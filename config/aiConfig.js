const { GoogleGenAI } = require('@google/genai');

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ Warning: GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

module.exports = { getAIClient };
