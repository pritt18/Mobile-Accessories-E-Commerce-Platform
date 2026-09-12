const prisma = require('../../config/db');
const { encryptSecret, decryptSecret, maskSecret, comparePassword } = require('../../config/security');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditAction } = require('../../middleware/audit');

/**
 * Get Payment Gateway Config (Super Admin Only)
 * Secrets are ALWAYS masked as ????????1234
 */
const getPaymentConfig = async (req, res) => {
  try {
    const creds = await prisma.paymentCredential.findMany({
      where: { provider: 'RAZORPAY' },
    });

    const formatted = creds.map((c) => {
      const decryptedSecret = decryptSecret(c.key_secret_encrypted);
      const decryptedWebhook = decryptSecret(c.webhook_secret_encrypted);
      return {
        id: c.id,
        provider: c.provider,
        mode: c.mode,
        keyId: c.key_id,
        keySecretMasked: maskSecret(decryptedSecret),
        webhookSecretMasked: maskSecret(decryptedWebhook),
        isActive: c.is_active,
        updatedAt: c.updatedAt,
      };
    });

    // Also get active mode from settings
    const activeSetting = await prisma.setting.findUnique({ where: { key: 'payment_razorpay_mode' } });
    const codSetting = await prisma.setting.findUnique({ where: { key: 'payment_cod_enabled' } });

    return successResponse(res, {
      credentials: formatted,
      activeMode: activeSetting?.value || 'TEST',
      codEnabled: codSetting ? codSetting.value === 'true' : true,
    });
  } catch (err) {
    console.error('getPaymentConfig error:', err);
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Step-Up Re-Authentication to Reveal Key Secret
 */
const revealKeySecret = async (req, res) => {
  try {
    const { password, credentialId } = req.body;

    if (!password) {
      return errorResponse(res, 'Super Admin password is required for step-up verification', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect password. Step-up authentication failed.', 401);
    }

    const cred = await prisma.paymentCredential.findUnique({ where: { id: parseInt(credentialId) } });
    if (!cred) return errorResponse(res, 'Credential not found', 404);

    const decryptedKeySecret = decryptSecret(cred.key_secret_encrypted);
    const decryptedWebhookSecret = decryptSecret(cred.webhook_secret_encrypted);

    await logAuditAction({
      userId: req.user.id,
      module: 'payment_credentials',
      action: 'reveal_secret',
      description: `Revealed Razorpay API Secret for mode ${cred.mode}`,
      req,
    });

    return successResponse(res, {
      keySecret: decryptedKeySecret,
      webhookSecret: decryptedWebhookSecret,
    }, 'Step-up authentication verified');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Update Payment Credentials with Step-up Password Re-entry
 */
const updatePaymentCredentials = async (req, res) => {
  try {
    const {
      currentPassword,
      mode = 'TEST',
      keyId,
      keySecret,
      webhookSecret,
      isActive = true,
      activeMode,
      codEnabled,
    } = req.body;

    // Step-up verification
    if (!currentPassword) {
      return errorResponse(res, 'Current Super Admin password is required to update payment gateway keys', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect password. Authorization denied.', 401);
    }

    if (keyId && keySecret) {
      const encryptedKeySecret = encryptSecret(keySecret);
      const encryptedWebhookSecret = webhookSecret ? encryptSecret(webhookSecret) : null;

      await prisma.paymentCredential.upsert({
        where: {
          provider_mode: {
            provider: 'RAZORPAY',
            mode,
          },
        },
        update: {
          key_id: keyId,
          key_secret_encrypted: encryptedKeySecret,
          webhook_secret_encrypted: encryptedWebhookSecret,
          is_active: isActive,
          updated_by: req.user.name,
        },
        create: {
          provider: 'RAZORPAY',
          mode,
          key_id: keyId,
          key_secret_encrypted: encryptedKeySecret,
          webhook_secret_encrypted: encryptedWebhookSecret,
          is_active: isActive,
          updated_by: req.user.name,
        },
      });

      await logAuditAction({
        userId: req.user.id,
        module: 'payment_credentials',
        action: 'update_credentials',
        description: `Updated Razorpay credentials for mode "${mode}". Key ending with: ...${keyId.slice(-4)}`,
        req,
      });
    }

    if (activeMode) {
      await prisma.setting.upsert({
        where: { key: 'payment_razorpay_mode' },
        update: { value: activeMode },
        create: { key: 'payment_razorpay_mode', value: activeMode, group: 'PAYMENT' },
      });
    }

    if (codEnabled !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'payment_cod_enabled' },
        update: { value: String(codEnabled) },
        create: { key: 'payment_cod_enabled', value: String(codEnabled), group: 'PAYMENT' },
      });
    }

    return successResponse(res, null, 'Payment credentials and gateway configuration updated securely');
  } catch (err) {
    console.error('updatePaymentCredentials error:', err);
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getPaymentConfig,
  revealKeySecret,
  updatePaymentCredentials,
};
