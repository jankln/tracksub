import { Router } from 'express';
import db from './database';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Middleware to protect routes
const protectedRoute = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Get user notification settings
router.get('/', protectedRoute, (req, res) => {
  const sql = 'SELECT notification_days FROM users WHERE id = ?';
  db.get(sql, [req.user.id], (err, row: any) => {
    if (err) {
      return res.status(500).json({ message: 'Error querying database' });
    }
    res.status(200).json({ notification_days: row?.notification_days || 7 });
  });
});

// Update user notification settings
router.put('/', protectedRoute, (req, res) => {
  const { notification_days } = req.body;
  const sql = 'UPDATE users SET notification_days = ? WHERE id = ?';
  db.run(sql, [notification_days, req.user.id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error updating settings' });
    }
    res.status(200).json({ message: 'Settings updated successfully', notification_days });
  });
});

export default router;
