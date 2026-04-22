const express = require('express');
const {
    createExam,
    getAllExams,
    updateExam,
    deleteExam,
    getExamQuestions,
    submitExam,
    getReport,
    declareResult,
    getPendingResults,
    getExamineeResults,
    getStudentExams,
    getFilteredExam,
    getResultDetails
} = require('../controllers/examination-controller');
const { verifyTokenforExaminee } = require('../middlewares/auth-middleware');

const examinationRouter = express.Router();


// -------- Specific / Static Routes First --------

// Create Exam + Get All Exams (Same Base Path)
examinationRouter.route('/')
    .post(createExam)
    .get(getAllExams)


// Get filtered exam
examinationRouter.get('/getfilteredexams', getFilteredExam)

// Submit Exam
examinationRouter.post('/submit-exam', verifyTokenforExaminee, submitExam)

// Get Report
examinationRouter.get('/report', getReport)

// Get particilar student total Exams
examinationRouter.get('/student-exams',verifyTokenforExaminee, getStudentExams);

// Get Pending Results
examinationRouter.get('/examination', getPendingResults)

// Get Examinee all Results of single examinee
examinationRouter.get('/examinee-result',verifyTokenforExaminee, getExamineeResults)


// -------- Exam Related --------

// Get particular student's specific Exam
examinationRouter.get('/exam/:examId',verifyTokenforExaminee, getExamQuestions)

// Get specific Exam result
examinationRouter.get("/result-single/:id",verifyTokenforExaminee, getResultDetails)

// Declare Result
examinationRouter.post('/result/:id', declareResult)


// -------- Dynamic ID Routes Last --------

// Update + Delete Exam
examinationRouter.route('/:id')
    .put(updateExam)
    .delete(deleteExam)


module.exports = { examinationRouter }