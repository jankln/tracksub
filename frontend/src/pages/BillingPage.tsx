import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Badge, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { usePlan, usePlanCatalog } from '../context/PlanContext';
import { createCheckoutSession, createFinancialConnectionsLink, createPortalSession } from '../api/billing';

const currencySymbol = '€';

const BillingPage = () => {
  const { plan, currentPlan, isPro, refreshPlan, loading } = usePlan();
  const planCatalog = usePlanCatalog();
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fcInfo, setFcInfo] = useState<string | null>(null);
  const location = useLocation();

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
    try {
      const data = await createFinancialConnectionsLink();
      setFcInfo(`Link token created. Client secret: ${data.client_secret}`);
      // When FC JS is wired, launch the modal here using client_secret.
    } catch (err) {
      setError('Failed to start Financial Connections.');
      console.error(err);
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
              <Card.Title>Plaid connection (Pro)</Card.Title>
              <Card.Text className="text-muted">
                This triggers Financial Connections (transactions) via Stripe. Once the Stripe
                modal is wired, this button will open the secure bank chooser.
              </Card.Text>
              {isPro ? (
                <>
                  <Button variant="success" className="me-2" onClick={handleFinancialConnections}>
                    Start Financial Connections
                  </Button>
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
