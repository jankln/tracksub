# 📧 Resend Setup for Tracksub Email Notifications

## Why Resend?
- ✅ **Works on Render free tier** (uses API, not SMTP - no port blocking issues)
- ✅ **Free tier: 100 emails/day, 3,000/month**
- ✅ **Easy signup** (simpler than SendGrid)
- ✅ **No credit card required**
- ✅ **Modern, developer-friendly API**
- ✅ **Better deliverability than Gmail SMTP**

---

## Step-by-Step Setup (3 minutes)

### 1️⃣ Create Resend Account

1. Go to: **https://resend.com/signup**
2. Sign up with your email or GitHub account
3. Verify your email address (check inbox)

### 2️⃣ Get Your API Key

1. After login, you'll be on the Dashboard
2. Go to: **API Keys** section (left sidebar)
3. Click **Create API Key**
4. Name it: `Tracksub Production`
5. **COPY THE API KEY NOW!** (You can't see it again)
   - It looks like: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3️⃣ Verify Your Domain (or Use Default)

**Option A: Use Your Own Email (Recommended for Production)**
1. Go to **Domains** section
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS setup instructions
5. Once verified, you can send from: `notifications@yourdomain.com`

**Option B: Use Resend's Test Domain (Quick Start)**
- For testing, Resend lets you send to your own verified email
- No domain setup needed for basic testing
- You can only send TO the email you signed up with

### 4️⃣ Configure Render Environment Variables

Go to: **Render Dashboard → Your Web Service → Environment**

**Remove these old variables (if they exist):**
- ❌ `SENDGRID_API_KEY`
- ❌ `EMAIL_HOST`
- ❌ `EMAIL_PORT`
- ❌ `EMAIL_USER`
- ❌ `EMAIL_PASS`

**Add these new variables:**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=notifications@yourdomain.com
NODE_ENV=production
```

**Important notes:**
- Replace `re_xxx...` with your actual API key from step 2
- For testing without a domain, use: `onboarding@resend.dev` as EMAIL_FROM
- Once you verify your domain, change EMAIL_FROM to your custom address

### 5️⃣ Install Dependencies Locally (Before Deploying)

On your local machine, in the backend directory:

```bash
cd backend
npm install resend
npm uninstall @sendgrid/mail
```

This will update your `package-lock.json` file.

### 6️⃣ Commit and Push Changes

```bash
git add .
git commit -m "Switch from SendGrid to Resend for email notifications"
git push
```

### 7️⃣ Deploy to Render

1. Render will automatically detect the changes and redeploy
2. Wait 2-3 minutes for deployment
3. Check logs for: `📧 Email service: Production (Resend)`

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
- [ ] Resend account created and email verified
- [ ] API key created and copied
- [ ] Environment variables set in Render
- [ ] Dependencies installed (`resend` added, `@sendgrid/mail` removed)
- [ ] Changes committed and pushed to Git
- [ ] App redeployed successfully on Render
- [ ] Logs show "Production (Resend)"
- [ ] Test email received

---

## 🔍 Troubleshooting

### "Unauthorized" or "Invalid API key" error
- ✅ Check API key is correct (no extra spaces)
- ✅ Verify you copied the full key starting with `re_`
- ✅ Make sure `RESEND_API_KEY` is set in Render environment

### "Domain not verified" error
- ✅ For testing, use `onboarding@resend.dev` as EMAIL_FROM
- ✅ For production, verify your domain in Resend dashboard
- ✅ Wait 5-10 minutes after DNS changes for propagation

### "Can only send to verified emails" error
- ✅ Without a verified domain, you can only send TO the email you signed up with
- ✅ Test with your own email address first
- ✅ Verify your domain to send to any email address

### No email received
- ✅ Check spam folder
- ✅ Check Render logs for "EMAIL SENT SUCCESSFULLY"
- ✅ Verify your subscription's next_payment_date is correct
- ✅ Make sure you're using a verified email as recipient (for testing)

### Build errors after changes
- ✅ Make sure you ran `npm install resend` locally
- ✅ Commit both `package.json` and `package-lock.json`
- ✅ Check Render build logs for any missing dependencies

---

## 📊 Resend Free Tier Limits

- **Daily limit:** 100 emails/day
- **Monthly limit:** 3,000 emails/month
- **No expiration:** Free forever
- **No credit card:** Not required for free tier
- **Perfect for:** Personal use, small teams (up to ~15 daily active users)

---

## 🆚 Comparison with Other Services

| Feature | Resend | SendGrid | Gmail SMTP |
|---------|--------|----------|------------|
| Works on Render free tier | ✅ Yes | ✅ Yes | ❌ No (ports blocked) |
| Free tier emails/day | 100 | 100 | 500 |
| Easy signup | ✅ Very easy | ⚠️ Can be difficult | ✅ Easy |
| Credit card required | ❌ No | ⚠️ Yes | ❌ No |
| Custom domain | ✅ Yes | ✅ Yes | ❌ No |
| Deliverability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎉 You're Done!

Your production email notifications are now powered by Resend!

**Daily cron job:** Runs at midnight UTC, checks all subscriptions, sends reminders

**Manual testing:** Use "Send Test Notification" button in Settings page

---

## 💡 Tips

1. **Monitor usage:** Resend dashboard → Usage (check daily sends)
2. **Test mode:** Without domain verification, test with your signup email only
3. **Custom domain:** For professional emails, add and verify your domain
4. **Need more emails?** Paid plans start at $20/month for 50,000 emails
5. **Better deliverability:** Always use a verified domain for production

---

## 🔗 Useful Links

- **Resend Dashboard:** https://resend.com/dashboard
- **API Documentation:** https://resend.com/docs
- **Domain Setup Guide:** https://resend.com/docs/dashboard/domains/introduction
- **API Keys:** https://resend.com/api-keys

---

**Questions?** Check Resend docs or contact support: support@resend.com
