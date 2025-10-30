import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const SettingsPage = () => {
  const [notificationDays, setNotificationDays] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setNotificationDays(response.data.settings.notification_days_before || 1);
      } catch (error) {
        console.error('Error fetching settings', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/settings', { notification_days_before: notificationDays });
      setMessage('Settings saved successfully!');
      setError('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Failed to save settings');
      setMessage('');
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await api.post('/notifications/test');
      setMessage(`Test completed! ${response.data.emailsSent} notification emails sent.`);
      setError('');
    } catch (error: any) {
      setError('Failed to send test notification');
      setMessage('');
    }
  };

  return (
    <Container className="mt-4">
      <h1>Settings</h1>
      
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Email Notification Settings</Card.Title>
          <Card.Text>
            Get reminded before your subscription payments are due.
          </Card.Text>
          
          {localStorage.getItem('userEmail') ? (
            <Card.Text>
              <strong>Your email:</strong> {localStorage.getItem('userEmail')}
            </Card.Text>
          ) : (
            <Alert variant="warning">
              <strong>⚠️ No email set</strong><br/>
              Please logout and login again to set your email for notifications.
            </Alert>
          )}
          
          <hr />
          
          <Form.Group controlId="notificationDays" className="mb-3">
            <Form.Label>Send notification this many days before payment:</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="30"
              value={notificationDays}
              onChange={(e) => setNotificationDays(parseInt(e.target.value))}
            />
            <Form.Text className="text-muted">
              You'll receive an email {notificationDays} day{notificationDays !== 1 ? 's' : ''} before each payment is due.
            </Form.Text>
          </Form.Group>
          
          <Button variant="primary" onClick={handleSave} className="me-2">
            Save Settings
          </Button>
          
          <Button variant="secondary" onClick={handleTestNotification}>
            Send Test Notification
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SettingsPage;
