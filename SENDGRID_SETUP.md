# 📧 SendGrid Setup for Tracksub Email Notifications

## Why SendGrid?
- ✅ Works on Render free tier (uses API, not SMTP)
- ✅ Free tier: 100 emails/day forever
- ✅ More reliable than Gmail for automated emails
- ✅ Professional email service

---

## Step-by-Step Setup (5 minutes)

### 1️⃣ Create SendGrid Account

1. Go to: https://signup.sendgrid.com/
2. Fill in your details:
   - Email address
   - Password
   - Choose "I'm a Developer"
3. Verify your email address (check inbox)
4. Complete the onboarding questionnaire:
   - Select: "I'm building a web application"
   - Purpose: "Transactional emails"
   - Skip partner integration

### 2️⃣ Verify a Sender Email Address

**Important:** SendGrid requires you to verify the email address you'll send FROM.

1. In SendGrid dashboard, go to: **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Name:** Tracksub Notifications
   - **From Email Address:** your-email@gmail.com (use your real email)
   - **Reply To:** same as above
   - **Company Address:** Can use your home address
   - **Nickname:** Tracksub
4. Click **Create**
5. Check your email and click the verification link
6. Wait for "Verified" status (takes ~1 minute)

### 3️⃣ Create API Key

1. In SendGrid dashboard, go to: **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `Tracksub Production`
4. Permissions: Choose **Restricted Access**
   - Scroll down to **Mail Send**
   - Set to **Full Access**
   - Leave everything else as "No Access"
5. Click **Create & View**
6. **COPY THE API KEY NOW!** (You can't see it again)
   - It looks like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4️⃣ Configure Render Environment Variables

Go to: Render Dashboard → Your Web Service → Environment

**Remove these old Gmail variables:**
- ❌ `EMAIL_HOST`
- ❌ `EMAIL_PORT`
- ❌ `EMAIL_USER`
- ❌ `EMAIL_PASS`

**Add these new variables:**

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=your-email@gmail.com
NODE_ENV=production
```

**Replace:**
- `SG.xxx...` = Your actual API key from step 3
- `your-email@gmail.com` = The email you verified in step 2

### 5️⃣ Save and Deploy

1. Click **Save Changes** in Render
2. Wait 2-3 minutes for automatic redeploy
3. Check logs for: `📧 Email service: Production (SendGrid)`

### 6️⃣ Test Email Notifications

1. Log in to your app
2. Go to **Settings** → Set notification days (e.g., 7)
3. Create a test subscription:
   - Start date: 1 month ago (e.g., 2024-09-30)
   - Billing cycle: Monthly
4. Click **Send Test Notification**
5. Check your email inbox! 📬

---

## ✅ Verification Checklist

After setup, verify:
- [ ] SendGrid account created and email verified
- [ ] Sender email verified in SendGrid
- [ ] API key created and copied
- [ ] Environment variables set in Render
- [ ] App redeployed successfully
- [ ] Logs show "Production (SendGrid)"
- [ ] Test email received

---

## 🔍 Troubleshooting

### "Unauthorized" error
- ✅ Check API key is correct (no extra spaces)
- ✅ Verify API key has "Mail Send: Full Access" permission

### "Sender email not verified" error
- ✅ Go to SendGrid → Settings → Sender Authentication
- ✅ Make sure email shows "Verified" status
- ✅ EMAIL_FROM must match the verified email exactly

### No email received
- ✅ Check spam folder
- ✅ Check Render logs for "EMAIL SENT SUCCESSFULLY"
- ✅ Verify subscription next_payment_date matches notification calculation

### "The from email does not match a verified Sender Identity"
- ✅ Make sure `EMAIL_FROM` in Render matches the email you verified in SendGrid
- ✅ Email addresses are case-sensitive - match exactly

---

## 📊 SendGrid Free Tier Limits

- **Daily limit:** 100 emails/day
- **No expiration:** Free forever
- **No credit card:** Required for signup but not charged
- **Perfect for:** Personal use, up to ~15 users with daily notifications

---

## 🎉 You're Done!

Your production email notifications are now powered by SendGrid!

**Daily cron job:** Runs at midnight UTC, checks all subscriptions, sends reminders

**Manual testing:** Use "Send Test Notification" button in Settings page

---

## 💡 Tips

1. **Monitor usage:** SendGrid dashboard → Stats (check daily sends)
2. **Unverified emails:** SendGrid requires sender verification - you can't send from random addresses
3. **Custom domain:** For professional emails (notifications@yourdomain.com), upgrade to paid plan
4. **Need more emails?:** Paid plans start at $15/month for 40,000 emails

---

**Questions?** Check SendGrid docs: https://docs.sendgrid.com/
