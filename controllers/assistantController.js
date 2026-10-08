const { processAssistantCommand } = require('../services/aiService');
const { handleSystemAction } = require('../services/systemService');

/**
 * @desc    Handle voice/text assistant commands for PC automation
 * @route   POST /api/assistant/command
 */
const handleVoiceCommand = async (req, res, next) => {
  try {
    const { command } = req.body;

    if (!command || command.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Command is required'
      });
    }

    // 1. Process command with Gemini AI (Identify intent & extract action/target)
    const aiResult = await processAssistantCommand(command);

    let systemResult = null;

    // 2. If it's a PC action, execute it on Windows
    if (aiResult.type === 'ACTION' && aiResult.action && aiResult.target) {
      systemResult = await handleSystemAction(aiResult.action, aiResult.target);
    }

    // 3. Return response with voice reply
    res.status(200).json({
      success: true,
      command,
      type: aiResult.type || 'CHAT',
      action: aiResult.action || null,
      target: aiResult.target || null,
      reply: aiResult.reply,
      systemResult
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleVoiceCommand
};
