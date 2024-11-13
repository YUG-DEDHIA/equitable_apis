const profileService = require("../services/reviewerProfileService");

exports.uploadProfileImage = async (req, res) => {

  if (!req.file) {
    return res.status(400).send({ error: "No image uploaded" });
  }

  try {
    const reviewerId = req.user._id;
    const profileImage = req.file;
    const result = await profileService.uploadProfileImage(reviewerId, profileImage);
    res.status(201).send(result);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).send({ error: error.message });
  }
};

exports.uploadSignature = async (req, res) => {

    if (!req.file) {
      return res.status(400).send({ error: "No image uploaded" });
    }
  
    try {
      const reviewerId = req.user._id;
      const signature = req.file;
      const result = await profileService.uploadSignature(reviewerId, signature);
      res.status(201).send(result);
    } catch (error) {
      const status = error.status || 500;
      res.status(status).send({ error: error.message });
    }
  };

  // exports.getBalance = async (req, res) => {
  //   try{
  //     const reviewerId = req.user._id;
  //     const result = await profileService.getBalance(reviewerId);
  //     res.status(201).send(result);
  //   } catch (error) {
  //     const status = error.status || 500;
  //     res.status(status).send({ error: error.message });
  //   }
  // };

  // exports.getStats = async (req, res) => {
  //   try{
  //     const reviewerId = req.user._id;
  //     const result = await profileService.getStats(reviewerId);
  //     res.status(201).send(result);
  //   } catch (error) {
  //     const status = error.status || 500;
  //     res.status(status).send({ error: error.message });
  //   }
  // };