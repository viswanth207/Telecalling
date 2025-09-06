const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const Lead = require('../../models/Lead');
const User = require('../../models/User');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (file.mimetype !== 'text/csv' && 
        file.mimetype !== 'application/vnd.ms-excel' && 
        file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return cb(new Error('Only CSV and Excel files are allowed'));
    }
    cb(null, true);
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// @route   POST api/leads
// @desc    Create a new lead
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('phone', 'Phone number is required').not().isEmpty(),
      check('courseInterested', 'Course interested is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        email,
        phone,
        alternatePhone,
        courseInterested,
        source,
        status,
        city,
        state,
        parentName,
        parentPhone
      } = req.body;

      // Get user role
      const user = req.userObj;
      
      // Build lead object
      const leadFields = {};
      leadFields.name = name;
      leadFields.email = email;
      leadFields.phone = phone;
      if (alternatePhone) leadFields.alternatePhone = alternatePhone;
      leadFields.courseInterested = courseInterested;
      if (source) leadFields.source = source;
      if (status) leadFields.status = status;
      if (city) leadFields.city = city;
      if (state) leadFields.state = state;
      if (parentName) leadFields.parentName = parentName;
      if (parentPhone) leadFields.parentPhone = parentPhone;
      
      // If user is an agent, automatically assign the lead to them
      if (user.role === 'agent') {
        leadFields.assignedTo = req.user.id;
      }

      const lead = new Lead(leadFields);
      await lead.save();

      res.json(lead);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/leads/upload
