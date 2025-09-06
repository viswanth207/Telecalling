const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/vtfinal')
  .then(() => {
    console.log('Connected to MongoDB');
    return User.find({});
  })
  .then(users => {
    console.log(`Total users: ${users.length}`);
    console.log('\nUser Details:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - Email: ${user.email} - Role: ${user.role} - ID: ${user._id}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });