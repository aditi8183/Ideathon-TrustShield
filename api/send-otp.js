import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS & Method Check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' });
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = process.env.SMTP_USER || 'trustshield.auth@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'edej xrgh uhxq eyhd';

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Trust Shield Security" <${smtpUser}>`,
      to: email,
      subject: `🛡️ Trust Shield - Security OTP: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0c1220; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(99, 102, 241, 0.3);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #6366f1; margin: 0;">🛡️ Trust Shield</h2>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Zero-Knowledge Financial Security System</p>
          </div>
          <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #cbd5e1;">Your 6-Digit Authentication OTP is:</p>
            <div style="font-size: 32px; font-weight: 800; color: #10b981; letter-spacing: 6px; margin: 16px 0;">${otp}</div>
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">This OTP is valid for 5 minutes. Do not share this code with anyone.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'OTP sent via Gmail SMTP' });
  } catch (err) {
    console.error('Vercel API OTP error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
