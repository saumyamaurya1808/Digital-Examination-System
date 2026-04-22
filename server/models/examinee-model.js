const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const examineeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        immutable: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Email unique hona chahiye
    },
    college: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    session: {
        type: String,
        required: true
    }, // Store name like "2022-2023"

    course: {
        type: String,
        required: true
    },  // Store "B.Tech"
    branch: {
        type: String,
        required: true
    },  // Store "CSE"
    year: {
        type: String,
        required: true
    },    // Store "1st Year"
    password: {
        type: String,
        required: true,
        select: false
    },
    status: {
        type: String,
        enum: ["active", "inactive", "delete"],
        default: "inactive",
        index: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    socketIds: {
        type: [String],
        default: []
    },
    role: {
        type: String,
        default: "examinee"
    },

    profileImage: {
        type: String
    },

    profileImagePublicId: {
        type: String
    },

    // otp verified
    resetOtp: {
        type: String
    },
    resetOtpExpire: {
        type: Date
    },

}, {
    timestamps: true
});

// PASSWORD HASHING
examineeSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});


// PASSWORD COMPARE
examineeSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};



// GENERATE JWT TOKEN
examineeSchema.methods.generateToken = function () {

    return jwt.sign(
        {
            id: this._id,
            role: "examinee"
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

};

const Examinee = mongoose.model("Examinee", examineeSchema);

module.exports = { Examinee };