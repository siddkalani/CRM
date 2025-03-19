const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const uploadm = require('../config/s3Config');


// IMPORTANT: Make sure to import the Contact model for the notes routes
const Contact = require('../models/contactModel');

// Import your controller functions
const {
  getContacts,
  addContact,
  getContactById,
  updateContact,
  deleteContact,
  uploadContactFile
} = require('../controller/contactController');

/**
 * =======================
 *  User-based contacts
 * =======================
 * GET  /api/contact/user/:userId   -> getContacts
 * POST /api/contact/user/:userId   -> addContact
 */
router
  .route('/user/:userId')
  .get(getContacts)
  .post(addContact);

/**
 * ================================
 *  Single contact (by contactId)
 * ================================
 * GET    /api/contact/one/:contactId -> getContactById
 * PUT    /api/contact/one/:contactId -> updateContact
 * DELETE /api/contact/one/:contactId -> deleteContact
 */
router
  .route('/one/:contactId')
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

/**
 * ==========================
 *  NOTES: CREATE / UPDATE / DELETE
 * ==========================
 */

// 1) CREATE a new note
// POST /api/contact/one/:contactId/notes
router.post(
  '/one/:contactId/notes',
  asyncHandler(async (req, res) => {
    const { text } = req.body;
    // 1. Find the contact
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // 2. Ensure notes array
    if (!Array.isArray(contact.notes)) {
      contact.notes = [];
    }

    // 3. Add the new note
    contact.notes.push({ text, createdAt: new Date() });

    // 4. Save and return
    await contact.save();
    res.json(contact);
  })
);

// 2) UPDATE a specific note
// PUT /api/contact/one/:contactId/notes/:noteId
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
    // note.updatedAt = new Date(); // optional
    await contact.save();
    res.json(contact);
  })
);

//delete contact 
router.route('/:contactId').delete(deleteContact)

// 3) DELETE a specific note
// DELETE /api/contact/one/:contactId/notes/:noteId
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

module.exports = router;
