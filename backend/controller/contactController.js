const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel');
const File = require('../models/fileModel');

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

const uploadContactFile = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileUrl = req.file.location; // S3 file URL
    const fileName = req.file.originalname; // Original file name
    const fileType = req.file.mimetype; // File type (e.g., image/png, application/pdf)

    // Save file metadata to the database
    const newFile = new File({
      name: fileName,
      url: fileUrl,
      fileType,
    });

    await newFile.save();

    res.status(200).json({
      message: 'File uploaded successfully.',
      fileUrl,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'File upload failed.', error: error.message });
  }
});


module.exports = {
  getContacts,
  addContact,
  getContactById,
  updateContact,
  deleteContact,
  uploadContactFile
};
