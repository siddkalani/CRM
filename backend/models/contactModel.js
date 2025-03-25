const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: 'User',
    },
    firstName: {
      type: String,
      required: [true, 'Please add first name'],
    },
    lastName: {
      type: String,
      // required: [true, 'Please add last name'],
    },
    email: {
      type: String,

      // required: [true, 'Please add email'],
    },
    phone: {
      type: String,
      // required: [true, 'Please add phone'],
    },
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
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contacts', contactSchema);
