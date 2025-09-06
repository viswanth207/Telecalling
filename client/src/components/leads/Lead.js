import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Box,
  Divider,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  VideoCall as VideoCallIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axios from 'axios';

import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const Lead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await axios.get(`/api/leads/${id}`);
        setLead(res.data);
        setEditData(res.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lead:', err);
        setAlert('Failed to fetch lead details', 'error');
        setLoading(false);
      }
    };

    fetchLead();
  }, [id, setAlert]);

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`/api/leads/${id}`, editData);
      setLead(res.data);
      setEditing(false);
      setAlert('Lead updated successfully', 'success');
    } catch (err) {
      console.error('Error updating lead:', err);
      setAlert('Failed to update lead', 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`/api/leads/${id}`);
        setAlert('Lead deleted successfully', 'success');
        navigate('/leads');
      } catch (err) {
        console.error('Error deleting lead:', err);
        setAlert('Failed to delete lead', 'error');
      }
    }
  };



  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'primary';
      case 'contacted':
        return 'info';
      case 'follow-up':
        return 'warning';
      case 'converted':
        return 'success';
      case 'not interested':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleWhatsAppCall = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=Hello, I would like to call you regarding your inquiry.`, '_blank');
    }
  };

  const handleWhatsAppMessage = (phone) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleEmailClick = (email) => {
    if (email) {
      window.open(`mailto:${email}?subject=Regarding your inquiry&body=Hello, I am reaching out regarding your inquiry.`, '_blank');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Loading Lead Details...</Typography>
      </Container>
    );
  }

  if (!lead) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Lead not found</Typography>
        <Button variant="contained" onClick={() => navigate('/leads')}>Back to Leads</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{lead.name}</Typography>
        <Box>
          {!editing ? (
            <>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={() => setEditing(true)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              {user && user.role === 'admin' && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<DeleteIcon />} 
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />} 
                onClick={handleSaveEdit}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CancelIcon />} 
                onClick={() => {
                  setEditing(false);
                  setEditData(lead);
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Lead Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Lead Details</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {!editing ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>Status:</Typography>
                    <Chip 
                      label={lead.status || 'New'} 
                      color={getStatusColor(lead.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Email:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">{lead.email || 'N/A'}</Typography>
                    {lead.email && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleEmailClick(lead.email)} 
                        color="primary"
                        title="Send Email"
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Phone:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">{lead.phone || 'N/A'}</Typography>
                    {lead.phone && (
                      <>
                        <IconButton 
                          size="small" 
                          href={`tel:${lead.phone}`} 
                          color="primary"
                          title="Call Phone"
                        >
                          <PhoneIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleWhatsAppCall(lead.phone)} 
                          color="success"
                          title="WhatsApp Call"
                        >
                          <VideoCallIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleWhatsAppMessage(lead.phone)} 
                          color="success"
                          title="WhatsApp Message"
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Source:</Typography>
                  <Typography variant="body1">{lead.source || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Assigned To:</Typography>
                  <Typography variant="body1">{lead.assignedTo?.name || 'Unassigned'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Notes:</Typography>
                  <Typography variant="body1">{lead.notes || 'No notes available'}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={editData.name || ''}
                    onChange={handleEditChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={editData.status || 'new'}
                      onChange={handleEditChange}
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
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editData.email || ''}
                    onChange={handleEditChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleEditChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Source"
                    name="source"
                    value={editData.source || ''}
                    onChange={handleEditChange}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={editData.notes || ''}
                    onChange={handleEditChange}
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>


      </Grid>
    </Container>
  );
};

export default Lead;