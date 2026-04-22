const mongoose = require("mongoose");
const { Question } = require("../models/question-model");
const { Examination } = require("../models/examination-model");
const { Examinee } = require("../models/examinee-model");
const { ExamAttempted } = require("../models/exam-attempted-model");
const { Session } = require("../models/session-model");
const XLSX = require("xlsx")


// ================= CREATE EXAM =================
const createExam = async (req, res) => {
    try {

        const {
            title,
            date,
            time,
            duration,
            totalMarks,
            passingMarks,
            sessionId,
            status,
            questionDistribution
        } = req.body;

        if (
            !title || !date || !time || !duration ||
            !totalMarks || !passingMarks || !sessionId ||
            !Array.isArray(questionDistribution)
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: "Invalid sessionId" });
        }

        let selectedQuestions = [];
        let distribution = [];

        const usedSubjects = new Set();

        for (const dist of questionDistribution) {

            const { subject, questionCount } = dist;

            if (!mongoose.Types.ObjectId.isValid(subject)) {
                return res.status(400).json({ message: "Invalid subjectId" });
            }

            if (usedSubjects.has(subject)) {
                return res.status(400).json({
                    message: "Duplicate subject in distribution"
                });
            }

            usedSubjects.add(subject);

            const count = Number(questionCount);

            const questions = await Question.aggregate([
                { $match: { subject: new mongoose.Types.ObjectId(subject) } },
                { $sample: { size: count } }
            ]);

            if (questions.length < count) {
                return res.status(400).json({
                    message: "Not enough questions available"
                });
            }

            selectedQuestions.push(...questions.map(q => q._id));

            distribution.push({
                subject,
                questionCount: count
            });

        }

        const exam = await Examination.create({
            title,
            date,
            time,
            duration,
            totalMarks: Number(totalMarks),
            passingMarks: Number(passingMarks),
            sessionId,
            status: status || "Scheduled",
            questionDistribution: distribution,
            questions: selectedQuestions
        });

        return res.status(201).json({
            success: true,
            exam
        });

    } catch (error) {
        console.error("Create Exam Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// ================= GET Search + Filter + Pagination =================
const getFilteredExam = async (req, res) => {
    try {
        const { course, branch, session, year, search, group } = req.query;

        let pipeline = [];

        // Search
        if (search?.trim()) {
            pipeline.push({
                $match: {
                    title: { $regex: search, $options: "i" }
                }
            });
        }

        // Session lookup
        pipeline.push(
            {
                $lookup: {
                    from: "sessions",
                    localField: "sessionId",
                    foreignField: "_id",
                    as: "sessionData"
                }
            },
            { $unwind: "$sessionData" }
        );

        // Subject lookup
        pipeline.push({
            $lookup: {
                from: "subjects",
                localField: "questionDistribution.subject",
                foreignField: "_id",
                as: "subjectData"
            }
        });

        pipeline.push({
            $addFields: {
                questionDistribution: {
                    $map: {
                        input: "$questionDistribution",
                        as: "qd",
                        in: {
                            subject: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$subjectData",
                                            as: "sub",
                                            cond: { $eq: ["$$sub._id", "$$qd.subject"] }
                                        }
                                    },
                                    0
                                ]
                            },
                            questionCount: "$$qd.questionCount"
                        }
                    }
                }
            }
        });

        // Filters
        const filters = {};

        if (course) filters["sessionData.course"] = course;
        if (branch) filters["sessionData.branch"] = branch;
        if (session) filters["sessionData.name"] = session;
        if (year) filters["sessionData.year"] = year;

        if (Object.keys(filters).length > 0) {
            pipeline.push({ $match: filters });
        }

        // Grouping
        if (group === "true" || group === true) {

            pipeline.push(
                {
                    $group: {
                        _id: {
                            course: "$sessionData.course",
                            sessionName: "$sessionData.name"
                        },
                        exams: { $push: "$$ROOT" }
                    }
                },
                {
                    $group: {
                        _id: "$_id.course",
                        sessions: {
                            $push: {
                                session: "$_id.sessionName",
                                exams: "$exams"
                            }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            );

        } else {

            pipeline.push({
                $sort: { createdAt: -1 }
            });

        }

        const exams = await Examination.aggregate(pipeline);

        res.json({
            success: true,
            data: exams
        });

    } catch (error) {

        console.error("Filter Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};



// ================= GET ALL EXAMS =================
const getAllExams = async (req, res) => {
    try {

        const exams = await Examination.find()
            .populate("sessionId", "name course branch year")
            .populate("questionDistribution.subject", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: exams
        });

    } catch (error) {

        console.error("Get Exams Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

// ================= Get Specific Student EXAMs (List view) =================
const getStudentExams = async (req, res) => {
    try {

        const email = req.user.email;
        const examinee = await Examinee.findOne({ email });

        if (!examinee) {
            return res.status(404).json({
                success: false,
                message: "examinee not found"
            });
        }

        // console.log("examinee : ", examinee)

        const sessions = await Session.find({
            course: examinee.course,
            branch: examinee.branch,
            name: examinee.session,
            year: examinee.year
        });

        // console.log("sessions", sessions);

        const sessionIds = sessions.map(s => (s._id));
        // console.log("my sessionIds", sessionIds);

        const exams = await Examination.find({
            sessionId: { $in: sessionIds },
            status: "Scheduled"
        })
            .populate("sessionId", "course branch year name")
            .populate("questionDistribution.subject", "name");

        // console.log("my exams", exams);

        // Har exam ke liye check karein ki kya student ne ise attempt kiya hai
        const examsWithStatus = await Promise.all(exams.map(async (exam) => {
            const attempt = await ExamAttempted.findOne({
                examId: exam._id,
                examineeId: examinee._id
            });

            // Hum existing data mein isAttempted flag aur details jod rahe hain
            return {
                ...exam.toObject(), // Mongoose document ko plain JS object mein badlein
                isAttempted: attempt ? (attempt.resultStatus === "Completed") : false,
                attemptDetails: attempt || null
            };
        }));

        return res.status(200).json({
            success: true,
            data: examsWithStatus // Ab updated array
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


// ================= UPDATE EXAM =================
const updateExam = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Exam ID"
            });
        }

        const updatedExam = await Examination.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedExam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        return res.status(200).json({
            success: true,
            updatedExam
        });

    } catch (error) {

        console.error("Update Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};



// ================= DELETE EXAM =================
const deleteExam = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Exam ID"
            });
        }

        const deleted = await Examination.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Exam not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Exam deleted successfully"
        });

    } catch (error) {

        console.error("Delete Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};


// ================= SUBMIT EXAM =================
const submitExam = async (req, res) => {
    try {
        const { examId, answers } = req.body;
        const user = req.user; // From verifyTokenforExaminee middleware

        if (!examId || !answers) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        // 1. Double check duplicate attempt (Early exit to avoid 500 error)
        const alreadyExists = await ExamAttempted.findOne({ examineeId: user._id, examId });
        if (alreadyExists) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted this exam."
            });
        }

        // 2. Fetch Exam with Questions
        const exam = await Examination.findById(examId).populate("questions");
        if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

        // 3. Scoring Logic & Answer Mapping
        let totalScore = 0;
        const processedAnswers = [];
        const marksPerQuestion = exam.totalMarks / (exam.questions.length || 1);

        exam.questions.forEach((q) => {
            const userChoice = answers[q._id.toString()] || null; // Handle unattempted
            const isCorrect = userChoice === q.correctAnswer;

            if (isCorrect) totalScore += marksPerQuestion;

            processedAnswers.push({
                questionId: q._id,
                selectedOption: userChoice,
                correctOption: q.correctAnswer,
                isCorrect: isCorrect
            });
        });

        const status = totalScore >= exam.passingMarks ? "Passed" : "Failed";

        // 4. Save Attempt to DB
        const newAttempt = await ExamAttempted.create({
            examineeId: user._id,
            examId: exam._id,
            submittedAnswers: processedAnswers,
            score: Math.round(totalScore),
            totalMarks: exam.totalMarks,
            passingMarks: exam.passingMarks,
            status: status,
            resultStatus: "Completed" // Mark as completed since we calculated score
        });

        return res.status(200).json({
            success: true,
            message: "Exam submitted successfully",
            result: {
                score: Math.round(totalScore),
                status: status
            }
        });

    } catch (error) {
        console.error("Submission Crash:", error);

        // Handle MongoDB Duplicate Key Error specifically
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Duplicate attempt detected." });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// ================= GET paricular student's particilar subject's EXAM  =================
const getExamQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        const user = req.user; // From verifyTokenforExaminee middleware

        const exam = await Examination
            .findById(examId)
            .populate("questions");

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        const examStart = new Date(`${exam.date}T${exam.time}`);
        const examEnd = new Date(examStart.getTime() + exam.duration * 60000);
        const now = new Date();

        if (now < examStart) {
            return res.status(403).json({ message: "Exam hasn't started yet!" });
        }
        if (now > examEnd) {
            return res.status(403).json({ message: "Exam time has expired!" });
        }
        return res.status(200).json({
            success: true,
            exam,
            questions: exam.questions,
            user
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};


// ================= GET REPORT =================
const getReport = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, sessionId, course, branch, exportExcel } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let pipeline = [
            // 1. Join with Examinee
            { $lookup: { from: "examinees", localField: "examineeId", foreignField: "_id", as: "examinee" } },
            { $unwind: "$examinee" },

            // 2. Join with Examination
            { $lookup: { from: "examinations", localField: "examId", foreignField: "_id", as: "exam" } },
            { $unwind: "$exam" },

            // 3. Join with Questions
            {
                $lookup: {
                    from: "questions",
                    localField: "submittedAnswers.questionId",
                    foreignField: "_id",
                    as: "questionDetails"
                }
            },

            // ---Subject Name laane ke liye---
            {
                $lookup: {
                    from: "subjects", // Check karein aapke subjects collection ka yahi naam hai na?
                    localField: "questionDetails.subject",
                    foreignField: "_id",
                    as: "subjectDetails"
                }
            },
            // 4. Filtering Logic
            {
                $match: {
                    $and: [
                        search ? {
                            $or: [
                                { "examinee.name": { $regex: search, $options: "i" } },
                                { "examinee.email": { $regex: search, $options: "i" } },
                                { "exam.title": { $regex: search, $options: "i" } }
                            ]
                        } : {},
                        status ? { status: status } : {},

                        sessionId ? { "examinee.session": sessionId } : {},
                        course ? { "examinee.course": course } : {},
                        branch ? { "examinee.branch": branch } : {},
                        req.query.year ? { "examinee.year": req.query.year } : {}
                    ]
                }
            }
        ];

        // --- EXCEL EXPORT LOGIC ---
        if (exportExcel === 'true') {
            const allData = await ExamAttempted.aggregate(pipeline);

            const excelRows = allData.map(item => {
                const subjectStats = {};

                item.submittedAnswers.forEach((ans) => {
                    // 1. Pehle question dhundo
                    const qDetail = item.questionDetails.find(q => q._id.toString() === ans.questionId.toString());

                    // 2. Phir us question ki subject ID se subject ka naam dhundo
                    const subInfo = item.subjectDetails.find(s => s._id.toString() === qDetail?.subject?.toString());

                    // Agar naam mil gaya to wo, warna ID, warna 'General'
                    const subName = subInfo ? subInfo.name : (qDetail?.subject || "General");

                    if (!subjectStats[subName]) {
                        subjectStats[subName] = { score: 0, total: 0 };
                    }
                    subjectStats[subName].total += 1;
                    if (ans.isCorrect) subjectStats[subName].score += 1;
                });

                // 2. Map subjects to string: "Physics: 10/12 | Maths: 8/10"
                const subjectString = Object.keys(subjectStats).length > 0
                    ? Object.entries(subjectStats)
                        .map(([name, stat]) => `${name}: ${stat.score}/${stat.total}`)
                        .join(" | ")
                    : "No Subject Data";

                return {
                    "Examinee Name": item.examinee?.name || "N/A",
                    "Email": item.examinee?.email || "N/A",
                    "Course": item.examinee?.course || "N/A",
                    "Branch": item.examinee?.branch || "N/A",
                    "Year": item.examinee?.year || "N/A",
                    "Session": item.examinee?.session || "N/A",
                    "Exam Title": item.exam?.title || "N/A",
                    "Subject Breakdown": subjectString,
                    "Total Score": `${item.score}/${item.totalMarks}`,
                    "Result Status": item.status,
                    "Detailed Q&A": item.submittedAnswers.map((a, i) => `Q${i + 1}:${a.isCorrect ? '✔' : '✘'}(Sel:${a.selectedOption})`).join(", ")
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Master Report");

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Master_Student_Report.xlsx');
            return res.send(excelBuffer);
        }

        // --- NORMAL JSON FETCH ---
        const totalResults = await ExamAttempted.aggregate([...pipeline, { $count: "total" }]);
        const total = totalResults.length > 0 ? totalResults[0].total : 0;
        const data = await ExamAttempted.aggregate([...pipeline, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: parseInt(limit) }]);

        return res.status(200).json({
            success: true,
            data,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating report" });
    }
};


// ================= DECLARE RESULT =================
const declareResult = async (req, res) => {

    try {

        const updated = await ExamAttempted.findByIdAndUpdate(
            req.params.id,
            { resultStatus: "Completed" },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            updated
        });

    } catch (error) {

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};


// ================= PENDING RESULTS =================
const getPendingResults = async (req, res) => {

    try {e
        const pending = await ExamAttempted
            .find({ resultStatus: "Pending" })
            .populate("examId", "title");

        return res.status(200).json({
            success: true,
            data: pending
        });

    } catch (error) {

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};



// ================= EXAMINEE all RESULTS =================
const getExamineeResults = async (req, res) => {
    try {
        const user = req.user;
        const result = await ExamAttempted
            .find({ examineeId: user._id })
            .populate("examId", "title")
            .populate("examineeId", "name email")
            .populate({
                path: "submittedAnswers.questionId",
                select: "question text options subject"
            });

        if (!result || result.length === 0) {
            return res.status(404).json({ success: false, message: "Result not found" });
        }
        return res.status(200).json({
            success: true,
            result
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// ================= GET SINGLE RESULT DETAILS of specific Stuendet (For Answer Key) =================
const getResultDetails = async (req, res) => {
    try {
        const { id } = req.params; // Result ID

        const result = await ExamAttempted.findById(id)
            .populate("examId", "title")
            .populate("examineeId", "name email")
            .populate({
                path: "submittedAnswers.questionId",
                select: "question text options subject" // Jo fields aapko dikhani hain
            });

        if (!result || result.length === 0) {
            return res.status(404).json({ success: false, message: "Result not found" });
        }

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createExam,
    getFilteredExam,
    getAllExams,
    getStudentExams,
    updateExam,
    deleteExam,
    submitExam,
    getExamQuestions,
    getReport,
    declareResult,
    getPendingResults,
    getExamineeResults,
    getResultDetails
};