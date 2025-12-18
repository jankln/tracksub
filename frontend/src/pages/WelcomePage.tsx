import React, { useEffect } from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add fade-in animation on mount
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

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="g-4">
            <Col md={4} className="fade-in">
              <Card className="feature-card h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    📊
                  </div>
                  <Card.Title className="feature-title">Automatic bank sync</Card.Title>
                  <Card.Text className="feature-description">
                    Link your bank once and new subscriptions are pulled in automatically. No more manual chasing.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="fade-in">
              <Card className="feature-card h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    📧
                  </div>
                  <Card.Title className="feature-title">Smart reminders</Card.Title>
                  <Card.Text className="feature-description">
                    Get email notifications before payments are due. 
                    Customize when you want to be reminded.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="fade-in">
              <Card className="feature-card h-100 text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    💰
                  </div>
                  <Card.Title className="feature-title">Manual stays free</Card.Title>
                  <Card.Text className="feature-description">
                    Prefer to type? Keep manual entry forever on the free plan. Pro adds automatic sync and faster support.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <Container>
          <Row className="text-center fade-in">
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h2 className="stat-number">Auto-imports</h2>
                <p className="stat-label">New bank subscriptions fetched for you</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h2 className="stat-number">Free forever</h2>
                <p className="stat-label">Manual entry and reminders included</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h2 className="stat-number">Fast support</h2>
                <p className="stat-label">Pro users jump the line</p>
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
            <p className="mb-0">© 2025 Tracksub. Made with ❤️ for subscription management.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default WelcomePage;
