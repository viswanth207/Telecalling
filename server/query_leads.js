const mongoose = require('mongoose');
const Lead = require('./models/Lead');

mongoose.connect('mongodb://127.0.0.1:27017/vtfinal')
  .then(() => {
    console.log('Connected to MongoDB');
    return Lead.find({});
  })
  .then(leads => {
    console.log(`Total leads: ${leads.length}`);
    console.log('\nLead Details:');
    leads.forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.name} - Status: ${lead.status} - Assigned: ${lead.assignedTo ? 'Yes' : 'No'} - ID: ${lead._id}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });