# 📧 MailerSend Setup for Tracksub Email Notifications

## Why MailerSend?
- ✅ **Works on Render free tier** (uses API, not SMTP - no port blocking issues)
- ✅ **Free tier: 12,000 emails/month** (400/day average!)
- ✅ **Easy signup** - No credit card required
- ✅ **Generous limits** - More than SendGrid or Resend
- ✅ **Professional email service** with great deliverability
- ✅ **Simple API** - Easy to integrate

---

## Step-by-Step Setup (5 minutes)

### 1️⃣ Create MailerSend Account

1. Go to: **https://www.mailersend.com/signup**
2. Sign up with your email
3. Verify your email address (check inbox)
4. Complete the onboarding form

### 2️⃣ Verify Your Sending Domain or Email

**Option A: Verify Your Own Domain (Recommended for Production)**
1. In MailerSend dashboard, go to: **Domains**
2. Click **Add Domain**
3. Enter your domain: `yourdomain.com` (just the domain, not email)
4. Follow the DNS setup instructions:
   - Add TXT records for domain verification
   - Add CNAME records for email authentication (SPF, DKIM)
5. Click **Verify Domain** once DNS records are added
6. Wait 5-10 minutes for verification
7. Once verified, you can send from: `notifications@yourdomain.com`

**Option B: Use Email Verification (Quick Testing)**
1. Go to: **Email Verification**
2. Click **Verify an Email**
3. Enter your email address (e.g., `yourname@gmail.com`)
4. Check your email and click the verification link
5. You can now send FROM this email address
6. **Limitation**: Can only send to specific recipients (need domain for unrestricted sending)

### 3️⃣ Create API Token

