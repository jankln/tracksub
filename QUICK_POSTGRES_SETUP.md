# 🚀 Quick PostgreSQL Setup for Render

## TL;DR - 5 Minute Setup

### 1. Create PostgreSQL Database (2 min)
```
Render Dashboard → New + → PostgreSQL
- Name: tracksub-db
- Plan: Free
- Create Database
```

### 2. Copy Connection URL (30 sec)
```
Click database → Connections → Copy "Internal Database URL"
```

### 3. Update Web Service (1 min)
```
Your Web Service → Environment → Add/Update:
DATABASE_URL = <paste-internal-url-here>
```

### 4. Done! (1 min)
```
App will auto-redeploy with PostgreSQL
Watch logs for: "Database connection established successfully"
```

## That's It! 🎉

Your app now uses:
- ✅ PostgreSQL in production (data persists forever!)
- ✅ SQLite in development (easy local testing)
- ✅ Automatic table creation
- ✅ No more data loss on redeploys

## Environment Variables Checklist

**Required:**
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Random 32+ character string
- ✅ `NODE_ENV` - Should be "production"

**Optional (for email notifications):**
- ⚪ `EMAIL_HOST` - e.g., smtp.gmail.com
- ⚪ `EMAIL_PORT` - e.g., 587
- ⚪ `EMAIL_USER` - Your email or API key
- ⚪ `EMAIL_PASS` - Your password or API key
- ⚪ `EMAIL_FROM` - Sender email address

## Troubleshooting

**"Unable to connect to database"**
→ Wait 2-3 minutes, database might still be starting

**App keeps restarting**
→ Check logs for errors, verify DATABASE_URL is correct

**Old data disappeared**
→ Expected! PostgreSQL is a fresh database. Re-register and add subscriptions.

---

**Need more details?** See `RENDER_POSTGRES_SETUP.md`
