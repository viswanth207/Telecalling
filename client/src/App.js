import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './App.css';

// Components
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import FirstAdminRegister from './components/auth/FirstAdminRegister';
import LeadRegister from './components/auth/LeadRegister';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import LeadDashboard from './components/dashboard/LeadDashboard';
import AnalyticsDashboard from './components/dashboard/AnalyticsDashboard';

// Lead Components
import Leads from './components/leads/Leads';
import Lead from './components/leads/Lead';
import LeadForm from './components/leads/LeadForm';
import LeadUpload from './components/leads/LeadUpload';

// Utils
import setAuthToken from './utils/setAuthToken';

// Context
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#ffffff',
    },
  },
});

// Check for token
if (localStorage.token) {
  // Set auth token header
  setAuthToken(localStorage.token);
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token
    if (localStorage.token) {
      try {
        // Decode token and get user info
        const decoded = jwtDecode(localStorage.token);

        // Check for expired token
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Logout user
          localStorage.removeItem('token');
          setAuthToken(false);
          setIsAuthenticated(false);
          setUser(null);
        } else {
          // Set user and isAuthenticated
          setIsAuthenticated(true);
          loadUser();
        }
      } catch (err) {
        console.error('Token validation error:', err);
        localStorage.removeItem('token');
        setAuthToken(false);
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth');
      setUser(res.data);
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('token');
      setAuthToken(false);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Private Route component
  const PrivateRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  // Admin Route component
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return isAuthenticated && user?.role === 'admin' ? (
      children
    ) : (
      <Navigate to="/dashboard" />
    );
  };

  // Lead Route component
  const LeadRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return isAuthenticated && user?.role === 'lead' ? (
      children
    ) : (
      <Navigate to="/dashboard" />
    );
  };

  return (
    <AuthProvider value={{ isAuthenticated, user, loading, setIsAuthenticated, setUser }}>
      <AlertProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
            <Navbar />
            <Alert />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-first-admin" element={<FirstAdminRegister />} />
              <Route path="/register-lead" element={<LeadRegister />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/lead-dashboard"
                element={
                  <LeadRoute>
                    <LeadDashboard />
                  </LeadRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <PrivateRoute>
                    <Leads />
                  </PrivateRoute>
                }
              />
              <Route
                path="/leads/:id"
                element={
                  <PrivateRoute>
                    <Lead />
                  </PrivateRoute>
                }
              />
              <Route
                path="/add-lead"
                element={
                  <PrivateRoute>
                    <LeadForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/upload-leads"
                element={
                  <AdminRoute>
                    <LeadUpload />
                  </AdminRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <AdminRoute>
                    <AnalyticsDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
        </ThemeProvider>
      </AlertProvider>
    </AuthProvider>
  );
};

export default App;
