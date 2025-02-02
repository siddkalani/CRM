const asyncHandler = require('express-async-handler');
const { generateAndSaveOtp, validateOtp } = require('../services/otpService');

// Request OTP
const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const result = await generateAndSaveOtp(email);
  res.status(200).json(result);
});

// Verify OTP
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  await validateOtp(email, otp,res);
});

module.exports = { requestOtp, verifyOtp };
