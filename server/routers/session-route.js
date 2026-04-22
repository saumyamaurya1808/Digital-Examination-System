const express = require('express');
const {
    createSession,
    getAllSessions,
    deleteSession,
    updateSession,
    getcustomSession,
    getAllFilteredSessions
} = require('../controllers/session-controller');

const sessionRouter = express.Router();


// Same base path "/"
sessionRouter.route('/')
    .post(createSession)
    .get(getAllSessions);

// get all session by filtered
sessionRouter.route("/filteredsession").get(getAllFilteredSessions)

// Dynamic ID route
sessionRouter.route('/:id')
    .put(updateSession)
    .delete(deleteSession)
    .get(getcustomSession); // Get session by ID

module.exports = { sessionRouter };