const Report = require("../models/Report");
const Video = require("../models/video");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const { ObjectId } = mongoose.Types;
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

exports.uploadReportPdf = async (reportContent, videoId) => {
  const uniqueFilename = `report-pdfs/${videoId}.pdf`;
  try {
    // Launch Puppeteer and open a new page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Add CSS for report styling and to handle expandable comment boxes
    const styledContent = `
      <style>
        img {
          max-width: 100%;
          height: auto;
        }
        .no-print, .action-buttons {
          display: none;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        .report-paper {
          padding: 20px;
          background-color: #f7f7f7;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 800px; /* Adjust max width as needed */
          margin: 0 auto; /* Center align the report */
        }
        .report-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .user-card {
          display: flex;
          align-items: center;
          padding: 20px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .image-preview {
          width: 100%;
          max-width: 200px;
          border: 1px solid #ccc;
          border-radius: 10px;
        }
        .final-suggestions, .comments-section {
          margin-top: 30px;
        }
        .suggestions-field, .comment-field {
          width: 100%;
          min-height: 150px; /* Increased height to accommodate more content */
          box-sizing: border-box;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          overflow: auto; /* Show scrollbars if content exceeds the box size */
        }
        .suggestions-field {
          margin-bottom: 30px;
        }
        .comment-field {
          margin-bottom: 30px;
        }
      </style>
      ${reportContent}
    `;

    // Set page content with CSS applied
    await page.setContent(styledContent, { waitUntil: "networkidle2" });

    // Ensure images are fully loaded before generating the PDF
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const images = Array.from(document.querySelectorAll('img'));
        let loadedImagesCount = 0;

        if (images.length === 0) {
          resolve();
        }

        images.forEach((img) => {
          if (img.complete) {
            loadedImagesCount += 1;
            if (loadedImagesCount === images.length) {
              resolve();
            }
          } else {
            img.addEventListener('load', () => {
              loadedImagesCount += 1;
              if (loadedImagesCount === images.length) {
                resolve();
              }
            });
            img.addEventListener('error', resolve); // Handle broken images
          }
        });
      });
    });

    const pdfPath = path.join(__dirname, `${videoId}.pdf`);

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Upload PDF to S3
    const fileContent = fs.readFileSync(pdfPath);
    const params = {
      Bucket: s3_bucketName,
      Key: uniqueFilename,
      Body: fileContent,
      ContentType: "application/pdf"
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Get the URL of the uploaded file
    const reportUrl = await getObjectURL(uniqueFilename);

    // Clean up local file
    fs.unlinkSync(pdfPath);

    console.log(reportUrl);
    return {
      message: "Report uploaded to S3 successfully",
      reportUrl
    };
  } catch (error) {
    console.error("Error uploading report to S3", error);
    throw new Error("Error uploading report to S3");
  }
};

exports.uploadImageForReport = async (videoId, file, timestamp, comment) => {
    const uniqueFilename = `reports/${uuidv4()}_${file.originalname}`;
  
    try {
      const params = {Bucket: s3_bucketName, Key: uniqueFilename, Body: file.buffer, ContentType: file.mimetype}
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      const imageUrl = await getObjectURL(uniqueFilename);
  
      // Find existing report or create a new one
      const report = await Report.findOneAndUpdate(
        { videoId: videoId },
        {
          $push: { images: { url: imageUrl, timestamp: timestamp, comment: comment } },
          $setOnInsert: { videoId: videoId, finalSuggestions: ""},
        },
        { new: true, upsert: true } // Create a new report if it does not exist
      );
  
      return {
        message: "Image uploaded and report updated successfully",
        imageUrl,
        report: report,
      };
    } catch (error) {
      console.error("Error uploading image for report:", error);
      throw new Error("Error uploading image for report");
    }
  };

  exports.sendReportToUser = async (videoId, io) => {
    try {
      const video = await Video.findById(videoId);  // Changed to findById for correct usage
      if (!video) {
        throw new Error("Video not found");
      }
  
      const user = video.user;
      const report = await Report.findOne({ videoId: videoId });
      if (!report) {
        throw new Error("No reports found");
      }
  
      await Report.findByIdAndUpdate(report._id, { $set: { user: user } });

      io.emit("receive-report", report);
  
      await User.findByIdAndUpdate(user, { $addToSet: { reports: report._id } });
  
      return report;
    } catch (error) {
      console.error("Error sending report to user:", error);
      throw new Error("Error sending report to user");
    }
  };
  

  exports.fetchReportbyVideoId = async (videoId) => {
    try {
      const report = await Report.findOne({videoId: videoId});
      if (!report) {
        throw new Error("No reports found");
      }
      return report;
    } catch (error) {
      console.error("Error fetching report by video Id:", error);
      throw new Error("Failed to retrieve report by video Id");
    }
  };

  exports.getReportsbyUserId = async (userId) => {
    try {
      const reports = await Report.find({user: userId})
      if (!reports.length) {
        throw new Error("No reports found");
      }
      return reports;
    } catch (error) {
      console.error("Error fetching report by user Id:", error);
      throw new Error("Failed to retrieve report by user Id");
    }
  }

  exports.deleteImageFromReport = async (videoId, imageId) => {
    try {
      const report =  await Report.updateOne(
            { videoId: videoId },
            { $pull: { images: { _id: imageId } } }
        );
        return report;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw new Error("Failed to delete image from report");
    }
};

exports.updateTheReport = async (videoId, images, finalSuggestions) => {
  try {
    const report =  await Report.updateOne(
          { videoId: videoId },
          { $set: { images: images, finalSuggestions: finalSuggestions } }
      );
      return report;
  } catch (error) {
      console.error('Error updating report:', error);
      throw new Error("Failed to update the report");
  }
};