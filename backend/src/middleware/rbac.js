const { errorResponse } = require('../utils/response');

/**
 * Checks if authenticated user has permission for a specific module and action
 */
const authorize = (module, action) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    const roleName = req.user.role.name;

    // Super Admin has master access to all modules and actions
    if (roleName === 'SUPER_ADMIN') {
      return next();
    }

    // Check data-driven permissions
    const permissions = req.user.role.permissions || [];
    const hasPermission = permissions.some((rp) => {
      const p = rp.permission;
      return p && p.module === module && (p.action === action || p.action === 'all');
    });

    if (!hasPermission) {
      return errorResponse(
        res,
        `Access denied. You do not have permission to ${action} ${module}.`,
        403
      );
    }

    next();
  };
};

/**
 * Simple role name check
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      return errorResponse(res, 'Insufficient role privileges for this action', 403);
    }

    next();
  };
};

module.exports = {
  authorize,
  requireRole,
};
