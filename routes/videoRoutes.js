const express = require('express');
const auth = require('../middleware/reviewerAuthMiddleware');
const videoController = require('../controllers/videoController');

const router = express.Router();

// Route to get all videos
router.get('/get', auth, videoController.getVideos);

// Route to get a video by ID
router.get('/getbyId', auth, videoController.getVideoById);

// Add new route for getting videos by reviewer ID
router.get('/getByReviewerId', auth, videoController.getVideosByReviewerId);
module.exports = router;
