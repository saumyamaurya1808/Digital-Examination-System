const { Question } = require("../models/question-model");
const { Subject } = require("../models/subject-model");


// Add Subject
const createSubject = async (req, res) => {
    try {
        const result = new Subject(req.body);
        await result.save();

        return res.json({
            success: true,
            message: "Subject added successfully"
        });

    } catch (error) {
        console.error("Error adding subject:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// Get All Subjects
const getAllSubjects = async (req, res) => {
    try {
        const result = await Subject.find();

        return res.json(result);

    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// Delete Subject
const deleteSubject = async (req, res) => {
    try {
        const result = await Subject.findByIdAndDelete(req.params.id);

        return res.json({
            success: true,
            message: "Subject deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting subject:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// Update Subject
const updateSubject = async (req, res) => {
    try {
        const result = await Subject.findByIdAndUpdate(
            req.params.id,
            req.body
        );

        return res.json({
            success: true,
            message: "Subject updated successfully"
        });

    } catch (error) {
        console.error("Error updating subject:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const getQuestionsBySubject = async (req, res) => {
    try {

        const { id } = req.params;   // subject id

        const questions = await Question.find({ subject: id })
            .populate("subject", "name");

        return res.json({
            totalQuestions: questions.length,
            data: questions
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });

    }
};

module.exports = {
    createSubject,
    getAllSubjects,
    deleteSubject,
    updateSubject,
    getQuestionsBySubject
};