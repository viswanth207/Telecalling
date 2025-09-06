const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Lead = require('../../models/Lead');

// @route   GET api/leads/assigned-to-me
// @desc    Get all leads assigned to the logged-in user
// @access  Private
router.get('/assigned-to-me', auth, async (req, res) => {
  try {
    const leads = await Lead.find({ assignedTo: req.user.id });
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;