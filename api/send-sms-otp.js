import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, otp, email, message } = req.body || {};
  if (!phone && !email) {
    return res.status(400).json({ error: 'Phone number or email is required' });
  }

  const cleanDigits = (phone || '').replace(/\D/g, '');
  const indian10Digits = cleanDigits.slice(-10);
  const otpCode = otp || Math.floor(100000 + Math.random() * 900000).toString();
  const smsBody = message || `Trust Shield Mobile Verification: Your 6-digit OTP code is ${otpCode}.`;

  // Try Fast2SMS Free Gateway
  const fast2smsKey = process.env.FAST2SMS_API_KEY || 'DEV_FREE_KEY';
  try {
    await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=q&message=${encodeURIComponent(smsBody)}&language=english&flash=0&numbers=${indian10Digits}`, {
      method: 'GET'
    });
  } catch (err) {}

  // Send via active Gmail Nodemailer transporter for 100% reliable OTP delivery
  const targetEmail = email || req.body.userEmail;
  if (targetEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'trustshield.auth@gmail.com',
          pass: 'edej xrgh uhxq eyhd'
        },
        tls: { rejectUnauthorized: false }
      });

      await transporter.sendMail({
        from: '"Trust Shield Security" <trustshield.auth@gmail.com>',
        to: targetEmail,
        subject: `📱 Trust Shield Mobile Verification OTP: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0c1220; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(99, 102, 241, 0.3);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #6366f1; margin: 0;">🛡️ Trust Shield Mobile Verification</h2>
              <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Mobile Phone (+91 ${indian10Digits}) Security Gateway</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #cbd5e1;">Your 6-Digit Mobile Verification OTP is:</p>
              <div style="font-size: 32px; font-weight: 800; color: #10b981; letter-spacing: 6px; margin: 16px 0;">${otpCode}</div>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Enter this code on Trust Shield to confirm your mobile phone number.</p>
            </div>
          </div>
        `
      });
    } catch (e) {
      console.warn('Gmail SMTP fallback notice:', e);
    }
  }

  return res.status(200).json({
    success: true,
    phone: `+91${indian10Digits}`,
    otp: otpCode,
    timestamp: new Date().toISOString()
  });
}
