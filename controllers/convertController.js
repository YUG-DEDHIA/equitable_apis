const {convertVideoToImages, convertImagesToVideo} = require('../utils/converter');
const fs = require('fs');
const path = require('path');

function saveBufferToFile(buffer, filename) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir);
    }
    const filePath = path.join(uploadsDir, filename);

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, buffer, (err) => {
            if (err) reject(err);
            else resolve(filePath);
        });
    });
}

async function processImageFiles(files) {
  const paths = [];
  for (const file of files) {
      const filePath = await saveBufferToFile(file.buffer, `image_${Date.now()}_${file.originalname}`);
      paths.push(filePath);
  }
  return paths;
}

exports.convertVideotoImageStream = async (req, res) => {
    if (!req.file) return res.status(400).send("No video file provided.");
    
    try {
        const savedFilePath = await saveBufferToFile(req.file.buffer, `video_${Date.now()}.mp4`);
        const imageUrl = await convertVideoToImages(savedFilePath, req.body.fps);
        res.send({ message: 'Video converted to images successfully', imageUrl });
    } catch (error) {
        console.log("Error during conversion:", error.message);
        res.status(500).send('Conversion failed: ' + error.message);
    }
}

exports.convertImageStreamToVideo = async (req, res) => {
    if (req.files.length === 0) return res.status(400).send("No image files provided.");
    
    try {
        const imagePaths = await processImageFiles(req.files);
        console.log(imagePaths);
        const videoUrl = await convertImagesToVideo(imagePaths, req.body.fps);
        res.send({ message: 'Images converted to video successfully', videoUrl });
    } catch (error) {
        console.error("Error during conversion:", error.message);
        res.status(500).send('Conversion failed: ' + error.message);
    }
}
