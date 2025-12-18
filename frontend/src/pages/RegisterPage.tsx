import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/register', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', email);
      window.dispatchEvent(new Event('auth-change'));
      navigate('/', { replace: true });
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 409) {
          setError('Email already registered. Please log in instead.');
        } else if (status === 400) {
          setError('Please provide a valid email and password.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(message || 'Registration failed.');
        }
      } else if (error.request) {
        setError('Cannot connect to server. Please check your connection');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e27', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }}></div>
      <Container style={{ maxWidth: '450px', position: 'relative', zIndex: 1 }}>
        <Card style={{ borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(99, 102, 241, 0.2)', backdropFilter: 'blur(20px)' }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/tracksublogo.png" alt="Tracksub" style={{ width: '90px', height: '90px', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.6))' }} />
              <h2 style={{ fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem' }}>Create Account</h2>
              <p style={{ color: '#94a3b8', marginBottom: 0 }}>Start tracking your subscriptions</p>
            </div>
            
            {error && <Alert variant="danger" dismissible onClose={() => setError('')} style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#fca5a5' }}>{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail" className="mb-3">
                <Form.Label style={{ color: '#e2e8f0', fontWeight: '600' }}>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ borderRadius: '12px', padding: '0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'white' }}
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mb-2">
                <Form.Label style={{ color: '#e2e8f0', fontWeight: '600' }}>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ borderRadius: '12px', padding: '0.85rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'white' }}
                />
                <Form.Text style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Password must be at least 6 characters long
                </Form.Text>
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="w-100 mb-3 mt-3"
                style={{ borderRadius: '12px', padding: '0.85rem', fontWeight: '700', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
              
              <div className="text-center">
                <p style={{ color: '#94a3b8', marginBottom: 0 }}>
                  Already have an account? <Link to="/login" style={{ color: '#a5b4fc', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
                </p>
              </div>
            </Form>
          </Card.Body>
        </Card>
        
        <div className="text-center mt-3">
          <Link to="/welcome" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.3s', fontWeight: '500' }}>
            ← Back to home
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;
