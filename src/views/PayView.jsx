import React, { useState, useEffect, useRef } from 'react';
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

// Helper to identify whether user entered a UPI ID or a UPI Number (mobile)
export const getPayeeType = (input) => {
  if (!input || typeof input !== 'string') return 'none';
  const trimmed = input.trim();
  if (trimmed.includes('@')) return 'upi_id';
  const cleanDigits = trimmed.replace(/\D/g, '');
  if (cleanDigits.length >= 8 && cleanDigits.length <= 12) return 'upi_number';
  return 'unknown';
};

// Helper to parse standard UPI QR strings (upi://pay?pa=...&pn=...&am=...)
export const parseUpiQrCode = (text) => {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  // If standard UPI payment URI scheme: upi://pay?pa=...&pn=...&am=...&tn=...
  if (trimmed.toLowerCase().startsWith('upi://pay') || trimmed.includes('pa=')) {
    try {
      const urlStr = trimmed.startsWith('upi://') ? trimmed : `upi://pay?${trimmed}`;
      const url = new URL(urlStr);
      const pa = url.searchParams.get('pa') || '';
      const pn = url.searchParams.get('pn') || '';
      const am = url.searchParams.get('am') || '';
      const tn = url.searchParams.get('tn') || pn || '';
      return { upi: pa, amount: am, note: tn, name: pn };
    } catch (e) {
      console.warn('UPI QR URL parse error:', e);
    }
  }

  // If raw UPI ID (e.g. aditi@okhdfcbank)
  if (trimmed.includes('@')) {
    return { upi: trimmed, amount: '', note: '', name: '' };
  }

  // If 10-digit phone or UPI number
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 12) {
    return { upi: digits.slice(-10), amount: '', note: '', name: '' };
  }

  return { upi: trimmed, amount: '', note: '', name: '' };
};

