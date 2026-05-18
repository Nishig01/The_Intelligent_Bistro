import nodemailer from "nodemailer";

// Reusable transporter — uses Ethereal (dev preview) or real SMTP via env vars
async function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Dev fallback: Ethereal free test account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function emailLayout(body: string) {
  return `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;color:#1A1A1A;border:1px solid #eee;border-radius:12px;overflow:hidden;">
      <div style="background:#1A1A1A;padding:28px 30px;text-align:center;">
        <h1 style="margin:0;font-size:26px;font-weight:normal;color:#FFF;letter-spacing:1px;">The Intelligent Bistro ✨</h1>
        <p style="color:#C1A87D;margin:6px 0 0;font-family:sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Premium Dining Experience</p>
      </div>
      <div style="padding:30px;">${body}</div>
      <div style="background:#F8F5F0;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="font-family:sans-serif;font-size:12px;color:#9CA3AF;margin:0;">© The Intelligent Bistro · Questions? Reply to this email.</p>
      </div>
    </div>`;
}

export async function sendOrderConfirmation(orderData: any) {
  const { orderId, items, total, customerName, email, orderType, eta } = orderData;
  const transporter = await getTransporter();

  const itemRows = items.map((item: any) => `
    <tr>
      <td style="padding:8px 0;font-family:sans-serif;font-size:14px;border-bottom:1px solid #f0f0f0;">${item.quantity}x ${item.name}</td>
      <td style="padding:8px 0;font-family:sans-serif;font-size:14px;border-bottom:1px solid #f0f0f0;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const body = `
    <p style="font-family:sans-serif;font-size:16px;">Dear ${customerName || 'Valued Guest'},</p>
    <p style="font-family:sans-serif;font-size:15px;line-height:1.7;color:#444;">
      Your order <strong style="color:#1A1A1A;">#${orderId}</strong> has been confirmed and our chefs are already working on it!
    </p>
    <div style="background:#fafafa;border-radius:10px;padding:20px;margin:20px 0;">
      <h3 style="margin:0 0 15px;font-size:16px;">Order Summary</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${itemRows}
        <tr>
          <td style="padding:12px 0 0;font-family:sans-serif;font-weight:bold;font-size:15px;">Total</td>
          <td style="padding:12px 0 0;font-family:sans-serif;font-weight:bold;font-size:15px;text-align:right;">$${total.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    <div style="background:#C1A87D20;border-left:3px solid #C1A87D;border-radius:6px;padding:14px 16px;margin:20px 0;">
      <p style="font-family:sans-serif;font-size:14px;margin:0;color:#1A1A1A;">
        🕐 Estimated ${orderType === 'delivery' ? 'Delivery' : orderType === 'pickup' ? 'Pickup' : 'Service'} Time: <strong>${eta || '25-35 mins'}</strong>
      </p>
    </div>
    <p style="font-family:sans-serif;font-size:14px;color:#6B7280;text-align:center;">Thank you for choosing The Intelligent Bistro. We hope to delight your palate!</p>`;

  const info = await transporter.sendMail({
    from: '"The Intelligent Bistro" <orders@thebistro.com>',
    to: email || "guest@example.com",
    subject: `Order Confirmed #${orderId} ✨ — The Intelligent Bistro`,
    html: emailLayout(body),
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log(`📧 Order confirmation email preview: ${previewUrl}`);
  return previewUrl;
}

export async function sendDeliveryEmail(orderData: any) {
  const { orderId, customerName, email, total } = orderData;
  const transporter = await getTransporter();

  const body = `
    <div style="text-align:center;padding:20px 0;">
      <div style="font-size:48px;">🎉</div>
      <h2 style="font-family:sans-serif;font-size:22px;margin:10px 0;">Your order has been delivered!</h2>
      <p style="font-family:sans-serif;color:#6B7280;font-size:15px;">Dear ${customerName || 'Valued Guest'}, your order <strong>#${orderId}</strong> ($${Number(total).toFixed(2)}) has arrived. Enjoy your meal!</p>
    </div>
    <div style="background:#10B98110;border-left:3px solid #10B981;border-radius:6px;padding:14px 16px;margin:20px 0;">
      <p style="font-family:sans-serif;font-size:14px;margin:0;color:#1A1A1A;">
        ✅ Delivered successfully. We hope you enjoy every bite!
      </p>
    </div>
    <p style="font-family:sans-serif;font-size:14px;color:#6B7280;text-align:center;">Love what you had? Come back and order again — we'll be waiting. ✨</p>`;

  const info = await transporter.sendMail({
    from: '"The Intelligent Bistro" <orders@thebistro.com>',
    to: email || "guest@example.com",
    subject: `🎉 Order #${orderId} Delivered! — The Intelligent Bistro`,
    html: emailLayout(body),
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log(`📧 Delivery confirmation email preview: ${previewUrl}`);
  return previewUrl;
}
