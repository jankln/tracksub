
import cron from 'node-cron';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { User, Subscription, sequelize } from './models';
import { Op } from 'sequelize';

// Email configuration for fallback (development)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'test@ethereal.email',
      pass: process.env.EMAIL_PASS || 'testpassword',
    },
  });
};

// Send an email using MailerSend (production) or Nodemailer (development)
export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const emailFrom = process.env.EMAIL_FROM || 'noreply@tracksub.com';
    const emailFromName = process.env.EMAIL_FROM_NAME || 'Tracksub Notifications';

    if (isProduction && process.env.MAILERSEND_API_KEY) {
      // Use MailerSend API in production
      const htmlContent = `<p>${text.replace(/\n/g, '<br>')}</p>`;
      
      const response = await axios.post(
        'https://api.mailersend.com/v1/email',
        {
          from: {
            email: emailFrom,
            name: emailFromName,
          },
          to: [
            {
              email: to,
            },
          ],
          subject: subject,
          text: text,
          html: htmlContent,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MAILERSEND_API_KEY}`,
          },
        }
      );

      console.log('\n=================================');
      console.log('📧 EMAIL SENT SUCCESSFULLY! (MailerSend)');
      console.log('=================================');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Response:', response.status, response.statusText);
      console.log('=================================\n');
      return true;
    } else {
      // Use Nodemailer for development/testing
      const transporter = createTransporter();
      const info = await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        text,
        html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
      });

      console.log('\n=================================');
      console.log('📧 EMAIL SENT SUCCESSFULLY! (Ethereal)');
      console.log('=================================');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      console.log('=================================\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('MailerSend API Error:', error.response.data);
    }
    return false;
  }
};

// Function to check and send notifications
export const checkAndSendNotifications = async () => {
  console.log('\n🔍 Checking for upcoming subscription payments...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Get all users with their notification preferences
    const users = await User.findAll({
      attributes: ['id', 'email', 'notification_days'],
    });

    let totalEmailsSent = 0;

    for (const user of users) {
      const notificationDays = user.notification_days || 7;
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + notificationDays);
      
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Find subscriptions for this user that match the notification date
      const subscriptions = await Subscription.findAll({
        where: {
          user_id: user.id,
          next_payment_date: targetDateStr,
          status: 'active'
        }
      });

      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Notification preference: ${notificationDays} days before`);
      console.log(`   Target date: ${targetDateStr}`);
      console.log(`   Found ${subscriptions.length} subscription(s) due`);

      for (const subscription of subscriptions) {
        const subject = `⚠️ Subscription Reminder: ${subscription.name}`;
        const text = `Hello!\n\nThis is a reminder that your subscription for "${subscription.name}" is due on ${subscription.next_payment_date}.\n\nAmount: $${subscription.amount}\n\nYou requested to be notified ${notificationDays} day${notificationDays !== 1 ? 's' : ''} before payment.\n\nPlease ensure you have sufficient funds in your account.\n\nBest regards,\nTracksub Team`;
        
        const sent = await sendEmail(user.email, subject, text);
        if (sent) totalEmailsSent++;
      }
    }

    console.log(`\n✅ Total emails sent: ${totalEmailsSent}`);
    return totalEmailsSent;
  } catch (error) {
    console.error('❌ Error in notification check:', error);
    throw error;
  }
};

// Cron job to send notifications daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('\n⏰ Running daily notification check (midnight)...');
  await checkAndSendNotifications();
});

console.log('✅ Email notification service started');
console.log('📅 Cron job scheduled: Daily at midnight (00:00)');
console.log(`📧 Email service: ${process.env.NODE_ENV === 'production' && process.env.MAILERSEND_API_KEY ? 'Production (MailerSend)' : 'Development (Ethereal test)'}\n`);
