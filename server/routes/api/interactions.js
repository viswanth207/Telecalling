const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const Interaction = require('../../models/Interaction');
const Lead = require('../../models/Lead');
const User = require('../../models/User');

// @route   POST api/interactions
// @desc    Create a new interaction
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('lead', 'Lead ID is required').not().isEmpty(),
      check('type', 'Interaction type is required').isIn(['call', 'sms', 'whatsapp', 'email']),
      check('remarks', 'Remarks are required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        lead,
        type,
        remarks,
        statusBefore,
        statusAfter,
        duration,
        followUpDate
      } = req.body;

      // Check if lead exists
      const leadObj = await Lead.findById(lead);
      if (!leadObj) {
        return res.status(404).json({ msg: 'Lead not found' });
      }

      // Check if user has access to this lead
      const user = req.userObj;
      if (user.role !== 'admin' && leadObj.assignedTo && leadObj.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Not authorized to add interaction to this lead' });
      }

      // Create interaction
      const interaction = new Interaction({
        lead,
        agent: req.user.id,
        type,
        remarks,
        statusBefore: statusBefore || leadObj.status,
        statusAfter: statusAfter || leadObj.status,
        duration,
        followUpDate
      });

      await interaction.save();

      // Update lead status and follow-up date if provided
      if (statusAfter || followUpDate) {
        const updateFields = {};
        if (statusAfter) updateFields.status = statusAfter;
        if (followUpDate) updateFields.nextFollowUp = followUpDate;
        updateFields.lastFollowUp = Date.now();
        updateFields.updatedAt = Date.now();

        await Lead.findByIdAndUpdate(lead, { $set: updateFields });
      }

      // Populate agent details
      const populatedInteraction = await Interaction.findById(interaction._id)
        .populate('agent', ['name', 'email'])
        .populate('lead', ['name', 'email', 'phone']);

      res.json(populatedInteraction);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/interactions
