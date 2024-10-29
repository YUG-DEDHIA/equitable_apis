const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
require("dotenv").config();

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOtp = async (mobileNumber) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  await client.messages.create({
    body: `Your OTP code is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: mobileNumber,
  });
  return otp;
};

exports.register = async ({ name, age, gender, mobileNumber, email, password, country}) => {
  const existingUserWithEmail = await User.findOne({ email });
  const existingUserWithMobileNumber = await User.findOne({ mobileNumber });
  if (existingUserWithEmail) {
    throw new Error("Email already registered");
  }
  if (existingUserWithMobileNumber) {
    throw new Error("Mobile Number already registered");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, age, gender, mobileNumber, email, password: hashedPassword, country });
  await user.save();
  return { message: "User successfully registered. Please log in." };
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login, Account Not Exists");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login, Password Not Matched");
  }
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  return { user, token };
};

exports.verifySession = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

exports.loginWithPhone = async (mobileNumber) => {
  try {
    let user = await User.findOne({ mobileNumber });
    if (!user) {
      throw new Error("User Not Found");
    }

    const otp = await sendOtp(mobileNumber);
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send otp");
  }
};

exports.verifyOtpForLogin = async (mobileNumber, otp) => {
  try {
    let user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET
    );
    return { user, token };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to login with mobile number");
  }
};
