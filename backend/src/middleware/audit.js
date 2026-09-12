const prisma = require('../config/db');

/**
 * Logs an administrative action to audit_logs
 */
const logAuditAction = async ({ userId, module, action, description, req }) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : null;
    await prisma.auditLog.create({
      data: {
        user_id: userId || null,
        module,
        action,
        description,
        ip_address: typeof ip === 'string' ? ip : '127.0.0.1',
      },
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = {
  logAuditAction,
};
