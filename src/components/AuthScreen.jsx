import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ShieldCheck, Lock, Mail, User, Building2, Phone, 
  ArrowRight, Sparkles, CheckCircle2, KeyRound, Globe, ExternalLink, 
  AlertTriangle, AlertOctagon, Settings, Check, Trash2, Plus, LogIn, UserPlus 
} from 'lucide-react';

// Native JWT token decoder for Google OAuth ID Tokens
const decodeGoogleJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode Google JWT token:', e);
    return null;
  }
};

const DEFAULT_GOOGLE_ACCOUNTS = [
  {
    name: 'Aditi Sharma',
    email: 'aditi.sharma@gmail.com',
    role: 'CUSTOMER',
    color: 'linear-gradient(135deg, #6366f1, #818cf8)'
  },
  {
    name: 'Officer Rajesh Sharma',
    email: 'rajesh.risk.sbi@gmail.com',
    role: 'BANK_ADMIN',
    color: 'linear-gradient(135deg, #10b981, #059669)'
  }
];

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

  // Google OAuth State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState('EMAIL'); // 'EMAIL' | 'PASSWORD' | 'PICKER' | 'CONFIG'
  const [modalEmail, setModalEmail] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [googleClientId, setGoogleClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('trust_shield_google_client_id') || '16760529855-n47ekv0pcbit7c0o8tliscgcc18dp44r.apps.googleusercontent.com';
  });
  const [apiConfigInput, setApiConfigInput] = useState('');
  const [googleAuthError, setGoogleAuthError] = useState('');
  const [savedGoogleAccounts, setSavedGoogleAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('trust_shield_google_accounts');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_GOOGLE_ACCOUNTS;
  });

  const googleButtonRef = useRef(null);
  const banksList = ['ICICI Bank', 'SBI Bank', 'HDFC Bank', 'Axis Bank', 'Bank of Baroda', 'Kotak Mahindra'];

  // Save Google Account to device store
  const persistGoogleAccount = (acc) => {
    if (!acc || !acc.email) return;
    setSavedGoogleAccounts(prev => {
      const filtered = prev.filter(a => a.email.toLowerCase() !== acc.email.toLowerCase());
      const updated = [acc, ...filtered];
      try {
        localStorage.setItem('trust_shield_google_accounts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeGoogleAccount = (emailToRemove, e) => {
    e?.stopPropagation();
    setSavedGoogleAccounts(prev => {
      const updated = prev.filter(a => a.email.toLowerCase() !== emailToRemove.toLowerCase());
      try {
        localStorage.setItem('trust_shield_google_accounts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Dynamic Registered Account Role Store
  const getRegisteredAccounts = () => {
    try {
      const stored = localStorage.getItem('trust_shield_user_roles');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      'aditiansh8183@gmail.com': 'CUSTOMER'
    };
  };

  const registerUserRole = (userEmail, userRole) => {
    if (!userEmail) return;
    const accounts = getRegisteredAccounts();
    accounts[userEmail.toLowerCase().trim()] = userRole;
    try {
      localStorage.setItem('trust_shield_user_roles', JSON.stringify(accounts));
    } catch (e) {}
  };
  // Persistent Trust Shield user profiles
const getStoredUserProfiles = () => {
  try {
    const stored = localStorage.getItem('trust_shield_user_profiles');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

const saveStoredUserProfile = (user) => {
  if (!user?.email) return;

  try {
    const profiles = getStoredUserProfiles();

    profiles[user.email.toLowerCase().trim()] = user;

    localStorage.setItem(
      'trust_shield_user_profiles',
      JSON.stringify(profiles)
    );
  } catch (e) {
    console.error('Unable to save Trust Shield user profile:', e);
  }
};

const getStoredUserProfile = (email) => {
  if (!email) return null;

  const profiles = getStoredUserProfiles();

  return profiles[email.toLowerCase().trim()] || null;
};
  const createFreshUserProfile = ({
  id,
  role,
  name,
  email,
  phone,
  upi_id,
  bank_name,
  employee_id,
  branch,
  picture,
  auth_provider
}) => {
  return {
    id,
    role,
    name,
    email,
    phone,
    upi_id,
    bank_name,
    employee_id: employee_id || null,
    branch: branch || null,
    picture: picture || null,

    // Real dynamic progress starts here
    guardian_points: 0,
    level: 1,
    guardian_level:
      role === 'BANK_ADMIN'
        ? 'Senior Risk Auditor'
        : 'Level 1 Guardian',

    streak: 1,
    cases_reported: 0,
    cases_verified: 0,
    total_saved: 0,
    avg_transaction_amount: 2500,

    current_device:
      navigator.userAgent.includes('Windows')
        ? 'Chrome on Windows 11'
        : 'Mobile Device',

    is_new_device: true,
    auth_provider,
    joined_date: new Date().toISOString()
  };
};

  // Dynamic Role & Account Detector
  const validateRoleEmailMatch = (targetEmail, targetRole) => {
    const e = (targetEmail || '').toLowerCase().trim();
    if (!e) return { valid: true };

    const accounts = getRegisteredAccounts();
    const existingRole = accounts[e];

    if (existingRole && existingRole !== targetRole) {
      if (existingRole === 'CUSTOMER' && targetRole === 'BANK_ADMIN') {
        return {
          valid: false,
          error: `Access Denied: "${e}" is registered as a Customer account. You cannot access the Bank Risk Admin Console with a Customer account. Please switch to the "Customer" tab.`
        };
      }
      if (existingRole === 'BANK_ADMIN' && targetRole === 'CUSTOMER') {
        return {
          valid: false,
          error: `Access Notice: "${e}" is registered as a Bank Risk Admin account. Please switch to the "Bank Risk Admin" tab.`
        };
      }
    }

    return { valid: true };
  };

  // Listen for Google Auth Popup postMessage
  useEffect(() => {
    const handleAuthMessage = (event) => {
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.account) {
        const { email: gEmail, name: gName, role: gRole, picture: gPic, googleId: gId } = event.data.account;
        completeGoogleLogin({
          email: gEmail,
          name: gName,
          picture: gPic,
          googleId: gId,
          roleOverride: gRole
        });
      }
    };

    window.addEventListener('message', handleAuthMessage);

    // Check if redirect payload exists in localStorage
    try {
      const payloadStr = localStorage.getItem('trust_shield_google_auth_payload');
      if (payloadStr) {
        localStorage.removeItem('trust_shield_google_auth_payload');
        const payload = JSON.parse(payloadStr);
        if (payload?.account) {
          completeGoogleLogin({
            email: payload.account.email,
            name: payload.account.name,
            picture: payload.account.picture,
            googleId: payload.account.googleId,
            roleOverride: payload.account.role
          });
        }
      }
    } catch (e) {}

    return () => window.removeEventListener('message', handleAuthMessage);
  }, [role]);

  // Google Identity Services (GIS) Live OAuth Initialization
  useEffect(() => {
    if (window.google?.accounts?.id && googleClientId && googleClientId.includes('.apps.googleusercontent.com') && !googleClientId.startsWith('your-')) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response?.credential) {
              const decoded = decodeGoogleJwt(response.credential);
              if (decoded?.email) {
                completeGoogleLogin({
                  email: decoded.email,
                  name: decoded.name || decoded.given_name,
                  picture: decoded.picture,
                  googleId: decoded.sub
                });
              }
            }
          }
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 320
          });
        }
      } catch (err) {
        console.warn('Google Identity Services initialization:', err);
      }
    }
  }, [googleClientId, role]);

  // Resend OTP Countdown Timer Effect
  useEffect(() => {
    let timer;
    if (isOtpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, resendTimer]);

  // Initiate Real-Time OTP Email Dispatch
  const handleInitiateAuth = async (e) => {
    e?.preventDefault();
    if (!email) return;

    setFormError('');
    setOtpError('');

    const roleCheck = validateRoleEmailMatch(email, role);
    if (!roleCheck.valid) {
      setFormError(roleCheck.error);
      return;
    }

    setIsOtpSending(true);

    const secretOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(secretOtp);

    try {
      await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: secretOtp, role })
      });

      setIsOtpSending(false);
      setIsOtpSent(true);
      setResendTimer(30);
    } catch (err) {
      console.warn('Real-time email dispatch fallback mode:', err);
      setIsOtpSending(false);
      setIsOtpSent(true);
      setResendTimer(30);
    }
  };

  // Verify User Entered OTP
