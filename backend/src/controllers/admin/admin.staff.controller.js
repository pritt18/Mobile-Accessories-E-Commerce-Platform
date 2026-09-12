const prisma = require('../../config/db');
const { hashPassword } = require('../../config/security');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

const getStaffMembers = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          name: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
        },
      },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = staff.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      mobile: s.mobile,
      role: s.role.name,
      roleId: s.role_id,
      status: s.status,
      createdAt: s.createdAt,
    }));

    const roles = await prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
    });

    const allPermissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    return successResponse(res, {
      staff: formatted,
      roles,
      allPermissions,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createStaffMember = async (req, res) => {
  try {
    const { name, email, mobile, password, roleId } = req.body;
    if (!name || !email || !password || !roleId) {
      return errorResponse(res, 'Name, email, password, and role are required', 400);
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return errorResponse(res, 'User with this email already exists', 400);

    const password_hash = await hashPassword(password);
    const newStaff = await prisma.user.create({
      data: {
        name,
        email,
        mobile: mobile || null,
        password_hash,
        role_id: parseInt(roleId),
      },
      include: { role: true },
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'staff',
      action: 'create_staff',
      description: `Created staff member "${name}" (${email}) with role ${newStaff.role.name}`,
      req,
    });

    return successResponse(res, newStaff, 'Staff account created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const { roleId, permissionIds } = req.body; // Array of permission IDs
    const rId = parseInt(roleId);

    const role = await prisma.role.findUnique({ where: { id: rId } });
    if (!role) return errorResponse(res, 'Role not found', 404);

    if (role.name === 'SUPER_ADMIN') {
      return errorResponse(res, 'Super Admin role always has all permissions and cannot be modified', 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { role_id: rId } });
      if (permissionIds && permissionIds.length > 0) {
        for (const pId of permissionIds) {
          await tx.rolePermission.create({
            data: {
              role_id: rId,
              permission_id: parseInt(pId),
            },
          });
        }
      }
    });

    await logAuditAction({
      userId: req.user.id,
      module: 'staff',
      action: 'update_permissions',
      description: `Updated permissions matrix for role "${role.name}"`,
      req,
    });

    return successResponse(res, null, `Permissions updated for ${role.name}`);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getStaffMembers,
  createStaffMember,
  updateRolePermissions,
};
