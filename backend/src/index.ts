
import express from 'express';
import path from 'path';
import { initDatabase } from './models';
import './notifications';
import authRouter from './auth';
import subscriptionsRouter from './subscriptions';
import settingsRouter from './settings';
import { checkAndSendNotifications } from './notifications';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/settings', settingsRouter);

// Debug endpoint to check subscriptions and dates
app.get('/api/notifications/debug', async (req, res) => {
  try {
    const { User, Subscription } = await import('./models');
    const users = await User.findAll({
      attributes: ['id', 'email', 'notification_days'],
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const debug: any = {
      today: today.toISOString().split('T')[0],
      users: []
    };
    
    for (const user of users) {
      const notificationDays = user.notification_days || 7;
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + notificationDays);
      
      const subscriptions = await Subscription.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'name', 'next_payment_date', 'status']
      });
      
      debug.users.push({
        email: user.email,
        notification_days: notificationDays,
        target_date: targetDate.toISOString().split('T')[0],
        subscriptions: subscriptions.map(s => ({
          name: s.name,
          next_payment_date: s.next_payment_date,
          status: s.status,
          matches: s.next_payment_date === targetDate.toISOString().split('T')[0]
        }))
      });
    }
    
    res.json(debug);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Manual trigger for testing email notifications
app.post('/api/notifications/test', async (req, res) => {
  try {
    const count = await checkAndSendNotifications();
    res.json({ message: 'Notification check completed', emailsSent: count });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notifications', error: String(error) });
  }
});

// Serve static files from the React app (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Handle React routing - catch all routes that don't match API
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  // Development - serve from frontend build folder
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
