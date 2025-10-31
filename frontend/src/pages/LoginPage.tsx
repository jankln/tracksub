import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
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
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userEmail', email);
      navigate('/');
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400 || error.response.status === 401) {
          setError('Invalid email or password');
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later');
        } else {
          setError(error.response.data.message || 'Login failed');
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <Container style={{ maxWidth: '450px' }}>
        <Card style={{ borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/tracksublogo.png" alt="Tracksub" style={{ width: '80px', height: '80px', marginBottom: '1rem' }} />
              <h2 style={{ fontWeight: '700', color: '#667eea' }}>Welcome Back</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>
            
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail" className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ borderRadius: '10px', padding: '0.75rem' }}
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ borderRadius: '10px', padding: '0.75rem' }}
                />
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="w-100 mb-3"
                style={{ borderRadius: '10px', padding: '0.75rem', fontWeight: '600' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="text-center">
                <p className="text-muted mb-0">
                  Don't have an account? <Link to="/register" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
                </p>
              </div>
            </Form>
          </Card.Body>
        </Card>
        
        <div className="text-center mt-3">
          <Link to="/welcome" style={{ color: 'white', textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
