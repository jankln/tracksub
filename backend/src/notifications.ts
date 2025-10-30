
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import db from './database';

// Create a transporter using Ethereal (test email service)
const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Send an email
export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: '"Tracksub" <noreply@tracksub.com>',
      to,
      subject,
      text,
      html: `<p>${text}</p>`,
    });

    console.log('\n=================================');
    console.log('📧 EMAIL SENT SUCCESSFULLY!');
    console.log('=================================');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('=================================\n');
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Function to check and send notifications
export const checkAndSendNotifications = async () => {
  console.log('\n🔍 Checking for upcoming subscription payments...');
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`📅 Today: ${today}`);

  // Query to find subscriptions where the next_payment_date matches user's notification preference
  const sql = `
    SELECT s.id, s.name, s.next_payment_date, s.amount, u.email, u.notification_days,
           julianday(s.next_payment_date) - julianday('now') as days_until_decimal,
           CAST(julianday(s.next_payment_date) - julianday('now') AS INTEGER) as days_until
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
    WHERE CAST(julianday(s.next_payment_date) - julianday('now') AS INTEGER) = COALESCE(u.notification_days, 7)
  `;
  
  // Also query all subscriptions to debug
  const debugSql = `
    SELECT s.name, s.next_payment_date, u.email, u.notification_days,
           julianday(s.next_payment_date) - julianday('now') as days_until_decimal,
           CAST(julianday(s.next_payment_date) - julianday('now') AS INTEGER) as days_until
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
  `;

  return new Promise((resolve, reject) => {
    // First, let's see all subscriptions
    db.all(debugSql, [], (err, allSubs: any[]) => {
      if (!err && allSubs.length > 0) {
        console.log('\n📋 All subscriptions in database:');
        allSubs.forEach(sub => {
          console.log(`  - ${sub.name}:`);
          console.log(`    Payment date: ${sub.next_payment_date}`);
          console.log(`    Days until (decimal): ${sub.days_until_decimal}`);
          console.log(`    Days until (integer): ${sub.days_until}`);
          console.log(`    Notify at: ${sub.notification_days || 7} days before`);
          console.log(`    Match: ${sub.days_until === (sub.notification_days || 7) ? '✅ YES' : '❌ NO'}`);
        });
      } else if (!err) {
        console.log('\n📋 No subscriptions found in database');
      }
      
      // Now check for notifications
      db.all(sql, [], async (err, rows: any[]) => {
        if (err) {
          console.error('❌ Error querying for subscriptions', err);
          reject(err);
          return;
        }

        console.log(`\n✅ Found ${rows.length} subscription(s) matching notification preferences`);

        for (const row of rows) {
          const { name, next_payment_date, amount, email, notification_days } = row;
          const subject = `⚠️ Subscription Reminder: ${name}`;
          const text = `Hello!\n\nThis is a reminder that your subscription for "${name}" is due on ${next_payment_date}.\n\nAmount: €${amount}\n\nYou requested to be notified ${notification_days} day${notification_days !== 1 ? 's' : ''} before payment.\n\nPlease ensure you have sufficient funds in your account.\n\nBest regards,\nTracksub Team`;
          
          await sendEmail(email, subject, text);
        }

        resolve(rows.length);
      });
    });
  });
};

// Cron job to send notifications daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('\n⏰ Running daily notification check (midnight)...');
  await checkAndSendNotifications();
});

console.log('✅ Email notification service started');
console.log('📅 Cron job scheduled: Daily at midnight (00:00)');
console.log('📧 Using Ethereal test email service - check console for preview URLs\n');
