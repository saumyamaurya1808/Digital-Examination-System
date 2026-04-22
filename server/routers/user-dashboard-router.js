const express = require("express");
const { verifyTokenforExaminee } = require("../middlewares/auth-middleware");
const { getDashboardDataStudent } = require("../controllers/user-dashboard-controller");

const userDashboardRouter = express.Router();

userDashboardRouter.route("/std-dashboard").get(verifyTokenforExaminee, getDashboardDataStudent);

module.exports = { userDashboardRouter }