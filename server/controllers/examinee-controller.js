const { cloudinary } = require("../config/cloudinary");
const { Examinee } = require("../models/examinee-model");
const fs = require("fs");
const XLSX = require("xlsx");
const { OTP } = require("../models/otp-model");

// REGISTER
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            college,
            course,
            branch,
            year,
            phone,
            session,
            password
        } = req.body;

        const otpRecord = await OTP.findOne({email, isVerified: true});
        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or unverified email. Please verify your email first."
            });
        }

        // Check required fields
        if (!name || !email || !college || !course || !branch || !phone || !session || !year || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check existing user
        const ex = await Examinee.findOne({ email });

        if (ex) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        let imageUrl = "";
        let publicId = "";

        // Agar image aayi hai to upload karo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "examinee_profiles"
            });

            imageUrl = result.secure_url;
            publicId = result.public_id;

            // Local file delete
            fs.unlinkSync(req.file.path);
        }

        // Create user
        const user = await Examinee.create({
            name,
            email,
            college,
            course,
            branch,
            year,
            phone,
            session,
            password,
            profileImage: imageUrl,
            profileImagePublicId: publicId
        });

        // Delete the verified OTP record
        await OTP.deleteMany({ email });

        // Generate Token
        const token = user.generateToken();

        // Send token in cookie
        res.cookie("token", token, {
            httpOnly: true,               // JS access block
            secure: false,                // production me true (HTTPS)
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000   // 1 day
        });

        return res.status(201).json({
            success: true,
            message: "Registered successfully",
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server Error" })
    }
}

// LOGIN
const login = async (req, res) => {

    try {
        const { email, password } = req.body

        const user = await Examinee.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })

        }

        // bcrypt compare
        const isMatch = await user.comparePassword(password)

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })

        }

        // Generate token
        const token = user.generateToken()

        // Send token in cookie
        res.cookie("token", token, {
            httpOnly: true,               // JS access block
            secure: false,                // production me true (HTTPS)
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000   // 1 day
        });

        return res.status(201).json({
            success: true,
            message: "Login Successfully",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {

        console.log(error)
        return res.status(500).json({ message: "Server Error" })

    }
}

// getCurrentUser
const getCurrentUser = async (req, res) => {
    try {
        const user = req.user; // Set in auth middleware
        return res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// GET ALL WITH FILTER
const getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const search = req.query.search || "";
        const session = req.query.session || "";
        const course = req.query.course || "";
        const branch = req.query.branch || "";
        const year = req.query.year || "";

        const skip = (page - 1) * limit;

        let filter = {};

        // SEARCH (NAME + EMAIL)
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // DROPDOWN FILTERS
        if (session) filter.session = session;
        if (course) filter.course = course;
        if (branch) filter.branch = branch;
        if (year) filter.year = year;

        const students = await Examinee.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Examinee.countDocuments(filter);

        res.json({
            success: true,
            data: students,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalStudents: total
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

// export excel
const exportExamineeExcel = async (req, res) => {

    const students = await Examinee.find()

    const formatted = students.map((s) => ({
        Name: s.name,
        Email: s.email,
        Phone: s.phone,
        College: s.college,
        Course: s.course,
        Branch: s.branch,
        Session: s.session,
        Year: s.year
    }))

    const worksheet = XLSX.utils.json_to_sheet(formatted)

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Students")

    const buffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer"
    })

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=students.xlsx"
    )

    res.send(buffer)

}


// GET BY ID
const getById = async (req, res) => {

    try {
        const { id } = req.params

        const user = await Examinee.findById(id)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json(user)

    } catch (error) {

        console.log(error)
        return res.status(500).json({ message: "Server Error" })
    }
}

// UPDATE
const update = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, phone, college, course, branch, session, year } = req.body;

        // 1. Pehle existing user ko dhundhein taaki purani image ID mil sake
        const user = await Examinee.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let updateData = { name, email, phone, college, course, branch, session, year };

        // 2. Agar nayi file upload hui hai (req.file)
        if (req.file) {
            try {
                // Purani image delete karein Cloudinary se (agar exist karti hai)
                if (user.profileImagePublicId) {
                    await cloudinary.uploader.destroy(user.profileImagePublicId);
                }

                // Nayi image upload karein
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "examinee_profiles",
                });

                // Update data mein naya URL aur ID add karein
                updateData.profileImage = result.secure_url;
                updateData.profileImagePublicId = result.public_id;

                // Local uploads folder se file delete karein
                fs.unlinkSync(req.file.path);

            } catch (cloudErr) {
                console.error("Cloudinary Error:", cloudErr);
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        // 3. Database update karein
        const updatedUser = await Examinee.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Error:", error);
        // Error hone par bhi agar file local mein reh gayi hai toh delete karein
        if (req.file) fs.unlinkSync(req.file.path);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// DELETE
const deleted = async (req, res) => {
    try {

        const { id } = req.params

        await Examinee.findByIdAndDelete(id)

        return res.status(200).json({
            success: true,
            message: "Deleted successfully"
        })

    } catch (error) {

        console.log(error)
        return res.status(500).json({ message: "Server Error" })

    }
}


// delete profile image from cloudunary
const deleteProfileImage = async (req, res) => {
    try {
        const user = await Examinee.findById(req.params.id);

        if (user && user.profileImagePublicId) {
            // Cloudinary se delete karein
            await cloudinary.uploader.destroy(user.profileImagePublicId);

            // DB fields ko khali karein
            user.profileImage = undefined;
            user.profileImagePublicId = undefined;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Image removed",
                user
            });
        }
        res.status(400).json({ message: "No image to delete" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};


// CHANGE PASSWORD
const changePassword = async (req, res) => {

    try {
        const { op, np, cnp } = req.body
        const { id } = req.params

        const user = await Examinee.findById(id).select("+password")

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const isMatch = await user.comparePassword(op)

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                message: "Old password not matched"
            })

        }

        if (op === np) {

            return res.status(400).json({
                message: "Old and new password cannot be same"
            })

        }

        if (np !== cnp) {

            return res.status(400).json({
                message: "Confirm password not matched"
            })

        }

        user.password = np
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })

    } catch (error) {

        console.log(error)
        return res.status(500).json({ message: "Server Error" })

    }

}

const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: false   // production me true
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
};


const checkExaminee = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "You have access to this protected examinee route"
    });
}

module.exports = {
    register,
    getAll,
    exportExamineeExcel,
    getById,
    update,
    deleted,
    deleteProfileImage,
    login,
    changePassword,
    getCurrentUser,
    logout,
    checkExaminee
}