const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { isCelebrateError } = require('celebrate');
require('dotenv').config();

const auth = require('./middlewares/auth');
const deviceTrust = require('./middlewares/deviceTrust');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { createUser, login } = require('./controllers/users');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const { PORT = 3000, MONGODB_URI } = process.env;

app.use(helmet());

// Configurar CORS según el ambiente
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://www.educben.mooo.com',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// Loggers de request
app.use(requestLogger);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Demasiados intentos de autenticación. Intenta más tarde.',
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Demasiados intentos de autenticación. Intenta más tarde.'
    });
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Demasiadas solicitudes. Intenta más tarde.'
    });
  }
});

// Rutas de prueba solo en desarrollo
if (NODE_ENV === 'development') {
  app.get('/crash-test', () => {
    setTimeout(() => {
      throw new Error('Servidor caído intencionalmente para pruebas');
    }, 0);
  });
}

app.post('/signup', authLimiter, createUser);
app.post('/signin', authLimiter, login);

app.use(auth);
app.use(apiLimiter);
app.use(deviceTrust);
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'API Around the U.S.',
    version: '1.0.0',
    endpoints: {
      public: ['POST /signup', 'POST /signin', 'GET /crash-test'],
      protected: ['GET /users', 'GET /users/me', 'GET /cards', 'POST /cards']
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `No se encontró la ruta: ${req.method} ${req.url}`
  });
});

// Logger de errores
app.use(errorLogger);

app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    console.error('Celebrate Validation Error:', err.message);
    const details = err.details.get(err.details.keys().next().value);
    const message = details?.message || 'Validation failed';

    return res.status(400).json({
      error: true,
      message
    });
  }
  next(err);
});

// ⚠️ Manejador general de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'An error has occurred on the server'
    : err.message;

  res.status(statusCode).json({
    error: true,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

if (NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/aroundb')
    .then(() => {
      console.log('✅ MongoDB conectado');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor en http://0.0.0.0:${PORT}`);
        console.log(`📁 Entorno: ${NODE_ENV || 'development'}`);
      });
    })
    .catch(err => {
      console.error('❌ Error MongoDB:', err.message);
      process.exit(1);
    });
}
module.exports = app;