// @desc    Get all interactions
// @access  Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const interactions = await Interaction.find()
      .sort({ date: -1 })
      .populate('agent', ['name', 'email'])
      .populate('lead', ['name', 'email', 'phone']);

    res.json(interactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/interactions/me
// @desc    Get all interactions by current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const interactions = await Interaction.find({ agent: req.user.id })
      .sort({ date: -1 })
      .populate('lead', ['name', 'email', 'phone']);

    res.json(interactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/interactions/lead/:leadId
// @desc    Get all interactions for a specific lead
// @access  Private
router.get('/lead/:leadId', auth, async (req, res) => {
  try {
    // Check if lead exists
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // Check if user has access to this lead
    const user = req.userObj;
    if (user.role !== 'admin' && lead.assignedTo && lead.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view interactions for this lead' });
    }

    const interactions = await Interaction.find({ lead: req.params.leadId })
      .sort({ date: -1 })
      .populate('agent', ['name', 'email']);

    res.json(interactions);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/interactions/stats
// @desc    Get interaction statistics for current agent
// @access  Private (Agent/Lead/Admin role)
router.get('/stats', auth, async (req, res) => {
  try {
    // Get user info
    const user = req.userObj;
    if (user.role !== 'agent' && user.role !== 'lead' && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Get recent interactions for this agent (limit to 5)
    const recentInteractions = await Interaction.find({ agent: req.user.id })
      .sort({ date: -1 })
      .limit(5)
      .populate('lead', 'name email phone')
      .select('type remarks date statusAfter');

    res.json({
      recentInteractions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/interactions/stats/agent/:agentId
// @desc    Get interaction statistics for a specific agent
// @access  Admin
router.get('/stats/agent/:agentId', [auth, admin], async (req, res) => {
  try {
    // Check if agent exists
    const agent = await User.findById(req.params.agentId);
    if (!agent) {
      return res.status(404).json({ msg: 'Agent not found' });
    }

    // Get total interactions count
    const totalInteractions = await Interaction.countDocuments({ agent: req.params.agentId });

    // Get interactions by type
    const callInteractions = await Interaction.countDocuments({ 
      agent: req.params.agentId,
      type: 'call'
    });
    
    const smsInteractions = await Interaction.countDocuments({ 
      agent: req.params.agentId,
      type: 'sms'
    });
    
    const whatsappInteractions = await Interaction.countDocuments({ 
      agent: req.params.agentId,
      type: 'whatsapp'
    });
    
    const emailInteractions = await Interaction.countDocuments({ 
      agent: req.params.agentId,
      type: 'email'
    });

    // Get interactions resulting in status changes
    const interestedConversions = await Interaction.countDocuments({ 
      agent: req.params.agentId,
      statusAfter: 'interested'
    });
    
    const notInterestedConversions = await Interaction.countDocuments({ 
      agent: req.params.agentId,
      statusAfter: 'not_interested'
    });
    
    const followUpConversions = await Interaction.countDocuments({ 
      agent: req.params.agentId,
      statusAfter: 'follow_up'
    });

    res.json({
      totalInteractions,
      interactionsByType: {
        call: callInteractions,
        sms: smsInteractions,
        whatsapp: whatsappInteractions,
        email: emailInteractions
      },
      conversions: {
        interested: interestedConversions,
        notInterested: notInterestedConversions,
        followUp: followUpConversions
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/interactions/stats/overall
// @desc    Get overall interaction statistics
// @access  Admin
router.get('/stats/overall', [auth, admin], async (req, res) => {
  try {
    const totalInteractions = await Interaction.countDocuments();
    const callInteractions = await Interaction.countDocuments({ type: 'call' });
    const smsInteractions = await Interaction.countDocuments({ type: 'sms' });
    const whatsappInteractions = await Interaction.countDocuments({ type: 'whatsapp' });
    const emailInteractions = await Interaction.countDocuments({ type: 'email' });

    // Get interactions by status change
    const interestedConversions = await Interaction.countDocuments({ statusAfter: 'interested' });
    const notInterestedConversions = await Interaction.countDocuments({ statusAfter: 'not_interested' });
    const followUpConversions = await Interaction.countDocuments({ statusAfter: 'follow_up' });

    // Get recent interactions (last 10)
    const recentInteractions = await Interaction.find()
      .sort({ date: -1 })
      .limit(10)
      .populate('agent', 'name email')
      .populate('lead', 'name email phone')
      .select('type remarks date statusAfter');

    res.json({
      totalInteractions,
      interactionsByType: {
        call: callInteractions,
        sms: smsInteractions,
        whatsapp: whatsappInteractions,
        email: emailInteractions
      },
      conversions: {
        interested: interestedConversions,
        notInterested: notInterestedConversions,
        followUp: followUpConversions
      },
      recentInteractions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/interactions/:id
// @desc    Get interaction by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id)
      .populate('agent', ['name', 'email'])
      .populate('lead', ['name', 'email', 'phone']);

    if (!interaction) {
      return res.status(404).json({ msg: 'Interaction not found' });
    }

    // Check if user has access to this interaction
    const user = req.userObj;
    if (user.role !== 'admin' && interaction.agent._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view this interaction' });
    }

    res.json(interaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Interaction not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/interactions/:id
// @desc    Update interaction
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { remarks, statusAfter, duration, followUpDate } = req.body;

  try {
    let interaction = await Interaction.findById(req.params.id);

    if (!interaction) {
      return res.status(404).json({ msg: 'Interaction not found' });
    }

    // Check if user has access to this interaction
    if (interaction.agent.toString() !== req.user.id) {
      const user = req.userObj;
      if (user.role !== 'admin') {
        return res.status(403).json({ msg: 'Not authorized to update this interaction' });
      }
    }

    // Build interaction object
    const interactionFields = {};
    if (remarks) interactionFields.remarks = remarks;
    if (statusAfter) interactionFields.statusAfter = statusAfter;
    if (duration) interactionFields.duration = duration;
    if (followUpDate) interactionFields.followUpDate = followUpDate;

    // Update
    interaction = await Interaction.findByIdAndUpdate(
      req.params.id,
      { $set: interactionFields },
      { new: true }
    )
      .populate('agent', ['name', 'email'])
      .populate('lead', ['name', 'email', 'phone']);

    // Update lead status and follow-up date if provided
    if (statusAfter || followUpDate) {
      const updateFields = {};
      if (statusAfter) updateFields.status = statusAfter;
      if (followUpDate) updateFields.nextFollowUp = followUpDate;
      updateFields.updatedAt = Date.now();

      await Lead.findByIdAndUpdate(interaction.lead._id, { $set: updateFields });
    }

    res.json(interaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Interaction not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/interactions/:id
// @desc    Delete an interaction
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id);

    if (!interaction) {
      return res.status(404).json({ msg: 'Interaction not found' });
    }

    await Interaction.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Interaction removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Interaction not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;