const { getAIClient } = require('../config/aiConfig');
const { SYSTEM_PROMPT } = require('../utils/prompts');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to automatically retry API calls when Google returns 503 high demand
 */
const callWithRetry = async (fn, maxRetries = 3, initialDelay = 1200) => {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const is503 =
        error?.message?.includes('503') ||
        error?.message?.includes('high demand') ||
        error?.status === 503;

      if (is503 && attempt < maxRetries) {
        console.warn(
          `⚠️ Gemini 503 High Demand detected. Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxRetries})...`
        );
        await wait(delay);
        delay *= 1.5;
      } else {
        throw error;
      }
    }
  }
  throw lastError;
};

/**
 * Generate AI response with optional conversation history
 * @param {string} prompt - Current user message
 * @param {Array} history - Previous messages [{ role: 'user' | 'model', content: string }]
 * @returns {Promise<string>}
 */
const generateAIResponse = async (prompt, history = []) => {
  const ai = getAIClient();

  // Convert previous history to Gemini contents format
  const contents = history.map((msg) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Append latest user message
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const response = await callWithRetry(async () => {
    return await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT
      }
    });
  });

  return response.text;
};

/**
 * Process voice or text command for PC automation + assistant response
 * @param {string} command - Voice/text command from user
 * @returns {Promise<{ type: 'ACTION'|'CHAT', action: string|null, target: string|null, reply: string }>}
 */
const processAssistantCommand = async (command) => {
  const ai = getAIClient();

  const assistantPrompt = `You are a smart Windows PC voice assistant (Jarvis).
Analyze the user command and determine if they want to perform a PC action or just chat.
Respond ONLY with a valid raw JSON object matching this structure:
{
  "type": "ACTION" or "CHAT",
  "action": "OPEN_APP" | "CLOSE_APP" | "OPEN_FOLDER" | "OPEN_WEBSITE" | null,
  "target": "target app/folder/website name" | null,
  "reply": "concise voice response to speak to the user in the language they used (Hindi/English/Hinglish)"
}

Guidelines:
- "OPEN_APP": Open software like chrome, notepad, calculator, vscode, spotify, camera, cmd, paint, settings, etc.
- "CLOSE_APP": Close running app like chrome, notepad, calculator, vscode, spotify, etc.
- "OPEN_FOLDER": Open folders like downloads, documents, desktop, pictures, etc.
- "OPEN_WEBSITE": Open website like youtube, google, github, etc. Provide full URL in target (e.g., https://youtube.com).
- "CHAT": Any general greeting, query, or question. Action and target must be null.
- Reply should be concise and conversational, suitable for text-to-speech.`;

  try {
    const response = await callWithRetry(async () => {
      return await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [{ text: `User command: "${command}"` }]
          }
        ],
        config: {
          systemInstruction: assistantPrompt,
          responseMimeType: 'application/json'
        }
      });
    });

    let rawText = (response.text || '').trim();
    // Strip code fences if present
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    return JSON.parse(rawText);
  } catch (error) {
    if (error?.message?.includes('503') || error?.message?.includes('high demand')) {
      return {
        type: 'CHAT',
        action: null,
        target: null,
        reply: 'AI server thoda busy chal raha hai sir. Kripya 2 second baad dobara bolein!'
      };
    }

    return {
      type: 'CHAT',
      action: null,
      target: null,
      reply: 'Command processed.'
    };
  }
};

module.exports = {
  generateAIResponse,
  processAssistantCommand
};
