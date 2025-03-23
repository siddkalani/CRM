const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const asyncHandler = require('express-async-handler');
dotenv.config();

// AWS SDK v3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Create upload middleware
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'private', // Change to 'public-read' if needed
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const timestamp = Date.now();
      const safeFileName = file.originalname
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-'); // Sanitize filename
      const fileName = `${timestamp}-${uuidv4()}-${safeFileName}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, PDF, DOC, DOCX, XLS, and XLSX files are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});


module.exports = upload;