1. In MailerSend dashboard, go to: **Settings** → **API Tokens**
2. Click **Create Token**
3. Name it: `Tracksub Production`
4. Select scope: **Full Access** (or at minimum: **Email: Send**)
5. Click **Create**
6. **COPY THE API TOKEN NOW!** (You can't see it again)
   - It looks like: `mlsn.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4️⃣ Configure Render Environment Variables

Go to: **Render Dashboard → Your Web Service → Environment**

**Remove these old variables (if they exist):**
- ❌ `SENDGRID_API_KEY`
- ❌ `RESEND_API_KEY`
- ❌ `EMAIL_HOST`
- ❌ `EMAIL_PORT`
- ❌ `EMAIL_USER`
- ❌ `EMAIL_PASS`

**Add these new variables:**

```env
MAILERSEND_API_KEY=mlsn.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=notifications@yourdomain.com
EMAIL_FROM_NAME=Tracksub Notifications
NODE_ENV=production
```

**Replace:**
- `mlsn.xxx...` = Your actual API token from step 3
- `notifications@yourdomain.com` = Your verified domain email OR verified email address
- `EMAIL_FROM_NAME` = The display name for your emails (optional)

### 5️⃣ Install Dependencies Locally

On your local machine, in the backend directory:

```bash
cd backend
npm install axios
```

The code is already updated to use MailerSend!

### 6️⃣ Commit and Push Changes

```bash
git add .
git commit -m "Switch to MailerSend for email notifications"
git push
```

### 7️⃣ Deploy to Render

1. Render will automatically detect the changes and redeploy
2. Wait 2-3 minutes for deployment
3. Check logs for: `📧 Email service: Production (MailerSend)`

### 8️⃣ Test Email Notifications

1. Log in to your app
2. Go to **Settings** → Set notification days (e.g., 7)
3. Create a test subscription:
   - Start date: 1 month ago
   - Billing cycle: Monthly
4. Click **Send Test Notification**
5. Check your email inbox! 📬

---

## ✅ Verification Checklist

After setup, verify:
- [ ] MailerSend account created and email verified
- [ ] Domain OR email address verified in MailerSend
- [ ] API token created and copied
- [ ] Environment variables set in Render
- [ ] Dependencies installed (`axios` added)
- [ ] Changes committed and pushed to Git
- [ ] App redeployed successfully on Render
- [ ] Logs show "Production (MailerSend)"
- [ ] Test email received

---

## 🔍 Troubleshooting

### "Unauthorized" or "Invalid API token" error
- ✅ Check API token is correct (no extra spaces)
- ✅ Verify you copied the full token starting with `mlsn.`
- ✅ Make sure `MAILERSEND_API_KEY` is set in Render environment
- ✅ Verify token has "Email: Send" permission

### "Domain not verified" error
- ✅ Go to MailerSend → Domains → Check verification status
- ✅ Make sure all DNS records are added correctly
- ✅ Wait 5-10 minutes after DNS changes for propagation
- ✅ For testing, use a verified email address instead

### "Sender email not verified" error
- ✅ Make sure `EMAIL_FROM` matches your verified domain or email exactly
- ✅ If using domain: `notifications@yourdomain.com` (domain must be verified)
- ✅ If using email: Must match the exact email you verified

### No email received
- ✅ Check spam folder
- ✅ Check Render logs for "EMAIL SENT SUCCESSFULLY"
- ✅ Verify your subscription's next_payment_date is correct
- ✅ Check MailerSend dashboard → Analytics for delivery status

### Build errors after changes
- ✅ Make sure you ran `npm install` locally
- ✅ Commit both `package.json` and `package-lock.json`
- ✅ Check Render build logs for any missing dependencies

---

## 📊 MailerSend Free Tier Limits

- **Monthly limit:** 12,000 emails/month
- **Daily average:** ~400 emails/day
- **No expiration:** Free forever
- **No credit card:** Not required for free tier
- **Perfect for:** Personal use, small businesses, up to 50+ active users

---

## 🆚 Comparison with Other Services

| Feature | MailerSend | SendGrid | Resend | Gmail SMTP |
|---------|------------|----------|--------|------------|
| Works on Render free tier | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Free emails/month | 12,000 | 3,000 | 3,000 | 15,000 |
| Easy signup | ✅ Easy | ⚠️ Difficult | ✅ Easy | ✅ Easy |
| Credit card required | ❌ No | ⚠️ Yes | ❌ No | ❌ No |
| Custom domain | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Deliverability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Winner: MailerSend** - Best free tier limits!

---

## 🎉 You're Done!

Your production email notifications are now powered by MailerSend!

**Daily cron job:** Runs at midnight UTC, checks all subscriptions, sends reminders

**Manual testing:** Use "Send Test Notification" button in Settings page

---

## 💡 Tips

1. **Monitor usage:** MailerSend dashboard → Analytics (check daily/monthly sends)
2. **Domain verification:** Always verify your domain for production use
3. **Email templates:** MailerSend offers beautiful email templates (optional)
4. **Webhooks:** Set up webhooks to track delivery, opens, clicks (advanced)
5. **Need more emails?** Paid plans start at $25/month for 50,000 emails

---

## 🔗 Useful Links

- **MailerSend Dashboard:** https://app.mailersend.com/
- **API Documentation:** https://developers.mailersend.com/
- **Domain Setup Guide:** https://www.mailersend.com/help/domain-verification
- **API Tokens:** https://app.mailersend.com/settings/api-tokens

---

## 📧 What EMAIL_FROM Should I Use?

### If you own a domain (e.g., `myapp.com`):
```env
EMAIL_FROM=notifications@myapp.com
EMAIL_FROM_NAME=MyApp Notifications
```

### If you don't have a domain (testing):
Verify your personal email in MailerSend, then:
```env
EMAIL_FROM=yourname@gmail.com
EMAIL_FROM_NAME=Tracksub
```

### For the best experience:
- Use a custom domain for professional appearance
- Avoid using `@gmail.com` or `@yahoo.com` in production
- Domain verification takes 5-10 minutes but is worth it!

---

**Questions?** Check MailerSend docs: https://developers.mailersend.com/
