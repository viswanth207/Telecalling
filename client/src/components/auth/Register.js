import React, { useState, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import AlertContext from '../../context/AlertContext';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';

const Register = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'lead'
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    
    if (formData.password !== formData.password2) {
      setAlert('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const body = JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      await axios.post('/api/auth/register', body, config);
      
      setAlert('Registration successful! Please login.', 'success');
      setFormData({
        name: '',
        email: '',
        password: '',
        password2: '',
        role: 'lead'
      });
      
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => setAlert(error.msg, 'error'));
      } else {
        setAlert('Registration failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        pt: 4,
        pb: 6,
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            color="primary"
            gutterBottom
          >
            Register
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Create your account
          </Typography>
          
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={onChange}
              autoComplete="new-password"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              name="password2"
              type="password"
              value={formData.password2}
              onChange={onChange}
              autoComplete="new-password"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
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
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Already have an account?
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to="/"
              size="large"
            >
              Login Here
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;