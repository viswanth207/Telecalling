const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const Lead = require('../../models/Lead');
const Interaction = require('../../models/Interaction');
const User = require('../../models/User');
const { startOfDay, endOfDay, subDays, format } = require('date-fns');

// @route   GET api/analytics/overview
// @desc    Get overview analytics
// @access  Private (Admin only)
router.get('/overview', [auth, admin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate) : new Date();

    // Total leads in date range
    const totalLeads = await Lead.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // Total interactions in date range
    const totalInteractions = await Interaction.countDocuments({
      date: { $gte: start, $lte: end }
    });

    // Conversion rate (admitted leads / total leads)
    const admittedLeads = await Lead.countDocuments({
      status: 'Admitted',
      createdAt: { $gte: start, $lte: end }
    });
    const conversionRate = totalLeads > 0 ? ((admittedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Active agents (agents with interactions in date range)
    const activeAgents = await Interaction.distinct('agent', {
      date: { $gte: start, $lte: end }
    });

    res.json({
      totalLeads,
      totalInteractions,
      conversionRate: parseFloat(conversionRate),
      activeAgents: activeAgents.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/trends
// @desc    Get trend analytics
// @access  Private (Admin only)
router.get('/trends', [auth, admin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate) : new Date();

    // Lead trends by day
    const leadTrends = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          leads: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Interaction trends by day
    const interactionTrends = await Interaction.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          interactions: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Combine trends data
    const trendsMap = new Map();
    leadTrends.forEach(item => {
      trendsMap.set(item._id, { date: item._id, leads: item.leads, interactions: 0 });
    });
    interactionTrends.forEach(item => {
      if (trendsMap.has(item._id)) {
        trendsMap.get(item._id).interactions = item.interactions;
      } else {
        trendsMap.set(item._id, { date: item._id, leads: 0, interactions: item.interactions });
      }
    });

    const combinedTrends = Array.from(trendsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Status distribution
    const statusDistribution = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Course popularity
    const coursePopularity = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$courseInterested',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      leadTrends: combinedTrends,
      interactionTrends: combinedTrends,
      statusDistribution,
      coursePopularity
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/agent-performance
// @desc    Get agent performance analytics
// @access  Private (Admin only)
router.get('/agent-performance', [auth, admin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate) : new Date();

    // Get all agents
    const agents = await User.find({ role: { $in: ['agent', 'lead'] } }).select('name email');

    const agentPerformance = await Promise.all(
      agents.map(async (agent) => {
        // Leads assigned to agent
        const leadsAssigned = await Lead.countDocuments({
          assignedTo: agent._id,
          createdAt: { $gte: start, $lte: end }
        });

        // Interactions by agent
        const interactions = await Interaction.countDocuments({
          agent: agent._id,
          date: { $gte: start, $lte: end }
        });

        // Conversions by agent
        const conversions = await Lead.countDocuments({
          assignedTo: agent._id,
          status: 'Admitted',
          updatedAt: { $gte: start, $lte: end }
        });

        return {
          name: agent.name,
          email: agent.email,
          leadsAssigned,
          interactions,
          conversions,
          conversionRate: leadsAssigned > 0 ? ((conversions / leadsAssigned) * 100).toFixed(1) : 0
        };
      })
    );

    // Sort by total activity (interactions + conversions)
    agentPerformance.sort((a, b) => (b.interactions + b.conversions) - (a.interactions + a.conversions));

    res.json(agentPerformance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/recent-activities
// @desc    Get recent activities
// @access  Private (Admin only)
router.get('/recent-activities', [auth, admin], async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentActivities = await Interaction.find()
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('agent', 'name email')
      .populate('lead', 'name email status')
      .lean();

    const formattedActivities = recentActivities.map(activity => ({
      type: activity.type,
      remarks: activity.remarks,
      date: activity.date,
      agentName: activity.agent?.name || 'Unknown Agent',
      leadName: activity.lead?.name || 'Unknown Lead',
      status: activity.lead?.status || 'Unknown'
    }));

    res.json(formattedActivities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/lead-funnel
// @desc    Get lead funnel analytics
// @access  Private (Admin only)
router.get('/lead-funnel', [auth, admin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : subDays(new Date(), 30);
    const end = endDate ? new Date(endDate) : new Date();

    const funnelData = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Define funnel order
    const funnelOrder = ['New', 'Interested', 'Follow-up', 'Admitted'];
    const orderedFunnel = funnelOrder.map(status => {
      const found = funnelData.find(item => item.status === status);
      return {
        status,
        count: found ? found.count : 0
      };
    });

    res.json(orderedFunnel);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;