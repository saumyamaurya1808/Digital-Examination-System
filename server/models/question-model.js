// models/Question.js

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },

        options: [
            {
                type: String,
                required: true,
                trim: true,
            },
        ],

        correctAnswer: {
            type: String,
            required: true,
            trim: true,
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = { Question };