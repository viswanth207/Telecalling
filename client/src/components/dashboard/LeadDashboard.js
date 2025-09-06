import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { Phone, Message, NoteAdd, Logout } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import setAuthToken from '../../utils/setAuthToken';

const LeadDashboard = () => {
  const { user, setIsAuthenticated, setUser } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksDialog, setRemarksDialog] = useState({ open: false, leadId: null, leadName: '' });
  const [remarks, setRemarks] = useState('');
  const [authError, setAuthError] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(false);
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const fetchAssignedLeads = useCallback(async () => {
    try {
      const res = await axios.get('/api/leads/assigned-to-me');
      setAssignedLeads(res.data);
      setAuthError(false);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setAuthError(true);
        setAlert('Session expired. Please clear your session and log in again.', 'error');
      } else {
        setAlert('Failed to fetch assigned students', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [setAlert]);

  useEffect(() => {
    fetchAssignedLeads();
  }, [fetchAssignedLeads]);

  const handleOpenRemarksDialog = (leadId, leadName) => {
    setRemarksDialog({ open: true, leadId, leadName });
    setRemarks('');
  };

  const handleCloseRemarksDialog = () => {
    setRemarksDialog({ open: false, leadId: null, leadName: '' });
    setRemarks('');
  };

  const handleSubmitRemarks = async () => {
    if (!remarks.trim()) {
      setAlert('Please enter remarks', 'error');
      return;
    }

    try {
      // Add interaction with remarks
      await axios.post('/api/interactions', {
        lead: remarksDialog.leadId,
        type: 'Remarks',
        remarks: remarks.trim(),
        statusBefore: 'Follow-up',
        statusAfter: 'Follow-up'
      });

      // Update the lead's lastFollowUp date
      await axios.put(`/api/leads/${remarksDialog.leadId}`, {
        lastFollowUp: new Date().toISOString()
      });

      // Refresh the leads list
      fetchAssignedLeads();
      
      setAlert('Remarks added successfully', 'success');
      handleCloseRemarksDialog();
    } catch (err) {
      console.error('Error adding remarks:', err);
      if (err.response && err.response.status === 401) {
        setAuthError(true);
        setAlert('Session expired. Please clear your session and log in again.', 'error');
        handleCloseRemarksDialog();
      } else {
        setAlert('Failed to add remarks. Please try again.', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'interested':
        return 'success';
      case 'not_interested':
        return 'error';
      case 'follow_up':
        return 'warning';
      case 'admitted':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
    {authError && (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={handleLogout}
            startIcon={<Logout />}
          >
            Clear Session & Login
          </Button>
        }
      >
        Your session has expired. Please clear your session and log in again.
      </Alert>
    )}
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Welcome, {user?.name}
            </Typography>
            <Typography variant="body1" paragraph>
              You are logged in as a Lead. Here are the students assigned to you.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Your Assigned Students
            </Typography>
            {assignedLeads.length === 0 ? (
              <Typography variant="body1">
                No students have been assigned to you yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Follow-up</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedLeads.map((lead) => (
                      <TableRow key={lead._id}>
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.courseInterested}</TableCell>
                        <TableCell>
                          <Chip 
                            label={lead.status.replace('_', ' ')} 
                            color={getStatusColor(lead.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {lead.lastFollowUp
                            ? format(new Date(lead.lastFollowUp), 'MMM dd, yyyy')
                            : 'No follow-up yet'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Call Student">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => window.open(`tel:${lead.phone}`)}
                              >
                                <Phone />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send Message">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => window.open(`sms:${lead.phone}`)}
                              >
                                <Message />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Add Remarks">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleOpenRemarksDialog(lead._id, lead.name)}
                              >
                                <NoteAdd />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>

    {/* Remarks Dialog */}
    <Dialog open={remarksDialog.open} onClose={handleCloseRemarksDialog} maxWidth="sm" fullWidth>
      <DialogTitle>Add Remarks for {remarksDialog.leadName}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Remarks"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter your remarks about the interaction..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseRemarksDialog}>Cancel</Button>
        <Button onClick={handleSubmitRemarks} variant="contained" color="primary">
          Add Remarks
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default LeadDashboard;