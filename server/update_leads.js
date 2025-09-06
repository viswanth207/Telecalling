const mongoose = require('mongoose');
const Lead = require('./models/Lead');

// Harsha's ID (lead user)
const HARSHA_ID = '68b416dcefc30e630817377f';

// Lead IDs to assign (5 students)
const LEADS_TO_ASSIGN = [
  '68b423aa1eb23ed7511480b3', // Rahul Sharma
  '68b423aa1eb23ed7511480b5', // Priya Patel
  '68b423aa1eb23ed7511480b7', // Ankit Kumar
  '68b423aa1eb23ed7511480b9', // Sneha Reddy
  '68b423aa1eb23ed7511480bb'  // Arun Singh
];

// Lead ID to remove
const LEAD_TO_REMOVE = '68b423aa1eb23ed7511480bd'; // Kavya Nair

mongoose.connect('mongodb://127.0.0.1:27017/vtfinal')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // 1. Assign 5 students to Harsha
    console.log('\n1. Assigning 5 students to Harsha...');
    const assignResult = await Lead.updateMany(
      { _id: { $in: LEADS_TO_ASSIGN } },
      { 
        $set: { 
          assignedTo: HARSHA_ID,
          updatedAt: new Date()
        } 
      }
    );
    console.log(`Assigned ${assignResult.modifiedCount} students to Harsha`);
    
    // 2. Update Sneha Reddy's status from follow_up to interested (since she's now assigned)
    console.log('\n2. Updating Sneha Reddy\'s status...');
    const statusResult = await Lead.updateOne(
      { _id: '68b423aa1eb23ed7511480b9' }, // Sneha Reddy
      { 
        $set: { 
          status: 'interested',
          updatedAt: new Date()
        } 
      }
    );
    console.log(`Updated Sneha Reddy's status: ${statusResult.modifiedCount} record modified`);
    
    // 3. Remove Kavya Nair
    console.log('\n3. Removing Kavya Nair...');
    const removeResult = await Lead.deleteOne({ _id: LEAD_TO_REMOVE });
    console.log(`Removed ${removeResult.deletedCount} student (Kavya Nair)`);
    
    console.log('\n✅ All updates completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });