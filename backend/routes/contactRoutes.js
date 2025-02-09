const express = require('express')
const router = express.Router()
const validateToken = require('../middleware/tokenValidator')
const { getContacts, addContact, getContactById, updateContact } = require('../controller/contactController');

// router.use(validateToken);

router.route('/:userId').get(getContacts).post(addContact);
router.route('/:id').get(getContactById).put(updateContact);



module.exports = router