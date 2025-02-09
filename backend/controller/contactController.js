const asyncHandler = require('express-async-handler');
const Contact = require('../models/contactModel');

/**
 * Get all contacts for the logged-in user
 */
const getContacts = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
      const contacts = await Contact.find({ ownerId: userId });
      res.status(200).json({ contacts });
    } catch (error) {
      res.status(500).json({ message: "Error fetching contacts for user", error });
    }
});

/**
 * Add a new contact
 */
const addContact = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, notes } = req.body;
  
    if (!firstName || !lastName || !email) {
      res.status(400);
      throw new Error("First Name, Last Name, and Email are required.");
    }
  
    try {
      const newContact = await Contact.create({
        firstName,
        lastName,
        email,
        phone,
        notes,
        ownerId: userId,
      });
  
      res.status(201).json(newContact);
    } catch (error) {
      res.status(500).json({ message: "Error adding contact", error });
    }
});

/**
 * Get a contact by ID for the logged-in user
 */
const getContactById = asyncHandler(async (req, res) => {
    const { userId, id } = req.params;

    try {
      const contact = await Contact.findOne({ _id: id, ownerId: userId });
  
      if (!contact) {
        res.status(404).json({ message: "Contact not found" });
        return;
      }
  
      res.status(200).json({ contact });
    } catch (error) {
      res.status(500).json({ message: "Error fetching contact", error });
    }
});

/**
 * Update a contact
 */
const updateContact = asyncHandler(async (req, res) => {
    // Find the contact by ID and ensure it belongs to the logged-in user
    const contact = await Contact.findOne({ _id: req.params.id, ownerId: req.user.id });
  
    if (!contact) {
      res.status(404);
      throw new Error('Contact not found or not authorized.');
    }
  
    // Update the contact with the provided fields
    Object.keys(req.body).forEach((key) => {
      contact[key] = req.body[key] || contact[key];
    });
  
    const updatedContact = await contact.save();
  
    res.status(200).json(updatedContact);
  });
  
/**
 * Delete a contact
 */
const deleteContact = asyncHandler(async (req, res) => {
    // Find the contact by ID and ensure it belongs to the logged-in user
    const contact = await Contact.findOne({ _id: req.params.id, ownerId: req.user.id });
  
    if (!contact) {
      res.status(404);
      throw new Error('Contact not found or not authorized.');
    }
  
    await contact.remove();
  
    res.status(200).json({ message: 'Contact deleted successfully.' });
  });

module.exports = {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getContactById,
};




// const asyncHandler = require('express-async-handler');
// const Contact = require('../models/contactModel')

// const getContact = asyncHandler(async (req, res) => {
//     const contacts = await Contact.find({ user_id: req.user.id });
//     res.status(200).json(contacts)
// })

// const addContact = asyncHandler(async (req, res) => {
//     console.log(`this is the req body: ${req.body}`);
//     console.log("req.user:", req.user);

//     const { name, email, phone } = req.body;

//     // Check if all fields are provided
//     if (!name || !email || !phone) {
//         res.status(400);
//         // throw new Error("All fields are must");
//     }

//     // Check if a contact with the same email already exists for the user
//     const existingContact = await Contact.findOne({ email, user_id: req.user.id });
//     if (existingContact) {
//         res.status(400);
//         throw new Error("A contact with the same email already exists");
//     }

//     // Create a new contact
//     const contact = await Contact.create({
//         name,
//         email,
//         phone,
//         user_id: req.user.id,
//     });

//     res.status(201).json(contact);
// });


// const deleteContact = asyncHandler(async (req, res) => {
//     const contact = await Contact.findById(req.params.id);
//     if (!contact) {
//         res.status(404);
//         throw new Error("No contact found");
//     }
//     // Delete the specific contact
//     await Contact.findByIdAndDelete(req.params.id);
//     res.status(200).json({ hello: `contact deleted for ${req.params.id}` })
// })

// const updateContact = asyncHandler(async (req, res) => {
//     const contact = await Contact.findById(req.params.id);
//     if (!contact) {
//         res.status(404);
//         throw new Error("No contact found");
//     }

//     // Use `findByIdAndUpdate` with correct casing
//     const updatedContact = await Contact.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true } // Options to return the updated document and validate input
//     );

//     res.status(200).json(updatedContact);
// });


// const getContactbyId = asyncHandler(async (req, res) => {
//     const contact = await Contact.findById(req.params.id)
//     if (!contact) {
//         res.status(404);
//         throw new Error("no contact found")
//     }
//     res.status(200).json(contact)
// })

// module.exports = { getContact, addContact, updateContact, deleteContact, getContactbyId }