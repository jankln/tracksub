# PostgreSQL Setup for Render.com

## Quick Setup Guide

Your app is now configured to automatically use PostgreSQL in production! Follow these steps:

### Step 1: Create PostgreSQL Database on Render

1. Go to your Render Dashboard: https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Configure the database:
   - **Name**: `tracksub-db` (or any name you prefer)
   - **Database**: `tracksub`
   - **User**: `tracksub_user`
   - **Region**: Same as your web service
   - **Instance Type**: **Free** (perfect for starting)
4. Click **"Create Database"**
5. Wait 1-2 minutes for database to be created

### Step 2: Get Database Connection URL

1. Once created, click on your new database
2. Scroll down to **"Connections"** section
3. Copy the **"Internal Database URL"** (looks like this):
   ```
   postgresql://tracksub_user:xxxxx@dpg-xxxxx-a/tracksub_xxxxx
   ```
4. **Important**: Use the **Internal** URL (faster, free) not External

### Step 3: Update Your Web Service

1. Go to your **Web Service** (tracksub)
2. Click **"Environment"** in the left sidebar
3. Find the `DATABASE_URL` variable or add it:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Internal Database URL you copied
4. Click **"Save Changes"**

### Step 4: Verify Environment Variables

Make sure you have these environment variables set:

```
DATABASE_URL=postgresql://tracksub_user:xxxxx@dpg-xxxxx-a/tracksub_xxxxx
JWT_SECRET=<your-random-32-character-string>
NODE_ENV=production
```

Optional email settings (for notifications):
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Step 5: Deploy!

1. The app will automatically redeploy with the new DATABASE_URL
2. OR manually trigger deploy: Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Watch the logs for successful database connection:
   ```
   Database connection established successfully.
   Database models synchronized.
   ```

## What Changed?

Your app now automatically:
- ✅ Uses **SQLite** for local development
- ✅ Uses **PostgreSQL** for production (on Render)
- ✅ Creates tables automatically on first run
- ✅ Handles SSL connections to PostgreSQL
- ✅ No data loss on redeploys (unlike SQLite)

## Database Features

### Automatic Table Creation
The app creates these tables automatically:
- `users` - User accounts with notification preferences
- `subscriptions` - User subscriptions with all details

### No Manual Migrations Needed
Tables are created automatically when the app starts!

## Testing Your Database

1. After deployment, register a new account
2. Add some subscriptions
3. Check Render logs to verify database operations
4. Redeploy your app - data should persist!

## Troubleshooting

**App won't start after adding DATABASE_URL?**
- Check the logs in Render dashboard
- Verify the DATABASE_URL is the **Internal** URL
- Make sure database and web service are in same region

**"Unable to connect to database" error?**
- Database might still be initializing (wait 2-3 minutes)
- Check if database status is "Available"
- Try redeploying the web service

**Old SQLite data?**
- SQLite data doesn't transfer automatically
- You'll need to re-register and re-add subscriptions
- Or use a migration tool to transfer data

## Cost Breakdown

**Free Tier (Starter Plan):**
- PostgreSQL: Free (1GB storage, 256MB RAM)
- Expires after 90 days (then upgrade or recreate)
- Perfect for testing and small apps

**Paid Tier ($7/month):**
- PostgreSQL: $7/month (10GB storage, 256MB RAM)
- No expiration
- Better performance
- Recommended for production

## Email Configuration (Optional)

For production email notifications, you can use:

### Option 1: Gmail (Free)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Add to Render environment variables:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=your-16-char-app-password
   EMAIL_FROM=youremail@gmail.com
   ```

### Option 2: SendGrid (Free 100 emails/day)
1. Sign up at https://sendgrid.com
2. Create API Key
3. Add to Render:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

## Next Steps

1. ✅ Set up PostgreSQL database
2. ✅ Update environment variables
3. ✅ Deploy and test
4. 🔄 Configure email service (optional)
5. 🔄 Add custom domain (optional)

---

**Questions?** Check Render docs: https://render.com/docs/databases