export const resolvePayeeDetails = (input, scamList = []) => {
  if (!input || !input.trim()) return null;
  const raw = input.trim().toLowerCase();
  const digits = raw.replace(/\D/g, '').slice(-10);
  const type = getPayeeType(input);

  if (type === 'none') return null;

  // 1. Blacklist check against community scams (UPI ID and Phone number)
  const matchedScam = (scamList || []).find(s => {
    const matchUpi = (s.upi_ids || []).some(u => u.toLowerCase() === raw);
    const matchPhone = (s.phone_numbers || []).some(p => {
      const pDigits = p.replace(/\D/g, '').slice(-10);
      return pDigits && digits && pDigits === digits;
    });
    return matchUpi || matchPhone;
  });

  if (matchedScam || raw.includes('fraud') || raw.includes('trai')) {
    return {
      type,
      isFraud: true,
      name: matchedScam ? `🚨 Blacklisted Fraudster (${matchedScam.title || 'Known Scam'})` : '🚨 Blacklisted Fraud Payee',
      resolvedVpa: type === 'upi_number' ? `${digits}@fraudster` : raw,
      bank: 'TrustShield Blacklisted Database'
    };
  }

  // 2. Verified Known Safe Mock Entries
  if (raw === 'starbucks.coffee@icici') {
    return { type: 'upi_id', isFraud: false, name: 'Starbucks Coffee India', resolvedVpa: raw, bank: 'ICICI Merchant' };
  }
  if (raw === 'landlord.rent@hdfc') {
    return { type: 'upi_id', isFraud: false, name: 'Rajesh Kumar (House Rent)', resolvedVpa: raw, bank: 'HDFC Bank' };
  }
  if (raw === 'aditiansh@oksbi' || raw === 'aditi@okicici' || digits === '9876543210') {
    return { type, isFraud: false, name: 'Aditi Sharma', resolvedVpa: 'aditi@okicici', bank: 'ICICI Bank' };
  }

  // 3. Generic Valid Formats
  if (type === 'upi_number') {
    return {
      type: 'upi_number',
      isFraud: false,
      name: `Verified Account (${digits})`,
      resolvedVpa: `${digits}@upi`,
      bank: 'NPCI Central Mapper'
    };
  }
  if (type === 'upi_id') {
    const handle = raw.split('@')[0];
    const capitalized = handle.charAt(0).toUpperCase() + handle.slice(1);
    return {
      type: 'upi_id',
      isFraud: false,
      name: `${capitalized} (Verified UPI)`,
      resolvedVpa: raw,
      bank: 'Verified UPI Account'
    };
  }

  return null;
};

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
  const [scannerError, setScannerError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Payee resolution helper state
  const payeeType = getPayeeType(recipientUpi);
  const resolvedPayee = resolvePayeeDetails(recipientUpi, scamList);

  const proceedToPayment = () => {
    if (paymentMethod === 'online') {
      setIsUpiModalOpen(true);
    } else {
      setIsPinModalOpen(true);
    }
  };

  // QR Scanner Handlers
  const applyScannedQr = (rawQrString) => {
    if (!rawQrString || !rawQrString.trim()) return;
    const parsed = parseUpiQrCode(rawQrString);
    if (parsed && parsed.upi) {
      setRecipientUpi(parsed.upi);
      if (parsed.amount) setAmount(parsed.amount);
      if (parsed.note) setNote(parsed.note);
      setIsPasted(false);
      if (onUpdatePaymentDraft) {
        onUpdatePaymentDraft({
          recipientUpi: parsed.upi,
          amount: parsed.amount || amount,
          note: parsed.note || note,
          isPasted: false
        });
      }
      setValidationError('');
      stopQrScanner();
    }
  };

  const stopQrScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (err) {
        console.error('Error stopping camera stream:', err);
      }
      videoRef.current.srcObject = null;
    }
    setIsScanningQr(false);
    setIsCameraActive(false);
    setIsQrScannerOpen(false);
    setScannerError('');
  };

  const handleScanQrCode = async () => {
    setIsQrScannerOpen(true);
    setIsScanningQr(true);
    setScannerError('');
    setIsCameraActive(false);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setIsCameraActive(true);
        }

        // Real-time BarcodeDetector frame scanner loop
        if ('BarcodeDetector' in window) {
          try {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            scanIntervalRef.current = setInterval(async () => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes.length > 0 && barcodes[0].rawValue) {
                    applyScannedQr(barcodes[0].rawValue);
                  }
                } catch (detectErr) {
                  // Continue scanning loop
                }
              }
            }, 300);
          } catch (detInitErr) {
            console.warn('BarcodeDetector init error:', detInitErr);
          }
        }
      } else {
        setScannerError('Camera access not supported in this environment. You can upload a QR image below.');
      }
    } catch (err) {
      console.warn('Camera access info:', err);
      setScannerError('Camera permission not granted or camera busy. You can upload a QR image or screenshot below.');
      setIsCameraActive(false);
    }
  };

  const handleQrImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerError('');
    try {
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const imageBitmap = await createImageBitmap(file);
        const barcodes = await detector.detect(imageBitmap);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          applyScannedQr(barcodes[0].rawValue);
          return;
        }
      }
      setScannerError('No UPI QR code found in uploaded image. Please ensure the QR is clear or enter the UPI ID manually.');
    } catch (err) {
      console.error('QR image decode error:', err);
      setScannerError('Could not decode QR from image. Please enter UPI details manually.');
    }
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

  // Zero-Knowledge Risk & Coercion Scanner
  const runRiskAnalysis = () => {
    setValidationError('');
    setIsOverrideSubmitted(false);
    setScamAlertSent(false);

    const pType = getPayeeType(recipientUpi);
    if (!recipientUpi || !recipientUpi.trim()) {
      setValidationError('Please enter a Recipient UPI ID or 10-digit UPI Number.');
      return;
    }
    if (pType === 'unknown') {
      setValidationError('Please enter a valid UPI ID (e.g. name@upi) or 10-digit UPI Number / Mobile.');
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

      // 2. Blacklist Check against community fraud DB (UPI IDs and Phone Numbers)
      const safeScamList = scamList || [];
      const cleanDigits = recipientUpi.replace(/\D/g, '').slice(-10);
      const isBlacklisted = safeScamList.some(s =>
        (s.upi_ids || []).some(u => u.toLowerCase() === recipientUpi.toLowerCase().trim()) ||
        (s.phone_numbers || []).some(p => {
          const pDigits = p.replace(/\D/g, '').slice(-10);
          return pDigits && cleanDigits && pDigits === cleanDigits;
        })
      ) || recipientUpi.toLowerCase().includes('fraud') || recipientUpi.toLowerCase().includes('trai');

      if (isBlacklisted) {
        score += 90;
        cSignals.push(pType === 'upi_number' ? 'Blacklisted Fraud Phone/UPI Number' : 'Blacklisted Fraud Payee');
        factors.push({
          id: 'blacklisted_upi',
          label: pType === 'upi_number' ? 'Matches blacklisted scam phone/UPI number database' : 'Matches community fraud database',
          labelHindi: 'सक्रिय धोखाधड़ी UPI / फोन नंबर डेटाबेस से मेल खाता है',
          severity: 'danger',
          score: 90
        });
      }

      // 3. Amount Anomaly
      if (amtNum > (safeUser.avg_transaction_amount || 2500) * 4) {
        score += 25;
        cSignals.push('High Amount Anomaly');
        factors.push({
          id: 'amount_anomaly',
          label: `Coercive Amount Spike (₹${amtNum.toLocaleString('en-IN')} vs average ₹${(safeUser.avg_transaction_amount || 2500).toLocaleString('en-IN')})`,
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
          label: `${pType === 'upi_number' ? 'UPI Number' : 'UPI ID'} pasted from clipboard — possible copy-paste coercion`,
          labelHindi: 'क्लिपबोर्ड से पेस्ट किया गया — पहचान की जांच करें',
          severity: 'warn',
          score: 15
        });
      }

      // 6. First-time Transfer Warning
      if (recipientUpi && !recipientUpi.toLowerCase().includes('aditi') && !recipientUpi.includes('9876543210')) {
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

        const nominee = safeUser?.trusted_nominee || { name: 'Papa (Rajesh Sharma)', phone: '+91 98765 43210', enabled: true };
        if (nominee.enabled && nominee.phone) {
          sendNomineeScamAlert({
            nomineeName: nominee.name,
            nomineePhone: nominee.phone,
            userName: safeUser.name || 'Aditi Sharma',
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
      payeeType,
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

        {/* Input Form */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="input-label" style={{ marginBottom: 0 }}>Recipient UPI ID / UPI Number</label>
            {payeeType === 'upi_id' && (
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--indigo-light)', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '2px 8px', borderRadius: 6 }}>
                🏷️ UPI ID
              </span>
            )}
            {payeeType === 'upi_number' && (
              <span style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: 6 }}>
                📱 10-Digit UPI Number
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-field mono"
              value={recipientUpi}
              onChange={handleUpiChange}
              onPaste={handleUpiPaste}
              placeholder="e.g. name@upi or 10-digit mobile number"
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

          {/* Live Payee Resolution Pill */}
          {resolvedPayee && recipientUpi.trim().length >= 3 && (
            <div style={{
              marginTop: 6,
              padding: '6px 10px',
              borderRadius: 8,
              background: resolvedPayee.isFraud ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.1)',
              border: resolvedPayee.isFraud ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: resolvedPayee.isFraud ? 'var(--danger-light)' : 'var(--safe-light)', fontWeight: 700 }}>
                {resolvedPayee.isFraud ? <AlertOctagon size={14} /> : <CheckCircle2 size={14} />}
                <span>{resolvedPayee.name}</span>
              </div>
              <span style={{ color: 'var(--sub)', fontSize: 10 }}>
                {resolvedPayee.type === 'upi_number' ? 'NPCI Central Mapper' : 'Verified Handle'}
              </span>
            </div>
          )}
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
                    Sent to: {safeUser?.trusted_nominee?.name || 'Papa (Rajesh Sharma)'} ({safeUser?.trusted_nominee?.phone || '+91 98765 43210'})
                  </div>
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
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }} className="mono">
                  <span>{completedTxnReceipt.recipientUpi}</span>
                  {completedTxnReceipt.payeeType === 'upi_number' && (
                    <span style={{ fontSize: 10, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '1px 6px', borderRadius: 4 }}>
                      UPI No
                    </span>
                  )}
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

      {/* ACTUAL CAMERA SCANNER MODAL */}
      {isQrScannerOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 380, textAlign: 'center' }}>
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

            <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', background: '#000', minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: 240,
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 24,
                border: '2px dashed var(--safe-light)',
                borderRadius: 12,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                pointerEvents: 'none'
              }} />
            </div>

            {scannerError ? (
              <p style={{ fontSize: 12, color: 'var(--warn-light)', marginTop: 10, background: 'rgba(245, 158, 11, 0.12)', padding: '6px 10px', borderRadius: 8 }}>
                ⚠️ {scannerError}
              </p>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--sub)', marginTop: 10 }}>
                Align merchant or payee QR code in the box to scan.
              </p>
            )}

            {/* Optional Image Upload fallback */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleQrImageUpload}
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--indigo-light)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <QrCode size={14} />
                <span>Upload QR Image</span>
              </button>
              <button
                type="button"
                onClick={stopQrScanner}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
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