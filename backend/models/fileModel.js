const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // File name
    url: { type: String, required: true }, // S3 file URL
    fileType: { type: String, required: true }, // e.g., 'image/png', 'application/pdf'
    uploadedAt: { type: Date, default: Date.now }, // Upload date
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model('File', fileSchema);
