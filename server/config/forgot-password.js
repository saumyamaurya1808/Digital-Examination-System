const nodemailer = require("nodemailer");
const { Examinee } = require("../models/examinee-model");

const sendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await Examinee.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // OTP Generate
        const otp = Math.floor(100000 + Math.random() * 900000);

        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 5 * 60 * 1000;

        await user.save();

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
            text: `Form forgot password - \n Your OTP is ${otp}.\n It will expire in 5 minutes. Don't share with anyone.`
        });

        res.json({
            success: true,
            message: "OTP sent to email"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    const user = await Examinee.findOne({
        email,
        resetOtp: otp,
        resetOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid or Expired OTP"
        });
    }

    res.json({
        success: true,
        message: "OTP Verified"
    });

};

resetPassword = async (req, res) => {

    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({
            message: "Passwords do not match"
        });
    }

    const user = await Examinee.findOne({ email }).select("+password");

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    user.password = password;

    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    await user.save();

    res.json({
        success: true,
        message: "Password reset successful"
    });

};

module.exports = { sendOtp, verifyOtp, resetPassword }