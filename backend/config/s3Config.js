const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1', // Replace with your region
});

// Create S3 instance
const s3 = new AWS.S3();

// Multer configuration for S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'my-app-bucket', // Replace with your bucket name
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName); // File name in S3
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/; // Allowed file types
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

module.exports = upload;
