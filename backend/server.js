const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Route files
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/appointments', appointments);

// В production отдаем статику фронтенда
if (isProduction) {
  console.log('Production mode: serving frontend static files');

  const frontendPath = path.join(__dirname, 'public');
  const fs = require('fs');

  if (fs.existsSync(frontendPath)) {
    console.log('Frontend build found at:', frontendPath);

    app.use(express.static(frontendPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.warn('WARNING: Frontend build not found at', frontendPath);
    app.get('/', (req, res) => {
      res.json({
        message: 'API Server for Appointment System',
        mode: 'production',
        endpoints: ['/api/auth/*', '/api/appointments/*']
      });
    });
  }
} else {
  // Development mode
  app.get('/', (req, res) => {
    res.json({
      message: 'Appointment System API',
      mode: 'development',
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          getMe: 'GET /api/auth/me'
        },
        appointments: {
          create: 'POST /api/appointments',
          getMy: 'GET /api/appointments/my',
          getAvailableTimes: 'GET /api/appointments/available-times'
        }
      }
    });
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
});