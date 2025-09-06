import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Grid, Paper, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const AgentDashboard = () => {
  // const { user } = useContext(AuthContext); // Currently unused
  const { setAlert } = useContext(AlertContext);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    followUps: 0,
    converted: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch agent dashboard data
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/leads/agent-stats');
        setStats({
          totalLeads: res.data.totalLeads || 0,
          newLeads: res.data.newLeads || 0,
          followUps: res.data.followUps || 0,
          converted: res.data.converted || 0
        });

        // Get recent leads
        const leadsRes = await axios.get('/api/leads/recent');
        setRecentLeads(leadsRes.data || []);

        // Sample chart data - replace with actual API data
        setChartData([
          { name: 'New', value: res.data.newLeads || 0 },
          { name: 'Follow Up', value: res.data.followUps || 0 },
          { name: 'Converted', value: res.data.converted || 0 },
          { name: 'Not Interested', value: res.data.notInterested || 0 }
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching agent dashboard data:', err);
        setAlert('Failed to load dashboard data', 'error');
        setLoading(false);
      }
    };

    fetchData();
  }, [setAlert]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Loading Dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Agent Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats cards */}
        <Grid item xs={12} md={3}>
          <Item>
            <Typography variant="h6">My Leads</Typography>
            <Typography variant="h3">{stats.totalLeads}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={3}>
          <Item>
            <Typography variant="h6">Assigned Students</Typography>
            <Typography variant="h3">{stats.newLeads}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={3}>
          <Item>
            <Typography variant="h6">Follow Ups</Typography>
            <Typography variant="h3">{stats.followUps}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={3}>
          <Item>
            <Typography variant="h6">Converted</Typography>
            <Typography variant="h3">{stats.converted}</Typography>
          </Item>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>My Lead Status</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Leads */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Leads</Typography>
            <List>
              {recentLeads.length > 0 ? (
                recentLeads.map((lead, index) => (
                  <React.Fragment key={lead._id || index}>
                    <ListItem>
                      <ListItemText 
                        primary={lead.name} 
                        secondary={`${lead.email || 'No email'} | ${lead.phone || 'No phone'}`} 
                      />
                    </ListItem>
                    {index < recentLeads.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent leads found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AgentDashboard;