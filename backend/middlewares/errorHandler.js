const { logger } = require('./logger');

const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  // Log del error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Respuesta al cliente
  res.status(statusCode).json({
    message: statusCode === 500
      ? 'An error has occurred on the server'
      : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;