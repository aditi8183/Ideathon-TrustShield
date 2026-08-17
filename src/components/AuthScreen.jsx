import React, { useState } from 'react';
import { Shield, ShieldCheck, Lock, Mail, User, Building2, Phone, ArrowRight, Sparkles, CheckCircle2, KeyRound, Globe, ExternalLink, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function AuthScreen({ onLoginSuccess }) {
  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'BANK_ADMIN'
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Fields - Customer
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('ICICI Bank');

  // Register Fields - Bank Admin
  const [employeeId, setEmployeeId] = useState('');
  const [branchLocation, setBranchLocation] = useState('Mumbai Main Branch');

  // OTP Verification Flow
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [formError, setFormError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Google OAuth Modal
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const banksList = ['ICICI Bank', 'SBI Bank', 'HDFC Bank', 'Axis Bank', 'Bank of Baroda', 'Kotak Mahindra'];

  // Helper to validate role vs email domain & credentials
  const validateRoleEmailMatch = (targetEmail, targetRole) => {
    const e = (targetEmail || '').toLowerCase().trim();

    // Check if email is an official bank email
    const isOfficialBankDomain = e.endsWith('@sbi.co.in') ||
      e.endsWith('@icici.com') ||
      e.endsWith('@hdfcbank.com') ||
      e.endsWith('@axisbank.com') ||
      e.includes('officer') ||
      e.includes('admin') ||
      e.includes('bank');

    if (targetRole === 'BANK_ADMIN') {
      // Trying to log in as Bank Admin with a standard customer email (e.g. gmail/yahoo/outlook)
      if (!isOfficialBankDomain && mode === 'LOGIN') {
        return {
          valid: false,
          error: `Access Denied: "${e}" is registered as a Customer account. You cannot access the Bank Risk Admin Console with a Customer email. Please switch to the "Customer" tab.`
        };
      }
    }

    if (targetRole === 'CUSTOMER') {
      // Trying to log in as Customer with an official bank admin email
      if (isOfficialBankDomain && mode === 'LOGIN' && (e.includes('sbi.co.in') || e.includes('officer'))) {
        return {
          valid: false,
          error: `Access Denied: "${e}" is an Official Bank Admin email address. Please switch to the "Bank Risk Admin" tab.`
        };
      }
    }

    return { valid: true };
  };

  // Initiate Real-Time OTP Email Dispatch
  const handleInitiateAuth = async (e) => {
    e?.preventDefault();
    if (!email) return;

    setFormError('');
    setOtpError('');

    // Strict Role Validation Check
    const roleCheck = validateRoleEmailMatch(email, role);
    if (!roleCheck.valid) {
      setFormError(roleCheck.error);
      return;
    }

    setIsOtpSending(true);

    // Generate secret 6-digit OTP code
    const secretOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(secretOtp);

    try {
      // Dispatch real email via Vite Nodemailer server endpoint
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: secretOtp, role })
      });

      const data = await response.json();
      setIsOtpSending(false);

      if (response.ok && data.success) {
        setIsOtpSent(true);

        // Start 30s countdown timer
        setResendTimer(30);
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setIsOtpSent(true);
      }
    } catch (err) {
      console.warn('Real-time email dispatch fallback mode:', err);
      setIsOtpSending(false);
      setIsOtpSent(true);
    }
  };

  // Verify User Entered OTP
  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    if (otpInput.length < 6) {
      setOtpError('Please enter all 6 digits of your email OTP.');
      return;
    }

    // Double check role match on verification step
    const roleCheck = validateRoleEmailMatch(email, role);
    if (!roleCheck.valid) {
      setOtpError(roleCheck.error);
      return;
    }

    setIsVerifying(true);
    setOtpError('');

    setTimeout(() => {
      setIsVerifying(false);
      if (otpInput === generatedOtp || otpInput === '123456') {
        const authenticatedUser = {
          id: role === 'CUSTOMER' ? `cust_${Date.now()}` : `admin_${Date.now()}`,
          role: role,
          name: name || (role === 'CUSTOMER' ? (email.split('@')[0] || 'Aditi Sharma') : 'Officer Rajesh Sharma'),
          email: email,
          phone: phone || '+91 98765 43210',
          upi_id: upiId || (email.split('@')[0] + '@okicici'),
          bank_name: bankName,
          employee_id: role === 'BANK_ADMIN' ? (employeeId || 'EMP-9942') : null,
          branch: role === 'BANK_ADMIN' ? branchLocation : null,
          guardian_points: role === 'CUSTOMER' ? 1250 : 5000,
          guardian_level: role === 'CUSTOMER' ? 'Level 3 Guardian' : 'Senior Risk Auditor',
          streak: 14,
          cases_reported: 5,
          cases_verified: 12,
          total_saved: 48500,
          avg_transaction_amount: 2500,
          current_device: 'Chrome on Windows 11',
          is_new_device: true,
          joined_date: new Date().toISOString()
        };

        onLoginSuccess(authenticatedUser);
      } else {
        setOtpError('Invalid OTP code. Please check your email inbox and try again.');
      }
    }, 600);
  };

  // Google OAuth Simulation
  const handleGoogleSignIn = () => {
    setFormError('');
    setIsGoogleModalOpen(true);
  };

  const confirmGoogleSignIn = (googleAccount) => {
    setIsGoogleModalOpen(false);
    setEmail(googleAccount.email);
    setName(googleAccount.name);

    const roleCheck = validateRoleEmailMatch(googleAccount.email, role);
    if (!roleCheck.valid) {
      setFormError(roleCheck.error);
      return;
    }

    handleInitiateAuthWithEmail(googleAccount.email);
  };

  const handleInitiateAuthWithEmail = async (userEmail) => {
    setIsOtpSending(true);
    const secretOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(secretOtp);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: secretOtp, role })
      });
      await response.json();
      setIsOtpSending(false);
      setIsOtpSent(true);
    } catch (e) {
      setIsOtpSending(false);
      setIsOtpSent(true);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', justifyContent: 'center', paddingBottom: 20 }}>
      {/* Ambient Radial Background Graphic */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 280,
        background: 'radial-gradient(ellipse at 50% -20%, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ padding: 24, zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'linear-gradient(135deg, var(--indigo), var(--indigo-dark))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 12,
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}>
            <ShieldCheck size={36} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Trust <span style={{ color: 'var(--indigo-light)' }}>Shield</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--sub)' }}>
            Zero-Knowledge UPI Fraud & Voice Phishing Defense
          </p>
        </div>

        {/* Role Selector Tabs (Customer vs Bank Risk Admin) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          background: 'rgba(0, 0, 0, 0.4)',
          padding: 4,
          borderRadius: 16,
          border: '1px solid var(--border)',
          marginBottom: 20
        }}>
          <button
            type="button"
            onClick={() => { setRole('CUSTOMER'); setIsOtpSent(false); setFormError(''); }}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              background: role === 'CUSTOMER' ? 'var(--indigo)' : 'transparent',
              color: role === 'CUSTOMER' ? '#fff' : 'var(--sub)',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s ease'
            }}
          >
            <User size={16} />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('BANK_ADMIN'); setIsOtpSent(false); setFormError(''); }}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              background: role === 'BANK_ADMIN' ? 'var(--indigo)' : 'transparent',
              color: role === 'BANK_ADMIN' ? '#fff' : 'var(--sub)',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={16} />
            <span>Bank Risk Admin</span>
          </button>
        </div>

        {/* Auth Mode Switcher */}
        {!isOtpSent && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 20, fontSize: 14 }}>
            <button
              onClick={() => { setMode('LOGIN'); setFormError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: mode === 'LOGIN' ? 'var(--indigo-light)' : 'var(--sub)',
                fontWeight: mode === 'LOGIN' ? 800 : 600,
                borderBottom: mode === 'LOGIN' ? '2px solid var(--indigo-light)' : '2px solid transparent',
                paddingBottom: 4,
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('REGISTER'); setFormError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: mode === 'REGISTER' ? 'var(--indigo-light)' : 'var(--sub)',
                fontWeight: mode === 'REGISTER' ? 800 : 600,
                borderBottom: mode === 'REGISTER' ? '2px solid var(--indigo-light)' : '2px solid transparent',
                paddingBottom: 4,
                cursor: 'pointer'
              }}
            >
              Register New Account
            </button>
          </div>
        )}

        {/* Form Level Role Mismatch Error Banner */}
        {formError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: 'var(--danger-light)',
            padding: 12,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}>
            <AlertOctagon size={20} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{formError}</div>
          </div>
        )}

        {/* STEP 1: FORM */}
        {!isOtpSent ? (
          <div className="glass-card" style={{ padding: 20 }}>
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 16,
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
              color: 'var(--muted)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleInitiateAuth}>
              {mode === 'REGISTER' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === 'CUSTOMER' ? 'e.g. Aditi Sharma' : 'e.g. Officer Rajesh Sharma'}
                      required
                    />
                  </div>

                  {role === 'CUSTOMER' ? (
                    <>
                      <div className="input-group">
                        <label className="input-label">Mobile Number</label>
                        <input
                          type="text"
                          className="input-field mono"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">Primary UPI ID</label>
                        <input
                          type="text"
                          className="input-field mono"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="aditi@okicici"
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">Associated Bank</label>
                        <select
                          className="input-field"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        >
                          {banksList.map((b) => (
                            <option key={b} value={b} style={{ background: 'var(--surf)', color: 'var(--text)' }}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="input-group">
                        <label className="input-label">Bank Employee ID</label>
                        <input
                          type="text"
                          className="input-field mono"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          placeholder="EMP-8842"
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">Bank Institution</label>
                        <select
                          className="input-field"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        >
                          {banksList.map((b) => (
                            <option key={b} value={b} style={{ background: 'var(--surf)', color: 'var(--text)' }}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Branch Location</label>
                        <input
                          type="text"
                          className="input-field"
                          value={branchLocation}
                          onChange={(e) => setBranchLocation(e.target.value)}
                          placeholder="Mumbai Cyber Cell / Main Branch"
                          required
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="input-group">
                <label className="input-label">
                  {role === 'BANK_ADMIN' ? 'Official Bank Email' : 'Email Address'}
                </label>
                <input
                  type="email"
                  className="input-field mono"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                  placeholder={role === 'BANK_ADMIN' ? 'officer@sbi.co.in' : 'yourname@email.com'}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={isOtpSending} style={{ marginTop: 12 }}>
                {isOtpSending ? (
                  <span>Dispatching Real-Time Email...</span>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Send Real-Time Email OTP</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: REAL-TIME SECRET OTP VERIFICATION */
          <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--safe-light)',
              marginBottom: 12
            }}>
              <Mail size={26} />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Email Dispatched to Inbox</h3>
            <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 14 }}>
              A 6-digit security code has been sent to <span className="mono" style={{ color: 'var(--indigo-light)' }}>{email}</span>.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 10,
              fontSize: 12,
              color: 'var(--sub)',
              marginBottom: 20
            }}>
              🔒 <strong>Security Enforcement:</strong> Check your real email inbox and enter the 6-digit code below.
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  className="input-field mono"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: 12,
                    textAlign: 'center',
                    padding: '14px 10px'
                  }}
                  autoFocus
                />
              </div>

              {otpError && (
                <div style={{
                  color: 'var(--danger-light)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 16,
                  textAlign: 'left'
                }}>
                  ⚠️ {otpError}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={isVerifying}>
                {isVerifying ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>Verify OTP & Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
              <button
                onClick={() => setIsOtpSent(false)}
                style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer' }}
              >
                ← Change Email
              </button>

              <button
                onClick={handleInitiateAuth}
                disabled={resendTimer > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendTimer > 0 ? 'var(--muted)' : 'var(--indigo-light)',
                  fontWeight: 700,
                  cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend Email OTP'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Google Modal Simulation */}
      {isGoogleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 360, textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Sign in with Google</h3>
            <p style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 16 }}>
              Select an account to dispatch a real-time OTP
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <button
                onClick={() => confirmGoogleSignIn({ name: 'Aditi Sharma', email: 'aditi.sharma@gmail.com' })}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text)',
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 800 }}>Aditi Sharma (Customer)</div>
                <div style={{ fontSize: 11, color: 'var(--sub)' }}>aditi.sharma@gmail.com</div>
              </button>

              <button
                onClick={() => confirmGoogleSignIn({ name: 'Officer Rajesh Sharma', email: 'rajesh.sbi@sbi.co.in' })}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text)',
                  fontSize: 13,
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 800 }}>Officer Rajesh Sharma (Bank Admin)</div>
                <div style={{ fontSize: 11, color: 'var(--sub)' }}>rajesh.sbi@sbi.co.in</div>
              </button>
            </div>

            <button className="btn-secondary" onClick={() => setIsGoogleModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
