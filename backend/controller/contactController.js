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

  if (!firstName || !lastName || !phone) {
    res.status(400);
    throw new Error('First Name, Last Name, and Phone are required.');
  }

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
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const fileUrl = req.file.location; // File URL from S3
  res.status(200).json({
    message: 'File uploaded successfully.',
    fileUrl,
  });
});

module.exports = {
  getContacts,
  addContact,
  getContactById,
  updateContact,
  deleteContact,
  uploadContactFile
};
