    const express = require('express');
    const {
        createQuestion,
        getAllQuestions,
        deleteQuestion,
        updateQuestion
    } = require('../controllers/questionbank-controller');

    const questionBankRouter = express.Router();


    // Same path "/"
    questionBankRouter.route('/')
        .post(createQuestion)
        .get(getAllQuestions);


    // Dynamic ID route
    questionBankRouter.route('/:id')
        .put(updateQuestion)
        .delete(deleteQuestion);


    module.exports = { questionBankRouter };