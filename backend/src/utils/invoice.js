/**
 * GST-Compliant Invoice Calculation and Data Formatter
 */
const generateInvoiceData = (order, settings = {}) => {
  const companyName = settings['site_name'] || 'Mobixia Accessories India Pvt Ltd';
  const companyGstin = settings['company_gstin'] || '27AABCU9603R1ZM';
  const companyAddress = settings['company_address'] || 'Tech Hub, Bandra West, Mumbai, Maharashtra 400050';
  const companyEmail = settings['support_email'] || 'support@mobixia.in';
  const companyPhone = settings['support_phone'] || '+91 98765 43210';

  // Calculate GST: Mobile accessories typically carry 18% GST (9% CGST + 9% SGST intra-state, or 18% IGST)
  const gstRate = 18; // percent
  const taxableAmount = +(order.subtotal - order.discount).toFixed(2);
  const cgst = +(taxableAmount * 0.09).toFixed(2);
  const sgst = +(taxableAmount * 0.09).toFixed(2);
  const totalTax = +(cgst + sgst).toFixed(2);

  return {
    invoiceNumber: `INV-${order.order_no}`,
    invoiceDate: new Date(order.placed_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    orderNumber: order.order_no,
    company: {
      name: companyName,
      gstin: companyGstin,
      address: companyAddress,
      email: companyEmail,
      phone: companyPhone,
    },
    customer: {
      name: order.user?.name || order.guest_name || 'Valued Customer',
      email: order.user?.email || order.guest_email || 'N/A',
      phone: order.user?.mobile || order.guest_phone || order.address?.phone || 'N/A',
      shippingAddress: order.shipping_info ? JSON.parse(order.shipping_info) : (order.address || {}),
    },
    items: order.items.map((item, idx) => ({
      srNo: idx + 1,
      name: item.product_name_snapshot,
      variant: item.variant_snapshot,
      hsnCode: '85044090', // Electrical / Mobile accessories standard HSN
      qty: item.qty,
      unitPrice: item.price,
      total: +(item.price * item.qty).toFixed(2),
    })),
    summary: {
      subtotal: order.subtotal,
      discount: order.discount,
      taxableAmount,
      cgst,
      sgst,
      totalTax,
      shippingFee: order.shipping_fee,
      grandTotal: order.total,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
    },
  };
};

/**
 * Generate official, printable GST Tax Invoice HTML page
 */
const generateInvoiceHtml = (data) => {
  const { invoiceNumber, invoiceDate, orderNumber, company, customer, items, summary } = data;
  const ship = customer.shippingAddress || {};
  const shipAddrStr = [
    ship.line1,
    ship.line2,
    ship.city,
    ship.state,
    ship.pincode ? `- ${ship.pincode}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const itemsRows = items
    .map(
      (it) => `
    <tr>
      <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center; font-size: 12px;">${it.srNo}</td>
      <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 12px;">
        <strong style="color: #0f172a;">${it.name}</strong><br>
        <span style="color: #64748b; font-size: 11px;">${it.variant || 'Standard'}</span>
      </td>
      <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center; font-size: 12px; font-family: monospace;">${it.hsnCode}</td>
      <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center; font-size: 12px; font-weight: 700;">${it.qty}</td>
      <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; font-size: 12px;">₹${it.unitPrice.toFixed(2)}</td>
      <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; font-size: 12px; font-weight: 700; color: #0f172a;">₹${it.total.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f1f5f9; color: #0f172a; padding: 24px; }
    .invoice-card { max-width: 850px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .action-bar { max-width: 850px; margin: 0 auto 16px auto; display: flex; justify-content: space-between; align-items: center; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 10px; cursor: pointer; text-decoration: none; border: none; transition: all 0.2s; }
    .btn-primary { background: #0072ff; color: #ffffff; box-shadow: 0 4px 12px rgba(0,114,255,0.25); }
    .btn-primary:hover { background: #005ce6; }
    .btn-secondary { background: #ffffff; color: #334155; border: 1px solid #cbd5e1; }
    .btn-secondary:hover { background: #f8fafc; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 10px; max-width: 100%; }
      .action-bar { display: none !important; }
      @page { size: A4; margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="font-size: 13px; color: #64748b; font-weight: 600;">
      Official Tax Invoice: <span style="color: #0f172a; font-weight: 800;">${invoiceNumber}</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.history.back()" class="btn btn-secondary">
        ← Back
      </button>
      <button onclick="window.print()" class="btn btn-primary">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <div class="invoice-card">
    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 2px solid #0072ff; padding-bottom: 20px;">
      <tr>
        <td>
          <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px;">
            Mobi<span style="color: #0072ff;">x</span>ia
          </h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700;">
            Mobile Accessories Online
          </p>
        </td>
        <td align="right">
          <div style="font-size: 18px; font-weight: 900; color: #0072ff; text-transform: uppercase; letter-spacing: 1px;">
            TAX INVOICE
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px; font-weight: 600;">
            (Original for Recipient)
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #0f172a;">
            <strong>Invoice No:</strong> ${invoiceNumber}<br>
            <strong>Invoice Date:</strong> ${invoiceDate}
          </div>
        </td>
      </tr>
    </table>

    <!-- Seller & Buyer info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <tr style="background-color: #f8fafc;">
        <td width="50%" style="padding: 12px 16px; border-right: 1px solid #e2e8f0; font-size: 12px; font-weight: 800; color: #0f172a;">
          SOLD BY (SELLER):
        </td>
        <td width="50%" style="padding: 12px 16px; font-size: 12px; font-weight: 800; color: #0f172a;">
          BILLING & SHIPPING TO (BUYER):
        </td>
      </tr>
      <tr>
        <td style="padding: 16px; border-right: 1px solid #e2e8f0; font-size: 12px; line-height: 1.6; color: #334155; vertical-align: top;">
          <strong style="color: #0f172a; font-size: 13px;">${company.name}</strong><br>
          ${company.address}<br>
          <strong>GSTIN:</strong> ${company.gstin}<br>
          <strong>Email:</strong> ${company.email} | <strong>Phone:</strong> ${company.phone}
        </td>
        <td style="padding: 16px; font-size: 12px; line-height: 1.6; color: #334155; vertical-align: top;">
          <strong style="color: #0f172a; font-size: 13px;">${customer.name}</strong><br>
          ${shipAddrStr || 'Same as Billing'}<br>
          <strong>Phone:</strong> ${customer.phone}<br>
          <strong>Email:</strong> ${customer.email}<br>
          <strong>Order ID:</strong> #${orderNumber}
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f1f5f9; color: #0f172a;">
          <th style="padding: 10px 12px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 800; width: 40px; text-align: center;">#</th>
          <th style="padding: 10px 12px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 800; text-align: left;">Product Description</th>
          <th style="padding: 10px 12px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 800; width: 90px; text-align: center;">HSN Code</th>
          <th style="padding: 10px 12px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 800; width: 50px; text-align: center;">Qty</th>
          <th style="padding: 10px 12px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 800; width: 100px; text-align: right;">Unit Price</th>
          <th style="padding: 10px 12px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 800; width: 105px; text-align: right;">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Calculation breakdown & signature -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
      <tr>
        <!-- Left: Terms & Payment Details -->
        <td width="55%" style="vertical-align: top; padding-right: 20px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 12px; line-height: 1.6; color: #475569;">
            <strong style="color: #0f172a;">Payment Details:</strong><br>
            Mode: <strong>${summary.paymentMethod}</strong> (${summary.paymentStatus})<br>
            Tax Applicable: <strong>18% GST</strong> (CGST 9% + SGST 9%)<br>
            <div style="margin-top: 10px; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
              Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
          </div>
        </td>

        <!-- Right: Totals summary -->
        <td width="45%" style="vertical-align: top;">
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; color: #334155;">
            <tr>
              <td style="padding: 6px 0;">Item Subtotal</td>
              <td align="right" style="font-weight: 600; color: #0f172a;">₹${summary.subtotal.toFixed(2)}</td>
            </tr>
            ${summary.discount > 0 ? `
            <tr>
              <td style="padding: 6px 0; color: #16a34a;">Discount</td>
              <td align="right" style="font-weight: 700; color: #16a34a;">-₹${summary.discount.toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0;">Taxable Value</td>
              <td align="right" style="font-weight: 600; color: #0f172a;">₹${summary.taxableAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">CGST (9%)</td>
              <td align="right" style="color: #64748b;">₹${summary.cgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">SGST (9%)</td>
              <td align="right" style="color: #64748b;">₹${summary.sgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Delivery / Shipping Fee</td>
              <td align="right" style="font-weight: 600; color: #0f172a;">
                ${summary.shippingFee === 0 ? '<strong style="color: #16a34a;">FREE</strong>' : `₹${summary.shippingFee.toFixed(2)}`}
              </td>
            </tr>
            <tr style="border-top: 2px solid #0f172a;">
              <td style="padding: 12px 0; font-size: 15px; font-weight: 900; color: #0f172a;">Grand Total</td>
              <td align="right" style="padding: 12px 0; font-size: 18px; font-weight: 900; color: #0072ff;">₹${summary.grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Signatory footer -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
      <tr>
        <td style="font-size: 11px; color: #94a3b8;">
          This is a computer-generated tax invoice and does not require physical stamp signature.
        </td>
        <td align="right" style="font-size: 12px; color: #0f172a;">
          <strong>For ${company.name}:</strong><br><br>
          <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 22px; color: #0072ff;">
            Mobixia Authorized Signatory
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
};

module.exports = {
  generateInvoiceData,
  generateInvoiceHtml,
};

