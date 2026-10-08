const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'AI Assistant Backend API is running smoothly 🚀'
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/assistant', assistantRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
