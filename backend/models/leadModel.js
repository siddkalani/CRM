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
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', LeadSchema);
