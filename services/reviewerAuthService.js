const Reviewer = require("../models/Reviewer");
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

exports.register = async ({ name, age, gender, mobileNumber, email, password, profileType, country}) => {
  const existingReviewerWithEmail = await Reviewer.findOne({ email });
  const existingReviewerWithMobileNumber = await Reviewer.findOne({ mobileNumber });
  if (existingReviewerWithEmail) {
    throw new Error("Email already registered");
  }
  if (existingReviewerWithMobileNumber) {
    throw new Error("Mobile Number already registered");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const reviewer = new Reviewer({ name, age, gender, mobileNumber, email, password: hashedPassword, profileType, country });
  await reviewer.save();
  return { message: "Reviewer successfully registered. Please log in." };
};

exports.login = async (email, password) => {
  const reviewer = await Reviewer.findOne({ email });

  if (!reviewer) {
    throw new Error("Unable to login, Account Not Exists");
  }
  const isMatch = await bcrypt.compare(password, reviewer.password);
  if (!isMatch) {
    throw new Error("Unable to login, Password Not Matched");
  }
  const token = jwt.sign({ _id: reviewer._id.toString() }, process.env.JWT_SECRET);
  return { reviewer, token };
};

exports.verifySession = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const reviewer = await Reviewer.findById(decoded._id);
  if (!reviewer) {
    throw new Error("Reviewer not found");
  }
  return reviewer;
};

exports.loginWithPhone = async (mobileNumber) => {
  try {
    let reviewer = await Reviewer.findOne({ mobileNumber });
    if (!reviewer) {
      throw new Error("Reviewer Not Found");
    }

    const otp = await sendOtp(mobileNumber);
    reviewer.otp = otp;
    reviewer.otpExpires = Date.now() + 10 * 60 * 1000;

    await reviewer.save();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send otp");
  }
};

exports.verifyOtpForLogin = async (mobileNumber, otp) => {
  try {
    let reviewer = await Reviewer.findOne({ mobileNumber });
    if (!reviewer) {
      return res.status(400).json({ msg: "Reviewer not found" });
    }

    if (reviewer.otp !== otp || reviewer.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    reviewer.otp = undefined;
    reviewer.otpExpires = undefined;

    await reviewer.save();

    const token = jwt.sign(
      { _id: reviewer._id.toString() },
      process.env.JWT_SECRET
    );
    return { reviewer, token };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to login with mobile number");
  }
};
