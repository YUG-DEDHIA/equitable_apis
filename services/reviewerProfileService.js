const Reviewer = require("../models/Reviewer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION
})

async function getObjectURL(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
    })
    const url = await getSignedUrl(s3Client, command, {expiresIn: 6*24*60*60});
    return url;
}

const s3_bucketName = process.env.BUCKET_NAME;

exports.uploadProfileImage = async (reviewerId, file) => {
    const uniqueFilename = `profile-images/${uuidv4()}_${file.originalname}`;
  
    try {
      const params = {Bucket: s3_bucketName, Key: uniqueFilename, Body: file.buffer, ContentType: file.mimetype}
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      const imageUrl = await getObjectURL(uniqueFilename);
  
      const reviewer = await Reviewer.findByIdAndUpdate(reviewerId, {profileImage: imageUrl});
  
      return {
        message: "Reviewer profile image updated successfully",
        imageUrl,
        reviewer: reviewer,
      };
    } catch (error) {
      console.error("Error updating profile image:", error);
      throw new Error("Error updating profile image");
    }
  };

  exports.uploadSignature = async (reviewerId, file) => {
    const uniqueFilename = `profile-images/${uuidv4()}_${file.originalname}`;
  
    try {
      const params = {Bucket: s3_bucketName, Key: uniqueFilename, Body: file.buffer, ContentType: file.mimetype}
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      const imageUrl = await getObjectURL(uniqueFilename);
  
      const reviewer = await Reviewer.findByIdAndUpdate(reviewerId, {signature: imageUrl});
  
      return {
        message: "Reviewer signature updated successfully",
        imageUrl,
        reviewer: reviewer,
      };
    } catch (error) {
      console.error("Error updating signature:", error);
      throw new Error("Error updating signature");
    }
  };

  exports.getBalance = async (reviewerId) => {
    try{
      const reviewer = await Reviewer.findById(reviewerId);
      if (!reviewer) {
        throw new Error("Reviewer not found");
      }
      const balance = reviewer.accountBalance;
      return {
        balance: balance,
      };
    } catch (error) {
      console.error("Error getting balance:", error);
      throw new Error("Error getting balance");
    }
  }

  exports.getStats = async (reviewerId) => {
    try{
      const reviewer = await Reviewer.findById(reviewerId);
      const stats = reviewer.dailyTimeSpent;
      return {
        stats: stats,
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      throw new Error("Error getting stats");
    }
  }