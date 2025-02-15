const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  company: { type: String }, 
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
