# 📧 Gmail SMTP Setup for Tracksub Email Notifications

## Step-by-Step Guide

### 1️⃣ Enable 2-Factor Authentication (2FA)

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA (use your phone for verification)

### 2️⃣ Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - **OR** Search for "App passwords" in your Google Account settings
2. You may need to sign in again
3. In the "Select app" dropdown, choose **Mail**
4. In the "Select device" dropdown, choose **Other (Custom name)**
5. Type: `Tracksub Notifications`
6. Click **Generate**
7. **IMPORTANT:** Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
   - ⚠️ You won't be able to see this again!
   - Save it temporarily in a notepad

### 3️⃣ Configure Render Environment Variables

Go to your Render Dashboard → Your Web Service → Environment

Add these 5 environment variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=your.email@gmail.com
```

**Replace:**
- `your.email@gmail.com` - Your actual Gmail address
- `xxxx xxxx xxxx xxxx` - The 16-character App Password you just generated

### 4️⃣ Save and Deploy

1. Click **Save Changes** in Render
2. Your app will automatically redeploy
3. Wait 2-3 minutes for deployment to complete

### 5️⃣ Test Email Notifications

**Option A: Using the Frontend**
1. Log in to your app
2. Go to **Settings** page
3. Set notification days (e.g., 7 days)
4. Add a test subscription with `next_payment_date` = 7 days from today
5. Click **Send Test Notification** button

**Option B: Using API directly**
```bash
curl -X POST https://your-app.onrender.com/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6️⃣ Verify It Works

Check your email inbox for:
- Subject: `⚠️ Subscription Reminder: [Subscription Name]`
- From: `your.email@gmail.com`

Also check Render logs:
- Look for: `📧 EMAIL SENT SUCCESSFULLY!`
- Should show: `Email service: Production`

---

## 🔍 Troubleshooting

### "Invalid login" error
- ✅ Make sure 2FA is enabled
- ✅ Use App Password, NOT your regular Gmail password
- ✅ Remove spaces from App Password when pasting

### Emails not sending
- ✅ Check Render logs for errors
- ✅ Verify `NODE_ENV=production` is set
- ✅ Ensure `EMAIL_HOST=smtp.gmail.com` (no typos)

### Emails going to spam
- ⚠️ This is normal for automated emails from Gmail
- ✅ Mark as "Not spam" in your inbox
- 💡 For better deliverability, use SendGrid or AWS SES

---

## 📊 Gmail Limits

- **Daily sending limit:** 500 emails/day
- **Rate limit:** ~100 emails/hour
- **Perfect for:** Personal use, small businesses
- **Not suitable for:** High-volume applications (1000+ emails/day)

---

## ✅ Current Settings Summary

Once configured, your app will:
- ✅ Check for upcoming payments daily at midnight
- ✅ Send email notifications X days before payment (user configurable)
- ✅ Only notify for active subscriptions
- ✅ Log all email activity to Render logs

---

**Next Steps After Setup:**
1. Test with your own email
2. Add real subscriptions
3. Monitor Render logs for email activity
4. Adjust notification days as needed

🎉 Your production email notifications are ready!
