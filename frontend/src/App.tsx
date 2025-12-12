import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DarkTheme.css';
import NavigationBar from './components/NavigationBar';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddSubscriptionPage from './pages/AddSubscriptionPage';
import EditSubscriptionPage from './pages/EditSubscriptionPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';
import BankSyncPage from './pages/BankSyncPage';

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    return isAuthenticated() ? children : <Navigate to="/welcome" />;
  };

  const PublicRoute = ({ children }: { children: React.ReactElement }) => {
    return !isAuthenticated() ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      {isAuthenticated() && <NavigationBar />}
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
            isAuthenticated() ? (
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            ) : (
              <Navigate to="/welcome" />
            )
          }
        />
        <Route
          path="/add-subscription"
          element={
            <PrivateRoute>
              <AddSubscriptionPage />
            </PrivateRoute>
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
      </Routes>
    </Router>
  );
}

export default App;
