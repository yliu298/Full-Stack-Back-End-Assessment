const asyncHandler = require('express-async-handler');
const ObjectId = require('mongoose').Types.ObjectId;
const mongoose = require('mongoose');
const User = require('../models/User');
const Tweet = require('../models/Tweet');

// handler for creating a new tweet object
exports.createTweet = asyncHandler(async (req, res, next) => {
  const { description } = req.body;
  const userId = req.user.id;

  const tweet = await Tweet.create({
    description,
    userId,
  });

  if (tweet) {
    res.status(201).json({
      success: {
        message: 'New tweet has been created successfully.',
        tweet,
      },
    });
  } else {
    res.status(500);
    throw new Error('invalid tweet data');
  }
});

//handler for updating a tweet object
exports.updateTweet = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { description } = req.body;

  try {
    const tweet = await Tweet.findOneAndUpdate({ id }, { description });
    res.status(200).json(contest);
  } catch (err) {
    res.status(500);
    throw new Error('Failed to update tweet');
  }
});

//handler for getting all tweets
exports.getTweets = asyncHandler(async (req, res, next) => {
  let tweetList = [];
  try {
    const tweets = await Tweet.find({}).populate('userId');
    tweets.forEach((tweet) => {
      const tweetData = {
        _id: tweet._id,
        description: tweet.description,
        likeNum: tweet.likeNum,
      };
      tweetList.push(tweetData);
    });
    res.status(200).json({ tweet: tweetList });
  } catch (err) {
    res.status(500);
    throw new Error('failed to get tweets');
  }
});

//handler for deleting one tweet
exports.deleteTweet = asyncHandler(async (req, res, next) => {
  const tweetId = req.params.id;
  let tweetList = [];
  try {
    const result = await Tweet.findByIdAndDelete({ tweetId });
    if (!result) {
      return res.status(404).send('Can not find this tweet');
    }
    const tweets = await Tweet.find({}).populate('userId');
    tweets.forEach((tweet) => {
      const tweetData = {
        _id: tweet._id,
        description: tweet.description,
        likeNum: tweet.likeNum,
      };
      tweetList.push(tweetData);
    });
    res.status(200).json({ tweet: tweetList });
  } catch (err) {
    res.status(500);
    throw new Error('failed to get tweets');
  }
});
