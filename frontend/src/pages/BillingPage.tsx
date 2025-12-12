import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { usePlan, usePlanCatalog } from '../context/PlanContext';
import {
  attachFinancialConnectionsAccount,
  createCheckoutSession,
  createFinancialConnectionsLink,
  createPortalSession,
  fetchFinancialCandidates,
  importFinancialSubscriptions,
  syncFinancialConnections,
} from '../api/billing';
import { loadStripe, Stripe } from '@stripe/stripe-js';

const currencySymbol = '€';

const BillingPage = () => {
  const { plan, currentPlan, isPro, refreshPlan, loading } = usePlan();
  const planCatalog = usePlanCatalog();
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fcInfo, setFcInfo] = useState<string | null>(null);
  const [fcLoading, setFcLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
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
  const [importing, setImporting] = useState(false);
  const location = useLocation();
  const stripePromiseRef = useRef<Promise<Stripe | null> | null>(null);

  const plans = useMemo(() => Object.values(planCatalog), [planCatalog]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === '1') {
      setMessage('Payment succeeded. Updating plan status…');
      refreshPlan();
    }
    if (params.get('canceled') === '1') {
      setError('Checkout canceled.');
    }
  }, [location.search, refreshPlan]);

  useEffect(() => {
    refreshPlan();
  }, [refreshPlan]);

  const handleUpgrade = () => {
    setUpgrading(true);
    setError(null);
    setMessage(null);
    createCheckoutSession()
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('No checkout URL returned from server.');
        }
      })
      .catch((err) => {
        setError('Failed to start checkout. Please try again.');
        console.error(err);
      })
      .finally(() => setUpgrading(false));
  };

  const handlePortal = () => {
    createPortalSession()
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
        }
      })
      .catch((err) => {
        setError('Failed to open billing portal.');
        console.error(err);
      });
  };

  const handleFinancialConnections = async () => {
    setError(null);
    setFcInfo(null);
    setFcLoading(true);
    try {
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
      setFcInfo('Bank account linked successfully.');
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
    setFcInfo(null);
    setSyncing(true);
    try {
      await syncFinancialConnections();
      const result = await fetchFinancialCandidates();
      const incoming = Array.isArray(result?.candidates) ? result.candidates : [];
      if (!incoming.length) {
        setFcInfo('No new bank transactions detected for subscriptions.');
        setCandidateModalOpen(false);
        return;
      }
      const mapped = incoming.map((c: any) => ({
        transaction_id: c.transaction_id,
        name: c.suggested_name || c.description || 'Subscription',
        billing_cycle: c.suggested_billing_cycle || 'monthly',
        next_payment_date: c.suggested_next_payment_date || c.transacted_at?.slice(0, 10) || '',
        amount: c.amount || 0,
        category: 'Other',
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
      setFcInfo('Imported selected subscriptions from bank sync.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import subscriptions.';
      setError(message);
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Container className="mt-4">
      <h1>Billing & Plans</h1>
      {message && (
        <Alert variant="info" className="mt-3" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {loading && (
        <div className="mt-2 d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" /> <span className="text-muted">Loading plan…</span>
        </div>
      )}

      <Row className="mt-4 g-3">
        <Col md={6}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title className="mb-1">Current plan</Card.Title>
                  <div className="text-muted">
                    {planCatalog[currentPlan].name} • Status: {plan.status}
                  </div>
                </div>
                <Badge bg={isPro ? 'primary' : 'secondary'}>{planCatalog[currentPlan].name}</Badge>
              </div>
              <ListGroup className="mt-3" variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Manual entry</span>
                  <span>{planCatalog[currentPlan].includesManualEntry ? 'Included' : 'Not included'}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Plaid-powered payment</span>
                  <span>{planCatalog[currentPlan].includesPlaid ? 'Included' : 'Upgrade to unlock'}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Renewal</span>
                  <span>{plan.renewsAt || 'Not scheduled'}</span>
                </ListGroup.Item>
              </ListGroup>
              <div className="d-flex gap-2 mt-3">
                {!isPro ? (
                  <Button variant="primary" onClick={handleUpgrade} disabled={upgrading}>
                    {upgrading ? 'Creating checkout…' : 'Upgrade to Pro'}
                  </Button>
                ) : (
                  <Button variant="outline-secondary" onClick={handlePortal}>
                    Manage in Stripe Portal
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Bank connection (Pro)</Card.Title>
              <Card.Text className="text-muted">Connect your bank and sync recent transactions.</Card.Text>
              {isPro ? (
                <>
                  <div className="d-flex flex-column gap-2">
                    <Button variant="success" onClick={handleFinancialConnections} disabled={fcLoading}>
                      {fcLoading ? 'Startingƒ?İ' : 'Start Financial Connections'}
                    </Button>
                    <Button variant="outline-primary" onClick={handleSyncSubscriptions} disabled={syncing}>
                      {syncing ? 'Syncingƒ?İ' : 'Sync subscriptions from bank'}
                    </Button>
                  </div>
                  {fcInfo && <Alert variant="secondary" className="mt-3 mb-0">{fcInfo}</Alert>}
                </>
              ) : (
                <Alert variant="secondary" className="mb-0">
                  Upgrade to Pro to enable Plaid-powered payment checkout.
                </Alert>
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
                      <Form.Control
                        type="text"
                        value={c.category}
                        onChange={(e) => {
                          const next = [...candidates];
                          next[idx] = { ...next[idx], category: e.target.value };
                          setCandidates(next);
                        }}
                      />
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

      <Row className="mt-4 g-3">
        {plans.map((planOption) => {
          const active = planOption.id === currentPlan;
          return (
            <Col md={6} key={planOption.id}>
              <Card
                style={{
                  border: active ? '1px solid rgba(99, 102, 241, 0.5)' : undefined,
                  boxShadow: active ? '0 0 20px rgba(99, 102, 241, 0.15)' : undefined,
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Card.Title className="mb-1">{planOption.name}</Card.Title>
                      <Card.Subtitle className="text-muted">{planOption.description}</Card.Subtitle>
                    </div>
                    <div className="text-end">
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {planOption.priceMonthly === 0
                          ? 'Free'
                          : `${currencySymbol}${planOption.priceMonthly}/mo`}
                      </div>
                    </div>
                  </div>
                  <ListGroup className="mt-3" variant="flush">
                    {planOption.features.map((feature) => (
                      <ListGroup.Item key={feature}>{feature}</ListGroup.Item>
                    ))}
                  </ListGroup>
                  <div className="d-flex gap-2 mt-3">
                    {planOption.id === 'free' ? (
                      <Button variant={active ? 'secondary' : 'outline-secondary'} disabled>
                        {active ? 'Active' : 'Switch to Free'}
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={handleUpgrade} disabled={isPro || upgrading}>
                        {isPro ? 'Active' : 'Upgrade to Pro'}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default BillingPage;
