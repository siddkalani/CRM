const express = require('express');
const router = express.Router();
const { registerUser, loginUser, currentUser,updateUser } = require('../controller/userController');
const validateToken = require('../middleware/tokenValidator');

// Define routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/current').get(validateToken, currentUser);
router.route('/update').put(validateToken, updateUser);

module.exports = router;
