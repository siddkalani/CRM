const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel');

const getContacts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const contacts = await Contact.find({ ownerId: userId });
  res.status(200).json({ contacts });
});

const addContact = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, phone, notes } = req.body;

  const newContact = await Contact.create({
    firstName,
    lastName,
    email,
    phone,
    notes,
    ownerId: userId,
  });
  res.status(201).json(newContact);
});

const getContactById = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);
  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }
  res.status(200).json(contact);
});

const updateContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);
  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }
  Object.keys(req.body).forEach((key) => {
    contact[key] = req.body[key] || contact[key];
  });
  const updatedContact = await contact.save();
  res.status(200).json(updatedContact);
});

const deleteContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);
  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }
  await contact.deleteOne(); // Use deleteOne() instead of remove()
  res.status(200).json({ message: 'Contact deleted successfully.' });
});

// const uploadContactNote = asyncHandler(async (req, res) => {
//   try {
//     const { contactId } = req.params; // Get contactId from params
//     const { text } = req.body; // Get optional text from request body

//     // Ensure at least one of text or file is provided
//     if (!text && !req.file) {
//       return res.status(400).json({ message: 'No text or file provided.' });
//     }

//     // Find the contact
//     const contact = await Contact.findById(contactId);
//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found.' });
//     }

//     // Ensure notes array exists
//     if (!Array.isArray(contact.notes)) {
//       contact.notes = [];
//     }

//     // Create a new note object
//     const note = {
//       createdAt: new Date(),
//     };

//     // Add text if provided
//     if (text) {
//       note.text = text;
//     }

//     // Add file details if a file is uploaded
//     if (req.file) {
//       note.fileUrl = req.file.location; // File URL from S3
//       note.fileName = req.file.originalname; // Original file name
//       note.fileType = req.file.mimetype; // MIME type (e.g., image/png, application/pdf)
//     }

//     // Push the note to the notes array
//     contact.notes.push(note);

//     // Save the updated contact
//     await contact.save();

//     // Return success response
//     res.status(201).json({
//       message: 'Note added successfully.',
//       note,
//       contact,
//     });
//   } catch (error) {
//     console.error('Error adding note:', error);
//     res.status(500).json({ message: 'Failed to add note.', error: error.message });
//   }
// });

//multiple files
const uploadContactNote = asyncHandler(async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  
  try {
    const { contactId } = req.params;
    const { text } = req.body;

    // Validate request
    if (!text && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'No text or files provided.' });
    }

    // Find the contact
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found.' });
    }

    // Ensure notes array exists
    if (!Array.isArray(contact.notes)) {
      contact.notes = [];
    }

    // Create a new note object
    const note = {
      createdAt: new Date(),
    };

    // Add text if provided
    if (text) {
      note.text = text;
    }

    // Process files if uploaded
    if (req.files && req.files.length > 0) {
      note.files = req.files.map((file) => ({
        fileUrl: file.location, // File URL from S3
        fileName: file.originalname, // Original file name
        fileType: file.mimetype, // MIME type
        fileSize: file.size, // File size
      }));
    }

    // Push the note to the notes array
    contact.notes.push(note);

    // Save the updated contact
    await contact.save();

    // Return success response
    res.status(201).json({
      message: 'Note added successfully.',
      note,
      contact,
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Failed to add note.', error: error.message });
  }
});


module.exports = {
  getContacts,
  addContact,
  getContactById,
  updateContact,
  deleteContact,
  uploadContactNote
};
