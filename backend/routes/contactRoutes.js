const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const {upload} = require('../config/s3Config');


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


router
  .route('/user/:userId')
  .get(getContacts)
  .post(addContact);
router
  .route('/one/:contactId')
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

  // router.post(
  //   '/one/:contactId/notes', // No need for noteId in this route
  //   upload.single('file'), // Middleware for handling file uploads
  //   uploadContactNote
  // );
  
  router.post(
    '/one/:leadId/notes', // No need for noteId in this route
    upload.array('files',20), // Middleware for handling file uploads
    uploadContactNote
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
