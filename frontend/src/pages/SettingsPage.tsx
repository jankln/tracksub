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
        setNotificationDays(response.data.notification_days || 7);
      } catch (error) {
        console.error('Error fetching settings', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/settings', { notification_days: notificationDays });
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
            <Form.Label><strong>Reminder Timing</strong></Form.Label>
            <div className="mb-3">
              <div className="d-flex gap-2 flex-wrap mb-2">
                <Button 
                  variant={notificationDays === 1 ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setNotificationDays(1)}
                >
                  1 day
                </Button>
                <Button 
                  variant={notificationDays === 3 ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setNotificationDays(3)}
                >
                  3 days
                </Button>
                <Button 
                  variant={notificationDays === 7 ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setNotificationDays(7)}
                >
                  1 week
                </Button>
                <Button 
                  variant={notificationDays === 14 ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setNotificationDays(14)}
                >
                  2 weeks
                </Button>
                <Button 
                  variant={notificationDays === 30 ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setNotificationDays(30)}
                >
                  1 month
                </Button>
              </div>
              
              <Form.Label className="mt-2">Or enter custom days:</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="90"
                value={notificationDays}
                onChange={(e) => setNotificationDays(parseInt(e.target.value) || 1)}
                placeholder="Enter days before payment"
              />
            </div>
            <Alert variant="info" className="mb-0">
              <small>
                📧 You'll receive an email <strong>{notificationDays} day{notificationDays !== 1 ? 's' : ''}</strong> before each payment is due.
              </small>
            </Alert>
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
