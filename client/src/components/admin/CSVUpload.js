import React, { useState, useContext } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import AlertContext from '../../context/AlertContext';

const CSVUpload = () => {
  const { setAlert } = useContext(AlertContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResults(null);
    } else {
      setAlert('Please select a valid CSV file', 'error');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setAlert('Please select a CSV file first', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/leads/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const results = {
        successful: res.data.count,
        failed: res.data.errors.length,
        errors: res.data.errors
      };
      setUploadResults(results);
      setAlert(`Successfully uploaded ${res.data.count} students`, 'success');
      setFile(null);
      // Reset file input
      document.getElementById('csv-file-input').value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setAlert(err.response?.data?.message || 'Failed to upload CSV file', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Student Details (CSV)
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload a CSV file with student details. Required columns: name, email, phone, courseInterested
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            component="label"
            htmlFor="csv-file-input"
            startIcon={<CloudUpload />}
          >
            Choose CSV File
          </Button>
          
          {file && (
            <Typography variant="body2">
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </Button>

        {uploading && (
          <LinearProgress sx={{ mt: 1 }} />
        )}

        {uploadResults && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Upload completed: {uploadResults.successful} successful, {uploadResults.failed} failed
            </Alert>
            
            {uploadResults.errors && uploadResults.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Errors:
                </Typography>
                <List dense>
                  {uploadResults.errors.slice(0, 5).map((error, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`Row ${error.row}: ${error.message}`}
                        secondary={error.data ? JSON.stringify(error.data) : ''}
                      />
                    </ListItem>
                  ))}
                  {uploadResults.errors.length > 5 && (
                    <ListItem>
                      <ListItemText 
                        primary={`... and ${uploadResults.errors.length - 5} more errors`}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CSVUpload;