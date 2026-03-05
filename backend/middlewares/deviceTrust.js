/**
 * Device Trust middleware (Zero-Trust pillar: Device Posture)
 *
 * In a production Zero-Trust environment each request should carry a
 * verifiable device attestation.  This middleware performs a lightweight
 * check: it validates the presence of the X-Device-ID header and logs
 * unknown or missing device identifiers as a security event so that the
 * Security / SIEM layer can correlate anomalies.
 *
 * The middleware is intentionally non-blocking: an absent device ID
 * downgrades the request's trust level but does not reject it outright.
 * This allows a phased roll-out — set DEVICE_TRUST_STRICT=true in the
 * environment to enforce the header for all authenticated requests.
 */

const { logger } = require("./logger");

const STRICT_MODE = process.env.DEVICE_TRUST_STRICT === "true";

/**
 * Express middleware that enforces (or warns about) device identity.
 */
function deviceTrust(req, res, next) {
  const deviceId = req.headers["x-device-id"];

  if (!deviceId) {
    logger.warn({
      event: "DEVICE_TRUST_MISSING_ID",
      ip: req.ip,
      path: req.path,
      userId: req.user && req.user._id,
    });

    if (STRICT_MODE) {
      return res.status(403).json({
        message: "Device identity required (X-Device-ID header missing)",
      });
    }
  } else {
    // Basic format validation: allow alphanumeric + hyphens, 8-64 chars
    const deviceIdPattern = /^[A-Za-z0-9-]{8,64}$/;
    if (!deviceIdPattern.test(deviceId)) {
      logger.warn({
        event: "DEVICE_TRUST_INVALID_ID",
        deviceId,
        ip: req.ip,
        path: req.path,
        userId: req.user && req.user._id,
      });

      if (STRICT_MODE) {
        return res.status(403).json({
          message: "Device identity invalid (X-Device-ID format incorrect)",
        });
      }
    } else {
      // Attach to request so downstream handlers can use it
      req.deviceId = deviceId;
      logger.debug({
        event: "DEVICE_TRUST_OK",
        deviceId,
        ip: req.ip,
        path: req.path,
        userId: req.user && req.user._id,
      });
    }
  }

  next();
}

module.exports = deviceTrust;
