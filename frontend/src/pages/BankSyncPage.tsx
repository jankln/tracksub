import React, { useEffect, useRef, useState } from 'react';
import { Container, Card, Button, Alert, Badge, Row, Col, Spinner, Modal, Form } from 'react-bootstrap';
import { usePlan } from '../context/PlanContext';
import {
  attachFinancialConnectionsAccount,
  createFinancialConnectionsLink,
  fetchFinancialCandidates,
  importFinancialSubscriptions,
  syncFinancialConnections,
  fetchPlan,
} from '../api/billing';
import { loadStripe, Stripe } from '@stripe/stripe-js';

const BankSyncPage = () => {
  const { isPro } = usePlan();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [fcLoading, setFcLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [linkedAccountId, setLinkedAccountId] = useState<string | null>(null);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [candidates, setCandidates] = useState<
    Array<{
      transaction_id: string;
      name: string;
      billing_cycle: string;
      next_payment_date: string;
      amount: number;
      category: string;
      description: string;
      transacted_at: string;
      include: boolean;
    }>
  >([]);
  const stripePromiseRef = useRef<Promise<Stripe | null> | null>(null);

  const categoryOptions = [
    'Other',
    'Streaming',
    'Productivity',
    'Cloud',
    'Gaming',
    'News',
    'Music',
    'Health',
    'Education',
    'Finance',
  ];

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPlan();
        setLinkedAccountId(data.financial_account_id || null);
      } catch (err) {
        setError('Failed to load bank sync status.');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const ensureStripe = async () => {
    const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Stripe publishable key is not configured.');
    }
    if (!stripePromiseRef.current) {
      stripePromiseRef.current = loadStripe(publishableKey);
    }
    const stripe = await stripePromiseRef.current;
    if (!stripe) {
      throw new Error('Failed to initialize Stripe.js.');
    }
    return stripe;
  };

  const handleFinancialConnections = async () => {
    setError(null);
    setInfo(null);
    setFcLoading(true);
    try {
      const stripe = await ensureStripe();
      const data = await createFinancialConnectionsLink();
      if (!data?.client_secret) {
        throw new Error('No client secret returned from server.');
      }

      const result = await stripe.collectFinancialConnectionsAccounts({
        clientSecret: data.client_secret,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Stripe returned an error starting Financial Connections.');
      }

      const session = result.financialConnectionsSession;
      const accountId = session?.accounts?.[0]?.id;
      if (!session?.id || !accountId) {
        throw new Error('No account returned from Financial Connections.');
      }

      await attachFinancialConnectionsAccount(accountId, session.id);
      setLinkedAccountId(accountId);
      setInfo('Bank account linked successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start Financial Connections.';
      setError(message);
      console.error(err);
    } finally {
      setFcLoading(false);
    }
  };

  const handleSyncSubscriptions = async () => {
    setError(null);
    setInfo(null);
    setSyncing(true);
    try {
      await syncFinancialConnections();
      const result = await fetchFinancialCandidates();
      const incoming = Array.isArray(result?.candidates) ? result.candidates : [];
      if (!incoming.length) {
        setInfo('No new bank transactions detected for subscriptions.');
        setCandidateModalOpen(false);
        return;
      }
      const mapped = incoming.map((c: any) => ({
        transaction_id: c.transaction_id,
        name: c.suggested_name || c.description || 'Subscription',
        billing_cycle: c.suggested_billing_cycle || 'monthly',
        next_payment_date: c.suggested_next_payment_date || c.transacted_at?.slice(0, 10) || '',
        amount: c.amount || 0,
        category: categoryOptions[0],
        description: c.description || '',
        transacted_at: c.transacted_at || '',
        include: true,
      }));
      setCandidates(mapped);
      setCandidateModalOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync subscriptions.';
      setError(message);
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleImportSelections = async () => {
    const selected = candidates.filter((c) => c.include);
    if (!selected.length) {
      setCandidateModalOpen(false);
      return;
    }
    setImporting(true);
    setError(null);
    try {
      await importFinancialSubscriptions(
        selected.map((c) => ({
          transaction_id: c.transaction_id,
          name: c.name,
          billing_cycle: c.billing_cycle,
          next_payment_date: c.next_payment_date,
          amount: c.amount,
          category: c.category,
        }))
      );
      setCandidateModalOpen(false);
      setInfo('Imported selected subscriptions from bank sync.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import subscriptions.';
      setError(message);
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  if (!isPro) {
    return (
      <Container className="mt-4">
        <h1>Bank Sync</h1>
        <Alert variant="secondary" className="mt-3">
          Bank Sync is a Pro feature. Upgrade in Billing to enable bank connections and syncing.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1>Bank Sync</h1>
      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {info && (
        <Alert variant="info" className="mt-3" dismissible onClose={() => setInfo(null)}>
          {info}
        </Alert>
      )}
      {loading && (
        <div className="mt-2 d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" /> <span className="text-muted">Loading bank status...</span>
        </div>
      )}

      <Row className="mt-4 g-3">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Connection status</Card.Title>
              <div className="d-flex align-items-center gap-2 mb-3">
                {linkedAccountId ? (
                  <Badge bg="success">Linked</Badge>
                ) : (
                  <Badge bg="secondary">Not linked</Badge>
                )}
                <span className="text-muted">
                  {linkedAccountId ? `Account ID: ${linkedAccountId}` : 'No bank account connected.'}
                </span>
              </div>
              <Button variant="success" onClick={handleFinancialConnections} disabled={fcLoading}>
                {fcLoading ? 'Starting…' : linkedAccountId ? 'Re-link bank' : 'Link bank account'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Sync subscriptions</Card.Title>
              <Card.Text className="text-muted">
                Sync recent bank transactions and import new subscriptions. Limited to 2 syncs per month.
              </Card.Text>
              <Button
                variant="outline-primary"
                onClick={handleSyncSubscriptions}
                disabled={syncing || !linkedAccountId}
              >
                {syncing ? 'Syncing…' : 'Sync now'}
              </Button>
              {!linkedAccountId && (
                <div className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>
                  Link a bank account first to enable syncing.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={candidateModalOpen} onHide={() => setCandidateModalOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review new subscriptions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {candidates.map((c, idx) => (
            <Card className="mb-3" key={c.transaction_id}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                      {c.description || 'Transaction'} • {c.transacted_at?.slice(0, 10)}
                    </div>
                  </div>
                  <Form.Check
                    type="switch"
                    id={`include-${idx}`}
                    label={c.include ? 'Will import' : 'Skip'}
                    checked={c.include}
                    onChange={(e) => {
                      const next = [...candidates];
                      next[idx] = { ...next[idx], include: e.target.checked };
                      setCandidates(next);
                    }}
                  />
                </div>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId={`name-${idx}`}>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={c.name}
                        onChange={(e) => {
                          const next = [...candidates];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setCandidates(next);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`amount-${idx}`}>
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={c.amount}
                        onChange={(e) => {
                          const next = [...candidates];
                          next[idx] = { ...next[idx], amount: parseFloat(e.target.value) || 0 };
                          setCandidates(next);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`cycle-${idx}`}>
                      <Form.Label>Billing cycle</Form.Label>
                      <Form.Select
                        value={c.billing_cycle}
                        onChange={(e) => {
                          const next = [...candidates];
                          next[idx] = { ...next[idx], billing_cycle: e.target.value };
                          setCandidates(next);
                        }}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`next-${idx}`}>
                      <Form.Label>Next payment date</Form.Label>
                      <Form.Control
                        type="date"
                        value={c.next_payment_date}
                        onChange={(e) => {
                          const next = [...candidates];
                          next[idx] = { ...next[idx], next_payment_date: e.target.value };
                          setCandidates(next);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                  <Form.Group controlId={`category-${idx}`}>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={c.category}
                      onChange={(e) => {
                        const next = [...candidates];
                        next[idx] = { ...next[idx], category: e.target.value };
                        setCandidates(next);
                      }}
                    >
                      {categoryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
          {!candidates.length && <div className="text-muted">No new subscriptions to import.</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCandidateModalOpen(false)} disabled={importing}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImportSelections} disabled={importing}>
            {importing ? 'Importing…' : 'Import selected'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BankSyncPage;
