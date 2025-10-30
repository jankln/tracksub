# 📊 Tracksub - Subscription Management Platform

A modern, full-stack web application for tracking and managing your subscriptions with intelligent email notifications and comprehensive analytics.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)

## ✨ Features

### 📈 Dashboard & Analytics
- **Real-time Overview** - Monitor monthly and yearly costs at a glance
- **Interactive Charts** - Visualize spending patterns with Chart.js
  - Monthly spending history timeline
  - Subscriptions breakdown by cost
  - Category distribution analysis
  - Monthly vs Yearly comparison
- **Smart Calculations** - Automatic cost projections and totals

### 🎯 Subscription Management
- **Complete CRUD Operations** - Create, read, update, and delete subscriptions
- **Rich Metadata** - Track name, cost, billing cycle, start date, and next payment
- **Category System** - Organize with 10+ pre-defined categories
  - Entertainment, Productivity, Gaming, Music, Education, Cloud Storage, Fitness, News, Software, Other
- **Status Tracking** - Mark subscriptions as active, inactive, or cancelled
- **Age Calculation** - See how long you've been subscribed to each service
- **Advanced Filtering** - Filter by category and status

### 🔔 Notification System
- **Email Reminders** - Get notified before payment dates
- **Customizable Timing** - Set reminder days (1-30 days before payment)
- **Ethereal Test Mode** - Test notifications without real email setup
- **Production Ready** - Easy integration with real SMTP services

### 🎨 User Experience
- **Responsive Design** - Mobile-friendly Bootstrap interface
- **Color-Coded Categories** - Visual distinction for easy identification
- **Status Badges** - Quick visual status indicators
- **Empty States** - Helpful guidance when no data exists
- **Error Handling** - User-friendly error messages
- **Loading States** - Smooth loading indicators

### 🔐 Authentication & Security
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - BCrypt password protection
- **Protected Routes** - Client and server-side route protection
- **Session Management** - Automatic token handling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with Hooks
- **TypeScript** - Type-safe development
- **React Router v6** - Client-side routing
- **Bootstrap 5** - Responsive UI framework
- **React Bootstrap** - Bootstrap components for React
- **Chart.js** - Data visualization
- **Axios** - HTTP client with interceptors

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **SQLite** - Development database
- **PostgreSQL** - Production database
- **Sequelize ORM** - Database management
- **JWT** - Authentication tokens
- **BCrypt** - Password hashing
- **Nodemailer** - Email service
- **Node-cron** - Scheduled tasks

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.x or higher
- **npm** 7.x or higher
- **Git** for version control

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tracksub.git
   cd tracksub
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**
   
   Create `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=sqlite:./database.sqlite
   JWT_SECRET=your_random_secret_key_here
   PORT=5000
   NODE_ENV=development
   
   # Email Configuration (Optional for development)
   EMAIL_HOST=smtp.ethereal.email
   EMAIL_PORT=587
   EMAIL_USER=your-ethereal-user
   EMAIL_PASS=your-ethereal-password
   EMAIL_FROM=noreply@tracksub.app
   ```

5. **Start Development Servers**

   **Terminal 1 - Backend**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

   **Terminal 2 - Frontend**
   ```bash
   cd frontend
   npm start
   ```
   Frontend runs on `http://localhost:3000`

6. **Access the Application**
   
   Open your browser and navigate to `http://localhost:3000`

## 📦 Production Deployment

### Deploy to Render.com

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure service:
     - **Name**: `tracksub`
     - **Environment**: `Node`
     - **Build Command**: `bash build.sh`
     - **Start Command**: `cd backend && node dist/index.js`

3. **Set Environment Variables**
   ```
   DATABASE_URL=<your-postgres-url>
   JWT_SECRET=<generate-random-32-char-string>
   NODE_ENV=production
   EMAIL_HOST=<your-smtp-host>
   EMAIL_PORT=587
   EMAIL_USER=<your-smtp-user>
   EMAIL_PASS=<your-smtp-password>
   EMAIL_FROM=noreply@yourdomain.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Access your app at the provided Render URL

### Deploy to Other Platforms

The application can be deployed to any Node.js hosting platform:
- **Heroku** - Add Procfile: `web: cd backend && node dist/index.js`
- **Railway** - Similar configuration to Render
- **DigitalOcean App Platform** - Use provided buildpacks
- **AWS/Azure/GCP** - Deploy as containerized application

## 🏗️ Project Structure

```
tracksub/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express app setup
│   │   ├── auth.ts            # Authentication routes
│   │   ├── subscriptions.ts   # Subscription routes
│   │   ├── settings.ts        # Settings routes
│   │   ├── models.ts          # Database models
│   │   └── emailService.ts    # Email notification service
│   ├── dist/                  # Compiled JavaScript
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts       # API client
│   │   ├── components/
│   │   │   └── NavigationBar.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── AddSubscriptionPage.tsx
│   │   │   ├── EditSubscriptionPage.tsx
│   │   │   ├── SubscriptionsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── categories.ts      # Category definitions
│   │   └── App.tsx            # Root component
│   └── package.json
├── build.sh                   # Production build script
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login

### Subscriptions
- `GET /api/subscriptions` - Get all user subscriptions
- `GET /api/subscriptions/:id` - Get single subscription
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update notification preferences

### Notifications
- `POST /api/notifications/test` - Send test notification email

## 🧪 Testing

### Test Email Notifications

1. Visit Settings page
2. Configure notification timing
3. Click "Send Test Notification"
4. Check console for Ethereal preview URL

### Production Email Setup

Replace Ethereal credentials with real SMTP service:
- **Gmail** - Use App Password
- **SendGrid** - API integration
- **AWS SES** - Simple Email Service
- **Mailgun** - SMTP service

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | Yes | `sqlite:./database.sqlite` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `PORT` | Server port number | No | `5000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `EMAIL_HOST` | SMTP server host | Yes | - |
| `EMAIL_PORT` | SMTP server port | Yes | `587` |
| `EMAIL_USER` | SMTP username | Yes | - |
| `EMAIL_PASS` | SMTP password | Yes | - |
| `EMAIL_FROM` | Sender email address | Yes | - |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Your Name - [@jankln](https://github.com/jankln)

## 🙏 Acknowledgments

- React Bootstrap for UI components
- Chart.js for data visualization
- Ethereal Email for testing email functionality
- Render.com for hosting platform

---

**Made with ❤️ by [Jan Klein]**
