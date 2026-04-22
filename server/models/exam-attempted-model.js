const mongoose = require("mongoose");

const examAttemptedSchema = new mongoose.Schema(
  {
    examineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Examinee",
      required: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Examination",
      required: true,
    },
    // Naya field: Individual answers save karne ke liye
    submittedAnswers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId, ref: "Question"
        },
        selectedOption: {
          type: String // User ne kya choose kiya
        },
        correctOption: {
          type: String // Us waqt sahi kya tha
        },
        isCorrect: {
          type: Boolean  // Result calculation ke liye
        }
      }
    ],
    score: {
      type: Number,
      default: 0
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    passingMarks: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Passed", "Failed"],
      default: "Failed",
    },
    resultStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Unique combination: Ek student, ek exam, ek hi attempt.
examAttemptedSchema.index({
  examineeId: 1,
  examId: 1
}, { unique: true });

const ExamAttempted = mongoose.model("ExamAttempted", examAttemptedSchema);
module.exports = { ExamAttempted };