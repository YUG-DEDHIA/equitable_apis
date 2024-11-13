const Video = require('../models/video');
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Types;

// Service to fetch all videos
exports.fetchVideos = async () => {
  try {
    const videos = await Video.find();
    return videos;
  } catch (error) {
    console.error("Error fetching videos from the database:", error);
    throw new Error("Failed to retrieve videos");
  }
};

// Service to fetch a video by its ID
exports.fetchVideoById = async (videoId) => {
  try {
    const video = await Video.findById(videoId).populate("reviewId");
    return video;
  } catch (error) {
    console.error("Error fetching video by ID from the database:", error);
    throw new Error("Failed to retrieve video by ID");
  }
};
//fetch videos by reviewer id
// videoService.js
exports.fetchVideosByReviewerId = async (reviewerId) => {
  try {
    // Find videos where the `reviewer` field matches the given reviewer ID
    const videos = await Video.find({ reviewer: new ObjectId(reviewerId)});
    return videos;
  } catch (error) {
    console.error("Error fetching videos by reviewer ID:", error);
    throw new Error("Failed to retrieve videos by reviewer ID");
  }
};