// @desc    Upload leads from CSV
// @access  Admin
router.post('/upload', [auth, admin, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        // Process each row
        for (const row of results) {
          try {
            // Check required fields
            if (!row.name || !row.email || !row.phone || !row.courseInterested) {
              errors.push({ row, error: 'Missing required fields' });
              continue;
            }

            // Create lead
            const lead = new Lead({
              name: row.name,
              email: row.email,
              phone: row.phone,
              alternatePhone: row.alternatePhone || '',
              courseInterested: row.courseInterested,
              source: row.source || 'website',
              status: row.status || 'new',
              city: row.city || '',
              state: row.state || '',
              parentName: row.parentName || '',
              parentPhone: row.parentPhone || '',
              assignedTo: row.assignedTo || null
            });

            await lead.save();
          } catch (err) {
            errors.push({ row, error: err.message });
          }
        }

        // Delete the file after processing
        fs.unlinkSync(req.file.path);

        res.json({
          success: true,
          count: results.length - errors.length,
          errors: errors
        });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads
// @desc    Get all leads
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = req.userObj;
    let leads;

    // If admin, get all leads, otherwise get only assigned leads
    if (user.role === 'admin') {
      leads = await Lead.find().sort({ createdAt: -1 }).populate('assignedTo', ['name', 'email']);
    } else {
      leads = await Lead.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
    }

    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/admin-stats
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/admin-stats', [auth, admin], async (req, res) => {
  try {
    // Get total leads count
    const totalLeads = await Lead.countDocuments();
    
    // Get leads by status
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const followUps = await Lead.countDocuments({ status: 'follow_up' });
    const converted = await Lead.countDocuments({ status: 'admitted' });
    const notInterested = await Lead.countDocuments({ status: 'not_interested' });
    
    // Get total agents count
    const agents = await User.countDocuments({ role: { $in: ['agent', 'lead'] } });
    
    res.json({
      totalLeads,
      newLeads,
      followUps,
      converted,
      notInterested,
      agents
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/agent-stats
// @desc    Get agent dashboard statistics
// @access  Private (Agent/Lead/Admin role)
router.get('/agent-stats', auth, async (req, res) => {
  try {
    // Get user info
    const user = req.userObj;
    if (user.role !== 'agent' && user.role !== 'lead' && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Get leads assigned to this agent
    const totalLeads = await Lead.countDocuments({ assignedTo: req.user.id });
    const newLeads = await Lead.countDocuments({ assignedTo: req.user.id, status: 'new' });
    const followUps = await Lead.countDocuments({ assignedTo: req.user.id, status: 'follow_up' });
    const converted = await Lead.countDocuments({ assignedTo: req.user.id, status: 'admitted' });
    const notInterested = await Lead.countDocuments({ assignedTo: req.user.id, status: 'not_interested' });
    
    res.json({
      totalLeads,
      newLeads,
      followUps,
      converted,
      notInterested
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/recent
// @desc    Get recent leads for agent
// @access  Private (Agent/Lead role)
router.get('/recent', auth, async (req, res) => {
  try {
    // Get user info
    const user = req.userObj;
    if (user.role !== 'agent' && user.role !== 'lead') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Get recent leads assigned to this agent (limit to 10)
    const recentLeads = await Lead.find({ assignedTo: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email phone status courseInterested createdAt');
    
    res.json(recentLeads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/unassigned
// @desc    Get all unassigned leads
// @access  Admin
router.get('/unassigned', [auth, admin], async (req, res) => {
  try {
    const leads = await Lead.find({ 
      $or: [
        { assignedTo: { $exists: false } },
        { assignedTo: null }
      ]
    }).sort({ createdAt: -1 });
    res.json(leads);
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

// @route   GET api/leads/:id
// @desc    Get lead by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', ['name', 'email']);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // Check if user has access to this lead
    const user = req.userObj;
    if (user.role !== 'admin' && lead.assignedTo && lead.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to access this lead' });
    }

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/leads/:id
// @desc    Update lead
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const {
    name,
    email,
    phone,
    alternatePhone,
    courseInterested,
    source,
    status,
    city,
    state,
    parentName,
    parentPhone,
    assignedTo,
    nextFollowUp
  } = req.body;

  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // Check if user has access to this lead
    const user = req.userObj;
    if (user.role !== 'admin' && lead.assignedTo && lead.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this lead' });
    }

    // Build lead object
    const leadFields = {};
    if (name) leadFields.name = name;
    if (email) leadFields.email = email;
    if (phone) leadFields.phone = phone;
    if (alternatePhone !== undefined) leadFields.alternatePhone = alternatePhone;
    if (courseInterested) leadFields.courseInterested = courseInterested;
    if (source) leadFields.source = source;
    if (status) leadFields.status = status;
    if (city !== undefined) leadFields.city = city;
    if (state !== undefined) leadFields.state = state;
    if (parentName !== undefined) leadFields.parentName = parentName;
    if (parentPhone !== undefined) leadFields.parentPhone = parentPhone;
    if (nextFollowUp) leadFields.nextFollowUp = nextFollowUp;
    leadFields.updatedAt = Date.now();

    // Only admin can assign leads
    if (assignedTo && user.role === 'admin') {
      leadFields.assignedTo = assignedTo;
    }

    // Update
    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: leadFields },
      { new: true }
    ).populate('assignedTo', ['name', 'email']);

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/leads/assign/:id
// @desc    Assign lead to an agent
// @access  Admin
router.put('/assign/:id', [auth, admin], async (req, res) => {
  const { assignedTo } = req.body;

  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // Check if agent exists
    if (assignedTo) {
      const agent = await User.findById(assignedTo);
      if (!agent || agent.role !== 'agent') {
        return res.status(400).json({ msg: 'Invalid agent ID' });
      }
    }

    // Update
    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          assignedTo: assignedTo || null,
          updatedAt: Date.now()
        } 
      },
      { new: true }
    ).populate('assignedTo', ['name', 'email']);

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/leads/:id
// @desc    Delete a lead
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    await Lead.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/filter/:status
// @desc    Filter leads by status
// @access  Private
router.get('/filter/:status', auth, async (req, res) => {
  try {
    const user = req.userObj;
    let leads;

    // If admin, get all leads with the status, otherwise get only assigned leads with the status
    if (user.role === 'admin') {
      leads = await Lead.find({ status: req.params.status })
        .sort({ createdAt: -1 })
        .populate('assignedTo', ['name', 'email']);
    } else {
      leads = await Lead.find({ 
        assignedTo: req.user.id,
        status: req.params.status 
      }).sort({ createdAt: -1 });
    }

    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/course/:course
// @desc    Filter leads by course
// @access  Private
router.get('/course/:course', auth, async (req, res) => {
  try {
    const user = req.userObj;
    let leads;

    // If admin, get all leads for the course, otherwise get only assigned leads for the course
    if (user.role === 'admin') {
      leads = await Lead.find({ 
        courseInterested: { $regex: req.params.course, $options: 'i' } 
      })
        .sort({ createdAt: -1 })
        .populate('assignedTo', ['name', 'email']);
    } else {
      leads = await Lead.find({ 
        assignedTo: req.user.id,
        courseInterested: { $regex: req.params.course, $options: 'i' } 
      }).sort({ createdAt: -1 });
    }

    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/leads/followup/today
// @desc    Get leads with follow-up scheduled for today
// @access  Private
router.get('/followup/today', auth, async (req, res) => {
  try {
    const user = req.userObj;
    
    // Get today's date range (start of day to end of day)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    let leads;

    // If admin, get all leads with follow-up today, otherwise get only assigned leads with follow-up today
    if (user.role === 'admin') {
      leads = await Lead.find({ 
        nextFollowUp: { $gte: startOfDay, $lte: endOfDay } 
      })
        .sort({ nextFollowUp: 1 })
        .populate('assignedTo', ['name', 'email']);
    } else {
      leads = await Lead.find({ 
        assignedTo: req.user.id,
        nextFollowUp: { $gte: startOfDay, $lte: endOfDay } 
      }).sort({ nextFollowUp: 1 });
    }

    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;