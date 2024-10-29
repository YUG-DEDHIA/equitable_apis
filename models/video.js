const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    unique: true,
  },
  videoUrl: {
    type: String,
  },
  orientation: {
    type: String,
    enum: ["Landscape", "Portrait"],
  },
  duration: {
    type: Number,
  }
});

const video = mongoose.model("Video", videoSchema);

module.exports = video;
