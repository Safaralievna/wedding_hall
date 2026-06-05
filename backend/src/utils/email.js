const nodemailer = require("nodemailer");

const hasSmtpConfig = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.SMTP_FROM;

const createTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendOtpEmail = async ({ to, otp, name }) => {
  const transporter = createTransporter();
  const subject = "To'yxona platformasi - OTP tasdiqlash kodi";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2>Salom, ${name || "foydalanuvchi"}!</h2>
      <p>Sizning OTP kodingiz:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px 16px; background: #f3f4f6; display: inline-block; border-radius: 8px;">${otp}</div>
      <p>Bu kod 10 daqiqa davomida amal qiladi.</p>
    </div>
  `;

  if (!transporter) {
    console.log(`[DEV OTP EMAIL] To: ${to} | OTP: ${otp}`);
    return { skipped: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });

  return { skipped: false };
};

module.exports = {
  sendOtpEmail,
  hasSmtpConfig,
};