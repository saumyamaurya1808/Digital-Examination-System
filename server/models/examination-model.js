const mongoose = require('mongoose');

const ExaminationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true   // search ke liye
    },

    date: {
        type: String,
        required: true
    },

    time: {
        type: String,
        required: true
    },

    duration: {
        type: Number,
        required: true
    },

    totalMarks: {
        type: Number,
        required: true
    },

    passingMarks: {
        type: Number,
        required: true
    },

    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
        index: true   // lookup fast
    },

    questionDistribution: [
        {
            subject: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
                required: true
            },
            questionCount: {
                type: Number,
                required: true
            }
        }
    ],
    
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        }
    ],
    
    status: {
        type: String,
        default: 'Scheduled',
        enum: ['Scheduled', 'Draft', 'Closed']
    },
}, { timestamps: true });


// Sorting optimization
ExaminationSchema.index({ createdAt: -1 });

const Examination = mongoose.model('Examination', ExaminationSchema);

module.exports = { Examination };