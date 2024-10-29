const User = require("../models/User");
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

exports.uploadProfileImage = async (userId, file) => {
    const uniqueFilename = `profile-images/${uuidv4()}_${file.originalname}`;
  
    try {
      const params = {Bucket: s3_bucketName, Key: uniqueFilename, Body: file.buffer, ContentType: file.mimetype}
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      const imageUrl = await getObjectURL(uniqueFilename);
  
      const user = await User.findByIdAndUpdate(userId, {profileImage: imageUrl});
  
      return {
        message: "User profile image updated successfully",
        imageUrl,
        user: user,
      };
    } catch (error) {
      console.error("Error updating profile image:", error);
      throw new Error("Error updating profile image");
    }
  };