
import express from 'express';
import path from 'path';
import './database';
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
