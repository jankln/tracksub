# Tracksub - Subscription Tracker

A full-stack application for tracking and managing your subscriptions with email notifications.

## Features
- Track subscriptions with categories and status
- Email notifications before payment
- Dashboard with charts and analytics
- Filter by category and status
- Calculate subscription age

## Tech Stack
- Frontend: React, TypeScript, Bootstrap, Chart.js
- Backend: Node.js, Express, TypeScript
- Database: SQLite (development) / PostgreSQL (production)

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tracksub.git
cd tracksub
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
cd ../backend
cp .env.example .env
# Edit .env with your configuration
```

5. Run development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Deployment

### Render.com
1. Push code to GitHub
2. Create new Web Service on Render.com
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Deploy!

## License
MIT
