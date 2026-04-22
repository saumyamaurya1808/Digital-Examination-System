const express = require('express')
const {
    register,
    getAll,
    getById,
    update,
    deleted,
    login,
    changePassword,
    getCurrentUser,
    logout,
    checkExaminee,
    exportExamineeExcel,
    deleteProfileImage
} = require('../controllers/examinee-controller');
const { verifyTokenforExaminee, isExaminee } = require('../middlewares/auth-middleware');
const { sendOtp, verifyOtp, resetPassword } = require('../config/forgot-password');
const { upload } = require('../middlewares/multer');

const examineeRouter = express.Router()

// ----- Specific Routes First -----
examineeRouter.route('/currentuser').get(verifyTokenforExaminee, isExaminee, getCurrentUser);


examineeRouter.route('/register').post(upload.single("profileImage"), register)


// Login
examineeRouter.post('/login', login)

// Same path "/"
examineeRouter.route('/').get(getAll)

// Excel export
examineeRouter.route('/export').get(exportExamineeExcel)

// for protecting examinee routes
examineeRouter.route("/userdashboard").get(verifyTokenforExaminee, isExaminee, checkExaminee);

// logout
examineeRouter.route('/logout').post(logout)

// forgot Pasword
examineeRouter.route("/forgot-password").post(sendOtp);

examineeRouter.route("/verify-otp").post(verifyOtp);

examineeRouter.route("/reset-password").post(resetPassword);

// Change Password
examineeRouter.put('/change/:id', changePassword);

// 2. DELETE PROFILE IMAGE
examineeRouter.delete("/delete-image/:id", deleteProfileImage);

// ----- Common Routes Grouped -----

// Same path "/:id"
examineeRouter.route('/:id')
    .get(getById)
    .put(upload.single("profileImage"), update)
    .delete(deleted)


module.exports = { examineeRouter }