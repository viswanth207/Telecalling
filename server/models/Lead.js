const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  alternatePhone: {
    type: String
  },
  courseInterested: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['website', 'event', 'referral', 'advertisement', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'interested', 'not_interested', 'follow_up', 'admitted'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  parentName: {
    type: String
  },
  parentPhone: {
    type: String
  },
  lastFollowUp: {
    type: Date
  },
  nextFollowUp: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('lead', LeadSchema);