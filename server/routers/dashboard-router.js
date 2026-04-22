const express = require("express");
const { getExamsByExaminee, getExamineeResult, checkAdmin, getDashboardDataAdmin } = require("../controllers/dashboard-controller");
const { verifyToken} =  require("../middlewares/auth-middleware");
const dashboardRouter = express.Router();


dashboardRouter.route("/").get(verifyToken, getDashboardDataAdmin);

// for protecting admin routes
dashboardRouter.route("/dashboard").get(verifyToken, checkAdmin);


dashboardRouter.route("/exams/:id").get(getExamsByExaminee);


dashboardRouter.route("/examinee-result/:id").get(getExamineeResult);


module.exports = { dashboardRouter };