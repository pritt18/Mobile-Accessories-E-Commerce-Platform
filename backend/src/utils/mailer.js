const nodemailer = require('nodemailer');
const prisma = require('../config/db');

let transporter = null;

// Initialize Nodemailer transporter
const initTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    const cleanPass = pass.replace(/\s+/g, '');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: cleanPass,
      },
    });
    console.log(`[MAILER] Configured Gmail SMTP Transport for: ${user.trim()}`);
  } else {
    console.log('[MAILER] No SMTP_USER/SMTP_PASS found in .env. Emails will be logged to console & database.');
  }

  return transporter;
};

/**
 * Generate responsive branded HTML template for emails
 */
const generateEmailHtml = ({ title, bodyContent, otpCode, orderData }) => {
  let orderHtml = '';
  if (orderData && orderData.items) {
    const itemsRows = orderData.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b;">
            <strong>${it.product_name_snapshot}</strong><br>
            <span style="font-size: 11px; color: #64748b;">${it.variant_snapshot || ''} • Qty: ${it.qty}</span>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; text-align: right; color: #0f172a;">
            ₹${(it.price * it.qty).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('');

    orderHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 13px; font-weight: 700; color: #0f172a; padding-bottom: 8px;">Order Summary</td>
            <td style="font-size: 12px; font-weight: 600; color: #0284c7; text-align: right; padding-bottom: 8px;">#${orderData.order_no}</td>
          </tr>
          ${itemsRows}
          <tr>
            <td style="padding-top: 12px; font-size: 12px; color: #64748b;">Subtotal</td>
            <td style="padding-top: 12px; font-size: 12px; text-align: right; color: #0f172a;">₹${orderData.subtotal}</td>
          </tr>
          ${
            orderData.discount > 0
              ? `
          <tr>
            <td style="font-size: 12px; color: #16a34a;">Discount (${orderData.coupon_code || 'Promo'})</td>
            <td style="font-size: 12px; text-align: right; color: #16a34a;">-₹${orderData.discount}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td style="font-size: 12px; color: #64748b;">Delivery Fee</td>
            <td style="font-size: 12px; text-align: right; color: #0f172a;">${orderData.shipping_fee === 0 ? 'FREE' : `₹${orderData.shipping_fee}`}</td>
          </tr>
          <tr>
            <td style="padding-top: 10px; font-size: 15px; font-weight: 800; color: #0f172a;">Grand Total</td>
            <td style="padding-top: 10px; font-size: 16px; font-weight: 800; text-align: right; color: #0072ff;">₹${orderData.total}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; text-align: center;">
          <a href="http://localhost:5173/track/${orderData.order_no}" style="display: inline-block; background-color: #0072ff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 700;">
            Track Your Shipment
          </a>
        </div>
      </div>
    `;
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
              <td style="padding: 24px 32px; background: linear-gradient(135deg, #0072ff 0%, #00c6ff 100%); text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                  Mobi<span style="color: #ffe600;">x</span>ia
                </h1>
                <p style="margin: 4px 0 0 0; color: #e0f2fe; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                  Mobile Accessories Online
                </p>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 32px 32px 24px 32px;">
                <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                  ${title}
                </h2>
                <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                  ${bodyContent}
                </p>

                ${orderHtml}

                ${
                  otpCode
                    ? `
                <div style="background-color: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                  <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                    Your Verification OTP
                  </div>
                  <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0072ff;">
                    ${otpCode}
                  </div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
                    ⏱️ Valid for 10 minutes • Do not share this with anyone
                  </div>
                </div>
                `
                    : ''
                }

                <p style="margin: 20px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                  Thank you for choosing Mobixia! If you have questions, reply to this email or contact support.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                  © ${new Date().getFullYear()} Mobixia. Premium Mobile Cases, Chargers & Tech Gear.<br>
                  Mumbai, India • Need help? Contact support@mobixia.com
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Dispatch transactional notification via Email & record in database
 */
const sendNotification = async ({ userId, type, channel = 'EMAIL', recipient, content, otpCode, orderData }) => {
  try {
    console.log(`[NOTIFICATION] [${channel}] to ${recipient} (${type}):\n${content}\n`);

    const mailTransport = initTransporter();

    let emailSent = false;
    let emailSubject = 'Mobixia Notification';

    if (type.includes('REGISTRATION')) {
      emailSubject = `Your Mobixia Verification OTP: ${otpCode || '123456'}`;
    } else if (type.includes('PASSWORD_RESET')) {
      emailSubject = `Mobixia Password Reset Code: ${otpCode || '123456'}`;
    } else if (type.includes('ORDER')) {
      emailSubject = `Order Confirmed: #${orderData?.order_no || 'Mobixia Order'}`;
    }

    // If real SMTP is configured and recipient is an email address, send actual email
    if (mailTransport && channel === 'EMAIL' && recipient.includes('@')) {
      try {
        const fromAddress = process.env.SMTP_FROM || `"Mobixia Support" <${process.env.SMTP_USER}>`;
        const html = generateEmailHtml({
          title: emailSubject,
          bodyContent: content,
          otpCode: otpCode || null,
          orderData: orderData || null,
        });

        const info = await mailTransport.sendMail({
          from: fromAddress,
          to: recipient,
          subject: emailSubject,
          text: content,
          html,
        });

        console.log(`✅ [EMAIL SENT SUCCESSFULLY] MessageId: ${info.messageId} to ${recipient}`);
        emailSent = true;
      } catch (mailErr) {
        console.error(`⚠️ [SMTP ERROR] Could not deliver email to ${recipient}:`, mailErr.message);
      }
    }

    // Log to MySQL notificationLog table
    const log = await prisma.notificationLog.create({
      data: {
        user_id: userId || null,
        type,
        channel,
        recipient,
        content,
        status: emailSent ? 'DELIVERED' : 'SENT',
      },
    });

    return log;
  } catch (err) {
    console.error('Failed to log/send notification:', err.message);
    return null;
  }
};

module.exports = {
  sendNotification,
};
