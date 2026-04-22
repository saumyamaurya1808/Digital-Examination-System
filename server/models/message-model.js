// models/Message.js

const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema(
//     {
//         question: {
//             type: String,
//             default: "",   // User's message
//             trim: true,
//         },

//         answer: {
//             type: String,
//             default: "",   // Admin's reply
//             trim: true,
//         },

//         examineeId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Examinee",
//             required: true,
//         },

//         deletedBy: {
//             type: String,
//             enum: ["admin", "user"],
//             default: null,
//         },

//         editedBy: {
//             type: String,
//             enum: ["admin", "user"],
//             default: null,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

const messageSchema = new mongoose.Schema({
    question: {
        type: String,
        default: "",
        trim: true
    },
    answer: {
        type: String,
        default: "",
        trim: true
    },
    examineeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Examinee",
        required: true
    },

    // Naye Fields
    deletedByUser: {
        type: Boolean,
        default: false
    },
    deletedByAdmin: {
        type: Boolean,
        default: false
    },

    editedBy: {
        type: String,
        enum: ["admin", "user"],
        default: null
    },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };