import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function emailPlugin(env) {
  return {
    name: 'trustshield-email-api',

    configureServer(server) {

      // ==============================
      // TRUSTED NOMINEE SCAM ALERT
      // ==============================
      server.middlewares.use('/api/scam_alert', async (req, res) => {

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            error: 'Method not allowed'
          }));
          return;
        }

        try {
          const {
            email,
            amount,
            recipientUpi,
            riskScore
          } = await readBody(req);

          if (!email || !email.trim()) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'Trusted nominee email is required'
            }));
            return;
          }

          const smtpHost = env.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
          const smtpPort = Number(env.SMTP_PORT || process.env.SMTP_PORT || 465);
          const smtpUser = env.SMTP_USER || process.env.SMTP_USER;
          const smtpPass = env.SMTP_PASS || process.env.SMTP_PASS;

          if (!smtpUser || !smtpPass) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'SMTP credentials are not configured in .env.local'
            }));
            return;
          }

          console.log(`Sending Trust Shield scam alert to ${email}`);

          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          await transporter.sendMail({
            from: `"Trust Shield Security" <${smtpUser}>`,
            to: email,
            subject: 'Trust Shield - Suspicious Payment Alert',

            html: `
              <div style="
                font-family:Arial,sans-serif;
                max-width:520px;
                margin:auto;
                padding:24px;
                background:#0c1220;
                color:#fff;
                border-radius:12px;
              ">

                <h2 style="color:#6366f1;text-align:center;">
                  🛡️ Trust Shield
                </h2>

                <p style="text-align:center;color:#94a3b8;">
                  Trusted Nominee Security Alert
                </p>

                <div style="
                  margin-top:20px;
                  padding:18px;
                  background:#35151a;
                  border:1px solid #ef4444;
                  border-radius:10px;
                ">

                  <h3 style="color:#f87171;">
                    ⚠️ Suspicious Payment Detected
                  </h3>

                  <p>
                    Trust Shield detected a potentially fraudulent
                    payment attempt.
                  </p>

                  <p>
                    <strong>Amount:</strong>
                    ₹${amount || 'Unknown'}
                  </p>

                  <p>
                    <strong>Recipient UPI:</strong>
                    ${recipientUpi || 'Unknown'}
                  </p>

                  <p>
                    <strong>Risk Score:</strong>
                    ${riskScore ?? 'Unknown'}/100
                  </p>

                </div>

                <div style="
                  margin-top:16px;
                  padding:14px;
                  background:#332b12;
                  border:1px solid #f59e0b;
                  border-radius:8px;
                  color:#fbbf24;
                ">
                  <strong>Security Warning</strong><br/>
                  Please contact the account holder and verify this
                  transaction before allowing the payment to proceed.
                </div>

                <p style="
                  margin-top:20px;
                  text-align:center;
                  color:#64748b;
                  font-size:11px;
                ">
                  Automatically generated by Trust Shield.
                </p>

              </div>
            `
          });

          console.log(`✅ Scam alert email sent to ${email}`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Scam alert sent successfully'
          }));

        } catch (error) {

          console.error('❌ Scam alert email error:', error);

          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            error: error.message || 'Failed to send scam alert'
          }));
        }
      });


      // ==============================
      // EMAIL OTP
      // ==============================
      server.middlewares.use('/api/send-otp', async (req, res) => {

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({
            error: 'Method not allowed'
          }));
          return;
        }

        try {

          const { email, otp, role } = await readBody(req);

          if (!email || !otp) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: 'Missing email or otp parameter'
            }));
            return;
          }

          const smtpHost = env.SMTP_HOST || process.env.SMTP_HOST;
          const smtpPort = Number(
            env.SMTP_PORT || process.env.SMTP_PORT || 465
          );
          const smtpUser = env.SMTP_USER || process.env.SMTP_USER;
          const smtpPass = env.SMTP_PASS || process.env.SMTP_PASS;

          if (!smtpHost || !smtpUser || !smtpPass) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'SMTP credentials are not configured'
            }));
            return;
          }

          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          await transporter.sendMail({
            from: `"Trust Shield Security" <${smtpUser}>`,
            to: email,
            subject: `Trust Shield - Security OTP: ${otp}`,

            html: `
              <div style="
                font-family:Arial,sans-serif;
                max-width:500px;
                margin:auto;
                padding:24px;
              ">

                <h2>🛡️ Trust Shield</h2>

                <p>
                  Your Trust Shield verification code is:
                </p>

                <h1 style="letter-spacing:8px;">
                  ${otp}
                </h1>

                <p>
                  This code is valid for 10 minutes.
                </p>

              </div>
            `
          });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'OTP email sent successfully'
          }));

        } catch (error) {

          console.error('OTP email error:', error);

          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            error: error.message || 'Failed to send OTP'
          }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      emailPlugin(env)
    ]
  };
});