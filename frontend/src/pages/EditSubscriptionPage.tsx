import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES } from '../categories';

const EditSubscriptionPage = () => {
  const [name, setName] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchSubscription = async () => {
      setFetchLoading(true);
      try {
        const response = await api.get(`/subscriptions/${id}`);
        const { name, billing_cycle, start_date, amount, category, status } = response.data.subscription;
        setName(name);
        setBillingCycle(billing_cycle);
        setStartDate(start_date);
        setAmount(amount);
        setCategory(category || 'Other');
        setStatus(status || 'active');
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError('Session expired. Please login again');
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response?.status === 404) {
          setError('Subscription not found');
          setTimeout(() => navigate('/subscriptions'), 2000);
        } else {
          setError('Failed to load subscription');
        }
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSubscription();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Calculate the next payment date from today based on billing cycle
      const start = new Date(startDate);
      const today = new Date();
      let nextPayment = new Date(start);
      
      // Find the next payment date that's in the future
      while (nextPayment <= today) {
        if (billingCycle === 'monthly') {
          nextPayment.setMonth(nextPayment.getMonth() + 1);
        } else {
          nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        }
      }
      
      await api.put(`/subscriptions/${id}`, {
        name,
        billing_cycle: billingCycle,
        start_date: startDate,
        next_payment_date: nextPayment.toISOString().split('T')[0],
        amount: parseFloat(amount),
        category,
        status,
      });
      navigate('/');
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Session expired. Please login again');
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response.status === 404) {
          setError('Subscription not found');
        } else if (error.response.status === 400) {
          setError('Please fill all fields correctly');
        } else if (error.response.status === 500) {
          setError('Server error. Please try again');
        } else {
          setError(error.response.data.message || 'Failed to update subscription');
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
    <Container className="mt-4">
      <h1>Edit Subscription</h1>
      
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      
      {fetchLoading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subscription name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="billingCycle" className="mb-3">
            <Form.Label>Billing Cycle</Form.Label>
            <Form.Control
              as="select"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="startDate" className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="amount" className="mb-3">
            <Form.Label>Amount (€)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="category" className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="status" className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
            </Form.Control>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Subscription'}
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default EditSubscriptionPage;
