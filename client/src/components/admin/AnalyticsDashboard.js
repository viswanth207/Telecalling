import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import AuthContext from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';

const AnalyticsDashboard = () => {
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days
  const [analytics, setAnalytics] = useState({
    overview: {
      totalLeads: 0,
      totalInteractions: 0,
      conversionRate: 0,
      activeAgents: 0
    },
    leadTrends: [],
    interactionTrends: [],
    statusDistribution: [],
    agentPerformance: [],
    coursePopularity: [],
    recentActivities: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange));
      
      const [overviewRes, trendsRes, performanceRes, activitiesRes] = await Promise.all([
        axios.get('/api/analytics/overview', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        }),
        axios.get('/api/analytics/trends', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        }),
        axios.get('/api/analytics/agent-performance', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        }),
        axios.get('/api/analytics/recent-activities', {
          params: { limit: 10 }
        })
      ]);

      setAnalytics({
        overview: overviewRes.data,
        leadTrends: trendsRes.data.leadTrends || [],
        interactionTrends: trendsRes.data.interactionTrends || [],
        statusDistribution: trendsRes.data.statusDistribution || [],
        agentPerformance: performanceRes.data || [],
        coursePopularity: trendsRes.data.coursePopularity || [],
        recentActivities: activitiesRes.data || []
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setAlert('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#aaaaaa'];

  const getStatusColor = (status) => {
    const colors = {
      'New': 'primary',
      'Interested': 'info',
      'Follow-up': 'warning',
      'Admitted': 'success',
      'Not Interested': 'error',
      'On Hold': 'default'
    };
    return colors[status] || 'default';
  };

  const getInteractionIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'call': return <PhoneIcon />;
      case 'email': return <EmailIcon />;
      case 'whatsapp': return <PhoneIcon />;
      default: return <AssignmentIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={dateRange}
            label="Date Range"
            onChange={(e) => setDateRange(e.target.value)}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.totalLeads}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Interactions
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.totalInteractions}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.conversionRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Agents
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.activeAgents}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lead Trends Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead & Interaction Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.leadTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Assigned Students"
                />
                <Area
                  type="monotone"
                  dataKey="interactions"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Interactions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Agent Performance */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Agent Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leadsAssigned" fill="#8884d8" name="Leads Assigned" />
                <Bar dataKey="interactions" fill="#82ca9d" name="Interactions" />
                <Bar dataKey="conversions" fill="#ffc658" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Course Popularity */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Popular Courses
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell align="right">Leads</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.coursePopularity.map((course, index) => (
                    <TableRow key={index}>
                      <TableCell>{course.name}</TableCell>
                      <TableCell align="right">{course.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {analytics.recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInteractionIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${activity.agentName} ${activity.type} ${activity.leadName}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.remarks}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(activity.date), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={activity.status}
                      color={getStatusColor(activity.status)}
                      size="small"
                    />
                  </ListItem>
                  {index < analytics.recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsDashboard;