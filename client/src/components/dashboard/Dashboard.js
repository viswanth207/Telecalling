import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsByStatus: [],
    leadsByCourse: [],
    upcomingFollowUps: 0,
    recentInteractions: [],
  });

  useEffect(() => {
    // Don't fetch data if user is a lead (they'll be redirected)
    if (user && user.role === 'lead') {
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        // Get lead statistics
        const leadsRes = await axios.get('/api/leads/admin-stats');
        
        // Get interaction statistics
        const interactionsRes = await axios.get('/api/interactions/stats');
        
        setStats({
          totalLeads: leadsRes.data.totalLeads || 0,
          leadsByStatus: leadsRes.data.leadsByStatus || [],
          leadsByCourse: leadsRes.data.leadsByCourse || [],
          upcomingFollowUps: leadsRes.data.upcomingFollowUps || 0,
          recentInteractions: interactionsRes.data.recentInteractions || [],
        });
      } catch (err) {
        console.error(err);
        setAlert('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setAlert, user]);

  // Redirect lead users to their specific dashboard
  if (user && user.role === 'lead') {
    return <Navigate to="/lead-dashboard" />;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user?.name} ({user?.role})
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Students
            </Typography>
            <Typography component="p" variant="h3">
              {stats.totalLeads}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Upcoming Follow-ups
            </Typography>
            <Typography component="p" variant="h3">
              {stats.upcomingFollowUps}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Conversion Rate
            </Typography>
            <Typography component="p" variant="h3">
              {stats.totalLeads > 0
                ? `${Math.round(
                    ((stats.leadsByStatus.find(s => s.status === 'Admitted')?.count || 0) /
                      stats.totalLeads) *
                      100
                  )}%`
                : '0%'}
            </Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Leads by Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.leadsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {stats.leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Leads by Course
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.leadsByCourse}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Interactions */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Interactions
            </Typography>
            <Grid container spacing={2}>
              {stats.recentInteractions.length > 0 ? (
                stats.recentInteractions.map((interaction, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardHeader
                        title={interaction.lead?.name || 'Unknown Lead'}
                        subheader={new Date(interaction.date).toLocaleDateString()}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Type: {interaction.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {interaction.statusAfter}
                        </Typography>
                        <Typography variant="body2">
                          {interaction.remarks}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body1" align="center">
                    No recent interactions found
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;