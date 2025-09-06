import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import setAuthToken from '../../utils/setAuthToken';

const Login = () => {
  const { isAuthenticated, setIsAuthenticated, setUser, user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'lead'
  });
  const [loading, setLoading] = useState(false);

  const { email, password, role } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth', { email, password });
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      // Get user data
      const userRes = await axios.get('/api/auth');
      const userData = userRes.data;
      
      // Validate role matches selected role
      if (userData.role !== role) {
        setAlert(`Invalid credentials for ${role} role`, 'error');
        localStorage.removeItem('token');
        setAuthToken(false);
        return;
      }
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => setAlert(error.msg, 'error'));
      } else {
        setAlert('Authentication failed', 'error');
      }
      localStorage.removeItem('token');
      setAuthToken(false);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if logged in based on role
  if (isAuthenticated) {
    if (user && user.role === 'lead') {
      return <Navigate to="/lead-dashboard" />;
    } else if (user && user.role === 'admin') {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={role}
                onChange={onChange}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;