const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/leads', require('./routes/api/leads'));
app.use('/api/interactions', require('./routes/api/interactions'));
app.use('/api/analytics', require('./routes/api/analytics'));
// Additional user routes for lead users
app.use('/api/users', require('./routes/api/lead-users'));
// Additional lead routes for assignment functionality (moved to leads.js)
// Additional lead routes from lead-management
app.use('/api/leads', require('./routes/api/lead-management'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));