const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  videoId: { 
    type: String,
    required: true,
    unique: true 
    },
  images: [{ 
    url: String,
    timestamp: Number,
    comment: String 
    }],
    finalSuggestions: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'Test_User'}
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;