const express = require('express');
const router = express.Router();
const Lead = require('../models/leadModel');
const {upload, s3Client} = require('../config/s3Config');
const {
  getLeads,
  addLead,
  getLeadById,
  updateLead,
  deleteLead,
uploadLeadNote
} = require('../controller/leadController');
const {handleMulterError} = require('../middleware/errorHandler');

router
  .route('/user/:userId')
  .get(getLeads)    // GET all leads for user
  .post(addLead);  // CREATE a lead for user

router
  .route('/one/:leadId')
  .get(getLeadById)   // GET a single lead
  .put(updateLead);    // UPDATE a single lead


  // router.post(
  //   '/one/:leadId/notes', // No need for noteId in this route
  //   upload.single('file'), // Middleware for handling file uploads
  //   uploadLeadNote
  // );
  
  router.post(
    '/one/:leadId/notes', // No need for noteId in this route
    upload.array('files',5), // Middleware for handling file uploads
    uploadLeadNote
  );
  

/*
 * 1) CREATE a new note for a given lead
 *    POST /api/lead/one/:leadId/notes
 */
// router.post('/one/:leadId/notes', async (req, res) => {
//   try {
//     const { text } = req.body;

//     // 1. Find the lead
//     const lead = await Lead.findById(req.params.leadId);
//     if (!lead) {
//       return res.status(404).json({ error: 'Lead not found' });
//     }

//     // 2. Initialize notes array if it doesn't exist
//     if (!Array.isArray(lead.notes)) {
//       lead.notes = [];
//     }

//     // 3. Push new note
//     lead.notes.push({ text, createdAt: new Date() });

//     // 4. Save lead
//     await lead.save();
//     res.json(lead);
//   } catch (err) {
//     console.error('Error adding note:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

/**
 * 2) UPDATE a specific note within a lead
 *    PUT /api/lead/one/:leadId/notes/:noteId
 */

router.put('/one/:leadId/notes/:noteId', async (req, res) => {
  try {
    const { text } = req.body;

    // 1. Find the lead
    const lead = await Lead.findById(req.params.leadId);
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
    // Optional: note.updatedAt = new Date();

    // 4. Save
    await lead.save();
    return res.json(lead);
  } catch (err) {
    console.error('Error updating note:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * 3) DELETE a specific note from a lead
 *    DELETE /api/lead/one/:leadId/notes/:noteId
 */

//delete lead 
router.route('/:leadId').delete(deleteLead)

router.delete('/one/:leadId/notes/:noteId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Remove the subdocument from the notes array
    lead.notes.pull(req.params.noteId);

    await lead.save();
    return res.json(lead);
  } catch (err) {
    console.error('Error deleting note:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
