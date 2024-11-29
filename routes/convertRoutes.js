const express = require('express');
const multer = require('multer');
const convertController = require('../controllers/convertController');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/video-to-images', upload.single('file'), convertController.convertVideotoImageStream);
router.post('/images-to-video', upload.array('files', 1000), convertController.convertImageStreamToVideo);

module.exports = router;


