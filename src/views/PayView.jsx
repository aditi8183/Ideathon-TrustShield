import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Send,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  QrCode,
  Camera,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  X,
  UserCheck,
  Smartphone,
  Clock,
  Copy,
  ShieldCheck,
  HelpCircle,
  Bell,
  Lock,
  Zap
} from 'lucide-react';

import PINModal from '../components/PINModal';
import UpiModal from '../components/UpiModal';
import { sendNomineeScamAlert } from '../utils/smsService';

export default function PayView({
  user,
  scamList = [],
  detectedScamCall,
  onPaymentBlocked,
  onPaymentSuccess,
  paymentDraft,
  onUpdatePaymentDraft,
  onClearPaymentDraft
}) 
{
  // Safe user fallback defaults
 const safeUser = user;

  const [recipientUpi, setRecipientUpi] = useState(paymentDraft?.recipientUpi || '');
  const [amount, setAmount] = useState(paymentDraft?.amount || '');
  const [note, setNote] = useState(paymentDraft?.note || '');
  const [frequentPayees, setFrequentPayees] = useState([]);
  const [isPasted, setIsPasted] = useState(paymentDraft?.isPasted || false);
  const [isOddHour, setIsOddHour] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Payment Method & Target App Selector State
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'in_app'
  const [selectedUpiApp, setSelectedUpiApp] = useState('all'); // 'all' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred'

  // False Positive Override & Nominee State
  const [userOverrideNote, setUserOverrideNote] = useState('');
  const [isOverrideSubmitted, setIsOverrideSubmitted] = useState(false);
  const [scamAlertSent, setScamAlertSent] = useState(false);

  // Modals & Analysis State
  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);
  const [coerciveSignals, setCoerciveSignals] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [completedTxnReceipt, setCompletedTxnReceipt] = useState(null);

  // QR Scanner State
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Load frequent payees from local storage
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('trustshield_payment_history') || '[]');
      const counts = {};
      history.forEach((payment) => {
        const upi = payment.recipient_upi || payment.recipientUpi || payment.upi;
        if (upi) counts[upi] = (counts[upi] || 0) + 1;
      });
      const topPayees = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([upi, count]) => ({ upi, count }));
      setFrequentPayees(topPayees);
    } catch (error) {
      console.warn('Unable to load payment history:', error);
    }
  }, []);

  useEffect(() => {
    const currentHour = new Date().getHours();
    setIsOddHour(currentHour >= 22 || currentHour < 6);
  }, []);

  // Sync state with persistent paymentDraft prop
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

  // QR Scanner Handlers
  const stopQrScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanningQr(false);
    setIsQrScannerOpen(false);
  };

  const handleScanQrCode = async () => {
    setIsQrScannerOpen(true);
    setIsScanningQr(true);

    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            let extractedUpi = decodedText;
            let extractedAmount = '';
            let extractedNote = '';

            // Real parsing of standard UPI URI schemes: upi://pay?pa=address@bank&am=100&tn=note
            if (decodedText.startsWith('upi://pay') || decodedText.includes('pa=')) {
              try {
                const urlString = decodedText.startsWith('upi://') 
                  ? decodedText 
                  : `upi://pay?${decodedText}`;
                const url = new URL(urlString);
                
                extractedUpi = url.searchParams.get('pa') || extractedUpi;
                extractedAmount = url.searchParams.get('am') || '';
                extractedNote = url.searchParams.get('tn') || url.searchParams.get('pn') || '';
              } catch (e) {
                console.warn('Malformed UPI string parsed, using raw text:', e);
              }
            }

            fillQuickPayee(extractedUpi, extractedAmount, extractedNote, false);
            stopQrScanner();
          },
          () => {}
        );
      } catch (err) {
        console.error('Failed to start QR camera scanner:', err);
        setIsScanningQr(false);
      }
    }, 300);
  };

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

  const fillQuickPayee = (upi, amt, payNote, pasted = false) => {
    setRecipientUpi(upi);
    if (amt) setAmount(String(amt));
    if (payNote) setNote(payNote);
    setIsPasted(pasted);
    if (onUpdatePaymentDraft) {
      onUpdatePaymentDraft({ recipientUpi: upi, amount: amt ? String(amt) : amount, note: payNote || note, isPasted: pasted });
    }
    setValidationError('');
  };

  const proceedToPayment = () => {
    if (paymentMethod === 'online') {
      setIsUpiModalOpen(true);
    } else {
      setIsPinModalOpen(true);
    }
  };

  // Zero-Knowledge Risk & Coercion Scanner
  const runRiskAnalysis = () => {
    setValidationError('');
    setIsOverrideSubmitted(false);
    setScamAlertSent(false);

    if (!recipientUpi || !recipientUpi.trim()) {
      setValidationError('Please enter a valid recipient UPI ID (e.g. name@oksbi).');
      return;
    }
    if (!recipientUpi.includes('@')) {
      setValidationError('UPI ID must contain "@" (e.g. name@bank).');
      return;
    }
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      setValidationError('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      let score = 0;
      const factors = [];
      const cSignals = [];

      // 1. Live Voice Call Coercion Signal
      if (detectedScamCall && detectedScamCall.category) {
        score += 85;
        cSignals.push('Live Voice Call Active');
        factors.push({
          id: 'vishing_active',
          label: `Coercive Voice Call Active: ${detectedScamCall.category.name}`,
          labelHindi: `सक्रिय वॉयस कॉल घोटाला: ${detectedScamCall.category.name}`,
          severity: 'danger',
          score: 85
        });
      }

      // 2. Blacklisted Fraud Database Match
      const matchedScam = (scamList || []).find(s => s.upi_id && s.upi_id.toLowerCase() === recipientUpi.toLowerCase().trim());
if (matchedScam) {
  score += 90;
        cSignals.push('Fraud Database Match');
        factors.push({
          id: 'blacklist_match',
          label: `Matches Community Fraud Database (${matchedScam ? matchedScam.scam_type : 'Reported UPI'})`,
          labelHindi: `सामुदायिक फ्रॉड डेटाबेस से मेल खाता है`,
          severity: 'danger',
          score: 90
        });
      }

      // 3. Amount Anomaly
const averageTransactionAmount =
  Number(safeUser.avg_transaction_amount) || 0;

if (
  averageTransactionAmount > 0 &&
  amtNum > averageTransactionAmount * 4
)    {    
  score += 25;
        cSignals.push('High Amount Anomaly');
        factors.push({
          id: 'amount_anomaly',
label: averageTransactionAmount > 0
  ? `Coercive Amount Spike (₹${amtNum.toLocaleString('en-IN')} vs average ₹${averageTransactionAmount.toLocaleString('en-IN')})`
  : `Unusually large payment amount: ₹${amtNum.toLocaleString('en-IN')}`,
          labelHindi: `असामान्य रूप से बड़ी राशि का स्थानांतरण`,
          severity: 'warn',
          score: 25
        });
      }

      // 4. New Device Fingerprint Signal
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

      // 5. Clipboard Paste Signal
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
    // Get payment history
    const getPaymentHistory = () => {
  try {
    return JSON.parse(
      localStorage.getItem('trustshield_payment_history') || '[]'
    );
  } catch {
    return [];
  }
};

     // 6. First-time Transfer
const paymentHistory = getPaymentHistory();

const hasPaidRecipient = paymentHistory.some(
  payment =>
    (payment.recipient_upi || '').toLowerCase().trim() ===
    recipientUpi.toLowerCase().trim()
);

if (!hasPaidRecipient) {
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

      // 7. Late Night Hours
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
        setIsBlockedModalOpen(true);

const nominee = safeUser?.trusted_nominee;
if (nominee?.enabled && nominee?.phone) {
  sendNomineeScamAlert({
            nomineeName: nominee.name,
            nomineePhone: nominee.phone,
userName: safeUser.name || 'User',
            scamCategory: detectedScamCall?.category?.name || (factors[0] ? factors[0].label : 'High Risk Cyber Fraud'),
            blockedAmount: amtNum,
            recipientUpi: recipientUpi,
            riskScore: finalScore
          });
          setScamAlertSent(true);
        }

        if (onPaymentBlocked) {
          onPaymentBlocked({
            amount: amtNum,
            recipient_upi: recipientUpi,
            risk_score: finalScore,
            blocked_reason: factors.map(f => f.label).join(' + ')
          });
        }
      } else {
        proceedToPayment();
      }
    }, 600);
  };

  const handleSubmitFalsePositive = () => {
    if (!userOverrideNote.trim()) return;
    setIsOverrideSubmitted(true);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setIsUpiModalOpen(false);

    const amtNum = parseFloat(amount) || 0;

    const receiptData = {
      txnId: `TS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: amtNum,
      recipientUpi: recipientUpi.trim(),
      note: note.trim() || 'Verified Safe Payment',
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setCompletedTxnReceipt(receiptData);

    try {
      const history = JSON.parse(localStorage.getItem('trustshield_payment_history') || '[]');
      const newPayment = { recipient_upi: recipientUpi.trim(), amount: amtNum, timestamp: new Date().toISOString() };
      const updatedHistory = [newPayment, ...history].slice(0, 100);
      localStorage.setItem('trustshield_payment_history', JSON.stringify(updatedHistory));

      const counts = {};
      updatedHistory.forEach((p) => {
        const u = p.recipient_upi || p.recipientUpi || p.upi;
        if (u) counts[u] = (counts[u] || 0) + 1;
      });
      const topPayees = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([u, count]) => ({ upi: u, count }));
      setFrequentPayees(topPayees);
    } catch (e) {}

    if (onPaymentSuccess) {
      onPaymentSuccess(amtNum);
    }

    handleResetDraft();
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Main Payment Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900 }}>UPI Payment Scanner</h2>

          {/* Camera QR Code Scanner Button */}
          <button
            type="button"
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
            <Camera size={16} />
            <span>Scan Camera QR</span>
          </button>
        </div>

        {/* Quick Payee Selection Bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 700, marginBottom: 6 }}>
            QUICK SEND — FREQUENT PAYEES:
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {frequentPayees.length > 0 ? (
              frequentPayees.map((payee) => (
                <button
                  key={payee.upi}
                  type="button"
                  onClick={() => fillQuickPayee(payee.upi, '', 'Quick Payment', false)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: 'var(--safe-light)',
                    borderRadius: 20,
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title={`${payee.upi} — ${payee.count} previous payments`}
                >
                  <Smartphone size={11} />
                  <span>{payee.upi}</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>x{payee.count}</span>
                </button>
              ))
            ) : (
              
               <span
  style={{
    fontSize: 12,
    color: 'var(--text-secondary)',
    fontWeight: 600
  }}
>
  No frequent payees yet. Your frequent recipients will appear here after you make payments.
</span>
       
            )}
          </div>
        </div>
                  
                
                
        {/* Input Form */}
        <div className="input-group">
          <label className="input-label">RECIPIENT UPI ID</label>
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
          <label className="input-label">AMOUNT (₹)</label>
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
          <label className="input-label">PAYMENT NOTE (OPTIONAL)</label>
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

        {/* SELECT PAYMENT METHOD SECTION */}
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

        {/* TARGET UPI APP SECTION */}
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

        {/* Main Pay Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-primary"
            onClick={runRiskAnalysis}
            disabled={isAnalyzing}
            style={{ flex: 1, marginTop: 8, padding: '12px 16px', fontSize: 15, fontWeight: 900 }}
          >
            {isAnalyzing ? (
              <span>Analyzing Zero-Knowledge Risk...</span>
            ) : (
              <>
                <Zap size={18} />
                <span>Pay Now ₹{amount || '0'}</span>
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

      {/* UNIFIED ALL-IN-ONE EXPLAINABILITY MODAL */}
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

            <div style={{ fontSize: 12, color: 'var(--warn-light)', fontWeight: 800, marginBottom: 8 }}>
              सावधान: इस भुगतान पर सुरक्षा चेतावनी जारी की गई है।
            </div>

            <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 14 }}>
              Trust Shield prevented transfer of ₹{amount} to <span className="mono">{recipientUpi}</span> to safeguard your bank account.
            </p>

            {scamAlertSent && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--safe-light)',
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 800,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textAlign: 'left'
              }}>
                <Bell size={16} color="var(--safe-light)" style={{ flexShrink: 0 }} />
                <div>
                  <div>Real-Time Emergency SMS Alert Sent!</div>
                  <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.85 }}>
Sent to: {safeUser?.trusted_nominee?.name || 'Trusted nominee'}
{' '}
({safeUser?.trusted_nominee?.phone || 'No phone number registered'})                  </div>
                </div>
              </div>
            )}

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
                    style={{ fontSize: 12, padding: '6px 10px' }}
                    placeholder="Provide context (e.g., Hospital payment)"
                    value={userOverrideNote}
                    onChange={(e) => setUserOverrideNote(e.target.value)}
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
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid var(--border)' }}
              onClick={() => setIsBlockedModalOpen(false)}
            >
              Cancel Payment & Stay Safe
            </button>
          </div>
        </div>
      )}

      {/* ACTUAL CAMERA SCANNER MODAL */}
      {isQrScannerOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 360, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={18} />
                <span>Scan UPI QR Code</span>
              </h3>
              <button
                onClick={stopQrScanner}
                style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              id="qr-reader"
              style={{
                width: '100%',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#000',
                minHeight: 250
              }}
            />

            {!isScanningQr && (
              <p style={{ fontSize: 12, color: 'var(--danger-light)', marginTop: 8 }}>
                Camera permission required or camera unavailable.
              </p>
            )}

            <button
              onClick={stopQrScanner}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODALS */}
      {isPinModalOpen && (
        <PINModal
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={handlePinSuccess}
          amount={amount}
          recipientUpi={recipientUpi}
        />
      )}

      {isUpiModalOpen && (
        <UpiModal
          onClose={() => setIsUpiModalOpen(false)}
          onSuccess={handlePinSuccess}
          amount={amount}
          recipientUpi={recipientUpi}
          app={selectedUpiApp}
        />
      )}
    </div>
  );
}
