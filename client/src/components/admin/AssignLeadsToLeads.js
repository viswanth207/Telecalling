import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox
} from '@mui/material';
import axios from 'axios';
import AlertContext from '../../context/AlertContext';

const AssignLeadsToLeads = () => {
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const [leadUsers, setLeadUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLeadUser, setSelectedLeadUser] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch lead users
        const leadUsersRes = await axios.get('/api/users/lead-users');
        setLeadUsers(leadUsersRes.data);

        // Fetch unassigned leads
        const leadsRes = await axios.get('/api/leads/unassigned');
        setLeads(leadsRes.data);
      } catch (err) {
        console.error(err);
        setAlert('Failed to fetch data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setAlert]);

  const handleLeadUserChange = (e) => {
    setSelectedLeadUser(e.target.value);
  };

  const handleLeadToggle = (leadId) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  const handleAssign = async () => {
    if (!selectedLeadUser || selectedLeads.length === 0) {
      setAlert('Please select a lead user and at least one student', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/leads/assign-to-lead', {
        leadUserId: selectedLeadUser,
        leadIds: selectedLeads
      });

      setAlert('Students assigned successfully', 'success');
      
      // Refresh data
      const leadsRes = await axios.get('/api/leads/unassigned');
      setLeads(leadsRes.data);
      setSelectedLeads([]);
    } catch (err) {
      console.error(err);
      setAlert('Failed to assign students', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Assign Students to Leads
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="lead-user-label">Select Lead User</InputLabel>
              <Select
                labelId="lead-user-label"
                id="lead-user-select"
                value={selectedLeadUser}
                label="Select Lead User"
                onChange={handleLeadUserChange}
                disabled={loading || leadUsers.length === 0}
              >
                {leadUsers.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssign}
              disabled={loading || !selectedLeadUser || selectedLeads.length === 0}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Assign Selected Students'}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Available Students
            </Typography>
            {leads.length === 0 ? (
              <Typography>No unassigned students available</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Select</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Course Interested</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leads.map(lead => (
                      <TableRow key={lead._id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedLeads.includes(lead._id)}
                            onChange={() => handleLeadToggle(lead._id)}
                          />
                        </TableCell>
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.courseInterested}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AssignLeadsToLeads;