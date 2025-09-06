import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Phone as PhoneIcon, 
  WhatsApp as WhatsAppIcon, 
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const LeadList = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    course: '',
    followUpDate: ''
  });

  const statusColors = {
    'New': 'primary',
    'Interested': 'success',
    'Not Interested': 'error',
    'Follow-up': 'warning',
    'Admitted': 'info',
    'On Hold': 'default'
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.course) queryParams.append('course', filters.course);
        if (filters.followUpDate) queryParams.append('followUpDate', filters.followUpDate);
        
        const url = `/api/leads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const res = await axios.get(url);
        setLeads(res.data);
      } catch (err) {
        console.error(err);
        setAlert('Failed to fetch leads', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [filters, setAlert]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(0); // Reset to first page when filters change
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`/api/leads/${id}`);
        setLeads(leads.filter(lead => lead._id !== id));
        setAlert('Lead deleted successfully', 'success');
      } catch (err) {
        console.error(err);
        setAlert('Failed to delete lead', 'error');
      }
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Students</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/add-lead"
        >
          Add Student
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Interested">Interested</MenuItem>
                <MenuItem value="Not Interested">Not Interested</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
                <MenuItem value="Admitted">Admitted</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="course-filter-label">Course</InputLabel>
              <Select
                labelId="course-filter-label"
                name="course"
                value={filters.course}
                onChange={handleFilterChange}
                label="Course"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="B.Tech">B.Tech</MenuItem>
                <MenuItem value="M.Tech">M.Tech</MenuItem>
                <MenuItem value="MBA">MBA</MenuItem>
                <MenuItem value="BBA">BBA</MenuItem>
                <MenuItem value="B.Sc">B.Sc</MenuItem>
                <MenuItem value="M.Sc">M.Sc</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Follow-up Date"
              type="date"
              name="followUpDate"
              value={filters.followUpDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Leads Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="leads table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Follow-up Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.length > 0 ? (
                leads
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((lead) => (
                    <TableRow key={lead._id}>
                      <TableCell component="th" scope="row">
                        <Link to={`/leads/${lead._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {lead.name}
                        </Link>
                      </TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.courseInterested}</TableCell>
                      <TableCell>
                        <Chip 
                          label={lead.status} 
                          color={statusColors[lead.status] || 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            color="primary" 
                            aria-label="call" 
                            size="small"
                            href={`tel:${lead.phone}`}
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="success" 
                            aria-label="whatsapp" 
                            size="small"
                            href={`https://wa.me/${lead.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="info" 
                            aria-label="email" 
                            size="small"
                            href={`mailto:${lead.email}`}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="warning" 
                            aria-label="edit" 
                            size="small"
                            component={Link}
                            to={`/edit-lead/${lead._id}`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {user && user.role === 'admin' && (
                            <IconButton 
                              color="error" 
                              aria-label="delete" 
                              size="small"
                              onClick={() => handleDeleteLead(lead._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No leads found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={leads.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default LeadList;