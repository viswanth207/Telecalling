import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

import AlertContext from '../../context/AlertContext';
import AuthContext from '../../context/AuthContext';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'new',
    notes: '',
    assignedTo: ''
  });
  
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get('/api/users/agents');
        setAgents(res.data);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setAlert('Failed to fetch agents', 'error');
      }
    };

    const fetchLead = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const res = await axios.get(`/api/leads/${id}`);
        const leadData = res.data;
        
        setFormData({
          name: leadData.name || '',
          email: leadData.email || '',
          phone: leadData.phone || '',
          source: leadData.source || '',
          status: leadData.status || 'new',
          notes: leadData.notes || '',
          assignedTo: leadData.assignedTo?._id || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lead:', err);
        setAlert('Failed to fetch lead details', 'error');
        setLoading(false);
      }
    };

    fetchAgents();
    if (isEdit) {
      fetchLead();
    }
  }, [id, isEdit, setAlert]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (isEdit) {
        await axios.put(`/api/leads/${id}`, formData);
        setAlert('Lead updated successfully', 'success');
      } else {
        await axios.post('/api/leads', formData);
        setAlert('Lead created successfully', 'success');
      }
      navigate('/leads');
    } catch (err) {
      console.error('Error saving lead:', err);
      setAlert(`Failed to ${isEdit ? 'update' : 'create'} lead`, 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading lead data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {isEdit ? 'Edit Lead' : 'Add New Lead'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="Website, Referral, etc."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="follow-up">Follow-up</MenuItem>
                  <MenuItem value="converted">Converted</MenuItem>
                  <MenuItem value="not interested">Not Interested</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  label="Assigned To"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {agents.map(agent => (
                    <MenuItem key={agent._id} value={agent._id}>
                      {agent.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/leads')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update Lead' : 'Create Lead'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default LeadForm;