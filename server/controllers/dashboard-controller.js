const { ExamAttempted } = require("../models/exam-attempted-model");
const { Examination } = require("../models/examination-model");
const { Examinee } = require("../models/examinee-model");
const { Question } = require("../models/question-model");
const { Subject } = require("../models/subject-model");


//  Dashboard Summary
const getDashboardDataAdmin = async (req, res) => {
    try {
        const totalExaminees = await Examinee.countDocuments();
        const totalQuestions = await Question.countDocuments();
        const totalExams = await Examination.countDocuments();
        const totalSubjects = await Subject.countDocuments();
        const totalExamAttempted = await ExamAttempted.countDocuments();
        const totalFailed = await ExamAttempted.countDocuments({status: "Failed"})

        return res.status(200).json({
            success: true,
            data: {
                totalExaminees,
                totalQuestions,
                totalExams,
                totalSubjects,
                totalExamAttempted,
                totalFailed,
                totalPassesd: (totalExamAttempted-totalFailed)
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching dashboard data"
        });
    }
};


// Total Exams by Examinee
const getExamsByExaminee = async (req, res) => {
    try {
        const { id } = req.params;

        const totalExams = await Examination.countDocuments({ examineeId: id });

        if (totalExams === 0) {
            return res.status(404).json({
                success: false,
                message: "No exams found for this examinee"
            });
        }

        return res.status(200).json({
            success: true,
            totalExams
        });

    } catch (error) {
        console.error("Error fetching exam details:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching exam details"
        });
    }
};


// Passed Exams Count
const getExamineeResult = async (req, res) => {
    try {
        const { id } = req.params;

        const passedExams = await ExamAttempted.countDocuments({
            resultStatus: "Completed",
            status: "Passed",
            examineeId: id,
        });

        return res.status(200).json({
            success: true,
            passedExams
        });

    } catch (error) {
        console.error("Error fetching examinee result:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch result"
        });
    }
};

const checkAdmin = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "You have access to this protected admin route"
    });
};


module.exports = {
    getDashboardDataAdmin,
    getExamsByExaminee,
    getExamineeResult,
    checkAdmin,
};