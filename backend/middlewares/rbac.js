/**
 * Role-Based Access Control middleware (Zero-Trust pillar: IAM / RBAC)
 *
 * Usage:
 *   router.get('/admin-only', auth, rbac('admin'), handler)
 *   router.get('/any-role',   auth, rbac('user', 'admin'), handler)
 */

const { logger } = require("./logger");

/**
 * Return an Express middleware that allows only requests whose
 * authenticated user carries one of the specified roles.
 *
 * @param {...string} allowedRoles - one or more roles permitted to access the route
 */
function rbac(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      logger.warn({
        event: "RBAC_ACCESS_DENIED",
        userId: req.user && req.user._id,
        userRole,
        requiredRoles: allowedRoles,
        ip: req.ip,
        path: req.path,
      });
      return res.status(403).json({
        message: "Acceso denegado: no tienes permiso para realizar esta acción",
      });
    }

    logger.debug({
      event: "RBAC_ACCESS_GRANTED",
      userId: req.user._id,
      userRole,
      ip: req.ip,
      path: req.path,
    });

    next();
  };
}

module.exports = rbac;
