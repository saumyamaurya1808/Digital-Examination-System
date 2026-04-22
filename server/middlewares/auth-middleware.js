const jwt = require("jsonwebtoken");
const { Admin } = require("../models/admin-model");
const { Examinee } = require("../models/examinee-model");



// Verify JWT Token (Cookie Based)
const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        console.log("Token from cookie:", token); // Debug log

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Optional: check user still exists in DB
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Admin not found."
            });
        }

        // Attach admin data to request
        req.admin = admin;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

const verifyTokenforExaminee = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Optional: check user still exists in DB
        const examinee = await Examinee.findById(decoded.id);

        if (!examinee) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Examinee not found."
            });
        }

        // Attach examinee data to request
        req.user = examinee;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

// Role Based Middleware (Admin Only Example)
const isAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access forbidden. Admin only."
        });
    }
    next();
};


const isExaminee = (req, res, next) => {
    if (!req.user || req.user.role !== "examinee") {
        return res.status(403).json({
            success: false,
            message: "Access forbidden. Examinee only."
        });
    }

    next();
};


module.exports = { verifyToken, isAdmin, verifyTokenforExaminee, isExaminee };