const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');

const { createTweet, updateTweet, getTweets, deleteTweet } = require('../controllers/tweet');

router.post('/', protect, createTweet);
router.put('/udpate/:id', protect, updateTweet);
router.get('/all/tweets', protect, getTweets);
router.delete('/delete/:id', protect, deleteTweet);

module.exports = router;
