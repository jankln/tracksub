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
              Never Miss a Subscription Payment Again
            </h1>
            <p className="hero-subtitle">
              Track, manage, and get reminded about all your subscriptions in one place
            </p>
            <div className="hero-buttons mt-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="me-3 mb-2"
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline-light" 
                size="lg"
                className="mb-2"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
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
                  <Card.Title className="feature-title">Track Everything</Card.Title>
                  <Card.Text className="feature-description">
                    Keep all your subscriptions organized in one beautiful dashboard. 
                    See what you're paying and when.
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
                  <Card.Title className="feature-title">Smart Reminders</Card.Title>
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
                  <Card.Title className="feature-title">Save Money</Card.Title>
                  <Card.Text className="feature-description">
                    See exactly how much you're spending each month. 
                    Cancel subscriptions you don't need.
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
                <h2 className="stat-number">Simple</h2>
                <p className="stat-label">Easy to use interface</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h2 className="stat-number">Free</h2>
                <p className="stat-label">No hidden costs</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="stat-item">
                <h2 className="stat-number">Secure</h2>
                <p className="stat-label">Your data is protected</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <div className="text-center fade-in">
            <h2 className="cta-title mb-4">Ready to Take Control?</h2>
            <p className="cta-subtitle mb-4">
              Join now and never miss a subscription payment again
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/register')}
            >
              Create Free Account
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
