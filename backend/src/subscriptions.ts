
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
        return res.sendStatus(403); // Forbidden
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

// Get all subscriptions for a user
router.get('/', protectedRoute, (req, res) => {
  const sql = 'SELECT * FROM subscriptions WHERE user_id = ?';
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error querying database' });
    }
    res.status(200).json({ subscriptions: rows });
  });
});

// Get a single subscription by ID
router.get('/:id', protectedRoute, (req, res) => {
  const sql = 'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?';
  db.get(sql, [req.params.id, req.user.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Error querying database' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json({ subscription: row });
  });
});

// Create a new subscription
router.post('/', protectedRoute, (req, res) => {
  const { name, billing_cycle, start_date, next_payment_date, amount, category, status } = req.body;
  const sql = 'INSERT INTO subscriptions (user_id, name, billing_cycle, start_date, next_payment_date, amount, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.run(sql, [req.user.id, name, billing_cycle, start_date, next_payment_date, amount, category || 'Other', status || 'active'], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error creating subscription' });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Update a subscription
router.put('/:id', protectedRoute, (req, res) => {
  const { name, billing_cycle, start_date, next_payment_date, amount, category, status } = req.body;
  const sql = 'UPDATE subscriptions SET name = ?, billing_cycle = ?, start_date = ?, next_payment_date = ?, amount = ?, category = ?, status = ? WHERE id = ? AND user_id = ?';
  db.run(sql, [name, billing_cycle, start_date, next_payment_date, amount, category || 'Other', status || 'active', req.params.id, req.user.id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error updating subscription' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json({ message: 'Subscription updated' });
  });
});

// Delete a subscription
router.delete('/:id', protectedRoute, (req, res) => {
  const sql = 'DELETE FROM subscriptions WHERE id = ? AND user_id = ?';
  db.run(sql, [req.params.id, req.user.id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting subscription' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json({ message: 'Subscription deleted' });
  });
});

export default router;