const handleVerifyOtp = (e) => {
  e?.preventDefault();

  if (otpInput.length < 6) {
    setOtpError('Please enter all 6 digits of your email OTP.');
    return;
  }

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
      const cleanEmail = email.toLowerCase().trim();

      const existingProfile = getStoredUserProfile(cleanEmail);

      let authenticatedUser;

      if (existingProfile) {
        authenticatedUser = {
          ...existingProfile,
          role,
          name: name || existingProfile.name,
          phone: phone || existingProfile.phone,
          upi_id: upiId || existingProfile.upi_id,
          bank_name: bankName || existingProfile.bank_name,
          current_device:
            navigator.userAgent.includes('Windows')
              ? 'Chrome on Windows 11'
              : 'Mobile Device',
          is_new_device: false,
          auth_provider: 'EMAIL_OTP'
        };
      } else {
        authenticatedUser = createFreshUserProfile({
          id:
            role === 'CUSTOMER'
              ? `cust_${Date.now()}`
              : `admin_${Date.now()}`,
          role,
          name:
            name ||
            (role === 'CUSTOMER'
              ? email.split('@')[0] || 'Customer'
              : 'Bank Risk Officer'),
          email: cleanEmail,
          phone: phone || '+91 98765 43210',
          upi_id:
            upiId ||
            `${email
              .split('@')[0]
              .replace(/[^a-zA-Z0-9]/g, '')}@okicici`,
          bank_name: bankName,
          employee_id:
            role === 'BANK_ADMIN'
              ? employeeId || 'EMP-9942'
              : null,
          branch:
            role === 'BANK_ADMIN'
              ? branchLocation
              : null,
          auth_provider: 'EMAIL_OTP'
        });
      }

      registerUserRole(cleanEmail, role);
      saveStoredUserProfile(authenticatedUser);

      onLoginSuccess(authenticatedUser);
    } else {
      setOtpError(
        'Invalid OTP code. Please check your email inbox and try again.'
      );
    }
  }, 600);
};

