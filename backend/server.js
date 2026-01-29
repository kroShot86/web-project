const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// В production отдаем статику фронтенда
if (isProduction) {
  console.log('Production mode: serving frontend static files');

  // Путь к собранному фронтенду
  const frontendPath = path.join(__dirname, 'public');

  // Проверяем, существует ли папка с фронтендом
  const fs = require('fs');
  if (fs.existsSync(frontendPath)) {
    console.log('Frontend build found at:', frontendPath);

    // Отдаем статические файлы фронтенда
    app.use(express.static(frontendPath));

    // Для SPA - все GET запросы (кроме API) перенаправляем на index.html
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next(); // Пропускаем API маршруты
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.warn('WARNING: Frontend build not found at', frontendPath);
    app.get('/', (req, res) => {
      res.json({
        message: 'Backend running in production mode',
        warning: 'Frontend build not found',
        api: 'Use /api/* endpoints'
      });
    });
  }
}

// API Routes (работают в обоих режимах)
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from Express API!',
    timestamp: new Date().toISOString(),
    mode: isProduction ? 'production' : 'development',
    path: '/backend/public'
  });
});

app.get('/api/data', (req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Item 1', value: 'Value 1' },
      { id: 2, name: 'Item 2', value: 'Value 2' },
      { id: 3, name: 'Item 3', value: 'Value 3' }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: isProduction ? 'production' : 'development'
  });
});

// Development mode root route
if (!isProduction) {
  app.get('/', (req, res) => {
    res.json({
      message: 'Backend API is running in development mode',
      instructions: 'Frontend runs separately on port 3000',
      api: 'Use /api/* endpoints'
    });
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
});