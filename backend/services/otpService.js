const OtpModel = require('../models/otpModel');
const generateOtp = require('../utils/generateOtp');
const sendOtpEmail = require('./emailService');

// Generate and Save OTP
const generateAndSaveOtp = async (email) => {
  const otp = generateOtp();

  const existingOtp = await OtpModel.findOne({ email });
  if (existingOtp) {
    existingOtp.otp = otp;
    existingOtp.expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await existingOtp.save();
  } else {
    await OtpModel.create({
      email,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
  }

  await sendOtpEmail(email, otp);
  return { message: 'OTP sent to your email.' };
};

// Validate OTP
const validateOtp = async (email, otp, res) => {
  try {
    const otpRecord = await OtpModel.findOne({ email, otp });
    
    // Check if OTP exists
    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid OTP. Please try again.' });
      return;
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
      return;
    }

    // Delete OTP record upon successful validation
    await OtpModel.deleteOne({ _id: otpRecord._id });

    // Respond with success
    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ message: 'An error occurred while verifying the OTP.' });
  }
};


module.exports = { generateAndSaveOtp, validateOtp };
