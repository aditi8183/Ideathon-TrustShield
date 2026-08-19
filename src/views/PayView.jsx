import React, { useState, useEffect } from 'react';
import { Send, ShieldAlert, AlertOctagon, CheckCircle2, QrCode, Camera, AlertTriangle, ArrowRight, Sparkles, X, UserCheck, Smartphone, Clock, Copy, ShieldCheck, HelpCircle, FileCheck2, Lock, Zap } from 'lucide-react';
import PINModal from '../components/PINModal';
import UpiModal from '../components/UpiModal';

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
  // Payment Method Selection ('online' = Launch UPI App | 'in_app' = In-App PIN Keypad)
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [selectedUpiApp, setSelectedUpiApp] = useState('all'); // 'all' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred'

  // Frequent Payees
  const [frequentPayees, setFrequentPayees] = useState([]);

  // Behavioral & Device Coercion signals
  const [isPasted, setIsPasted] = useState(paymentDraft?.isPasted || false);
  const [isOddHour, setIsOddHour] = useState(false);
  const [validationError, setValidationError] = useState('');
  // Behavioral & Device Coercion signals
 
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

  // Risk Analysis Output States
  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);
  const [coerciveSignals, setCoerciveSignals] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modal Visibility States
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isUrgentWarningOpen, setIsUrgentWarningOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);

  // Successful Payment Receipt Modal State
  const [completedTxnReceipt, setCompletedTxnReceipt] = useState(null);

  // False Positive Override Request State
  const [userOverrideNote, setUserOverrideNote] = useState('');
  const [isOverrideSubmitted, setIsOverrideSubmitted] = useState(false);
  const [trustedNomineeEmail, setTrustedNomineeEmail] = useState('');
  const [isSendingScamAlert, setIsSendingScamAlert] = useState(false);
  const [scamAlertError, setScamAlertError] = useState('');
  const [fraudAcknowledged, setFraudAcknowledged] = useState(false);
  const [scamAlertSent, setScamAlertSent] = useState(false);

  const proceedToPayment = () => {
    if (paymentMethod === 'online') {
      setIsUpiModalOpen(true);
    } else {
      setIsPinModalOpen(true);
    }
  };
  useEffect(() => {
    // Check current hour for odd-hour transaction warning (10 PM to 6 AM)
    const currentHour = new Date().getHours();
    setIsOddHour(currentHour >= 22 || currentHour < 6);
  }, []);
  useEffect(() => {
  try {
    const history = JSON.parse(
      localStorage.getItem('trustshield_payment_history') || '[]'
    );

    const counts = {};

    history.forEach((payment) => {
      if (!payment.recipientUpi) return;

      const upiKey = payment.recipientUpi.toLowerCase();

      if (!counts[upiKey]) {
        counts[upiKey] = {
          upi: payment.recipientUpi,
          count: 0,
          lastAmount: payment.amount || 0,
          note: payment.note || ''
        };
      }

      counts[upiKey].count += 1;
      counts[upiKey].lastAmount = payment.amount || 0;
      counts[upiKey].note = payment.note || '';
    });

    const sortedPayees = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setFrequentPayees(sortedPayees);
  } catch (error) {
    console.error('Unable to load payment history:', error);
  }
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
    setRiskScore(0);
    setRiskFactors([]);
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
    if (!recipientUpi.includes('@')) {
      setValidationError('Please enter a valid UPI ID (e.g. name@upi or phonepe/gpay).');
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
        score += 50;
        cSignals.push('Live Active Call');
        factors.push({
          id: 'voice_scam_category',
          label: `Coercive Voice Call Active: ${cat.name || 'Phishing Scam'}`,
          labelHindi: `सक्रिय वॉयस कॉल दबाव: ${cat.nameHindi || 'धोखाधड़ी चेतावनी'}`,
          severity: 'danger',
          score: 50
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

      if (finalScore >= 40) {
        // Flagged Transaction (Moderate or High Risk): Show Unified All-In-One Explainability Modal
        setIsBlockedModalOpen(true);
        if (onPaymentBlocked) {
          onPaymentBlocked({
            amount: amtNum,
            recipient_upi: recipientUpi,
            risk_score: finalScore,
            blocked_reason: factors.map(f => f.label).join(' + ')
          });
        }
      } else {
        // Safe: Proceed to selected payment method (UPI App or PIN)
        proceedToPayment();
      }
    }, 600);
  };

  // Safe Payment Successful PIN / UPI Handler
  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setIsUpiModalOpen(false);
    const amtNum = parseFloat(amount) || 0;
    const payeeUpi = recipientUpi || 'merchant@upi';
    const payNote = note || 'Verified Safe Payment';
    const txnId = `TS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setCompletedTxnReceipt({
      txnId,
      amount: amtNum,
      recipientUpi: payeeUpi,
      note: payNote,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    });

    if (onPaymentSuccess) {
      onPaymentSuccess(amtNum);
    }

    handleResetDraft();
  };

  const handleSendScamAlert = async () => {
    const email = trustedNomineeEmail.trim();

    if (!email) return;

    setIsSendingScamAlert(true);
    setScamAlertSent(false);
    setScamAlertError('');

    try {
const response = await fetch('/api/scam_alert', {        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount,
          recipientUpi,
          riskScore
        })
      });

const text = await response.text();
let data;

try {
  data = JSON.parse(text);
} catch {
  data = { message: text };
}
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send scam alert');
      }

      setScamAlertSent(true);
    } catch (error) {
      console.error('Scam alert error:', error);
      setScamAlertError(
        error.message || 'Unable to send scam alert'
      );
    } finally {
      setIsSendingScamAlert(false);
    }
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

       {/* Quick Send - Frequent Payees */}
<div style={{ marginBottom: 14 }}>
  <div style={{
    fontSize: 11,
    color: 'var(--sub)',
    fontWeight: 700,
    marginBottom: 6
  }}>
    QUICK SEND — FREQUENT PAYEES
  </div>

  {frequentPayees.length > 0 ? (
    <div style={{
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }}>
      {frequentPayees.map((payee) => (
        <button
          key={payee.upi}
          onClick={() =>
            fillQuickPayee(
              payee.upi,
              payee.lastAmount,
              payee.note || 'Quick Send',
              false
            )
          }
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--safe-light)',
            borderRadius: 20,
            padding: '6px 11px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          👤 {payee.upi}

          <span style={{
            marginLeft: 5,
            opacity: 0.7
          }}>
            ×{payee.count}
          </span>
        </button>
      ))}
    </div>
  ) : (
    <div style={{
      padding: 10,
      borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border)',
      color: 'var(--sub)',
      fontSize: 11
    }}>
      No frequent payees yet. They will appear here after successful payments.
    </div>
  )}
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

        {/* Payment Method Selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            SELECT PAYMENT METHOD:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: paymentMethod === 'online' ? '1.5px solid var(--indigo-light)' : '1px solid var(--border)',
                background: paymentMethod === 'online' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: paymentMethod === 'online' ? '#fff' : 'var(--sub)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: paymentMethod === 'online' ? '0 0 14px rgba(99, 102, 241, 0.25)' : 'none'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: paymentMethod === 'online' ? 'var(--indigo)' : 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}>
                <Zap size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>Pay Online</div>
                <div style={{ fontSize: 10, color: 'var(--sub)' }}>Open UPI App (GPay/PhonePe)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('in_app')}
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: paymentMethod === 'in_app' ? '1.5px solid var(--indigo-light)' : '1px solid var(--border)',
                background: paymentMethod === 'in_app' ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: paymentMethod === 'in_app' ? '#fff' : 'var(--sub)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: paymentMethod === 'in_app' ? '0 0 14px rgba(99, 102, 241, 0.25)' : 'none'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: paymentMethod === 'in_app' ? 'var(--indigo)' : 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0
              }}>
                <Lock size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>In-App PIN</div>
                <div style={{ fontSize: 10, color: 'var(--sub)' }}>Protected PIN Gateway</div>
              </div>
            </button>
          </div>
        </div>

        {/* Preferred UPI App Selector (Shown when Pay Online is selected) */}
        {paymentMethod === 'online' && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 12,
            padding: '10px 12px',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--indigo-light)' }}>
                TARGET UPI APP:
              </span>
              <span style={{ fontSize: 10, color: 'var(--sub)' }}>
                Opens directly on Pay Now
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', name: 'Auto / Default', icon: '⚡' },
                { id: 'gpay', name: 'Google Pay', icon: '🌐' },
                { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                { id: 'paytm', name: 'Paytm', icon: '🔵' },
                { id: 'bhim', name: 'BHIM', icon: '🇮🇳' },
                { id: 'cred', name: 'CRED', icon: '💳' }
              ].map(app => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedUpiApp(app.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 16,
                    border: selectedUpiApp === app.id ? '1px solid var(--indigo-light)' : '1px solid var(--border)',
                    background: selectedUpiApp === app.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedUpiApp === app.id ? '#fff' : 'var(--sub)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>{app.icon}</span>
                  <span>{app.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
            ) : paymentMethod === 'online' ? (
              <>
                <Zap size={18} />
                <span>Pay Now ₹{amount || '0'}</span>
              </>
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
        <div className="glass-card" style={{ marginTop: 14 }}>
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

          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--sub)', marginBottom: 10, marginTop: 10 }}>
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
                  proceedToPayment();
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

            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--danger-light)', marginBottom: 4 }}>
              Transaction Blocked
            </h3>

            {/* HINDI WARNING SUBTITLE FROM IMAGE 1 */}
            <div style={{ fontSize: 12, color: 'var(--warn-light)', fontWeight: 800, marginBottom: 8 }}>
              सावधान: इस भुगतान पर सुरक्षा चेतावनी जारी की गई है।
            </div>

            <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 14 }}>
              Trust Shield prevented transfer of ₹{amount} to <span className="mono">{recipientUpi}</span> to safeguard your bank account.
            </p>

            {/* RISK SCORE & SIGNAL BREAKDOWN BOX FROM IMAGE 2 */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 12,
              padding: 12,
              fontSize: 12,
              textAlign: 'left',
              color: 'var(--danger-light)',
              marginBottom: 12
            }}>
              <strong>Risk Score: {riskScore}/100</strong>
              <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                {riskFactors.map(f => <li key={f.id}>{f.label}</li>)}
              </ul>
            </div>
            {/* BEFORE CONFIRMING CHECKLIST BOX FROM IMAGE 1 */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'left',
              fontSize: 12,
              marginBottom: 16
            }}>
              <strong style={{ color: 'var(--text)' }}>Before taking action, check:</strong>
              <ul style={{ paddingLeft: 16, marginTop: 6, color: 'var(--sub)' }}>
                <li>Are you currently on a voice call asking you to transfer money?</li>
                <li>Is someone pressuring you with an urgent deadline?</li>
                <li>Legitimate banks & police NEVER demand UPI transfers over phone calls.</li>
              </ul>
            </div>

            {/* TRUSTED NOMINEE ALERT SECTION */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'left',
              marginBottom: 16
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--indigo-light)',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <UserCheck size={15} />
                <span>Trusted Nominee Alert</span>
              </div>

              <p style={{
                fontSize: 11,
                color: 'var(--sub)',
                marginBottom: 10
              }}>
                Notify your trusted nominee about this suspicious payment attempt.
              </p>

              <div style={{
                display: 'flex',
                gap: 6,
                marginBottom: 10
              }}>
                <input
                  type="email"
                  className="input-field"
                  value={trustedNomineeEmail}
                  onChange={(e) => setTrustedNomineeEmail(e.target.value)}
                  placeholder="Trusted nominee email"
                  style={{
                    fontSize: 11,
                    padding: '7px 10px',
                    flex: 1
                  }}
                />

                <button
                  onClick={handleSendScamAlert}
                  disabled={
                    !trustedNomineeEmail.trim() || isSendingScamAlert
                  } style={{
                    background: 'var(--indigo)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 10px',
                    fontSize: 11,
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    cursor: trustedNomineeEmail.trim() ? 'pointer' : 'not-allowed',
                    opacity: trustedNomineeEmail.trim() ? 1 : 0.5
                  }}
                >
                  {isSendingScamAlert ? 'Sending...' : 'Send Scam Alert'}    </button>
              </div>

              {scamAlertSent && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--safe-light)',
                  padding: 8,
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 10
                }}>
                  <CheckCircle2
                    size={14}
                    style={{
                      display: 'inline',
                      marginRight: 5,
                      verticalAlign: 'middle'
                    }}
                  />
                  Scam alert sent to the trusted nominee.
                </div>
              )}
              {scamAlertError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--danger-light)',
                    padding: 8,
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 10
                  }}
                >
                  ⚠️ {scamAlertError}
                </div>
              )}

              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                fontSize: 11,
                color: 'var(--danger-light)',
                lineHeight: 1.5
              }}>
                ⚠️ WARNING suspicious activity was detected.

              </div>

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 11,
                color: 'var(--sub)',
                cursor: 'pointer',
                marginBottom: 12
              }}>
                <input
                  type="checkbox"
                  checked={fraudAcknowledged}
                  onChange={(e) => setFraudAcknowledged(e.target.checked)}
                  style={{
                    marginTop: 2,
                    cursor: 'pointer'
                  }}
                />

                <span>
                  I understand the fraud warning and all the terms and conditions.
                  I still want to continue with this payment.
                </span>
              </label>

              <button
                className="btn-primary"
                disabled={!fraudAcknowledged}
                onClick={() => {
                  setIsBlockedModalOpen(false);
                  proceedToPayment();
                }}
                style={{
                  width: '100%',
                  opacity: fraudAcknowledged ? 1 : 0.45,
                  cursor: fraudAcknowledged ? 'pointer' : 'not-allowed',
                  marginBottom: 8
                }}
              >
                Proceed
              </button>
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

      {/* COMPLETED SAFE PAYMENT RECEIPT MODAL */}
      {completedTxnReceipt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 20,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--safe-light)',
              marginBottom: 14
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--safe-light)', marginBottom: 4 }}>
              Payment Successful!
            </h3>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 16 }}>
              Verified Safe Transaction via Trust Shield Zero-Knowledge Engine
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 18,
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>Amount Paid</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--safe-light)' }} className="mono">
                  ₹{completedTxnReceipt.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>Paid To</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }} className="mono">
                  {completedTxnReceipt.recipientUpi}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>Txn Reference</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--indigo-light)' }} className="mono">
                  {completedTxnReceipt.txnId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--sub)' }}>Time</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {completedTxnReceipt.date} at {completedTxnReceipt.time}
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--gold)',
              padding: 10,
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}>
              <Sparkles size={16} />
              <span>+25 Guardian Points Awarded!</span>
            </div>

            <button
              className="btn-primary"
              onClick={() => setCompletedTxnReceipt(null)}
              style={{ width: '100%' }}
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* UPI Intent Launcher Modal */}
      <UpiModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        amount={amount}
        recipientUpi={recipientUpi}
        note={note}
        userName={safeUser.name}
        selectedApp={selectedUpiApp}
        onSuccess={handlePinSuccess}
      />

      {/* PIN Entry Modal */}
      <PINModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        amount={amount}
        recipientUpi={recipientUpi}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
}
