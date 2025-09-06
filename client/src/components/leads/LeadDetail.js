import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import {
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLead = async () => {
      try {
        // Fetch lead details
        const leadRes = await axios.get(`/api/leads/${id}`);
        setLead(leadRes.data);
      } catch (err) {
        console.error(err);
        setAlert('Failed to fetch lead details', 'error');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id, navigate, setAlert]);



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{lead.name}</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/edit-lead/${id}`)}
          >
            EDIT
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Lead Details */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Lead Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography variant="body1">{lead.status}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Course Interested</Typography>
                <Typography variant="body1">{lead.courseInterested}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Phone</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>{lead.phone}</Typography>
                  <IconButton 
                    color="primary" 
                    size="small" 
                    href={`tel:${lead.phone}`}
                  >
                    <PhoneIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    color="success" 
                    size="small" 
                    href={`https://wa.me/${lead.phone}`}
                    target="_blank"
                  >
                    <WhatsAppIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>{lead.email}</Typography>
                  <IconButton 
                    color="info" 
                    size="small" 
                    href={`mailto:${lead.email}`}
                  >
                    <EmailIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Source</Typography>
                <Typography variant="body1">{lead.source || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Next Follow-up</Typography>
                <Typography variant="body1">
                  {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'Not scheduled'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Location</Typography>
                <Typography variant="body1">{lead.location || 'Not specified'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Assigned To</Typography>
                <Typography variant="body1">{lead.assignedTo?.name || 'Not assigned'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Additional Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Parent's Name</Typography>
                <Typography variant="body1">{lead.parentName || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Parent's Phone</Typography>
                <Typography variant="body1">{lead.parentPhone || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Notes</Typography>
                <Typography variant="body1">{lead.notes || 'No notes'}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>


    </Container>
  );
};

export default LeadDetail;