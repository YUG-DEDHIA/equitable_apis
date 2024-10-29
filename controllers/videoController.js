const videoService = require('../services/videoService');

// Controller to get all videos
exports.getVideos = async (req, res) => {
  try {
    const videos = await videoService.fetchVideos();
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: error.message });
  }
};

// Controller to get a video by its ID
exports.getVideoById = async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: "videoId parameter is required" });
  }

  try {
    const video = await videoService.fetchVideoById(videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.status(200).json(video);
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    res.status(500).json({ error: error.message });
  }
};