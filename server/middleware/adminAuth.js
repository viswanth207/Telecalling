const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    // Get user from database
    const user = await User.findById(req.user.id).select('-password');
    
    // Check if user exists and is an admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized as admin' });
    }
    
    next();
  } catch (err) {
    console.error('Error in admin authorization middleware:', err.message);
    res.status(500).send('Server Error');
  }
};