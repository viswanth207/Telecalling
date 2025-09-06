import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import setAuthToken from '../../utils/setAuthToken';
import axios from 'axios';

const Landing = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'lead'
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const onLoginChange = e =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const onLoginSubmit = async e => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post('/api/auth', { 
        email: loginData.email, 
        password: loginData.password 
      });
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      const userRes = await axios.get('/api/auth');
      const userData = userRes.data;
      
      if (userData.role !== loginData.role) {
        setAlert(`Invalid credentials for ${loginData.role} role`, 'error');
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
      setLoginLoading(false);
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
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            color="primary"
            gutterBottom
          >
            Vignan University Admissions
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Telecalling System for Efficient Student Enrollment
          </Typography>
          
          <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
              Login
            </Typography>
            <Box component="form" onSubmit={onLoginSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="login-email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={loginData.email}
                onChange={onLoginChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="login-password"
                autoComplete="current-password"
                value={loginData.password}
                onChange={onLoginChange}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="login-role-label">Role</InputLabel>
                <Select
                  labelId="login-role-label"
                  name="role"
                  value={loginData.role}
                  onChange={onLoginChange}
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
                disabled={loginLoading}
              >
                {loginLoading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Don't have an account?
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                component={Link}
                to="/register"
                size="large"
              >
                Register Here
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Landing;