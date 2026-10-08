const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getAllSessions,
  clearChatSession
} = require('../controllers/chatController');

// All chat sessions list
router.get('/sessions', getAllSessions);

// Send message to AI
router.post('/', sendMessage);

// Get chat history by sessionId
router.get('/:sessionId', getChatHistory);

// Delete chat session by sessionId
router.delete('/:sessionId', clearChatSession);

module.exports = router;
