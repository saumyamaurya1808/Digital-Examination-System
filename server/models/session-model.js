const mongoose = require('mongoose');

const sessionsSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    course: {
        type: String,
        required: true
    },

    branch: {
        type: String,
        required: true
    },

    year: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Compound index for filtering
sessionsSchema.index({
    name: 1,
    course: 1,
    branch: 1
});

const Session = mongoose.model('Session', sessionsSchema);

module.exports = { Session };