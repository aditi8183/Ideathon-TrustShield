import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Mail,
  MessageSquare,
  Link2,
  Smartphone,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Trash2,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw,
  Search
} from 'lucide-react';
import { classifySpeechAutonomously, extractPhishingUrls } from '../data/scamKeywords';

export default function ScannerView({ onAddScam, user }) {
  const [mode, setMode] = useState('sms'); // 'sms' | 'email' | 'link' | 'upi'
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const sampleScenarios = {
    sms: [
      {
        label: '🎁 Reward Points Expiry',
        text: 'Dear customer, your credit card reward points worth Rs 9,850 will expire today. Click link to redeem into your bank: https://sbi-points-cash.xyz'
      },
      {
        label: '📱 3-Month Free Recharge',
        text: 'Free 3 Months 5G Recharge offer for Jio/Airtel users under PM Yojana. Click here to activate: http://free-recharge.in'
      },
      {
        label: '⚡ Electricity Power Cut',
        text: 'Dear consumer, your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Pay immediately via AnyDesk.'
      },
      {
        label: '🏦 Bank PAN KYC Blocked',
        text: 'Dear SBI User, your net banking is blocked due to unverified PAN. Update now & share 6-digit OTP code to avoid permanent suspension.'
      },
      {
        label: '🚗 Traffic E-Challan',
        text: 'Traffic Police: E-Challan fine of Rs 1,000 pending on vehicle DL01AB1234. Pay online to avoid court summons.'
      },
      {
        label: '✅ Safe Bank SMS',
        text: 'Dear customer, INR 2,500.00 debited from A/C XX4921 at Grocery Mart on 26-Aug. Avail Bal: INR 34,200.00 - ICICI Bank.'
      }
    ],
    email: [
      {
        label: '💵 Income Tax Refund',
        text: 'Subject: Tax Refund Approved\n\nDear Taxpayer, Income Tax Department has approved a refund of Rs 24,500 for your PAN. Click below to verify your netbanking credentials and receive your refund.'
      },
      {
        label: '🔒 Urgent Password Expiry',
        text: 'Subject: Security Notice: Password Expiring\n\nYour organization email account will be suspended in 2 hours. Download the attached security patch APK to update your credentials immediately.'
      },
      {
        label: '💼 Telegram VIP Job Offer',
        text: 'Subject: Selected for Part-Time Rating Job\n\nEarn Rs 3,000 - 8,000 daily working from home. Join Telegram VIP Task group and deposit initial Rs 1,000 for 300% guaranteed profit.'
      },
      {
        label: '✅ Safe Meeting Invite',
        text: 'Subject: Project Architecture Sync\n\nHi Team, please find attached the quarterly project review slides for our meeting tomorrow at 11 AM. Thanks!'
      }
    ],
    link: [
      {
        label: '⚠️ Fake SBI KYC Portal',
        text: 'http://sbi-pan-kyc-update.xyz/login.php'
      },
      {
        label: '⚠️ Malicious AnyDesk APK',
        text: 'https://download-remote-support-app.apk-service.top'
      },
      {
        label: '⚠️ KBC Lottery Winning Portal',
        text: 'http://kbc-lucky-draw-winner25lakh.info/claim'
      },
      {
        label: '✅ Official Govt Portal',
        text: 'https://echallan.parivahan.gov.in'
      }
    ],
    upi: [
      {
        label: '⚠️ Suspicious Lottery VPA',
        text: 'kbc.lottery.tax.claim@ybl'
      },
      {
        label: '⚠️ Electricity Scammer Number',
        text: '+91 98765 43210 (Posing as Electricity Officer)'
      },
      {
        label: '✅ Verified Merchant UPI',
        text: 'swiggy.pay@icici'
      }
    ]
  };

  const handleScan = (textToScan = input) => {
    const clean = textToScan.trim();
    if (!clean) {
      setResult(null);
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      const res = classifySpeechAutonomously(clean);
      const suspiciousUrls = extractPhishingUrls(clean);

      // Score calculation
      let score = res.confidence || (res.detected ? 90 : 10);
      if (suspiciousUrls.length > 0 && !res.detected) {
        score = 85;
      }

      setResult({
        ...res,
        score,
        isScam: res.detected || score >= 75 || suspiciousUrls.length > 0,
        suspiciousUrls
      });
      setIsScanning(false);
    }, 200);
  };

  const handleApplyScenario = (sc) => {
    setInput(sc.text);
    handleScan(sc.text);
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ marginBottom: 16, padding: '20px 16px', textAlign: 'center' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.4))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--indigo-light)',
            marginBottom: 10,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          }}
        >
          <ShieldAlert size={28} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4, color: 'var(--text)' }}>
          Universal Spam & Cyber Fraud Scanner
        </h2>
        <p style={{ fontSize: 12, color: 'var(--sub)', maxWidth: 450, margin: '0 auto' }}>
          Zero-Knowledge AI scanner for SMS messages, phishing emails, suspicious links, and cyber extortion traps.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          background: 'var(--card-inner)',
          padding: 6,
          borderRadius: 14,
          border: '1px solid var(--border)',
          marginBottom: 14
        }}
      >
        <button
          type="button"
          onClick={() => { setMode('sms'); setResult(null); }}
          style={{
            background: mode === 'sms' ? 'var(--indigo)' : 'transparent',
            color: mode === 'sms' ? '#fff' : 'var(--sub)',
            border: 'none',
            borderRadius: 10,
            padding: '8px 4px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}
        >
          <MessageSquare size={16} />
          <span>SMS Text</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('email'); setResult(null); }}
          style={{
            background: mode === 'email' ? 'var(--indigo)' : 'transparent',
            color: mode === 'email' ? '#fff' : 'var(--sub)',
            border: 'none',
            borderRadius: 10,
            padding: '8px 4px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Mail size={16} />
          <span>Email</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('link'); setResult(null); }}
          style={{
            background: mode === 'link' ? 'var(--indigo)' : 'transparent',
            color: mode === 'link' ? '#fff' : 'var(--sub)',
            border: 'none',
            borderRadius: 10,
            padding: '8px 4px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Link2 size={16} />
          <span>URL Link</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('upi'); setResult(null); }}
          style={{
            background: mode === 'upi' ? 'var(--indigo)' : 'transparent',
            color: mode === 'upi' ? '#fff' : 'var(--sub)',
            border: 'none',
            borderRadius: 10,
            padding: '8px 4px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Smartphone size={16} />
          <span>Phone / UPI</span>
        </button>
      </div>

      {/* Input Box & Scanner Action */}
      <div className="glass-card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase' }}>
            {mode === 'sms' ? 'Paste SMS / WhatsApp Message:' : mode === 'email' ? 'Paste Email Subject & Body:' : mode === 'link' ? 'Paste Website Link or APK URL:' : 'Enter Phone Number or UPI ID:'}
          </span>
          {input && (
            <button
              type="button"
              onClick={() => { setInput(''); setResult(null); }}
              style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          rows={mode === 'link' || mode === 'upi' ? 2 : 4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === 'sms'
              ? 'Paste suspicious SMS here (e.g. "Your reward points will expire today. Click link to redeem...")...'
              : mode === 'email'
              ? 'Paste email content here (e.g. "Income Tax refund approved...")...'
              : mode === 'link'
              ? 'Paste URL here (e.g. http://sbi-pan-update.xyz)...'
              : 'Enter mobile number or UPI VPA (e.g. 9876543210 or user@okhdfcbank)...'
          }
          style={{
            width: '100%',
            background: 'var(--card-inner)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 13,
            lineHeight: 1.5,
            outline: 'none',
            fontFamily: 'inherit',
            marginBottom: 10
          }}
        />

        <button
          type="button"
          onClick={() => handleScan()}
          disabled={!input.trim() || isScanning}
          className="btn-primary"
          style={{
            width: '100%',
            opacity: !input.trim() || isScanning ? 0.6 : 1,
            cursor: !input.trim() || isScanning ? 'not-allowed' : 'pointer'
          }}
        >
          {isScanning ? (
            <>
              <RefreshCw size={16} className="spin" />
              <span>Analyzing Threat Signals...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Scan for Fraud & Spam</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Test Scenario Chips */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--sub)', marginBottom: 6, textTransform: 'uppercase' }}>
          One-Click Test Scenarios:
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {(sampleScenarios[mode] || []).map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyScenario(sc)}
              style={{
                background: 'var(--card-inner)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0
              }}
            >
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Threat Result Card */}
      {result && (
        <div
          className="glass-card"
          style={{
            background: result.isScam
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.16), rgba(185, 28, 28, 0.08))'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(5, 150, 105, 0.08))',
            border: `1px solid ${result.isScam ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.4)'}`,
            padding: 16,
            borderRadius: 16,
            animation: 'fadeIn 0.25s ease'
          }}
        >
          {/* Top Verdict Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: result.isScam ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                  border: `1px solid ${result.isScam ? 'var(--danger-light)' : 'var(--safe-light)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: result.isScam ? 'var(--danger-light)' : 'var(--safe-light)'
                }}
              >
                {result.isScam ? <ShieldAlert size={26} /> : <ShieldCheck size={26} />}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: result.isScam ? 'var(--danger-light)' : 'var(--safe-light)', textTransform: 'uppercase' }}>
                  {result.isScam ? `🚨 FRAUD / SPAM DETECTED (${result.risk_level || 'HIGH'})` : '✅ VERIFIED SAFE COMMUNICATION'}
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>
                  {result.category?.name || (result.isScam ? 'Malicious Phishing Attack' : 'Clean / Legitimate')}
                </div>
                {result.category?.nameHindi && (
                  <div style={{ fontSize: 11, color: 'var(--sub)' }}>{result.category.nameHindi}</div>
                )}
              </div>
            </div>

            {/* Risk Gauge Score */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase' }}>
                RISK SCORE
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: result.isScam ? 'var(--danger-light)' : 'var(--safe-light)'
                }}
                className="mono"
              >
                {result.score}%
              </div>
            </div>
          </div>

          {/* Suspicious Phishing Links Detected */}
          {result.suspiciousUrls && result.suspiciousUrls.length > 0 && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 10,
                padding: '8px 12px',
                marginBottom: 10
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--danger-light)', marginBottom: 4 }}>
                ⚠️ High-Risk Suspicious URLs Extracted:
              </div>
              {result.suspiciousUrls.map((url, i) => (
                <div key={i} className="mono" style={{ fontSize: 11, color: 'var(--text)', wordBreak: 'break-all' }}>
                  • {url}
                </div>
              ))}
            </div>
          )}

          {/* Red Flag Keyword Tags */}
          {result.matchedPatterns && result.matchedPatterns.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', marginBottom: 4 }}>
                Detected Coercive Patterns:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {result.matchedPatterns.map((pat, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: 'var(--danger-light)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}
                  >
                    🚩 {pat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Recommendation */}
          <div
            style={{
              background: 'var(--card-inner)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 12,
              color: 'var(--text)',
              marginBottom: 10
            }}
          >
            <strong>🛡️ Recommended Action: </strong>
            {result.category?.actionPlan || result.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
