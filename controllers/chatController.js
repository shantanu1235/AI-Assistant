const Chat = require('../models/Chat');
const { generateAIResponse } = require('../services/aiService');

/**
 * @desc    Send a message to AI assistant
 * @route   POST /api/chat
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId = 'default-session' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Find or create conversation session
    let chat = await Chat.findOne({ sessionId });
    if (!chat) {
      chat = new Chat({
        sessionId,
        title: message.substring(0, 30) + '...',
        messages: []
      });
    }

    // Generate AI response with history context
    const aiReply = await generateAIResponse(message, chat.messages);

    // Save user message and AI response
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'model', content: aiReply });
    await chat.save();

    res.status(200).json({
      success: true,
      sessionId: chat.sessionId,
      reply: aiReply,
      messages: chat.messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat history for a session
 * @route   GET /api/chat/:sessionId
 */
const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const chat = await Chat.findOne({ sessionId });

    if (!chat) {
      return res.status(200).json({ success: true, sessionId, messages: [] });
    }

    res.status(200).json({
      success: true,
      sessionId: chat.sessionId,
      title: chat.title,
      messages: chat.messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all chat sessions
 * @route   GET /api/chat/sessions
 */
const getAllSessions = async (req, res, next) => {
  try {
    const sessions = await Chat.find({}, 'sessionId title updatedAt createdAt').sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear / delete a chat session
 * @route   DELETE /api/chat/:sessionId
 */
const clearChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await Chat.findOneAndDelete({ sessionId });

    res.status(200).json({
      success: true,
      message: `Session ${sessionId} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getAllSessions,
  clearChatSession
};
