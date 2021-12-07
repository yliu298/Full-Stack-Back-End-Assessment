const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  likeNum: {
    type: Number,
  },
});

module.exports = Tweet = mongoose.model('Tweet', tweetSchema);
