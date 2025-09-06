import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import AlertContext from '../../context/AlertContext';

const EditLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseInterested: '',
    status: '',
    source: '',
    location: '',
    parentName: '',
    parentPhone: '',
    notes: '',
    nextFollowUp: ''
  });

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await axios.get(`/api/leads/${id}`);
        const leadData = res.data;
        
        // Format date for input field
        if (leadData.nextFollowUp) {
          const date = new Date(leadData.nextFollowUp);
          leadData.nextFollowUp = date.toISOString().split('T')[0];
        }
        
        setFormData({
          name: leadData.name || '',
          email: leadData.email || '',
          phone: leadData.phone || '',
          courseInterested: leadData.courseInterested || '',
          status: leadData.status || 'New',
          source: leadData.source || '',
          location: leadData.location || '',
          parentName: leadData.parentName || '',
          parentPhone: leadData.parentPhone || '',
          notes: leadData.notes || '',
          nextFollowUp: leadData.nextFollowUp || ''
        });
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

  const {
    name,
    email,
    phone,
    courseInterested,
    status,
    source,
    location,
    parentName,
    parentPhone,
    notes,
    nextFollowUp
  } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.put(`/api/leads/${id}`, formData);
      setAlert('Lead updated successfully', 'success');
      navigate(`/leads/${id}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => setAlert(error.msg, 'error'));
      } else {
        setAlert('Failed to update lead', 'error');
      }
    } finally {
      setSubmitting(false);
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Lead
        </Typography>
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="name"
                value={name}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phone"
                value={phone}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="course-label">Course Interested</InputLabel>
                <Select
                  labelId="course-label"
                  name="courseInterested"
                  value={courseInterested}
                  onChange={onChange}
                  label="Course Interested"
                >
                  <MenuItem value="B.Tech">B.Tech</MenuItem>
                  <MenuItem value="M.Tech">M.Tech</MenuItem>
                  <MenuItem value="MBA">MBA</MenuItem>
                  <MenuItem value="BBA">BBA</MenuItem>
                  <MenuItem value="B.Sc">B.Sc</MenuItem>
                  <MenuItem value="M.Sc">M.Sc</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={status}
                  onChange={onChange}
                  label="Status"
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Interested">Interested</MenuItem>
                  <MenuItem value="Not Interested">Not Interested</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Admitted">Admitted</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="source-label">Source</InputLabel>
                <Select
                  labelId="source-label"
                  name="source"
                  value={source}
                  onChange={onChange}
                  label="Source"
                >
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Social Media">Social Media</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                  <MenuItem value="Advertisement">Advertisement</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={location}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Next Follow-up Date"
                name="nextFollowUp"
                type="date"
                value={nextFollowUp}
                onChange={onChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Parent Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Parent Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent's Name"
                name="parentName"
                value={parentName}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent's Phone"
                name="parentPhone"
                value={parentPhone}
                onChange={onChange}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                multiline
                rows={4}
                value={notes}
                onChange={onChange}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(`/leads/${id}`)}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting || !name || !phone || !courseInterested}
              >
                {submitting ? <CircularProgress size={24} /> : 'Update Lead'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditLead;