const jwt = require("jsonwebtoken");
const { isRevoked } = require("../services/tokenBlacklist");
const { logger } = require("./logger");

module.exports = (req, res, next) => {
  // Verificar header Authorization
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    logger.warn({ event: "AUTH_MISSING_TOKEN", ip: req.ip, path: req.path });
    return res.status(401).json({ message: "Hmm lo siento, se requiere autorizacion" });
  }

  // Extraer token
  const token = authorization.replace("Bearer ", "");

  // Zero-Trust: check token revocation blacklist
  if (isRevoked(token)) {
    logger.warn({ event: "AUTH_REVOKED_TOKEN", ip: req.ip, path: req.path });
    return res.status(401).json({ message: "Token revocado" });
  }

  let payload;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no configurado en variables de entorno");
    }
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      logger.warn({ event: "AUTH_INVALID_TOKEN", ip: req.ip, path: req.path });
      return res.status(401).json({ message: "Token invalido" });
    }
    if (err.name === "TokenExpiredError") {
      logger.warn({ event: "AUTH_EXPIRED_TOKEN", ip: req.ip, path: req.path });
      return res.status(401).json({ message: "Token expirado" });
    }
    return res.status(401).json({ message: "Error de autorizacion" });
  }

  // Attach raw token so controllers can revoke it on logout
  req.token = token;
  req.user = payload;

  logger.debug({
    event: "AUTH_SUCCESS", userId: payload._id, ip: req.ip, path: req.path,
  });
  next();
};
