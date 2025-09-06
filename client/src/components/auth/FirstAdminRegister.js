import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Box
} from '@mui/material';
import AlertContext from '../../context/AlertContext';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';

const FirstAdminRegister = () => {
  const { setAlert } = useContext(AlertContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // Redirect if registration was successful
  if (registered) {
    return <Navigate to="/login" />;
  }

  const { name, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setAlert('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to register first admin...');
      const res = await axios.post('/api/users/register-first-admin', {
        name,
        email,
        password
      });

      console.log('Registration successful:', res.data);
      setAlert('Admin registered successfully. Please login.', 'success');
      setRegistered(true);
    } catch (err) {
      console.error('Registration error:', err);
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => setAlert(error.msg, 'error'));
      } else if (err.response?.data?.msg) {
        setAlert(err.response.data.msg, 'error');
      } else {
        setAlert('Registration failed. Please check server connection.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register First Admin
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Create the first administrator account for your system
        </Typography>
        
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={onChange}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm Password"
            type="password"
            id="password2"
            value={password2}
            onChange={onChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FirstAdminRegister;