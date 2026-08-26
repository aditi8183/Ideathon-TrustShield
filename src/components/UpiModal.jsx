import React, { useState, useEffect } from 'react';
import { Smartphone, ExternalLink, QrCode, Copy, Check, CheckCircle2, X, RefreshCw, ShieldCheck, Zap } from 'lucide-react';

export default function UpiModal({
  isOpen,
  onClose,
  amount,
  recipientUpi,
  note = '',
  userName = 'Recipient',
  selectedApp = 'all',
  onSuccess
}) {
  const [activeApp, setActiveApp] = useState(selectedApp);
  const [copied, setCopied] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);

  // Sync initial app selection
  useEffect(() => {
    if (isOpen) {
      setActiveApp(selectedApp || 'all');
      setIsSuccessState(false);

      // Trigger automatic launch on open
      const url = buildUpiUrl(selectedApp || 'all');
      tryLaunchUpi(url);
    }
  }, [isOpen, selectedApp]);

  if (!isOpen) return null;

  const amtNum = parseFloat(amount) || 0;
  const amtFormatted = amtNum.toFixed(2);
  const cleanNote = note.trim() || 'TrustShield Verified Payment';

  // Determine if input is UPI ID or UPI Number (Phone / Numeric)
  const isUpiNumber = recipientUpi && !recipientUpi.includes('@') && recipientUpi.replace(/\D/g, '').length >= 8;
  const cleanDigits = recipientUpi ? recipientUpi.replace(/\D/g, '').slice(-10) : '';

  // Build standard NPCI direct UPI URI without strict package forcing (prevents Play Store redirect)
  function buildUpiUrl(appId) {
    const rawParams = {
      pa: resolvedPayeeVpa,
      pn: userName || 'Recipient',
      am: amtFormatted,
      cu: 'INR',
      tn: cleanNote,
      mode: '02',
      purpose: '00',
      orgid: '180001'
    };
    const params = new URLSearchParams(rawParams).toString();

    switch (appId) {
      case 'gpay':
        return `tez://upi/pay?${params}`;
      case 'phonepe':
        return `phonepe://pay?${params}`;
      case 'paytm':
        return `paytmmp://pay?${params}`;
      case 'bhim':
      case 'cred':
      case 'all':
      default:
        return `upi://pay?${params}`;
    }
  }

  const currentUpiUrl = buildUpiUrl(activeApp);
  const genericUpiUrl = `upi://pay?pa=${encodeURIComponent(resolvedPayeeVpa)}&pn=${encodeURIComponent(userName || 'Recipient')}&am=${amtFormatted}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;

  function tryLaunchUpi(url, appId = activeApp) {
    const targetUrl = url || buildUpiUrl(appId);
    if (!targetUrl) return;

    try {
      // Create and trigger direct link click (universal for Android & iOS)
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Also set window.location as primary trigger
      setTimeout(() => {
        try {
          window.location.href = targetUrl;
        } catch (err) {}
      }, 50);
    } catch (e) {
      console.warn('UPI Launch redirect handled:', e);
      try {
        window.location.href = targetUrl;
      } catch (err) {}
    }
  }

  const handleAppSelect = (appId) => {
    setActiveApp(appId);
    const url = buildUpiUrl(appId);
    tryLaunchUpi(url, appId);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUpiUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPayee = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(resolvedPayeeVpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCompletePayment = () => {
    setIsSuccessState(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1200);
  };

  const upiApps = [
    { id: 'all', name: 'Default UPI', color: '#6366f1', badge: 'Auto' },
    { id: 'gpay', name: 'Google Pay', color: '#4285f4', icon: '🌐' },
    { id: 'phonepe', name: 'PhonePe', color: '#5f259f', icon: '🟣' },
    { id: 'paytm', name: 'Paytm', color: '#00b9f5', icon: '🔵' },
    { id: 'bhim', name: 'BHIM UPI', color: '#00796b', icon: '🇮🇳' },
    { id: 'cred', name: 'CRED', color: '#111827', icon: '💳' }
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div className="modal-content" style={{ maxWidth: 440, textAlign: 'center', position: 'relative' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            color: 'var(--sub)',
            cursor: 'pointer',
            padding: 4
          }}
        >
          <X size={20} />
        </button>

        {isSuccessState ? (
          <div style={{ padding: '24px 0' }}>
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid var(--safe-light)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 size={40} color="var(--safe-light)" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--safe-light)', marginBottom: 6 }}>
              Payment Completed!
            </h3>
            <p style={{ fontSize: 13, color: 'var(--sub)' }}>
              ₹{amtNum.toLocaleString('en-IN')} sent securely to <span className="mono" style={{ color: 'var(--text)' }}>{recipientUpi}</span>
            </p>
          </div>
        ) : (
          <>
            {/* Header Icon */}
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(12, 18, 32, 0.8) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--indigo-light)',
              marginBottom: 12,
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
            }}>
              <Smartphone size={26} />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
              Opening UPI App...
            </h3>
            <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: isUpiNumber ? 8 : 14 }}>
              Completing ₹<span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>{amtNum.toLocaleString('en-IN')}</span> transfer to <span className="mono" style={{ color: 'var(--indigo-light)', fontWeight: 700 }}>{recipientUpi}</span>
            </p>

            {isUpiNumber && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '3px 10px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 12
              }}>
                <span>📱 NPCI Mapper: {cleanDigits} → {resolvedPayeeVpa}</span>
              </div>
            )}

            {/* Security Guarantee Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--safe-light)',
              marginBottom: 16
            }}>
              <ShieldCheck size={14} />
              <span>TrustShield Zero-Knowledge Safe Transfer</span>
            </div>

            {/* Direct App Launchers Grid */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 12,
              marginBottom: 14,
              textAlign: 'left'
            }}>
              <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tap to Open Preferred App:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {upiApps.map((app) => {
                  const targetUrl = buildUpiUrl(app.id);
                  return (
                    <a
                      key={app.id}
                      href={targetUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        handleAppSelect(app.id);
                      }}
                      style={{
                        padding: '8px 6px',
                        borderRadius: 10,
                        border: activeApp === app.id ? '1.5px solid var(--indigo-light)' : '1px solid var(--border)',
                        background: activeApp === app.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        color: 'var(--text)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        textDecoration: 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{app.icon || '⚡'}</span>
                      <span style={{ fontSize: 11 }}>{app.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* QR Code Section for Desktop / Cross-Device Scanning */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 12,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 90,
                height: 90,
                background: '#fff',
                borderRadius: 10,
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(genericUpiUrl)}&size=100x100&margin=2`}
                  alt="UPI QR Code"
                  style={{ width: '100%', height: '100%', borderRadius: 6, display: 'block' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
                  Scan on Phone Camera / UPI App
                </div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 8, lineHeight: 1.3 }}>
                  On desktop or laptop? Scan this QR code with Google Pay, PhonePe, or Paytm to pay instantly.
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCopyPayee}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: 'var(--indigo-light)',
                      borderRadius: 8,
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={12} color="var(--safe-light)" />
                        <span style={{ color: 'var(--safe-light)' }}>Copied UPI ID!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Payee UPI</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyLink}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border)',
                      color: 'var(--sub)',
                      borderRadius: 8,
                      padding: '4px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Copy size={12} />
                    <span>Copy Intent Link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={currentUpiUrl}
                onClick={(e) => {
                  e.preventDefault();
                  tryLaunchUpi(currentUpiUrl, activeApp);
                }}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, var(--indigo), var(--indigo-dark))',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Zap size={16} />
                <span>Open in {activeApp === 'all' ? 'Any UPI App' : upiApps.find(a => a.id === activeApp)?.name}</span>
              </a>

              <button
                onClick={handleCompletePayment}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: 'var(--safe-light)',
                  padding: '12px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <CheckCircle2 size={18} />
                <span>I Have Completed Payment in UPI App</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--sub)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                Cancel / Return to Shield
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
