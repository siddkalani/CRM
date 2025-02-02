const express = require('express');
const { requestOtp, verifyOtp } = require('../controller/otpController');

const router = express.Router();

router.post('/request-otp', requestOtp); // Route to request OTP
router.post('/verify-otp', verifyOtp);   // Route to verify OTP

module.exports = router;
