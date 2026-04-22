const express = require("express");
const { registerAdmin, loginAdmin, changePassword, logoutAdmin, getServerLoadingData } = require("../controllers/admin-controller");
const { verifyToken, isAdmin } = require("../middlewares/auth-middleware");
const adminRouter = express.Router();

adminRouter.route("/register").post(registerAdmin);
adminRouter.route("/login").post(loginAdmin);
adminRouter.route("/logout").post(logoutAdmin);
adminRouter.route("/changepassword").put(verifyToken, isAdmin, changePassword);
adminRouter.route("/stats").get(verifyToken, getServerLoadingData);

module.exports = { adminRouter }