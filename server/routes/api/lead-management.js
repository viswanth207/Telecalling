const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');

const User = require('../../models/User');
const Lead = require('../../models/Lead');

// Note: unassigned route is handled in leads.js to avoid conflicts

// @route   POST api/leads/assign-to-lead
// @desc    Assign leads to a lead user
// @access  Private (Admin only)
router.post('/assign-to-lead', [
  auth,
  adminAuth,
  [
    check('leadUserId', 'Lead user ID is required').not().isEmpty(),
    check('leadIds', 'Lead IDs are required').isArray().not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { leadUserId, leadIds } = req.body;

  try {
    // Verify lead user exists
    const leadUser = await User.findById(leadUserId);
    if (!leadUser || leadUser.role !== 'lead') {
      return res.status(404).json({ msg: 'Lead user not found' });
    }

    // Update all leads with the assigned lead user
    await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { assignedTo: leadUserId } }
    );

    res.json({ msg: 'Leads assigned successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/assigned-to-me
// @desc    Get all leads assigned to the logged-in lead user
// @access  Private (Lead role)
router.get('/assigned-to-me', auth, async (req, res) => {
  try {
    // Check if user is a lead
    const user = req.userObj;
    if (user.role !== 'lead') {
      return res.status(403).json({ msg: 'Not authorized as a lead user' });
    }

    const leads = await Lead.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;