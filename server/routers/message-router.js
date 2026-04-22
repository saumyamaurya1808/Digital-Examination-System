const express = require('express');
const {
  createMessage,
  getAllMessages,
  getUserMessages,
  editMessage,
  replyMessage,
  softDeleteMessage
} = require('../controllers/message-controller');
const { verifyTokenforExaminee } = require('../middlewares/auth-middleware');

const messageRouter = express.Router();


// ----- Static Routes First -----

messageRouter.post('/',verifyTokenforExaminee, createMessage);

messageRouter.get('/all', getAllMessages);

messageRouter.get('/user/:id', getUserMessages);

messageRouter.post('/reply/:id', replyMessage);

messageRouter.put('/edit/:id', editMessage);

messageRouter.put('/delete/:id', softDeleteMessage);


module.exports = { messageRouter };