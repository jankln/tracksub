
import { Router } from 'express';
import db from './database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Register
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password' });
    }

    const insert = 'INSERT INTO users (email, password) VALUES (?,?)';
    db.run(insert, [email, hash], function (err) {
      if (err) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ token });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], (err, row: any) => {
    if (err) {
      return res.status(500).json({ message: 'Error querying database' });
    }
    if (!row) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    bcrypt.compare(password, row.password, (err, result) => {
      if (result) {
        const token = jwt.sign({ id: row.id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
      } else {
        res.status(400).json({ message: 'Invalid email or password' });
      }
    });
  });
});

export default router;
