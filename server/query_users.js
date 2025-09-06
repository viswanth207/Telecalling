const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/vtfinal')
  .then(() => {
    console.log('Connected to MongoDB');
    return User.find({ role: 'agent' });
  })
  .then(agents => {
    console.log(`Total agents: ${agents.length}`);
    console.log('\nAgent Details:');
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} - Email: ${agent.email} - ID: ${agent._id}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });