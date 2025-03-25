const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    company: { type: String },
    // Notes array with support for multiple files
    notes: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        text: { type: String }, // For plain text notes
        files: [
          {
            fileUrl: { type: String }, // URL of the uploaded file
            fileName: { type: String }, // Original name of the file
            fileType: { type: String }, // MIME type of the file
            fileSize: { type: Number }, // Size of the file in bytes
          },
        ],
        createdAt: { type: Date, default: Date.now }, // Timestamp
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', LeadSchema);
