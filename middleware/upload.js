const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bluepay/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
  }
};

exports.uploadToCloudinary = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

exports.uploadToMemory = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  next();
};