const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  owner: { type: String },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', LeadSchema);
