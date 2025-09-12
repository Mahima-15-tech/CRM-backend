// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g. "smtp.gmail.com"
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// verify transporter in startup (optional)
transporter.verify().then(() => {
  console.log('✅ Email transporter ready');
}).catch((err) => {
  console.warn('⚠️ Email transporter verify failed:', err.message);
});

module.exports = transporter;
