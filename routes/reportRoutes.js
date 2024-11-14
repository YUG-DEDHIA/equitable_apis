const express = require('express');
const multer = require('multer');
const reportController = require('../controllers/reportController');
const upload = multer({ storage: multer.memoryStorage() });
const auth = require('../middleware/reviewerAuthMiddleware');

const router = express.Router();
router.post('/upload-image/:videoId', auth, upload.single('file'), reportController.uploadImage);
router.post('/upload-s3', auth, reportController.uploadReportPdf);
router.get('/get/:videoId', auth, reportController.getReportbyVideoId);
router.delete('/delete-image/:videoId/:imageId', auth, reportController.deleteImageInReport);
router.put('/update/:videoId', auth, reportController.updateImagesInReport);
router.get('/getReports', auth, reportController.getReportsbyUserId);
router.put('/sendreport/:videoId', auth, reportController.sendReportToUser);
// router.get('/getbyId', auth, reportController.getReportbyId);
// router.delete('/delete', auth, reportController.deleteReport);

module.exports = router;