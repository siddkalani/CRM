const express = require('express')
const router = express.Router()
const validateToken = require('../middleware/tokenValidator')
const Contact = require('../models/contactModel')
const { getContacts, addContact, getContactById, updateContact } = require('../controller/contactController');

// router.use(validateToken);

router.route('/:userId').get(getContacts).post(addContact);
router.route('/:id').get(getContactById).put(updateContact);

router.put('/:id/notes', async (req, res) => {
  try {
    const { notes } = req.body;
    // Find the lead by id and update its notes
    const lead = await Contact.findByIdAndUpdate(
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

module.exports = router