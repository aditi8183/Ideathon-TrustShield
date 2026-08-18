import React, { useState, useEffect } from 'react';
import { Send, ShieldAlert, AlertOctagon, CheckCircle2, QrCode, Camera, AlertTriangle, ArrowRight, Sparkles, X, UserCheck, Smartphone, Clock, Copy, ShieldCheck, HelpCircle } from 'lucide-react';
import PINModal from '../components/PINModal';

export default function PayView({
  user,
  scamList = [],
  detectedScamCall,
  onPaymentBlocked,
  onPaymentSuccess,
  paymentDraft,
  onUpdatePaymentDraft,
  onClearPaymentDraft
}) {
  // Safe user fallback defaults
  const safeUser = user || {
    id: 'u042',
    name: 'Aditi Sharma',
    bank_name: 'ICICI Bank',
    avg_transaction_amount: 2500,
    total_saved: 48500,
    guardian_points: 1250,
    current_device: 'Chrome on Windows 11',
    is_new_device: true
  };

  const [recipientUpi, setRecipientUpi] = useState(paymentDraft?.recipientUpi || '');
  const [amount, setAmount] = useState(paymentDraft?.amount || '');
  const [note, setNote] = useState(paymentDraft?.note || '');

  // Behavioral & Device Coercion signals
  const [isPasted, setIsPasted] = useState(paymentDraft?.isPasted || false);
  const [isOddHour, setIsOddHour] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Keep state synchronized with persistent paymentDraft prop
  useEffect(() => {
    if (paymentDraft) {
      if (paymentDraft.recipientUpi !== undefined && paymentDraft.recipientUpi !== recipientUpi) {
        setRecipientUpi(paymentDraft.recipientUpi);
      }
      if (paymentDraft.amount !== undefined && paymentDraft.amount !== amount) {
        setAmount(paymentDraft.amount);
      }
      if (paymentDraft.note !== undefined && paymentDraft.note !== note) {
        setNote(paymentDraft.note);
      }
      if (paymentDraft.isPasted !== undefined) {
        setIsPasted(paymentDraft.isPasted);
      }
    }
  }, [paymentDraft]);

  // Modals & Analysis
  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);
  const [coerciveSignals, setCoerciveSignals] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modal Visibility States
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isUrgentWarningOpen, setIsUrgentWarningOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);

  // False Positive Override Request State
  const [userOverrideNote, setUserOverrideNote] = useState('');
  const [isOverrideSubmitted, setIsOverrideSubmitted] = useState(false);

  useEffect(() => {
    // Check current hour for odd-hour transaction warning (10 PM to 6 AM)
    const currentHour = new Date().getHours();
    setIsOddHour(currentHour >= 22 || currentHour < 6);
  }, []);

  const handleUpiChange = (e) => {
    const val = e.target.value;
    setRecipientUpi(val);
    if (onUpdatePaymentDraft) {
      onUpdatePaymentDraft({ recipientUpi: val, amount, note, isPasted });
    }
    if (validationError) setValidationError('');
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    if (onUpdatePaymentDraft) {
      onUpdatePaymentDraft({ recipientUpi, amount: val, note, isPasted });
    }
    if (validationError) setValidationError('');
  };

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);
    if (onUpdatePaymentDraft) {
      onUpdatePaymentDraft({ recipientUpi, amount, note: val, isPasted });
    }
  };

  const handleUpiPaste = () => {
    setIsPasted(true);
    if (onUpdatePaymentDraft) {
      onUpdatePaymentDraft({ recipientUpi, amount, note, isPasted: true });
    }
  };

  const handleResetDraft = () => {
    setRecipientUpi('');
    setAmount('');
    setNote('');
    setIsPasted(false);
    setValidationError('');
    if (onClearPaymentDraft) {
      onClearPaymentDraft();
    }
  };

  // Quick Payee Selectors
  const fillQuickPayee = (upi, amt, payNote, pasted = false) => {
    setRecipientUpi(upi);
    setAmount(String(amt));
    setNote(payNote);
    setIsPasted(pasted);
    if (onUpdatePaymentDraft) {
      onUpdatePaymentDraft({ recipientUpi: upi, amount: String(amt), note: payNote, isPasted: pasted });
    }
    setValidationError('');
  };

  // QR Code Scanner Simulation
  const handleScanQrCode = () => {
    setIsQrScannerOpen(true);
    setIsScanningQr(true);

    setTimeout(() => {
      setIsScanningQr(false);
      fillQuickPayee('starbucks.coffee@icici', 450, 'Coffee & Snacks Scan', false);
      setTimeout(() => {
        setIsQrScannerOpen(false);
      }, 800);
    }, 1500);
  };

  // Run Zero-Knowledge AI Risk & Coercion Engine
  const runRiskAnalysis = () => {
    if (!recipientUpi.trim()) {
      setValidationError('Please enter a Recipient UPI ID or tap a Quick Payee.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setValidationError('Please enter a valid amount in ₹.');
      return;
    }

    setValidationError('');
    setIsAnalyzing(true);
    setIsOverrideSubmitted(false);

    setTimeout(() => {
      let score = 0;
      const factors = [];
      const cSignals = [];
      const amtNum = parseFloat(amount) || 0;
      const userAvg = safeUser.avg_transaction_amount || 2500;

      // 1. Live Call Coercion Pattern (Vishing Call Active)
      if (detectedScamCall && detectedScamCall.category) {
        const cat = detectedScamCall.category;
        score += 45;
        cSignals.push('Live Active Call');
        factors.push({
          id: 'voice_scam_category',
          label: `Coercive Voice Call Active: ${cat.name || 'Phishing Scam'}`,
          labelHindi: `सक्रिय वॉयस कॉल दबाव: ${cat.nameHindi || 'धोखाधड़ी चेतावनी'}`,
          severity: 'danger',
          score: 45
        });
      }

      // 2. Blacklist Check against community fraud DB
      const safeScamList = scamList || [];
      const isBlacklisted = safeScamList.some(s =>
        (s.upi_ids || []).some(u => u.toLowerCase() === recipientUpi.toLowerCase())
      ) || recipientUpi.toLowerCase().includes('fraud') || recipientUpi.toLowerCase().includes('trai');

      if (isBlacklisted) {
        score += 55;
        cSignals.push('Blacklisted Fraud Payee');
        factors.push({
          id: 'blacklisted_upi',
          label: 'Matches community fraud database',
          labelHindi: 'सक्रिय धोखाधड़ी UPI डेटाबेस से मेल खाता है',
          severity: 'danger',
          score: 55
        });
      }

      // 3. Amount Anomaly & Coercive Spike Signal
      const isHighAmount = amtNum > 50000 || amtNum > (userAvg * 5);
      if (isHighAmount) {
        score += 25;
        cSignals.push('Amount Spike Escalation');
        factors.push({
          id: 'amount_anomaly',
          label: `Coercive Amount Spike (₹${amtNum.toLocaleString('en-IN')} vs avg ₹${userAvg})`,
          labelHindi: `असामान्य रूप से बड़ी राशि (औसत ₹${userAvg} से अधिक)`,
          severity: 'danger',
          score: 25
        });
      }

      // 4. Device Fingerprint Change Signal
      if (safeUser.is_new_device) {
        score += 15;
        cSignals.push('New Device Anomaly');
        factors.push({
          id: 'new_device',
          label: `Device Change Detected: ${safeUser.current_device || 'Unrecognized Device'}`,
          labelHindi: `नए / अपरिचित उपकरण से प्रयास`,
          severity: 'warn',
          score: 15
        });
      }

      // 5. Interaction Clipboard Pattern (Pasted UPI)
      if (isPasted) {
        score += 15;
        cSignals.push('Clipboard Paste Interaction');
        factors.push({
          id: 'pasted_upi',
          label: 'UPI ID pasted from clipboard — possible copy-paste coercion',
          labelHindi: 'UPI ID क्लिपबोर्ड से पेस्ट की गई — पहचान की जांच करें',
          severity: 'warn',
          score: 15
        });
      }

      // 6. First-time Transfer Warning
      if (recipientUpi && !recipientUpi.includes('aditi')) {
        score += 10;
        cSignals.push('First-Time Transfer');
        factors.push({
          id: 'first_time_payee',
          label: 'First-time transfer to this recipient',
          labelHindi: 'इस पते पर पहला लेनदेन',
          severity: 'info',
          score: 10
        });
      }

      // 7. Late Night Panic Hours
      if (isOddHour) {
        score += 10;
        cSignals.push('Late Night Hours');
        factors.push({
          id: 'odd_hours',
          label: 'Late night transaction attempt (10 PM - 6 AM)',
          labelHindi: 'असामान्य देर रात के समय में लेनदेन',
          severity: 'warn',
          score: 10
        });
      }

      const finalScore = Math.min(100, score);
      setRiskScore(finalScore);
      setRiskFactors(factors);
      setCoerciveSignals(cSignals);
      setIsAnalyzing(false);

      if (finalScore >= 70) {
        // High Risk: Block Payment
        setIsBlockedModalOpen(true);
        if (onPaymentBlocked) {
          onPaymentBlocked({
            amount: amtNum,
            recipient_upi: recipientUpi,
            risk_score: finalScore,
            blocked_reason: factors.map(f => f.label).join(' + ')
          });
        }
      } else if (finalScore >= 40) {
        // Moderate Risk: Deliver Understandable Warning & Support User Confirmation for Urgent Payments
        setIsUrgentWarningOpen(true);
      } else {
        // Safe: Open PIN Modal directly
        setIsPinModalOpen(true);
      }
    }, 600);
  };

  // Submit False Positive Request to Bank Risk Officer Console
  const handleSubmitFalsePositive = () => {
    if (!userOverrideNote.trim()) return;
    setIsOverrideSubmitted(true);
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'var(--danger-light)';
    if (score >= 40) return 'var(--warn-light)';
    return 'var(--safe-light)';
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Device Fingerprint Security Badge */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '8px 12px',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--sub)' }}>
          <Smartphone size={14} color="var(--indigo-light)" />
          <span>Device: <strong>{safeUser.current_device || 'Chrome on Windows'}</strong></span>
        </div>
        {safeUser.is_new_device && (
          <span style={{
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--warn-light)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '2px 6px',
            borderRadius: 4,
            fontWeight: 800
          }}>
            New Device Signal
          </span>
        )}
      </div>

      {/* Live Voice Phishing Banner Alert (If Active Call Flagged) */}
      {detectedScamCall && detectedScamCall.category && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(12, 18, 32, 0.95))',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 16,
          padding: 12,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <AlertOctagon size={24} color="var(--danger-light)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--danger-light)' }}>
              LIVE VOICE SCAM WARNING: {detectedScamCall.category.name || 'Vishing Call'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--sub)' }}>
              Speech engine flagged coercion terms. Any transfer will be blocked to protect your money.
            </div>
          </div>
        </div>
      )}

      {/* Main Payment Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900 }}>UPI Payment Scanner</h2>

          {/* QR Code Scanner Button */}
          <button
            onClick={handleScanQrCode}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: 'var(--indigo-light)',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <QrCode size={16} />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Quick Payee Selection Bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 700, marginBottom: 6 }}>
            QUICK TAP DEMO PAYEES:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => fillQuickPayee('starbucks.coffee@icici', 350, 'Coffee Payment', false)}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--safe-light)',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ☕ Cafe Coffee (Safe)
            </button>

            <button
              onClick={() => fillQuickPayee('landlord.rent@hdfc', 15000, 'House Rent', false)}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: 'var(--indigo-light)',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🏠 Rent Transfer (Safe)
            </button>

            <button
              onClick={() => fillQuickPayee('trai.verify@fraudster', 18500, 'Customs Fee Clearance', true)}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger-light)',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🚨 TRAI Scam (Fraud)
            </button>
          </div>
        </div>

        {/* Input Form */}
        <div className="input-group">
          <label className="input-label">Recipient UPI ID</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-field mono"
              value={recipientUpi}
              onChange={handleUpiChange}
              onPaste={handleUpiPaste}
              placeholder="name@upi / phonepe / gpay"
            />
            {isPasted && (
              <span style={{
                position: 'absolute',
                right: 10,
                top: 10,
                fontSize: 10,
                fontWeight: 800,
                color: 'var(--warn-light)',
                background: 'rgba(245, 158, 11, 0.15)',
                padding: '2px 6px',
                borderRadius: 4
              }}>
                PASTED
              </span>
            )}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Amount (₹)</label>
          <input
            type="number"
            className="input-field mono"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            style={{ fontSize: 18, fontWeight: 800 }}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Payment Note (Optional)</label>
          <input
            type="text"
            className="input-field"
            value={note}
            onChange={handleNoteChange}
            placeholder="e.g. Rent, Clearance Fee, Shopping"
          />
        </div>

        {validationError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger-light)',
            padding: 10,
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 12
          }}>
            ⚠️ {validationError}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            onClick={runRiskAnalysis}
            disabled={isAnalyzing}
            style={{ flex: 1, marginTop: 8 }}
          >
            {isAnalyzing ? (
              <span>Analyzing Zero-Knowledge Risk & Coercion Signals...</span>
            ) : (
              <>
                <Send size={18} />
                <span>Scan & Pay ₹{amount || '0'}</span>
              </>
            )}
          </button>

          {(recipientUpi || amount || note) && (
            <button
              onClick={handleResetDraft}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: 'var(--sub)',
                fontSize: 11,
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 10,
                marginTop: 8,
                cursor: 'pointer'
              }}
            >
              Clear Form
            </button>
          )}
        </div>
      </div>

      {/* Live AI Risk & Behavioral Signals Output */}
      {riskFactors.length > 0 && (
        <div className="glass-card">
          <div className="risk-meter" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 700 }}>ZERO-KNOWLEDGE AI RISK SCORE</div>
              <div className="risk-score-display" style={{ color: getRiskColor(riskScore) }}>
                {riskScore}/100
              </div>
            </div>
            <div className="risk-level-tag" style={{
              background: riskScore >= 70 ? 'rgba(239, 68, 68, 0.2)' : riskScore >= 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: getRiskColor(riskScore),
              border: `1px solid ${getRiskColor(riskScore)}`
            }}>
              {riskScore >= 70 ? 'HIGH RISK (BLOCKED)' : riskScore >= 40 ? 'MODERATE RISK (CONFIRMATION)' : 'SAFE'}
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--sub)', marginBottom: 10 }}>
            COERCIVE & BEHAVIORAL INTERACTION SIGNALS:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {riskFactors.map((factor) => (
              <div
                key={factor.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 10,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10
                }}
              >
                <AlertTriangle
                  size={16}
                  color={factor.severity === 'danger' ? 'var(--danger-light)' : 'var(--warn-light)'}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{factor.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--sub)' }}>{factor.labelHindi}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Scanner Camera Simulator Modal */}
      {isQrScannerOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 900 }}>Scan Merchant QR Code</div>
              <button
                onClick={() => setIsQrScannerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              width: '100%',
              height: 220,
              borderRadius: 16,
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px dashed var(--indigo-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 16
            }}>
              <Camera size={48} color="var(--indigo-light)" className="pulse" />
              <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 12 }}>
                {isScanningQr ? 'Aligning QR Code...' : 'QR Code Detected!'}
              </div>

              {/* Scanning Crosshair */}
              <div style={{
                position: 'absolute',
                inset: 30,
                border: '2px solid var(--safe-light)',
                borderRadius: 12,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }} />
            </div>

            {isScanningQr ? (
              <div style={{ fontSize: 13, color: 'var(--indigo-light)', fontWeight: 700 }}>
                Extracting Merchant UPI & Amount...
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--safe-light)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle2 size={16} />
                <span>Extracted: starbucks.coffee@icici (₹450)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODERATE RISK: Understandable Warning & Urgent Payment Confirmation Modal */}
      {isUrgentWarningOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: 420 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warn-light)',
              marginBottom: 14
            }}>
              <AlertTriangle size={30} />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--warn-light)', marginBottom: 6 }}>
              Security Warning: Confirm Payment
            </h3>
            <div style={{ fontSize: 12, color: 'var(--warn-light)', fontWeight: 700, marginBottom: 12 }}>
              सावधान: इस भुगतान पर सुरक्षा चेतावनी जारी की गई है।
            </div>

            <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 16, lineHeight: '1.4' }}>
              This transfer of ₹{amount} to <span className="mono">{recipientUpi}</span> triggered security flags (First-time transfer / New Device / Odd Hours).
            </p>

            {/* Understandable Warning Points */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'left',
              fontSize: 12,
              marginBottom: 20
            }}>
              <strong style={{ color: 'var(--text)' }}>Before confirming, check:</strong>
              <ul style={{ paddingLeft: 16, marginTop: 6, color: 'var(--sub)' }}>
                <li>Are you currently on a voice call asking you to transfer money?</li>
                <li>Is someone pressuring you with an urgent deadline?</li>
                <li>Legitimate banks & police NEVER demand UPI transfers over phone calls.</li>
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={() => setIsUrgentWarningOpen(false)}
              >
                Cancel Payment
              </button>

              <button
                className="btn-primary"
                onClick={() => {
                  setIsUrgentWarningOpen(false);
                  setIsPinModalOpen(true);
                }}
                style={{ background: 'var(--indigo)' }}
              >
                Confirm Urgent Payment →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH RISK: Transaction Blocked & Bank False Positive Override Review Modal */}
      {isBlockedModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: 440 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 20,
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--danger-light)',
              marginBottom: 14
            }}>
              <AlertOctagon size={32} />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--danger-light)', marginBottom: 6 }}>
              Transaction Blocked
            </h3>
            <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 14 }}>
              Trust Shield prevented transfer of ₹{amount} to <span className="mono">{recipientUpi}</span> to safeguard your bank account.
            </p>

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 12,
              padding: 12,
              fontSize: 12,
              textAlign: 'left',
              color: 'var(--danger-light)',
              marginBottom: 16
            }}>
              <strong>Risk Score: {riskScore}/100</strong>
              <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                {riskFactors.map(f => <li key={f.id}>{f.label}</li>)}
              </ul>
            </div>

            {/* FALSE POSITIVE / INSTITUTIONAL OVERRIDE SECTION */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'left',
              marginBottom: 16
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--indigo-light)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <HelpCircle size={14} />
                <span>Is this a False Positive / Legitimate Payment?</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 8 }}>
                If this is a legitimate urgent medical bill or family emergency transfer, submit a note for your Bank Cyber Risk Officer to review & override:
              </p>

              {isOverrideSubmitted ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: 'var(--safe-light)',
                  padding: 10,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: 'center'
                }}>
                  <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6 }} />
                  False Positive Review Case submitted to Bank Cyber Risk Officer!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    className="input-field"
                    value={userOverrideNote}
                    onChange={(e) => setUserOverrideNote(e.target.value)}
                    placeholder="e.g. Legitimate hospital deposit for brother"
                    style={{ fontSize: 11, padding: '6px 10px' }}
                  />
                  <button
                    onClick={handleSubmitFalsePositive}
                    style={{
                      background: 'var(--indigo)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>

            <button className="btn-primary" onClick={() => setIsBlockedModalOpen(false)}>
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* PIN Entry Modal */}
      <PINModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        amount={amount}
        recipientUpi={recipientUpi}
        onSuccess={() => {
          if (onPaymentSuccess) onPaymentSuccess(parseFloat(amount));
          setAmount('');
          setRecipientUpi('');
          setNote('');
          setRiskFactors([]);
        }}
      />
    </div>
  );
}
