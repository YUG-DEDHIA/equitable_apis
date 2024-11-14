const reportService = require("../services/reportService");

exports.uploadReportPdf = async (req, res) => {

  const { reportContent, videoId } = req.body;

try {

  const result = await reportService.uploadReportPdf(reportContent, videoId);

  res.status(201).send(result);
} catch (error) {
  const status = error.status || 500;
  res.status(status).send({ error: error.message });
}
};

exports.uploadImage = async (req, res) => {
 
    const comment = req.body.comment;
    const timestamp = req.body.timestamp;
    const {videoId} = req.params;

  if (!req.file) {
    return res.status(400).send({ error: "No image uploaded" });
  }

  try {
    const file = req.file;

    const result = await reportService.uploadImageForReport(videoId, file, timestamp, comment);

    res.status(201).send(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).send({ error: error.message });
  }
};

// exports.getVideos = async (req, res) => {
//   const { mode } = req.query;
//   if (!mode) {
//     return res.status(400).send({ error: "Mode parameter is required" });
//   }
//   try {
//     const videos = await videoService.fetchVideos(mode, req.user._id);
//     res.status(200).send(videos);
//   } catch (error) {
//     res.status(error.status || 500).send({ error: error.message });
//   }
// };

exports.getReportbyVideoId = async (req, res) => {
  const {videoId} = req.params;
  try {
    const report = await reportService.fetchReportbyVideoId(videoId);
    res.status(200).send(report);
  } catch (error) {
    res.status(error.status || 500).send({ error: error.message });
  }
};

exports.getReportsbyUserId = async (req, res) => {
  try{
    const reports = await reportService.getReportsbyUserId(req.user._id);
    console.log(reports)
    res.status(200).send(reports);
  } catch (error) {
    res.status(error.status || 500).send({ error: error.message });
  }
}

exports.sendReportToUser = async (req, res) => {
  const {io} = req;
  const {videoId} = req.params;
  try{
    const report = await reportService.sendReportToUser(videoId, io);
    if (!report)
    {
      res.status(404).json({error: "Report Not Found"});
    }
    res.status(201).json({message: "Report sent successfully"});
  }
  catch (error) {
    res.status(error.status || 500).send({ error: error.message });
  }
}

exports.deleteImageInReport = async (req, res) => {
  const {videoId, imageId} = req.params;
  try {
    const report = await reportService.deleteImageFromReport(videoId, imageId);
    res.status(200).send(report);
  } catch (error) {
    res.status(error.status || 500).send({ error: error.message });
  }
};

exports.updateImagesInReport = async (req, res) => {
  const {videoId} = req.params;
  const {images, finalSuggestions} = req.body;
  try {
    const report = await reportService.updateTheReport(videoId, images, finalSuggestions);
    res.status(200).send(report);
  } catch (error) {
    res.status(error.status || 500).send({ error: error.message });
  }
};

// exports.deleteVideos = async (req, res) => {
//   try {
//     const videoIds = req.body.videoIds;
//     if (!videoIds || !Array.isArray(videoIds)) {
//       return res.status(400).json({ error: "Invalid video IDs provided" });
//     }

//     const deleted = await videoService.deleteVideos(videoIds);
//     res.status(200).json({ deletedCount: deleted.deletedCount });
//   } catch (error) {
//     console.error("Error in deleteVideos controller:", error);
//     res.status(500).json({ error: error.message });
//   }
// };