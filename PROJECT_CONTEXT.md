# Tracksub Project Context

## Project Overview
**Tracksub** is a web application designed to track and manage personal subscriptions. Users can register, login, add subscriptions, and receive email notifications before payment dates.

## Architecture

### Full Stack Application
- **Frontend**: React with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
Tracksub/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Main server entry point
│   │   ├── database.ts       # SQLite database setup & schema
│   │   ├── auth.ts           # Authentication routes (register/login)
│   │   ├── subscriptions.ts  # Subscription CRUD operations
│   │   └── notifications.ts  # Cron job for email notifications
│   ├── db.sqlite             # SQLite database file
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── HomePage.tsx              # Main dashboard showing all subscriptions
    │   │   ├── LoginPage.tsx             # User login
    │   │   ├── RegisterPage.tsx          # User registration
    │   │   ├── AddSubscriptionPage.tsx   # Add new subscription
    │   │   └── EditSubscriptionPage.tsx  # Edit existing subscription
    │   ├── components/
    │   │   ├── NavigationBar.tsx         # Navigation header
    │   │   └── PrivateRoute.tsx          # Route protection component
    │   ├── api/
    │   │   └── axios.ts                  # Axios config with JWT interceptor
    │   ├── App.tsx                       # Main app with routing
    │   └── index.tsx                     # React entry point
    ├── public/
    ├── package.json
    └── tsconfig.json
```

## Backend Details

### Technology Stack
- **Express.js** v5.1.0 - Web framework
- **TypeScript** v5.9.3 - Type safety
- **SQLite3** v5.1.7 - Database
- **bcrypt** v6.0.0 - Password hashing
- **jsonwebtoken** v9.0.2 - JWT authentication
- **node-cron** v4.2.1 - Scheduled tasks
- **nodemailer** v7.0.10 - Email notifications
- **ts-node-dev** - Development server with auto-reload

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
)
```

#### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  billing_cycle TEXT,
  start_date TEXT,
  next_payment_date TEXT,
  amount REAL,
  FOREIGN KEY (user_id) REFERENCES users (id)
)
```

### API Endpoints

#### Authentication (`/api/auth`)
- **POST /register** - Create new user account
  - Body: `{ email, password }`
  - Returns: JWT token
- **POST /login** - Authenticate user
  - Body: `{ email, password }`
  - Returns: JWT token

#### Subscriptions (`/api/subscriptions`)
All routes require JWT authentication via Authorization header: `Bearer <token>`

- **GET /** - Get all subscriptions for logged-in user
- **GET /:id** - Get specific subscription by ID
- **POST /** - Create new subscription
  - Body: `{ name, billing_cycle, start_date, next_payment_date, amount }`
- **PUT /:id** - Update subscription
  - Body: `{ name, billing_cycle, start_date, next_payment_date, amount }`
- **DELETE /:id** - Delete subscription

### Notification System
- **Cron Job**: Runs daily at midnight (`0 0 * * *`)
- **Function**: Sends email reminders 7 days before subscription payment is due
- **Email Service**: Uses Ethereal (test email service) for development

### Server Configuration
- **Port**: 3000
- **JWT Secret**: `'your-super-secret-key'` ⚠️ (hardcoded - should be environment variable)

## Frontend Details

### Technology Stack
- **React** v19.2.0 - UI framework
- **TypeScript** v4.9.5 - Type safety
- **React Router DOM** v7.9.4 - Client-side routing
- **React Bootstrap** v2.10.10 - UI components
- **Bootstrap** v5.3.8 - Styling
- **Axios** v1.13.1 - HTTP client
- **Create React App** - Project scaffolding

### Pages

#### HomePage (`/`)
- Protected route (requires authentication)
- Displays list of all user subscriptions
- Shows: subscription name, amount, next payment date
- Actions: Add, Edit, Delete subscriptions

#### LoginPage (`/login`)
- Email and password authentication
- Stores JWT token in localStorage
- Redirects to home on success

#### RegisterPage (`/register`)
- New user registration
- Email and password
- Auto-login after registration

#### AddSubscriptionPage (`/add-subscription`)
- Protected route
- Form fields:
  - Name (text)
  - Billing Cycle (monthly/yearly dropdown)
  - Start Date (date picker)
  - Amount (number)
- Calculates next payment date automatically

#### EditSubscriptionPage (`/edit-subscription/:id`)
- Protected route
- Pre-populated form with existing subscription data
- Updates subscription details

### Components

#### NavigationBar
- App-wide navigation
- Shows "Tracksub" brand
- Conditional rendering:
  - Authenticated: Home link + Logout button
  - Unauthenticated: Login + Register links

#### PrivateRoute
- HOC for route protection
- Checks for JWT token in localStorage
- Redirects to login if not authenticated

### API Configuration
- **Base URL**: `/api` (proxied to backend)
- **Proxy**: `http://localhost:3000` (configured in package.json)
- **Auth Interceptor**: Automatically adds JWT token to all requests

