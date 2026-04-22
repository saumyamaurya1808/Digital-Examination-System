const { Session } = require("../models/session-model");

// Create a session
const createSession = async (req, res) => {
    try {
        const { name, course, branch, year, description } = req.body;
        const sessionRegex = /^\d{4}-\d{4}$/;
        
        if (!name || !course || !branch || !year || !description) {
            return res.status(400).json({ success: false, message: "All fields are mandatory" });
        }
        
        if (!sessionRegex.test(name)) {
            return res.status(400).json({ success: false, message: "Format must be YYYY-YYYY" });
        }
        
        const [start, end] = name.split("-");
        if (parseInt(end) !== parseInt(start) + 1) {
            return res.status(400).json({ success: false, message: "Years must be consecutive" });
        }
        
        const newSession = await Session.create({ name, course, branch, year, description });
        
        console.log("coming session in controller",req.body);

        return res.status(201).json({
            success: true,
            message: "Session Added Successfully",
            result: newSession // Send result back
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Get all sessions
const getAllSessions = async (req, res) => {
    try {
        const result = await Session.find();

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No sessions found"
            });
        }

        return res.json({
            success: true,
            result
        });

    } catch (err) {
        return res.status(500).json({
            error: "Failed to fetch sessions"
        });
    }
};

// GET ALL SESSIONS WITH FILTER
const getAllFilteredSessions = async (req, res) => {
    try {

        const search = req.query.search || "";
        const session = req.query.session || "";
        const course = req.query.course || "";
        const branch = req.query.branch || "";

        let filter = {};

        // SEARCH BY YEAR
        if (search) {
            filter.year = { $regex: search, $options: "i" };
        }

        // DROPDOWN FILTERS
        if (session) filter.name = session;
        if (course) filter.course = course;
        if (branch) filter.branch = branch;

        const result = await Session.find(filter).sort({ name: -1 });

        return res.json({
            success: true,
            result
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch sessions"
        });

    }
};

// Delete a session
const deleteSession = async (req, res) => {
    try {
        const result = await Session.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        return res.json({
            success: true,
            message: "Session Deleted Successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete session"
        });
    }
};


// Update a session
const updateSession = async (req, res) => {
    try {

        const result = await Session.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after" }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        return res.json({
            success: true,
            message: "Session Updated Successfully",
            result
        });

    } catch (err) {
        return res.status(400).json({
            error: err.message
        });
    }
};

// Get session by ID (optional)
const getcustomSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const result = await Session.findById(sessionId);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        return res.json({
            success: true,
            result
        });

    } catch (err) {
        return res.status(500).json({
            error: "Failed to fetch session"
        });
    }
};

module.exports = {
    createSession,
    getAllSessions,
    getAllFilteredSessions,
    deleteSession,
    updateSession,
    getcustomSession
};