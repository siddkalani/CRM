const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { upload } = require('../config/s3Config');

// IMPORTANT: Make sure to import the Contact model for the notes routes
const Contact = require('../models/contactModel');

// Import your controller functions
const {
  getContacts,
  addContact,
  getContactById,
  updateContact,
  deleteContact,
  uploadContactNote
} = require('../controller/contactController');

// Routes for getting and adding contacts
router.route('/user/:userId')
  .get(getContacts)
  .post(addContact);

// Routes for getting, updating, and deleting a specific contact
router.route('/one/:contactId')
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

// Corrected POST route to add a note for a contact
// Now it uses the correct :contactId in the URL, which matches the `Contact` model logic.
router.post(
  '/one/:contactId/notes', // The correct route for adding notes to a contact
  upload.array('files', 5), // Allow uploading up to 5 files
  uploadContactNote // Middleware function to handle the file upload and adding notes
);

// Route to update a specific note
router.put(
  '/one/:contactId/notes/:noteId',
  asyncHandler(async (req, res) => {
    const { text } = req.body;
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const note = contact.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.text = text;
    await contact.save();
    res.json(contact);
  })
);

// Route to delete a specific note
router.delete(
  '/one/:contactId/notes/:noteId',
  asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    contact.notes.pull(req.params.noteId);
    await contact.save();
    res.json(contact);
  })
);

// Delete a contact
router.route('/:contactId').delete(deleteContact);

module.exports = router;
