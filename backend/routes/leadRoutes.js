const express = require('express');
const router = express.Router();
const Lead = require('../models/leadModel');
const validateToken = require('../middleware/tokenValidator');
const {
  getLeads,
  addLead,
  getLeadById,
  updateLead
} = require('../controller/leadController');

// router.use(validateToken); // enable if you want auth

// Existing routes
router.route('/:userId').get(getLeads).post(addLead);
router.route('/:id').get(getLeadById).put(updateLead);

/*
  ====================================
  =  NOTES: CREATE / UPDATE / DELETE =
  ====================================
*/

/**
 * 1. CREATE a new note for a given lead
 *    POST /api/lead/:id/notes
 */
router.post('/:id/notes', async (req, res) => {
  try {
    const { text } = req.body;

    // 1. Find the lead
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // 2. Initialize notes array if it doesn't exist
    if (!Array.isArray(lead.notes)) {
      lead.notes = [];
    }

    // 3. Push new note
    lead.notes.push({ text, createdAt: new Date() });

    // 4. Save lead
    await lead.save();

    res.json(lead);
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * 2. UPDATE a specific note within a lead
 *    PUT /api/lead/:id/notes/:noteId
 */
router.put('/:id/notes/:noteId', async (req, res) => {
  try {
    const { text } = req.body;

    // 1. Find the lead
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // 2. Find the note by its _id
    const note = lead.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // 3. Update the text
    note.text = text;
    // If you want to track updates, you could add updatedAt:
    // note.updatedAt = new Date();

    // 4. Save lead
    await lead.save();

    // 5. Return updated lead
    return res.json(lead);
  } catch (err) {
    console.error('Error updating note:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * 3. DELETE a specific note from a lead
 *    DELETE /api/lead/:id/notes/:noteId
 */
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // This removes the subdocument from the array by matching its _id
    lead.notes.pull(req.params.noteId);

    await lead.save();
    return res.json(lead);
  } catch (err) {
    console.error('Error deleting note:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
