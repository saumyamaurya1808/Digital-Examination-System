const express = require('express');

const { sendOtp, verifyOtp } = require('../controllers/otp-controller');

const otpRouter = express.Router();

otpRouter.post('/send-otp', sendOtp);
otpRouter.post('/verify-otp', verifyOtp);

module.exports = { otpRouter };