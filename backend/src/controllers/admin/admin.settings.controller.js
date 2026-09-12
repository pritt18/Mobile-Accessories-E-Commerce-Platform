const prisma = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return successResponse(res, map);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Key-value object
    if (!settings || typeof settings !== 'object') {
      return errorResponse(res, 'Invalid settings payload', 400);
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    await logAuditAction({
      userId: req.user.id,
      module: 'settings',
      action: 'update_settings',
      description: `Updated site configuration settings (${Object.keys(settings).join(', ')})`,
      req,
    });

    return successResponse(res, settings, 'Settings updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
