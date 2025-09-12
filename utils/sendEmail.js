const transporter = require ("../config/email");

async function sendEmail(to, subject, text, html) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
  }
}

module.exports = sendEmail;
