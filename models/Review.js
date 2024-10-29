const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  frontVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    unique: true,
  },
  backVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    unique: true,
  },
  assigned: {
    type: Boolean,
  },
  reviewed: {
    type: Boolean,
  },
  framesUrl: {
    type: String,
  },
  anomalies: [{
    timestamp: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report",
    unique: true,
  },
  cleanPath: {
    type: Boolean,
  },
  bowelPrepScore: {
    type: Number,
    default: 1,
    min: [1, "Score cannot be less than 1"],
    max: [10, "Score cannot exceed 10"],
  },
  aiFrames: {
    type: String,
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reviewer",
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
