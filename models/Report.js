const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
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
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
