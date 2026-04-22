const { Admin } = require("../models/admin-model");
const os = require('os'); 

// Register Admin
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check duplicate email
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Create admin (password hash pre-save me hoga)
        const admin = await Admin.create({ name, email, password });

        // Generate JWT
        const token = admin.generateToken();

        // Send token in cookie
        res.cookie("token", token, {
            httpOnly: true,               // JS access block
            secure: false,                // production me true (HTTPS)
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000   // 1 day
        });

        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: {
                id: admin._id,
                email: admin.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Login Admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // bcrypt compare method (model me defined hai)
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate JWT
        const token = admin.generateToken();

        // Send token in cookie
        res.cookie("token", token, {
            httpOnly: true,               // JS access block
            secure: false,                // production me true (HTTPS)
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000   // 1 day
        });

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            admin: {
                id: admin._id,
                email: admin.email,
                role: "admin"
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// logoutAdmin
const logoutAdmin = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
            secure: false // production me true
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};

// changePassword
const changePassword = async (req, res) => {
    try {
        const { op, np, cnp } = req.body;
        const id = req.admin._id;

        const user = await Admin.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Compare old password properly
        const isMatch = await user.comparePassword(op);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password not matched"
            });
        }

        if (op === np) {
            return res.status(400).json({
                success: false,
                message: "Old and new password cannot be same"
            });
        }

        if (np !== cnp) {
            return res.status(400).json({
                success: false,
                message: "Confirm password not matched"
            });
        }

        user.password = np;
        await user.save();  //  pre("save") middleware chalega

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// GET: /api/admin/stats
const getServerLoadingData = async (req, res) => {
    try {
        // CPU Load (1 min average / Number of Cores)
        const cpus = os.cpus().length;
        const loadAvg = os.loadavg()[0]; 
        const cpuUsage = Math.min(Math.round((loadAvg / cpus) * 100), 100);

        // Memory Usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

        // Dono mein se jo zyada load hai wo bhej rahe hain
        const currentLoad = Math.max(cpuUsage, memUsage);

        res.status(200).json({
            success: true,
            load: currentLoad, // Ye dashboard bar ke liye hai
            details: { cpu: cpuUsage, ram: memUsage }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};


module.exports = { registerAdmin, loginAdmin, changePassword, logoutAdmin, getServerLoadingData };