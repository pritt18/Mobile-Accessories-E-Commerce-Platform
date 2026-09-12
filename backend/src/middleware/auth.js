const { verifyToken } = require('../config/security');
const prisma = require('../config/db');
const { errorResponse } = require('../utils/response');

/**
 * Required authentication middleware
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 'User account not found', 401);
    }

    if (user.status === 'BLOCKED') {
      return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired authentication token', 401);
  }
};

/**
 * Optional authentication middleware for guest / logged-in hybrid endpoints
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          role: true,
        },
      });
      if (user && user.status === 'ACTIVE') {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
};
