// routes/leads.js
const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// Update lead notes
router.put('/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    // Find the lead by id and update its notes
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true } // returns the updated document
    );
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
