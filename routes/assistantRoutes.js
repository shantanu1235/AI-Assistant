const express = require('express');
const router = express.Router();
const { handleVoiceCommand } = require('../controllers/assistantController');

// POST /api/assistant/command - Execute voice/text laptop automation command
router.post('/command', handleVoiceCommand);

module.exports = router;
