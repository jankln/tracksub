import React, { useEffect } from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, index * 150);
    });
  }, []);

  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <div className="d-flex justify-content-center gap-3 mb-3 fade-in" style={{ flexWrap: 'wrap' }}>
            <Button variant="outline-light" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              How it works
            </Button>
            <Button variant="outline-light" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              Pricing
            </Button>
          </div>
          <div className="hero-content text-center fade-in">
            <img 
              src="/tracksublogo.png" 
              alt="Tracksub Logo" 
              className="hero-logo mb-4"
            />
            <h1 className="hero-title">
              Tracksub Pro keeps your subscriptions on autopilot
            </h1>
            <p className="hero-subtitle">
              Connect your bank once, we auto-fetch new subscriptions and keep reminders flowing. Manual entry stays free.
            </p>
            <div className="hero-buttons mt-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="me-3 mb-2"
                onClick={() => navigate('/register')}
              >
                Try Tracksub Free
              </Button>
              <Button 
                variant="outline-light" 
                size="lg"
                className="mb-2"
                onClick={() => navigate('/login')}
              >
                Log in
              </Button>
              <div className="text-muted small w-100 mt-2">
                Want more automation? <a href="/billing" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 700 }}>See Tracksub Pro</a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="features-section py-5">
        <Container>
          <div className="text-center mb-4 fade-in">
            <h2 className="feature-title">How it works</h2>
            <p className="text-muted">Get started fast, never forget to cancel again.</p>
          </div>
          <Row className="g-4">
            <Col md={4} className="fade-in">
              <Card className="feature-card h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    ĐY"S
                  </div>
                  <Card.Title className="feature-title">Connect once</Card.Title>
                  <Card.Text className="feature-description">
                    Link your bank or start with manual entry. We pull in new subs automatically and keep your list clean.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="fade-in">
              <Card className="feature-card h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    ĐY"ơ
                  </div>
                  <Card.Title className="feature-title">Get smart reminders</Card.Title>
                  <Card.Text className="feature-description">
                    We remind you before renewals hit so you can cancel what you don’t need—no more forgotten trials.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="fade-in">
              <Card className="feature-card h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    ĐY'ø
                  </div>
                  <Card.Title className="feature-title">Stay in control</Card.Title>
                  <Card.Text className="feature-description">
                    Track all costs in one place, spot pricey renewals, and cancel faster. Manual entry stays free forever.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Feature highlights */}
      <section className="features-section py-5">
        <Container>
          <div className="text-center mb-4 fade-in">
            <h2 className="feature-title">Everything you need to manage subs</h2>
          </div>
          <Row className="g-4">
            <Col md={3} className="fade-in">
              <Card className="feature-card h-100">
                <Card.Body>
                  <Card.Title className="feature-title">Automatic bank sync</Card.Title>
                  <Card.Text className="feature-description">New subscriptions imported for you after you connect once.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="fade-in">
              <Card className="feature-card h-100">
                <Card.Body>
                  <Card.Title className="feature-title">Manual entry (free)</Card.Title>
                  <Card.Text className="feature-description">Keep adding subs by hand—always included on Free and Pro.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="fade-in">
              <Card className="feature-card h-100">
                <Card.Body>
                  <Card.Title className="feature-title">Email reminders</Card.Title>
                  <Card.Text className="feature-description">Pick when to be warned before each renewal hits your card.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="fade-in">
              <Card className="feature-card h-100">
                <Card.Body>
                  <Card.Title className="feature-title">Priority support</Card.Title>
                  <Card.Text className="feature-description">Pro users skip the line with faster responses.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="features-section py-5">
        <Container>
          <div className="text-center mb-4 fade-in">
            <h2 className="feature-title">Pricing</h2>
            <p className="text-muted">Choose Free or unlock automation with Pro.</p>
          </div>
          <Row className="g-4">
            <Col md={6} className="fade-in">
              <Card className="feature-card h-100 text-center">
                <Card.Body>
                  <Card.Title className="feature-title">Free</Card.Title>
                  <h3 style={{ color: '#a5b4fc', fontWeight: 800 }}>€0 / mo</h3>
                  <Card.Text className="feature-description">Manual tracking, reminders, dashboard.</Card.Text>
                  <Button variant="outline-light" onClick={() => navigate('/register')}>Start Free</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="fade-in">
              <Card className="feature-card h-100 text-center" style={{ border: '1px solid rgba(99,102,241,0.4)' }}>
                <Card.Body>
                  <Card.Title className="feature-title">Pro</Card.Title>
                  <h3 style={{ color: '#a5b4fc', fontWeight: 800 }}>€7 / mo</h3>
                  <Card.Text className="feature-description">Automatic bank sync, priority support, everything in Free.</Card.Text>
                  <Button variant="primary" onClick={() => navigate('/billing')}>Upgrade to Pro</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="g-4 mt-4 fade-in">
            <Col>
              <Card className="feature-card">
                <Card.Body>
                  <Card.Title className="feature-title">Compare</Card.Title>
                  <div className="d-flex flex-wrap justify-content-between text-muted">
                    <div>Manual entry</div>
                    <div>Free ✔️ / Pro ✔️</div>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between text-muted mt-2">
                    <div>Automatic bank sync</div>
                    <div>Free ✖️ / Pro ✔️</div>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between text-muted mt-2">
                    <div>Email reminders</div>
                    <div>Free ✔️ / Pro ✔️</div>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between text-muted mt-2">
                    <div>Priority support</div>
                    <div>Free ✖️ / Pro ✔️</div>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between text-muted mt-2">
                    <div>ICS calendar sync</div>
                    <div>Free ✖️ / Pro ✔️</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <Container>
          <div className="text-center fade-in mb-4">
            <h2 className="feature-title">Tracking over €1,400,000 in subscriptions worldwide</h2>
          </div>
          <Row className="text-center fade-in">
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h2 className="stat-number">20,000+</h2>
                <p className="stat-label">Users</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h2 className="stat-number">130,000+</h2>
                <p className="stat-label">Subscriptions tracked</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h2 className="stat-number">€232,000</h2>
                <p className="stat-label">Saved from cancellations</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <div className="text-center fade-in">
            <h2 className="cta-title mb-4">Ready for effortless tracking?</h2>
            <p className="cta-subtitle mb-4">
              Start free today. Upgrade to Pro when you want automatic bank sync and faster support.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="welcome-footer py-4">
        <Container>
          <div className="text-center text-muted">
            <p className="mb-0">¶¸ 2025 Tracksub. Made with ƒ?Ï‹÷? for subscription management.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default WelcomePage;
