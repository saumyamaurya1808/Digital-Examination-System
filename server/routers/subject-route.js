const express = require('express');
const {
    createSubject,
    getAllSubjects,
    deleteSubject,
    updateSubject,
    getQuestionsBySubject
} = require('../controllers/subject-controller');

const subjectRouter = express.Router();


// Same base path "/"
subjectRouter.route('/')
    .post(createSubject)
    .get(getAllSubjects);
    
subjectRouter.route('/specificsubject/:id').get(getQuestionsBySubject);

// Dynamic ID route
subjectRouter.route('/:id')
    .put(updateSubject)
    .delete(deleteSubject);


module.exports = { subjectRouter };