### State Management
- Uses React Hooks (`useState`, `useEffect`)
- localStorage for JWT token persistence
- No global state management (Redux/Context API not implemented)

## Key Features

### ✅ Implemented
1. **User Authentication**
   - Registration with email/password
   - Login with JWT tokens
   - Password hashing with bcrypt
   - Protected routes

2. **Subscription Management**
   - Create subscriptions
   - View all subscriptions
   - Edit subscriptions
   - Delete subscriptions
   - Track billing cycles (monthly/yearly)
   - Track payment amounts and dates

3. **Email Notifications**
   - Automated cron job (daily)
   - 7-day reminder before payment
   - Uses Ethereal for testing

4. **User Interface**
   - Responsive design with Bootstrap
   - Clean navigation
   - Form validation
   - CRUD operations

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server (port 3000)
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm start            # Start development server (port 3000)
npm test             # Run tests
npm run build        # Build for production
```

## Known Issues & TODOs

### Security Concerns ⚠️
1. **JWT Secret** - Hardcoded in source code, should use environment variables
2. **CORS** - Not configured, may cause issues in production
3. **Token Expiration** - Tokens expire in 1 hour, no refresh token mechanism
4. **Input Validation** - Minimal validation on backend endpoints

### Missing Features
1. **Environment Variables** - No `.env` file for configuration
2. **Error Handling** - Limited error handling and user feedback
3. **Loading States** - No loading indicators for async operations
4. **Email Verification** - Users not required to verify email addresses
5. **Password Reset** - No forgot password functionality
6. **Subscription Categories** - No way to categorize subscriptions
7. **Total Cost Calculation** - No monthly/yearly total cost display
8. **Currency Support** - Hardcoded to dollars, no multi-currency
9. **Recurring Payment Auto-Update** - No automatic next payment date calculation after payment
10. **Production Email** - Still using Ethereal test service

### Database
- No migrations system
- No indexes on frequently queried fields
- No database backups configured

### Testing
- No unit tests implemented
- No integration tests
- No E2E tests
- Testing libraries installed but not used

### Code Quality
- TypeScript strict mode not enabled
- No linting configuration (ESLint, Prettier)
- Some TypeScript `any` types need proper typing
- No API documentation (Swagger/OpenAPI)

## Deployment Considerations
- Frontend and backend run separately (need reverse proxy or deployment strategy)
- SQLite not ideal for production (consider PostgreSQL/MySQL)
- No Docker configuration
- No CI/CD pipeline
- No logging or monitoring setup

## Current State Summary

**Status**: 🟡 **MVP Complete - Development Stage**

The application has core functionality working:
- Users can register and login
- Users can manage their subscriptions
- Email reminders are scheduled (test service)
- Basic UI with Bootstrap styling

However, the application requires:
- Security improvements (environment variables, better auth)
- Production-ready email service
- Better error handling and validation
- Testing coverage
- Deployment configuration

This is a functional prototype suitable for local development and testing, but requires hardening before production deployment.
