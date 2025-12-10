import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert, Badge } from 'react-bootstrap';
import { usePlan, usePlanCatalog } from '../context/PlanContext';

const currencySymbol = '€';

const BillingPage = () => {
  const { plan, currentPlan, isPro, markPendingUpgrade, completeUpgrade, downgradeToFree } = usePlan();
  const planCatalog = usePlanCatalog();
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState('');

  const plans = useMemo(() => Object.values(planCatalog), [planCatalog]);

  const handleUpgrade = () => {
    setUpgrading(true);
    markPendingUpgrade();
    setMessage('Mock checkout created. When backend is connected, this will redirect to Stripe + Plaid.');
    setTimeout(() => {
      completeUpgrade(null);
      setUpgrading(false);
      setMessage('Tracksub Pro enabled locally. Backend hookup will control the real status.');
    }, 800);
  };

  const handleDowngrade = () => {
    downgradeToFree();
    setMessage('Switched to Free. Billing backend will own this once connected.');
  };

  return (
    <Container className="mt-4">
      <h1>Billing & Plans</h1>
      {message && (
        <Alert variant="info" className="mt-3" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
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
                  <span>Plaid bank sync</span>
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
                  <Button variant="outline-danger" onClick={handleDowngrade}>
                    Downgrade to Free
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
                This is the front-end shell for Plaid Link. Once the backend is ready,
                this block will create a link token, open Plaid, and attach the item to the
                customer&apos;s Pro subscription.
              </Card.Text>
              {isPro ? (
                <Button variant="success" className="me-2" disabled>
                  Launch Plaid Link (coming soon)
                </Button>
              ) : (
                <Alert variant="secondary" className="mb-0">
                  Upgrade to Pro to enable Plaid-powered sync.
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
                      <Button
                        variant={active ? 'secondary' : 'outline-secondary'}
                        onClick={handleDowngrade}
                        disabled={active}
                      >
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
