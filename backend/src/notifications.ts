
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { User, Subscription, sequelize } from './models';
import { Op } from 'sequelize';

// Email configuration
const createTransporter = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && process.env.EMAIL_HOST) {
    // Production email service
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development - use Ethereal (test email)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'test@ethereal.email',
        pass: process.env.EMAIL_PASS || 'testpassword',
      },
    });
  }
};

// Send an email
export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Tracksub" <noreply@tracksub.com>',
      to,
      subject,
      text,
      html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
    });

    console.log('\n=================================');
    console.log('📧 EMAIL SENT SUCCESSFULLY!');
    console.log('=================================');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Message ID:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
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
console.log(`📧 Email service: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development (Ethereal test)'}\n`);
