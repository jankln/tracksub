import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PlanBadge from './PlanBadge';
import { useLanguage } from '../context/LanguageContext';

const NavigationBar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/welcome', { replace: true });
  };

  return (
    <Navbar 
      expand="lg" 
      style={{ 
        background: 'rgba(15, 23, 42, 0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        padding: '1rem 0'
      }}
    >
      <Container>
        <Navbar.Brand 
          as={Link} 
          to="/" 
          style={{ 
            fontWeight: '800', 
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Tracksub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {token && (
              <>
                <Nav.Link as={Link} to="/" style={{ color: '#e2e8f0', fontWeight: '500', marginLeft: '1rem' }}>{t('nav_dashboard')}</Nav.Link>
                <Nav.Link as={Link} to="/subscriptions" style={{ color: '#e2e8f0', fontWeight: '500', marginLeft: '1rem' }}>{t('nav_subscriptions')}</Nav.Link>
                <Nav.Link as={Link} to="/billing" style={{ color: '#e2e8f0', fontWeight: '500', marginLeft: '1rem' }}>{t('nav_billing')}</Nav.Link>
                <Nav.Link as={Link} to="/bank-sync" style={{ color: '#e2e8f0', fontWeight: '500', marginLeft: '1rem' }}>{t('nav_bank_sync')}</Nav.Link>
                <Nav.Link as={Link} to="/settings" style={{ color: '#e2e8f0', fontWeight: '500', marginLeft: '1rem' }}>{t('nav_settings')}</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {token ? (
              <>
                <div className="me-3 d-flex align-items-center">
                  <PlanBadge />
                </div>
                <Button 
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    borderRadius: '10px',
                    padding: '0.5rem 1.5rem',
                    fontWeight: '600'
                  }}
                >
                  {t('nav_logout')}
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" style={{ color: '#e2e8f0', fontWeight: '500' }}>{t('nav_login')}</Nav.Link>
                <Nav.Link as={Link} to="/register" style={{ color: '#e2e8f0', fontWeight: '500' }}>{t('nav_register')}</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
