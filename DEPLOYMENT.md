# Deployment Guide - Render.com

## Step 1: Prepare Your Code

✅ Already done! Your code is ready with:
- Environment variable support
- Build scripts
- Production-ready configuration

## Step 2: Push to GitHub

1. Go to https://github.com and create a new repository called "tracksub"
2. In your terminal:

```bash
cd C:\Users\Jan\git\Tracksub
git add .
git commit -m "Prepare for deployment"
git remote add origin https://github.com/YOUR_USERNAME/tracksub.git
git branch -M main
git push -u origin main
```

## Step 3: Sign Up for Render.com

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (easiest option)
4. Authorize Render to access your repositories

## Step 4: Create Web Service

1. Click "New +" button → "Web Service"
2. Connect your GitHub repository "tracksub"
3. Configure settings:
   - **Name**: tracksub (or whatever you want)
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `cd backend && node dist/index.js`
   - **Instance Type**: Free

## Step 5: Add Environment Variables

Click "Advanced" and add these environment variables:

```
JWT_SECRET=<generate-a-random-32-character-string>
NODE_ENV=production
```

To generate JWT_SECRET, use this in PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## Step 6: Deploy!

1. Click "Create Web Service"
2. Wait 5-10 minutes for the build to complete
3. Your app will be live at: `https://tracksub-XXXX.onrender.com`

## Step 7: Test Your App

1. Visit your Render URL
2. Register a new account
3. Add a subscription
4. Test all features

## Important Notes

⚠️ **Free Tier Limitations:**
- App sleeps after 15 minutes of inactivity
- First request after sleep takes 30-50 seconds to wake up
- 750 hours/month free (enough for one app running 24/7)

## Troubleshooting

**Build fails?**
- Check Render logs for specific errors
- Make sure all dependencies are in package.json

**App doesn't load?**
- Check if build completed successfully
- Verify environment variables are set
- Check Render logs for runtime errors

**Database issues?**
- SQLite works but data resets on redeploy
- For production, upgrade to PostgreSQL (see POSTGRES_SETUP.md)

## Next Steps

1. **Custom Domain** (optional):
   - Buy domain from Namecheap/GoDaddy ($10/year)
   - Add custom domain in Render settings
   - Update DNS records

2. **Email Service**:
   - Sign up for SendGrid (free 100 emails/day)
   - Add environment variables:
     ```
     EMAIL_HOST=smtp.sendgrid.net
     EMAIL_PORT=587
     EMAIL_USER=apikey
     EMAIL_PASS=<your-sendgrid-api-key>
     ```

3. **Monitoring**:
   - Use Render's built-in logs
   - Set up UptimeRobot for uptime monitoring (free)

## Updating Your App

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Render automatically detects the push and redeploys!

## Cost Summary

- **Free tier**: $0/month
  - Includes 750 hours
  - App sleeps after inactivity
  - Perfect for testing

- **Paid tier**: $7/month
  - Always on (no sleeping)
  - Better performance
  - Recommended for production

---

Need help? Check Render docs: https://render.com/docs
