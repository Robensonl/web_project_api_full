const winston = require('winston');
const expressWinston = require('express-winston');

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 📝 Logger de solicitudes
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'request.log' })
  ],
  format: logFormat,
  meta: true,
  msg: 'HTTP req.method req.url',
  expressFormat: true,
  colorize: false,
  ignoreRoute: (req, res) => req.url === '/health' // Ignorar health checks
});

// ❌ Logger de errores
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' })
  ],
  format: logFormat
});

// 📊 Logger para consola (solo desarrollo)
const consoleLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

module.exports = {
  requestLogger,
  errorLogger,
  logger: consoleLogger
};