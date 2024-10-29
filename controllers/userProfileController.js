const profileService = require("../services/userProfileService");

exports.uploadProfileImage = async (req, res) => {

  if (!req.file) {
    return res.status(400).send({ error: "No image uploaded" });
  }

  try {
    const userId = req.user._id;
    const profileImage = req.file;
    const result = await profileService.uploadProfileImage(userId, profileImage);
    res.status(201).send(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).send({ error: error.message });
  }
};