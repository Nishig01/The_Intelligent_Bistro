import nodemailer from "nodemailer";

export async function sendOrderConfirmation(orderData: any) {
  const { orderId, items, total, customerName, email } = orderData;

  const testAccount = await nodemailer.createTestAccount();
  
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });

  const emailHtml = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
      <div style="text-align: center; padding: 30px 0; border-bottom: 1px solid #eee;">
        <h1 style="margin: 0; font-size: 28px; font-weight: normal;">The Bistro ✨</h1>
        <p style="color: #666; margin-top: 10px; font-family: sans-serif;">Order Confirmation</p>
      </div>
      <div style="padding: 30px 0;">
        <p style="font-family: sans-serif; font-size: 16px;">Dear ${customerName || 'Valued Guest'},</p>
        <p style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          Thanks for dining with The Intelligent Bistro. Your order <strong>#${orderId}</strong> is being prepared by our chefs.
        </p>
        <div style="background: #fafafa; padding: 20px; border-radius: 12px; margin: 30px 0;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          ${items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-family: sans-serif;">
              <span>${item.quantity}x ${item.name}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div style="border-top: 1px solid #ddd; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between; font-weight: bold; font-family: sans-serif;">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
        <p style="font-family: sans-serif; font-size: 16px; text-align: center; color: #666;">
          Estimated Delivery Time: <strong>35-45 minutes</strong>
        </p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: '"The Intelligent Bistro" <orders@thebistro.com>',
    to: email || "guest@example.com",
    subject: `Order Confirmation #${orderId} ✨`,
    html: emailHtml,
  });

  return nodemailer.getTestMessageUrl(info);
}
