import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import moment from 'moment';
import AlertContext from '../../context/AlertContext';
import AuthContext from '../../context/AuthContext';

const AgentDashboard = () => {
  const { setAlert } = useContext(AlertContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsByStatus: {},
    recentInteractions: [],
    upcomingFollowUps: []
  });

  useEffect(() => {
    const fetchAgentStats = async () => {
      try {
        const [leadsRes, interactionsRes] = await Promise.all([
          axios.get('/api/leads/stats'),
          axios.get('/api/interactions/stats')
        ]);

        setStats({
          totalLeads: leadsRes.data.totalAssignedLeads,
          leadsByStatus: leadsRes.data.leadsByStatus,
          recentInteractions: interactionsRes.data.recentInteractions,
          upcomingFollowUps: leadsRes.data.upcomingFollowUps
        });
      } catch (err) {
        console.error(err);
        setAlert('Failed to fetch dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentStats();
  }, [setAlert]);

  const getStatusColor = (status) => {
    const statusColors = {
      'New': 'primary',
      'Contacted': 'info',
      'Interested': 'success',
      'Not Interested': 'error',
      'Enrolled': 'secondary',
      'On Hold': 'warning'
    };
    return statusColors[status] || 'default';
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
        Agent Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user?.name}!
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              My Leads
            </Typography>
            <Typography variant="h3" sx={{ mb: 2 }}>
              {stats.totalLeads}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                <Chip 
                  key={status} 
                  label={`${status}: ${count}`} 
                  color={getStatusColor(status)} 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Follow-ups
            </Typography>
            {stats.upcomingFollowUps.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Lead Name</TableCell>
                      <TableCell>Follow-up Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.upcomingFollowUps.map((followUp) => (
                      <TableRow key={followUp._id}>
                        <TableCell>
                          <Link to={`/leads/${followUp._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {followUp.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {moment(followUp.nextFollowUp).format('MMM DD, YYYY')}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={followUp.status} 
                            color={getStatusColor(followUp.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Call">
                            <IconButton size="small" href={`tel:${followUp.phone}`}>
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="WhatsApp">
                            <IconButton size="small" href={`https://wa.me/${followUp.phone}`} target="_blank">
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Email">
                            <IconButton size="small" href={`mailto:${followUp.email}`}>
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1">No upcoming follow-ups</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Interactions */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Interactions
        </Typography>
        {stats.recentInteractions.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status Change</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentInteractions.map((interaction) => (
                  <TableRow key={interaction._id}>
                    <TableCell>
                      <Link to={`/leads/${interaction.lead._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {interaction.lead.name}
                      </Link>
                    </TableCell>
                    <TableCell>{interaction.type}</TableCell>
                    <TableCell>{moment(interaction.date).format('MMM DD, YYYY')}</TableCell>
                    <TableCell>
                      {interaction.statusBefore !== interaction.statusAfter ? (
                        <>
                          <Chip 
                            label={interaction.statusBefore} 
                            color={getStatusColor(interaction.statusBefore)} 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          {' → '}
                          <Chip 
                            label={interaction.statusAfter} 
                            color={getStatusColor(interaction.statusAfter)} 
                            size="small" 
                          />
                        </>
                      ) : (
                        <Chip 
                          label={interaction.statusAfter} 
                          color={getStatusColor(interaction.statusAfter)} 
                          size="small" 
                        />
                      )}
                    </TableCell>
                    <TableCell>{interaction.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1">No recent interactions</Typography>
        )}
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Today's Tasks
              </Typography>
              <Typography variant="body2">
                View and manage your follow-ups scheduled for today.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/leads?followUpDate=today">
                View Tasks
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                New Leads
              </Typography>
              <Typography variant="body2">
                Check your newly assigned leads that need initial contact.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/leads?status=New">
                View New Leads
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Interested Leads
              </Typography>
              <Typography variant="body2">
                Follow up with leads who have shown interest in courses.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/leads?status=Interested">
                View Interested Leads
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AgentDashboard;