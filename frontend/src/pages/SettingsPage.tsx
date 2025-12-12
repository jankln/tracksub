import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Container, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';

const SettingsPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const [notificationDays, setNotificationDays] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setNotificationDays(response.data.notification_days || 7);
      } catch (err) {
        console.error('Error fetching settings', err);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveNotifications = async () => {
    try {
      await api.put('/settings', { notification_days: notificationDays });
      setMessage('Notification settings saved');
      setError('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to save settings');
      setMessage('');
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await api.post('/notifications/test');
      setMessage(`Test completed! ${response.data.emailsSent} notification emails sent.`);
      setError('');
    } catch (err: any) {
      setError('Failed to send test notification');
      setMessage('');
    }
  };

  const handleLanguageSave = () => {
    try {
      localStorage.setItem('language', language);
      setMessage('Language updated');
      setError('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to save language');
      setMessage('');
    }
  };

  return (
    <Container className="mt-4">
      <h1>{t('settings_title')}</h1>
      
      {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      
      <Card className="mt-4">
        <Card.Body>
          <Tabs defaultActiveKey="notifications" id="settings-tabs" className="mb-3">
            <Tab eventKey="notifications" title={t('settings_tab_notifications')}>
              <Card.Title>{t('settings_email_title')}</Card.Title>
              <Card.Text>{t('settings_email_help')}</Card.Text>
              
              {localStorage.getItem('userEmail') ? (
                <Card.Text>
                  <strong>Your email:</strong> {localStorage.getItem('userEmail')}
                </Card.Text>
              ) : (
                <Alert variant="warning">
                  <strong>⚠️</strong><br/>
                  {t('settings_no_email')}
                </Alert>
              )}
              
              <hr />
              
              <Form.Group controlId="notificationDays" className="mb-3">
                <Form.Label><strong>{t('settings_reminder_timing')}</strong></Form.Label>
                <div className="mb-3">
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    {[1, 3, 7, 14, 30].map((days) => (
                      <Button
                        key={days}
                        variant={notificationDays === days ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setNotificationDays(days)}
                      >
                        {days === 1 ? '1 day' : days === 7 ? '1 week' : days === 14 ? '2 weeks' : days === 30 ? '1 month' : `${days} days`}
                      </Button>
                    ))}
                  </div>
                  
                  <Form.Label className="mt-2">{t('settings_custom_days')}</Form.Label>
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
                    📅 {t('settings_info_prefix')} <strong>{notificationDays} day{notificationDays !== 1 ? 's' : ''}</strong> before each payment is due.
                  </small>
                </Alert>
              </Form.Group>
              
              <Button variant="primary" onClick={handleSaveNotifications} className="me-2">
                {t('settings_save_notifications')}
              </Button>
              
              <Button variant="secondary" onClick={handleTestNotification}>
                {t('settings_send_test')}
              </Button>
            </Tab>
            <Tab eventKey="language" title={t('settings_tab_language')}>
              <Card.Title className="mt-3">{t('settings_tab_language')}</Card.Title>
              <Form.Group controlId="languageSelect" className="mb-3">
                <Form.Label>{t('settings_language_label')}</Form.Label>
                <Form.Select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </Form.Select>
              </Form.Group>
              <Button variant="primary" onClick={handleLanguageSave}>
                {t('settings_language_save')}
              </Button>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SettingsPage;
