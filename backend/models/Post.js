const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'postcollection' });

module.exports = mongoose.model('Post', postSchema); 