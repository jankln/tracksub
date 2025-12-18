import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DarkTheme.css';
import NavigationBar from './components/NavigationBar';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EditSubscriptionPage from './pages/EditSubscriptionPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';
import BankSyncPage from './pages/BankSyncPage';
import CalendarPage from './pages/CalendarPage';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('token') !== null);

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(localStorage.getItem('token') !== null);
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-change', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    return isAuthenticated ? children : <Navigate to="/welcome" replace />;
  };

  const PublicRoute = ({ children }: { children: React.ReactElement }) => {
    return !isAuthenticated ? children : <Navigate to="/" replace />;
  };

  return (
    <LanguageProvider>
      <Router>
        {isAuthenticated && <NavigationBar />}
        <Routes>
          <Route
            path="/welcome"
            element={
              <PublicRoute>
                <WelcomePage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              ) : (
                <Navigate to="/welcome" />
              )
            }
          />
          <Route
            path="/edit-subscription/:id"
            element={
              <PrivateRoute>
                <EditSubscriptionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <PrivateRoute>
                <SubscriptionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <PrivateRoute>
                <BillingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/bank-sync"
            element={
              <PrivateRoute>
                <BankSyncPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <CalendarPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
