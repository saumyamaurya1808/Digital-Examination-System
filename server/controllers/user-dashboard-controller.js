const { ExamAttempted } = require("../models/exam-attempted-model");
const { Examination } = require("../models/examination-model");
const { Session } = require("../models/session-model");


const getDashboardDataStudent = async (req, res) => {

    try {
        const user = req.user;

        // STEP 1: Session find karo
        const sessionDoc = await Session.findOne({
            name: user.session,
            course: user.course,
            branch: user.branch,
            // year: user.year
        });

        if (!sessionDoc) {  
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        // STEP 2: Total Exams (sessionId se)
        const totalExams = await Examination.countDocuments({
            sessionId: sessionDoc._id,
            // status: "Closed" // recommended
        });

        // STEP 3: Attempted
        const attemptedCount = await ExamAttempted.countDocuments({
            examineeId: user._id
        });
        
        // STEP 4: Missed
        const missedCount = totalExams - attemptedCount;

        // STEP 5: Passed
        const passedCount = await ExamAttempted.countDocuments({
            examineeId: user._id,
            status: "Passed"
        });

        console.log("passed exam ",passedCount)

        // STEP 6: Failed
        const failedCount = await ExamAttempted.countDocuments({
            examineeId: user._id,
            status: "Failed"
        });

        return res.status(200).json({
            success: true,
            data: {
                totalExams,
                attemptedCount,
                missedCount,
                passedCount,
                failedCount
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Dashboard error"
        });
    }


};
module.exports = { getDashboardDataStudent }