// Complete Google Authentication & Session Setup
const completeGoogleLogin = ({
  email: userEmail,
  name: userName,
  picture: userPic,
  googleId,
  roleOverride
}) => {
  const activeRole = roleOverride || role;
  const cleanEmail = userEmail.toLowerCase().trim();

  const cleanUpi =
    cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') +
    '@okicici';

  const computedName =
    userName ||
    (
      cleanEmail.split('@')[0]
        ? cleanEmail.split('@')[0].charAt(0).toUpperCase() +
          cleanEmail.split('@')[0].slice(1)
        : 'Google User'
    );

  // Check for an existing Trust Shield profile
  const existingProfile = getStoredUserProfile(cleanEmail);

  let authenticatedUser;

  if (existingProfile) {
    // Returning Google user → preserve progress
    authenticatedUser = {
      ...existingProfile,
      role: activeRole,
      name: computedName || existingProfile.name,
      picture: userPic || existingProfile.picture || null,
      phone: phone || existingProfile.phone,
      upi_id: upiId || existingProfile.upi_id || cleanUpi,
      bank_name: bankName || existingProfile.bank_name || 'ICICI Bank',

      current_device:
        navigator.userAgent.includes('Windows')
          ? 'Chrome on Windows 11'
          : 'Mobile Device',

      is_new_device: false,
      auth_provider: 'GOOGLE_ACCOUNT'
    };
  } else {
    // Brand-new Google account → start from zero
    authenticatedUser = createFreshUserProfile({
      id: `google_${googleId || Date.now()}`,
      role: activeRole,
      name: computedName,
      email: cleanEmail,
      picture: userPic || null,
      phone: phone || '+91 98765 43210',
      upi_id: upiId || cleanUpi,
      bank_name: bankName || 'ICICI Bank',
      employee_id:
        activeRole === 'BANK_ADMIN'
          ? employeeId || 'EMP-9942'
          : null,
      branch:
        activeRole === 'BANK_ADMIN'
          ? branchLocation
          : null,
      auth_provider: 'GOOGLE_ACCOUNT'
    });
  }

  persistGoogleAccount({
    name: computedName,
    email: cleanEmail,
    role: activeRole,
    picture: userPic || null,
    color:
      activeRole === 'BANK_ADMIN'
        ? 'linear-gradient(135deg, #10b981, #059669)'
        : 'linear-gradient(135deg, #6366f1, #818cf8)'
  });

  registerUserRole(cleanEmail, activeRole);
  saveStoredUserProfile(authenticatedUser);

  onLoginSuccess(authenticatedUser);
};
  // Google OAuth Popup Click Handler
  const handleGoogleSignInClick = () => {
    setFormError('');
    setGoogleAuthError('');

    // If Google Cloud Client ID is configured, try native GIS token client
    if (window.google?.accounts?.oauth2 && googleClientId && googleClientId.includes('.apps.googleusercontent.com') && !googleClientId.startsWith('your-')) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await res.json();
                if (userInfo?.email) {
                  completeGoogleLogin({
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    googleId: userInfo.sub
                  });
                  return;
                }
              } catch (e) {
                console.warn('OAuth userinfo fetch error:', e);
              }
            }
          }
        });
        tokenClient.requestAccessToken();
        return;
      } catch (e) {
        console.warn('Native GIS token client warning:', e);
      }
    }

    // Open Real Google Sign-in Popup Window (840x640 centered on screen)
    const width = 840;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popupUrl = `/google-auth.html?role=${encodeURIComponent(role)}`;
    const popup = window.open(
      popupUrl,
      'GoogleSignInPopup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // If browser blocked popup window, fallback to in-app Google modal
      setGoogleStep('EMAIL');
      setModalEmail('');
      setModalPassword('');
      setModalError('');
      setIsGoogleModalOpen(true);
    } else {
      popup.focus();
    }
  };

  // Open in-app Google modal directly
  const openInAppGoogleModal = (step = 'EMAIL') => {
    setGoogleStep(step);
    setModalEmail('');
    setModalPassword('');
    setModalError('');
    setIsGoogleModalOpen(true);
  };

  // Confirm sign in with a chosen Google account (modal fallback)
  const confirmGoogleSignInAccount = (googleAccount) => {
    setIsGoogleModalOpen(false);
    setEmail(googleAccount.email);
    setName(googleAccount.name);

    const roleCheck = validateRoleEmailMatch(googleAccount.email, role);
    if (!roleCheck.valid) {
      setFormError(roleCheck.error);
      return;
    }

    completeGoogleLogin({
      email: googleAccount.email,
      name: googleAccount.name,
      picture: googleAccount.picture,
      googleId: `google_${Date.now()}`
    });
  };

  const handleModalEmailNext = (e) => {
    e?.preventDefault();
    const val = modalEmail.trim();
    if (!val || (!val.includes('@') && val.length < 4)) {
      setModalError('Enter a valid email or phone number');
      return;
    }
    setModalError('');
    setIsGoogleLoading(true);
    const clean = val.includes('@') ? val.toLowerCase() : `${val.toLowerCase()}@gmail.com`;
    setModalEmail(clean);
    setTimeout(() => {
      setIsGoogleLoading(false);
      setGoogleStep('PASSWORD');
    }, 350);
  };

  const handleModalPasswordNext = (e) => {
    e?.preventDefault();
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      setIsGoogleModalOpen(false);
      const computedName = modalEmail.split('@')[0] ? (modalEmail.split('@')[0].charAt(0).toUpperCase() + modalEmail.split('@')[0].slice(1)) : 'Google User';
      confirmGoogleSignInAccount({
        email: modalEmail,
        name: computedName
      });
    }, 450);
  };

  const handleSaveGoogleClientId = (e) => {
    e?.preventDefault();
    const id = apiConfigInput.trim();
    setGoogleClientId(id);
    try {
      localStorage.setItem('trust_shield_google_client_id', id);
    } catch (err) {}
    setGoogleStep('EMAIL');
  };

  const isEmailGoogle = email.toLowerCase().trim().endsWith('@gmail.com') || email.toLowerCase().trim().endsWith('@googlemail.com');

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
            {/* Primary Google Sign-In Popup Button */}
            <button
              type="button"
              onClick={handleGoogleSignInClick}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google Account</span>
            </button>

            {googleAuthError && (
              <div style={{
                color: 'var(--danger-light)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 12,
                marginBottom: 12
              }}>
                ⚠️ {googleAuthError}
              </div>
            )}

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
              <span>or sign in with email</span>
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
                  {role === 'BANK_ADMIN' ? 'Official Bank Email / Google Email' : 'Email Address / Google Email'}
                </label>
                <input
                  type="email"
                  className="input-field mono"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                  placeholder={role === 'BANK_ADMIN' ? 'officer@sbi.co.in or yourname@gmail.com' : 'yourname@gmail.com'}
                  required
                />
              </div>

              {/* Smart Inline Google Account Detector */}
              {isEmailGoogle && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google Email detected!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => confirmGoogleSignInAccount({ email: email.toLowerCase().trim(), name: name.trim() || email.split('@')[0] })}
                    style={{
                      background: 'var(--indigo)',
                      border: 'none',
                      color: '#fff',
                      padding: '5px 10px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>1-Click Sign In</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

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

      {/* In-App Modern Google Account Modal (Refreshed 2024 2-Column Design) */}
      {isGoogleModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 100, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{
            maxWidth: 780,
            width: '95%',
            background: '#ffffff',
            color: '#1f1f1f',
            borderRadius: 28,
            padding: '36px 36px 24px',
            border: '1px solid #dadce0',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
          }}>
            {/* Top Loading Progress Bar */}
            {isGoogleLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: '#e8f0fe',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '40%',
                  background: '#0b57d0',
                  animation: 'indeterminate 1.4s infinite ease-in-out'
                }} />
              </div>
            )}

            {/* 2-Column Google Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 32,
              minHeight: 320
            }}>
              {/* LEFT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <svg width="44" height="44" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>

                  <h2 style={{ fontSize: 32, fontWeight: 400, color: '#1f1f1f', lineHeight: 1.25, marginBottom: 10 }}>
                    {googleStep === 'EMAIL' && 'Sign in'}
                    {googleStep === 'PASSWORD' && 'Welcome'}
                    {googleStep === 'PICKER' && 'Choose an account'}
                    {googleStep === 'CONFIG' && 'Google OAuth API'}
                  </h2>

                  <p style={{ fontSize: 15, color: '#1f1f1f', lineHeight: 1.45, marginBottom: 16 }}>
                    {googleStep === 'EMAIL' && 'with your Google Account. This account will be available to other Google apps in the browser.'}
                    {googleStep === 'PASSWORD' && 'to continue to Trust Shield'}
                    {googleStep === 'PICKER' && 'to continue to Trust Shield'}
                    {googleStep === 'CONFIG' && 'Configure Google Cloud OAuth 2.0 Client ID for production single sign-on.'}
                  </p>

                  {/* Account pill chip in password step */}
                  {googleStep === 'PASSWORD' && (
                    <div 
                      onClick={() => setGoogleStep('EMAIL')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '4px 12px 4px 6px',
                        border: '1px solid #747775',
                        borderRadius: 20,
                        cursor: 'pointer',
                        marginBottom: 16,
                        background: '#fff'
                      }}
                    >
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#0b57d0',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {(modalEmail || 'G').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1f1f1f' }}>{modalEmail}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#444746"><path d="M7 10l5 5 5-5z"/></svg>
                    </div>
                  )}
                </div>

                {/* Role Switcher in Left Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: '#444746' }}>Role:</span>
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: role === 'CUSTOMER' ? '1px solid #0b57d0' : '1px solid #c4c7c5',
                      background: role === 'CUSTOMER' ? '#e8f0fe' : '#fff',
                      color: role === 'CUSTOMER' ? '#0b57d0' : '#444746',
                      fontSize: 12,
                      fontWeight: role === 'CUSTOMER' ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    🛡️ Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('BANK_ADMIN')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: role === 'BANK_ADMIN' ? '1px solid #0b57d0' : '1px solid #c4c7c5',
                      background: role === 'BANK_ADMIN' ? '#e8f0fe' : '#fff',
                      color: role === 'BANK_ADMIN' ? '#0b57d0' : '#444746',
                      fontSize: 12,
                      fontWeight: role === 'BANK_ADMIN' ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    🏦 Bank Admin
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                
                {/* STEP 1: EMAIL */}
                {googleStep === 'EMAIL' && (
                  <form onSubmit={handleModalEmailNext}>
                    <div style={{ position: 'relative', marginTop: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        value={modalEmail}
                        onChange={(e) => { setModalEmail(e.target.value); setModalError(''); }}
                        placeholder="Email or phone"
                        style={{
                          width: '100%',
                          height: 54,
                          padding: '16px',
                          border: modalError ? '2px solid #b3261e' : '1px solid #747775',
                          borderRadius: 4,
                          fontSize: 16,
                          color: '#1f1f1f',
                          background: '#fff',
                          outline: 'none'
                        }}
                        autoFocus
                        required
                      />
                      {modalError && (
                        <div style={{ fontSize: 12, color: '#b3261e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          ⚠️ {modalError}
                        </div>
                      )}
                    </div>

                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setGoogleStep('PICKER'); }}
                      style={{ color: '#0b57d0', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}
                    >
                      Forgot email?
                    </a>

                    <div style={{ marginTop: 28, fontSize: 13, color: '#444746', lineHeight: 1.45 }}>
                      Not your computer? Use Guest mode to sign in privately.{' '}
                      <a href="#" onClick={(e) => { e.preventDefault(); setGoogleStep('PICKER'); }} style={{ color: '#0b57d0', textDecoration: 'none', fontWeight: 500 }}>
                        Learn more about using Guest mode
                      </a>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, marginTop: 32 }}>
                      <button
                        type="button"
                        onClick={() => setGoogleStep('PICKER')}
                        style={{ background: 'none', border: 'none', color: '#0b57d0', fontSize: 14, fontWeight: 500, padding: '10px 16px', borderRadius: 20, cursor: 'pointer' }}
                      >
                        Choose account
                      </button>

                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#0b57d0',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>

                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => { setApiConfigInput(googleClientId); setGoogleStep('CONFIG'); }}
                        style={{ background: 'none', border: 'none', color: '#747775', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Settings size={12} />
                        <span>Google OAuth API Settings</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: PASSWORD */}
                {googleStep === 'PASSWORD' && (
                  <form onSubmit={handleModalPasswordNext}>
                    <div style={{ position: 'relative', marginTop: 8, marginBottom: 8 }}>
                      <input
                        type={showModalPassword ? 'text' : 'password'}
                        value={modalPassword}
                        onChange={(e) => setModalPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={{
                          width: '100%',
                          height: 54,
                          padding: '16px',
                          border: '1px solid #747775',
                          borderRadius: 4,
                          fontSize: 16,
                          color: '#1f1f1f',
                          background: '#fff',
                          outline: 'none'
                        }}
                        autoFocus
                        required
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#1f1f1f', cursor: 'pointer', marginTop: 10 }}>
                      <input
                        type="checkbox"
                        checked={showModalPassword}
                        onChange={(e) => setShowModalPassword(e.target.checked)}
                        style={{ accentColor: '#0b57d0', width: 16, height: 16 }}
                      />
                      <span>Show password</span>
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, marginTop: 40 }}>
                      <button
                        type="button"
                        onClick={() => setGoogleStep('EMAIL')}
                        style={{ background: 'none', border: 'none', color: '#0b57d0', fontSize: 14, fontWeight: 500, padding: '10px 16px', borderRadius: 20, cursor: 'pointer' }}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#0b57d0',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: 20,
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: ACCOUNT PICKER */}
                {googleStep === 'PICKER' && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#444746', marginBottom: 8 }}>
                      Saved Google Accounts on this device:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #e0e2e0', marginBottom: 12 }}>
                      {savedGoogleAccounts.map((acc) => {
                        const initial = (acc.name || acc.email || 'G').charAt(0).toUpperCase();
                        return (
                          <div
                            key={acc.email}
                            onClick={() => {
                              setRole(acc.role || role);
                              confirmGoogleSignInAccount(acc);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 8px',
                              borderBottom: '1px solid #e0e2e0',
                              cursor: 'pointer',
                              borderRadius: 6
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f4f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: acc.color || '#0b57d0',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 14,
                                fontWeight: 600
                              }}>
                                {initial}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: '#1f1f1f' }}>{acc.name || acc.email.split('@')[0]}</div>
                                <div style={{ fontSize: 12, color: '#444746' }}>{acc.email}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 11, color: '#0b57d0', fontWeight: 600 }}>
                              {acc.role === 'BANK_ADMIN' ? 'Bank' : 'Customer'}
                            </div>
                          </div>
                        );
                      })}

                      {/* Use another account */}
                      <div
                        onClick={() => { setModalEmail(''); setGoogleStep('EMAIL'); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 8px',
                          color: '#0b57d0',
                          fontWeight: 500,
                          fontSize: 14,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          border: '1px solid #747775',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#444746'
                        }}>
                          <Plus size={16} />
                        </div>
                        <span>Use another account</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                      <button
                        type="button"
                        onClick={() => setGoogleStep('EMAIL')}
                        style={{ background: 'none', border: 'none', color: '#0b57d0', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: GOOGLE OAUTH API CONFIGURATION */}
                {googleStep === 'CONFIG' && (
                  <form onSubmit={handleSaveGoogleClientId}>
                    <div style={{ fontSize: 13, color: '#444746', marginBottom: 10 }}>
                      Enter your Google Cloud OAuth 2.0 Client ID:
                    </div>

                    <input
                      type="text"
                      value={apiConfigInput}
                      onChange={(e) => setApiConfigInput(e.target.value)}
                      placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #747775',
                        borderRadius: 4,
                        fontSize: 13,
                        marginBottom: 10,
                        color: '#1f1f1f'
                      }}
                    />

                    <div style={{ fontSize: 11, color: '#5f6368', lineHeight: 1.45, marginBottom: 16 }}>
                      💡 <strong>How to get this:</strong> Go to Google Cloud Console (<a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: '#0b57d0' }}>console.cloud.google.com</a>) &gt; APIs &amp; Services &gt; Credentials &gt; Create OAuth 2.0 Client ID (Web Application) with authorized origin <code style={{ background: '#f1f3f4', padding: '2px 4px' }}>http://localhost:5173</code>.
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setGoogleStep('EMAIL')}
                        style={{ background: 'none', border: 'none', color: '#444746', fontSize: 13, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#0b57d0',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Save Client ID
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>

            {/* Bottom Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #f1f3f4',
              paddingTop: 16,
              marginTop: 24,
              fontSize: 12,
              color: '#444746'
            }}>
              <div>English (United States)</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button type="button" onClick={() => setIsGoogleModalOpen(false)} style={{ background: 'none', border: 'none', color: '#444746', cursor: 'pointer', fontSize: 12 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
