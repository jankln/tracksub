import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Container, Card, ListGroup, Badge, Button, Form, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getCategoryColor, CATEGORIES } from '../categories';

interface Subscription {
  id: number;
  name: string;
  billing_cycle: string;
  start_date: string;
  next_payment_date: string;
  amount: number;
  category: string;
  status: string;
}

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [subscriptions, categoryFilter, statusFilter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.subscriptions || []);
      setError('');
    } catch (error) {
      setError('Failed to load subscriptions');
      console.error('Error fetching subscriptions', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...subscriptions];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(sub => sub.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubscriptions(filtered);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    
    try {
      await api.delete(`/subscriptions/${deleteId}`);
      setSubscriptions(subscriptions.filter(sub => sub.id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      setError('Failed to delete subscription');
      console.error('Error deleting subscription', error);
    }
  };

  const calculateAge = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths > 0) {
        return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Subscriptions</h1>
        <Link to="/add-subscription">
          <Button variant="primary">Add Subscription</Button>
        </Link>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Category</Form.Label>
                <Form.Control
                  as="select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Control
                  as="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredSubscriptions.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '4rem', opacity: 0.3 }}>🔍</div>
            <h4 className="mt-3">No Subscriptions Found</h4>
            <p className="text-muted">
              {subscriptions.length === 0 
                ? 'Start by adding your first subscription'
                : 'Try adjusting your filters'}
            </p>
            {subscriptions.length === 0 && (
              <Link to="/add-subscription">
                <Button variant="primary" size="lg" className="mt-2">
                  Add Subscription
                </Button>
              </Link>
            )}
          </Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {filteredSubscriptions.map((sub) => {
            const categoryColor = getCategoryColor(sub.category);
            const getStatusColor = () => {
              switch(sub.status) {
                case 'active': return { bg: '#d1e7dd', color: '#0f5132' };
                case 'inactive': return { bg: '#fff3cd', color: '#664d03' };
                case 'cancelled': return { bg: '#f8d7da', color: '#842029' };
                default: return { bg: '#e2e3e5', color: '#41464b' };
              }
            };
            const statusColor = getStatusColor();
            const age = calculateAge(sub.start_date);

            return (
              <ListGroup.Item key={sub.id} style={{ opacity: sub.status === 'active' ? 1 : 0.6 }}>
                <Row className="align-items-center">
                  <Col md={6}>
                    <h5 className="mb-2">{sub.name}</h5>
                    <div className="mb-2">
                      <Badge 
                        className="me-2" 
                        style={{ 
                          backgroundColor: categoryColor.bgColor, 
                          color: categoryColor.color,
                          border: `1px solid ${categoryColor.color}`
                        }}
                      >
                        {sub.category}
                      </Badge>
                      <Badge 
                        className="me-2" 
                        style={{ 
                          backgroundColor: statusColor.bg, 
                          color: statusColor.color,
                          border: `1px solid ${statusColor.color}`,
                          textTransform: 'capitalize'
                        }}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="text-muted small">
                      <div>💰 €{sub.amount} / {sub.billing_cycle}</div>
                      <div>📅 {age} old</div>
                      <div>📆 Next payment: {sub.next_payment_date}</div>
                      <div>🗓️ Started: {sub.start_date}</div>
                    </div>
                  </Col>
                  <Col md={6} className="text-end">
                    <Link to={`/edit-subscription/${sub.id}`}>
                      <Button variant="outline-primary" size="sm" className="me-2">
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(sub.id)}
                    >
                      Delete
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this subscription? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SubscriptionsPage;
