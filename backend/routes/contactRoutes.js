const express = require('express')
const router = express.Router()
const { getContact, addContact, updateContact, deleteContact, getContactbyId } = require('../controller/contactController')
const validateToken = require('../middleware/tokenValidator')
const app = express()

router.use(validateToken);

router.route('/').get(getContact).post(addContact)
router.route('/:id').put(updateContact).delete(deleteContact).get(getContactbyId)


module.exports = router