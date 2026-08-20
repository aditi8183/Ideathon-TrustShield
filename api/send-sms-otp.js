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

  const { phone, otp, message } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const cleanDigits = phone.replace(/\D/g, '').slice(-10);
  const otpCode = otp || Math.floor(100000 + Math.random() * 900000).toString();
  const smsBody = message || `Trust Shield Security: Your 6-digit SMS verification OTP is ${otpCode}. Valid for 5 minutes.`;

  let fast2smsResult = null;
  let textbeltResult = null;

  // 1. Dispatch via Fast2SMS SMS Gateway
  const fast2smsKey = process.env.FAST2SMS_API_KEY || 'DEV_FREE_KEY';
  try {
    const f2sResp = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=q&message=${encodeURIComponent(smsBody)}&language=english&flash=0&numbers=${cleanDigits}`, {
      method: 'GET'
    });
    fast2smsResult = await f2sResp.json();
  } catch (err) {
    console.warn('Fast2SMS gateway notice:', err.message);
  }

  // 2. Dispatch via Textbelt SMS Gateway
  try {
    const tbResp = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: `+91${cleanDigits}`,
        message: smsBody,
        key: 'textbelt'
      })
    });
    textbeltResult = await tbResp.json();
  } catch (err) {
    console.warn('Textbelt gateway notice:', err.message);
  }

  return res.status(200).json({
    success: true,
    phone: `+91${cleanDigits}`,
    otp: otpCode,
    fast2sms: fast2smsResult,
    textbelt: textbeltResult,
    timestamp: new Date().toISOString()
  });
}
