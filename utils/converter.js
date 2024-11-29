const ffmpeg = require('fluent-ffmpeg');
const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
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
    const url = await getSignedUrl(s3Client, command, {expiresIn: 24*60*60});
    return url;
}

const s3_bucketName = process.env.BUCKET_NAME;

// Convert video to images and save to S3
exports.convertVideoToImages = async function (videoPath, fps) {
    const tempDir = path.join(__dirname, `temp/${Date.now()}`);
    await fsp.mkdir(tempDir, { recursive: true });

    if (!(await fsp.stat(videoPath))) {
        console.log("File does not exist or is not accessible");
        return;
    }

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .outputOptions('-vf', `fps=${fps}`)
            .output(path.join(tempDir, 'output_%04d.jpg'))
            .on('end', async () => {
                console.log('Video conversion finished.');
                try {
                    const folderUrl = await uploadDirectoryToS3(s3Client, s3_bucketName, tempDir, 'images');
                    resolve(folderUrl);
                } catch (error) {
                    reject(error);
                } finally {
                    await fs.promises.rm(tempDir, { recursive: true });
                }
            })
            .on('error', (err) => {
                console.error('Error in video conversion:', err);
                reject(err);
            })
            .run();
    });
};

// Convert images to video and save to S3
exports.convertImagesToVideo = async function (imagePaths, fps) {
    const outputVideoPath = path.join(__dirname, `temp/output_${Date.now()}.mp4`);
    const fileListPath = path.join(__dirname, `temp/filelist_${Date.now()}.txt`);

    // Write paths to a temporary file list for ffmpeg
    const fileContent = imagePaths.map(imgPath => `file '${imgPath}'`).join('\n');
    await fsp.writeFile(fileListPath, fileContent);

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(fileListPath)
            .inputOptions('-f', 'concat', '-safe', '0')
            .outputOptions('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(fps)) // Set frame rate
            .output(outputVideoPath)
            .on('start', commandLine => console.log(`Spawned Ffmpeg with command: ${commandLine}`))
            .on('end', async () => {
                console.log('Image conversion finished.');
                try {
                    const videoUrl = await uploadFileToS3(S3Client, s3_bucketName, outputVideoPath, 'video');
                    resolve(videoUrl);
                } catch (error) {
                    reject(error);
                } finally {
                    // Clean up the output file and temporary file list
                    await fsp.unlink(outputVideoPath);
                    await fsp.unlink(fileListPath);
                }
            })
            .on('error', (err, stdout, stderr) => {
                console.error('Error in image conversion:', err.message);
                console.error('ffmpeg stdout:', stdout);
                console.error('ffmpeg stderr:', stderr);
                reject(err);
            })
            .run();
    });
};



async function uploadDirectoryToS3(s3Client, s3_bucketName, dirPath, prefix) {
    const files = await fs.promises.readdir(dirPath);
    const promises = files.map(file => {
        const filePath = path.join(dirPath, file);
        return uploadFileToS3(s3Client, s3_bucketName, filePath, `${prefix}/${file}`);
    });

    const urls = await Promise.all(promises);
    return urls;
}


async function uploadFileToS3(s3Client, s3_bucketName, filePath, objectName) {
    const fileStream = fs.createReadStream(filePath);
    const fileStat = await fs.promises.stat(filePath); // Using fs.promises for async operation

    const params = {
        Bucket: s3_bucketName,
        Key: objectName,
        Body: fileStream,
        ContentType: 'application/octet-stream', // Correct MIME type based on your files
        ContentLength: fileStat.size
    };
    await s3Client.send(new PutObjectCommand(params)); // Ensuring the command is properly constructed and sent

    return `https://${s3_bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectName}`;
}
