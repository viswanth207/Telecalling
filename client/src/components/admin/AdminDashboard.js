import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import AlertContext from '../../context/AlertContext';

const AdminDashboard = () => {
  const { setAlert } = useContext(AlertContext);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
    phone: '',
    department: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        setAlert('Failed to fetch users', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [setAlert]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'agent',
      phone: '',
      department: ''
    });
    setEditMode(false);
    setCurrentUserId(null);
  };

  const handleUserFormChange = (e) => {
    setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    try {
      const res = await axios.post('/api/users', userFormData);
      setUsers([...users, res.data]);
      setAlert('User added successfully', 'success');
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => setAlert(error.msg, 'error'));
      } else {
        setAlert('Failed to add user', 'error');
      }
    }
  };

  const handleEditUser = async () => {
    try {
      // Remove password if it's empty (not being updated)
      const userData = { ...userFormData };
      if (!userData.password) delete userData.password;

      const res = await axios.put(`/api/users/${currentUserId}`, userData);
      setUsers(users.map(user => (user._id === currentUserId ? res.data : user)));
      setAlert('User updated successfully', 'success');
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach(error => setAlert(error.msg, 'error'));
      } else {
        setAlert('Failed to update user', 'error');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
        setAlert('User deleted successfully', 'success');
      } catch (err) {
        console.error(err);
        setAlert('Failed to delete user', 'error');
      }
    }
  };

  const openEditDialog = (user) => {
    setCurrentUserId(user._id);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for security
      role: user.role,
      phone: user.phone || '',
      department: user.department || ''
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleAssignLeads = async () => {
    try {
      setLoading(true);
      await axios.post('/api/leads/assign');
      setAlert('Leads assigned successfully', 'success');
    } catch (err) {
      console.error(err);
      setAlert('Failed to assign leads', 'error');
    } finally {
      setLoading(false);
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
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="User Management" />
          <Tab label="Lead Assignment" />
          <Tab label="System Settings" />
        </Tabs>
      </Box>

      {/* User Management Tab */}
      {tabValue === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenDialog}
            >
              Add User
            </Button>
          </Box>

          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>{user.department || 'N/A'}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => openEditDialog(user)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Lead Assignment Tab */}
      {tabValue === 1 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lead Assignment
          </Typography>
          <Typography variant="body1" paragraph>
            Automatically assign unassigned leads to available agents based on workload balance.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAssignLeads}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Assign Leads'}
          </Button>
        </Paper>
      )}

      {/* System Settings Tab */}
      {tabValue === 2 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body1" paragraph>
            System configuration options will be available here in future updates.
          </Typography>
        </Paper>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={userFormData.name}
                onChange={handleUserFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userFormData.email}
                onChange={handleUserFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={editMode ? 'New Password (leave blank to keep current)' : 'Password'}
                name="password"
                type="password"
                value={userFormData.password}
                onChange={handleUserFormChange}
                required={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={userFormData.role}
                  onChange={handleUserFormChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={userFormData.phone}
                onChange={handleUserFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={userFormData.department}
                onChange={handleUserFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={editMode ? handleEditUser : handleAddUser}
            variant="contained"
            color="primary"
          >
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;