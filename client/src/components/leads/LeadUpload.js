import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const LeadUpload = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadResult(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setAlert('Please select a file', 'error');
      return;
    }

    // Check if file is CSV
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setAlert('Please upload a CSV file', 'error');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/leads/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadResult(res.data);
      setAlert('Leads uploaded successfully', 'success');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.msg || 'Failed to upload leads';
      setAlert(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Upload Students
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Alert severity="info">
            <AlertTitle>CSV Format Instructions</AlertTitle>
            <Typography variant="body2" component="div">
              Please ensure your CSV file has the following columns:
              <List dense>
                <ListItem>
                  <ListItemText primary="name" secondary="Full name of the lead (required)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="phone" secondary="Phone number (required)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="email" secondary="Email address" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="courseInterested" secondary="Course of interest (required)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="status" secondary="Status (default: New)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="source" secondary="Lead source" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="location" secondary="Location/City" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="parentName" secondary="Parent's name" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="parentPhone" secondary="Parent's phone" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="notes" secondary="Additional notes" />
                </ListItem>
              </List>
            </Typography>
          </Alert>
        </Box>

        <Box component="form" onSubmit={onSubmit}>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              mb: 3,
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(0, 0, 0, 0.01)'
              }
            }}
            onClick={() => document.getElementById('csv-upload').click()}
          >
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={onFileChange}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Click to select CSV file or drag and drop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {file ? `Selected: ${file.name}` : 'No file selected'}
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!file || loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload Leads'}
          </Button>
        </Box>

        {uploadResult && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Upload Results
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Successfully Uploaded"
                  secondary={`${uploadResult.success} leads`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Failed to Upload"
                  secondary={`${uploadResult.failed} leads`}
                />
              </ListItem>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <ListItem>
                  <ListItemText
                    primary="Errors"
                    secondary={
                      <List dense>
                        {uploadResult.errors.map((error, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={`Row ${error.row || 'Unknown'}`}
                              secondary={error.message}
                            />
                          </ListItem>
                        ))}
                      </List>
                    }
                  />
                </ListItem>
              )}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFile(null);
                  setUploadResult(null);
                }}
              >
                Upload Another File
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/leads')}
              >
                View All Students
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LeadUpload;