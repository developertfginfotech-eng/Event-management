const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { protect } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: File type not allowed');
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB default
  fileFilter: fileFilter,
});

router.use(protect);

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
    },
  });
});

// @desc    Upload multiple files
// @route   POST /api/files/upload-multiple
// @access  Private
router.post('/upload-multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload files',
    });
  }

  const files = req.files.map((file) => ({
    filename: file.filename,
    path: `/uploads/${file.filename}`,
    size: file.size,
  }));

  res.status(200).json({
    success: true,
    count: files.length,
    data: files,
  });
});

module.exports = router;
