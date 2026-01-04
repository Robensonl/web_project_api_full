const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Verificar header Authorization
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Hmmm! lo siento se requiere autorización' });
  }

  // Extraer token
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no configurado en variables de entorno');
    }
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Error de autorización' });
  }

  // Añadir payload a la request
  req.user = payload;
  next();
};