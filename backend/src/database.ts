
import sqlite3 from 'sqlite3';

const DBSOURCE = 'db.sqlite';

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  }
  console.log('Connected to the SQLite database.');

  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      notification_days INTEGER DEFAULT 7,
      CONSTRAINT email_unique UNIQUE (email)
    )
  `;

  const subscriptionsTable = `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      billing_cycle TEXT,
      start_date TEXT,
      next_payment_date TEXT,
      amount REAL,
      category TEXT DEFAULT 'Other',
      status TEXT DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `;

  db.serialize(() => {
    db.run(usersTable, (err) => {
      if (err) {
        // Table already created
        console.log('Users table already created.');
      } else {
        console.log('Users table created.');
      }
    });
    
    // Add notification_days column if it doesn't exist (for existing databases)
    db.run('ALTER TABLE users ADD COLUMN notification_days INTEGER DEFAULT 7', (err) => {
      if (err) {
        console.log('notification_days column already exists or error adding it.');
      } else {
        console.log('Added notification_days column to users table.');
      }
    });
    
    db.run(subscriptionsTable, (err) => {
      if (err) {
        // Table already created
        console.log('Subscriptions table already created.');
      } else {
        console.log('Subscriptions table created.');
      }
    });
    
    // Add category column if it doesn't exist (for existing databases)
    db.run('ALTER TABLE subscriptions ADD COLUMN category TEXT DEFAULT "Other"', (err) => {
      if (err) {
        console.log('category column already exists or error adding it.');
      } else {
        console.log('Added category column to subscriptions table.');
      }
    });
    
    // Add status column if it doesn't exist (for existing databases)
    db.run('ALTER TABLE subscriptions ADD COLUMN status TEXT DEFAULT "active"', (err) => {
      if (err) {
        console.log('status column already exists or error adding it.');
      } else {
        console.log('Added status column to subscriptions table.');
      }
    });
  });
});

export default db;
