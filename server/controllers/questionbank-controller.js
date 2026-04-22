const { Question } = require("../models/question-model");


// Add Question
const createQuestion = async (req, res) => {
    try {

        let { question, options, correctAnswer, subject } = req.body;

        // Basic validation
        if (!question || !options || options.length < 2 || !correctAnswer || !subject) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Remove empty options
        options = options.filter(opt => opt.trim() !== "");

        if (options.length < 2) {
            return res.status(400).json({ message: "Minimum 2 options required" });
        }

        // Check correct answer exists in options
        if (!options.includes(correctAnswer)) {
            return res.status(400).json({ message: "Correct answer must match one of the options" });
        }

        const questionDoc = await Question.create({
            question,
            options,
            correctAnswer,
            subject
        });


        return res.status(201).json({
            success: true,
            message: "Question added successfully",
            data: questionDoc
        });

    } catch (error) {
        console.error("Error adding question:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


//  Get All Questions
const getAllQuestions = async (req, res) => {
    try {
        const question = await Question.find().populate('subject');

        return res.json({ success: true, data: question });

    } catch (error) {
        console.error("Error fetching questions:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};


//  Delete Question
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findByIdAndDelete(id);

        return res.json({ success: true, message: "Deleted successfully" });

    } catch (error) {
        console.error("Error deleting question:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};


//  Update Question
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findByIdAndUpdate(id, req.body);

        return res.json({ success: true, message: "Updated Successfully" });

    } catch (error) {
        console.error("Error updating question:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    createQuestion,
    getAllQuestions,
    deleteQuestion,
    updateQuestion
};