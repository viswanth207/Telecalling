import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

import AlertContext from '../../context/AlertContext';
import AssignLeadsToLeads from '../admin/AssignLeadsToLeads';
import CSVUpload from '../admin/CSVUpload';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const AdminDashboard = () => {
  const { setAlert } = useContext(AlertContext);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    followUps: 0,
    converted: 0,
    agents: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin dashboard data
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/leads/admin-stats');
        setStats({
          totalLeads: res.data.totalLeads || 0,
          newLeads: res.data.newLeads || 0,
          followUps: res.data.followUps || 0,
          converted: res.data.converted || 0,
          agents: res.data.agents || 0
        });

        // Sample chart data - replace with actual API data
        setChartData([
          { name: 'New', value: res.data.newLeads || 0 },
          { name: 'Follow Up', value: res.data.followUps || 0 },
          { name: 'Converted', value: res.data.converted || 0 },
          { name: 'Not Interested', value: res.data.notInterested || 0 }
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Stats cards */}
        <Grid item xs={12} md={2}>
          <Item>
            <Typography variant="h6">Total Students</Typography>
            <Typography variant="h3">{stats.totalLeads}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={2}>
          <Item>
            <Typography variant="h6">Assigned Students</Typography>
            <Typography variant="h3">{stats.newLeads}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={2}>
          <Item>
            <Typography variant="h6">Follow Ups</Typography>
            <Typography variant="h3">{stats.followUps}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={2}>
          <Item>
            <Typography variant="h6">Converted</Typography>
            <Typography variant="h3">{stats.converted}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={2}>
          <Item>
            <Typography variant="h6">Agents</Typography>
            <Typography variant="h3">{stats.agents}</Typography>
          </Item>
        </Grid>

        {/* Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Lead Status Overview</Typography>
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
                  <Bar dataKey="value" fill="#000000" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* CSV Upload */}
        <Grid item xs={12} md={6}>
          <CSVUpload />
        </Grid>

        {/* Assign Leads to Lead Users */}
        <Grid item xs={12}>
          <AssignLeadsToLeads />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;