const nodemailer = require("nodemailer");
const { OTP } = require("../models/otp-model");

const sendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        await OTP.deleteMany({ email });  // Delete existing OTP for the email

        // OTP Generate
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

        const newOtp = await OTP.create({
            email,
            otp,
            expireAt: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
        }); // Save OTP to database

        // Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset OTP",
            text: `Form verify email - \n Your OTP is ${otp}.\n It will expire in 10 minutes. Don't share with anyone.`
        });

        return res.json({
            success: true,
            message: "OTP sent to email"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or Expired OTP"
            });
        }

        const currentTime = Date.now();
        if (otpRecord.expireAt < currentTime) {
            await OTP.deleteMany({ email, otp }); // Delete expired OTP

            return res.status(400).json({
                message: "Invalid or Expired OTP"
            });
        }

        otpRecord.isVerified = true;

        await otpRecord.save();

        return res.json({
            success: true,
            message: "OTP Verified"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { sendOtp, verifyOtp };