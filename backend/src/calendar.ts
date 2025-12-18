import { Router, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest, protectedRoute } from './middleware/auth';
import { User, Subscription } from './models';

const router = Router();
const appUrl = process.env.APP_URL || 'https://tracksub-7w3u.onrender.com';

const escapeText = (text: string) =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}${month}${day}`;
};

const buildICS = (userId: number, subs: Subscription[]) => {
  const now = new Date();
  const nowStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tracksub//Calendar//EN',
    'CALSCALE:GREGORIAN',
  ];

  subs.forEach((sub) => {
    const nextDate = formatDate(sub.next_payment_date);
    const freq = sub.billing_cycle === 'yearly' ? 'YEARLY' : 'MONTHLY';
    const summary = escapeText(sub.name);
    const description = escapeText(`Subscription charge ${sub.amount} (${sub.billing_cycle})`);

    lines.push(
      'BEGIN:VEVENT',
      `UID:sub-${sub.id}-${userId}@tracksub`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${nextDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `RRULE:FREQ=${freq}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

// Authenticated: fetch or create a persistent calendar token (Pro only)
router.get('/token', protectedRoute, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user?.id || 0);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.plan !== 'pro') return res.status(403).json({ message: 'Calendar sync requires Pro' });

    if (!user.calendar_token) {
      user.calendar_token = crypto.randomBytes(24).toString('hex');
      await user.save();
    }

    const icalUrl = `${appUrl.replace(/\/$/, '')}/api/calendar/ics/${user.calendar_token}`;
    res.json({ ical_url: icalUrl, token: user.calendar_token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate calendar link' });
  }
});

// Public ICS feed via token
router.get('/ics/:token', async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) return res.status(400).send('Missing token');

    const user = await User.findOne({ where: { calendar_token: token } });
    if (!user) return res.status(404).send('Calendar not found');
    if (user.plan !== 'pro') return res.status(403).send('Calendar requires active Pro plan');

    const subs = await Subscription.findAll({
      where: { user_id: user.id, status: 'active' },
    });

    const ics = buildICS(user.id, subs);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=\"tracksub.ics\"');
    res.send(ics);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load calendar');
  }
});

export default router;
