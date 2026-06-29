const nodemailer = require('nodemailer');

const sendEmailOTP = async (toEmail, otp) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || 'noreply@hajianfoods.com';

  const messageBody = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #FF5A36; text-align: center;">HAJIAN FOODS</h2>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p>Hello Admin,</p>
      <p>A password change was requested for your administrator account. Please use the following 6-digit One-Time Password (OTP) to complete the request:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF5A36; background: #FFF5F2; padding: 15px 30px; border-radius: 10px; border: 1px dashed #FF5A36;">
          ${otp}
        </span>
      </div>
      <p style="color: #777; font-size: 12px; text-align: center;">This OTP is valid for 5 minutes. If you did not request this password change, please ignore this email and verify your account security.</p>
    </div>
  `;

  if (!host || !user || !pass) {
    console.log(`\n-----------------------------------------------\n[EMAIL SIMULATION] Sent Password Change OTP: ${otp} to ${toEmail}\n(To send real emails, add SMTP credentials to backend .env file)\n-----------------------------------------------\n`);
    return true;
  }

  try {
    const transporterConfig = host.includes('gmail')
      ? {
          service: 'gmail',
          auth: {
            user,
            pass,
          },
        }
      : {
          host,
          port: Number(port),
          secure: Number(port) === 465,
          auth: {
            user,
            pass,
          },
        };

    const transporter = nodemailer.createTransport(transporterConfig);

    await transporter.sendMail({
      from: `"Hajian Foods Admin Security" <${from}>`,
      to: toEmail,
      subject: 'Admin Account: Password Change Verification Code',
      html: messageBody,
    });

    console.log(`[EMAIL SUCCESS] Sent OTP to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email:', error);
    return false;
  }
};

module.exports = { sendEmailOTP };
