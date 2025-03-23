// models/leadModel.js

const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String},
    email: { type: String },
    phone: { type: String },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      // required: true,
    },
    company: { type: String },
    // Instead of a single string, use an array:
    notes: [
          {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              default: () => new mongoose.Types.ObjectId(),
            },
            text: { type: String }, // For plain text notes
            fileUrl: { type: String }, // URL of the uploaded file (if any)
            fileName: { type: String }, // Name of the file
            fileType: { type: String }, // Type of the file (e.g., image/png, application/pdf)
            createdAt: { type: Date, default: Date.now }, // Timestamp
          },
        ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', LeadSchema);
