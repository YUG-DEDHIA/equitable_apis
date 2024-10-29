const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true, 
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [18, "Age must be at least 18"], 
    max: [100, "Age cannot exceed 100"],  
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
  mobileNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true, 
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  mobileVerified: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
  },
  online: {
    type: Boolean,
    default: false,
  },
  bowelPrepScore: {
    type: Number,
    default: 1,
    min: [1, "Score cannot be less than 1"],
    max: [10, "Score cannot exceed 10"],
  },
  reports: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Report", unique: true },
  ],
  dailyTimeSpent: {
    type: Map,
    of: [Number],
    default: new Map(),
  },
  lastUpdate: {
    type: Date,
    default: null,
  },
});

// Method to update dailyTimeSpent
userSchema.methods.updateDailyTimeSpent = async function () {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Check if dailyTimeSpent is a Map
  if (!(this.dailyTimeSpent instanceof Map)) {
    this.dailyTimeSpent = new Map(this.dailyTimeSpent);
  }

  // Initialize dailyTimeSpent for the current day if not present
  if (!this.dailyTimeSpent.has(currentDay)) {
    this.dailyTimeSpent.set(currentDay, Array(24).fill(0));
  }

  // Check if last update was within the same minute
  if (this.lastUpdate && now - this.lastUpdate < 60000) {
    return; // Skip update if within the same minute
  }

  const timeSpentToday = this.dailyTimeSpent.get(currentDay);
  if (timeSpentToday) {
    timeSpentToday[currentHour] = (timeSpentToday[currentHour] || 0) + 1; // increment by 1 minute
  }

  // Update lastUpdate timestamp
  this.lastUpdate = now;

  this.markModified("dailyTimeSpent");
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
