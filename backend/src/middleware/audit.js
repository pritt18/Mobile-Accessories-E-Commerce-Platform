const prisma = require('../config/db');

/**
 * In-memory / console audit logger (No DB storage required)
 */
const logAuditAction = async ({ userId, module, action, description, req }) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
    console.log(`[AUDIT] [${module.toUpperCase()}] Action: ${action} | User: ${userId || 'SYSTEM'} | IP: ${ip} | Desc: ${description}`);
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = {
  logAuditAction,
};
