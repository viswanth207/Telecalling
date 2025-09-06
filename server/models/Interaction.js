const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'lead',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  type: {
    type: String,
    enum: ['call', 'sms', 'whatsapp', 'email'],
    required: true
  },
  remarks: {
    type: String,
    required: true
  },
  statusBefore: {
    type: String,
    enum: ['new', 'interested', 'not_interested', 'follow_up', 'admitted']
  },
  statusAfter: {
    type: String,
    enum: ['new', 'interested', 'not_interested', 'follow_up', 'admitted']
  },
  duration: {
    type: Number,  // Duration in seconds (for calls)
  },
  followUpDate: {
    type: Date
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('interaction', InteractionSchema);