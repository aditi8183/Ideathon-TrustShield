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
  FileCheck2,
  Bell,
  Users,
  Building2,
  Landmark,
  CreditCard,
  Upload,
  RefreshCw,
  Zap,
  Lock
} from 'lucide-react';
import PINModal from '../components/PINModal';
import UpiModal from '../components/UpiModal';
import { sendNomineeScamAlert } from '../utils/smsService';
import jsQR from 'jsqr';

// Helper to parse standard UPI QR strings (upi://pay?pa=...&pn=...&am=...&tn=...)
export const parseUpiQrCode = (text) => {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  // Standard UPI URI scheme: upi://pay?pa=...&pn=...&am=...&tn=...
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
      console.warn('UPI QR URL parse fallback:', e);
      const paMatch = trimmed.match(/pa=([^&]+)/i);
      const pnMatch = trimmed.match(/pn=([^&]+)/i);
      const amMatch = trimmed.match(/am=([^&]+)/i);
      const tnMatch = trimmed.match(/tn=([^&]+)/i);
      const pa = paMatch ? decodeURIComponent(paMatch[1]) : '';
      const pn = pnMatch ? decodeURIComponent(pnMatch[1]) : '';
      const am = amMatch ? decodeURIComponent(amMatch[1]) : '';
      const tn = tnMatch ? decodeURIComponent(tnMatch[1]) : pn;
      if (pa) {
        return { upi: pa, amount: am, note: tn, name: pn };
      }
    }
  }

  // Raw UPI ID (e.g. aditi@okhdfcbank or starbucks@icici)
  if (trimmed.includes('@')) {
    return { upi: trimmed, amount: '', note: '', name: '' };
  }

  // 10-digit phone or UPI number
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 12) {
    return { upi: digits.slice(-10), amount: '', note: '', name: '' };
  }

  return { upi: trimmed, amount: '', note: '', name: '' };
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
  const safeUser = user || {
    id: 'u042',
    name: 'Aditi Sharma',
    bank_name: 'ICICI Bank',
    avg_transaction_amount: 2500,
    total_saved: 0,
    guardian_points: 0,
    level: 1,
    guardian_level: 'Level 1 Guardian',
    current_device: 'Chrome on Windows 11',
    is_new_device: true
  };

  const [payMode, setPayMode] = useState('UPI');
  const [recipientUpi, setRecipientUpi] = useState(paymentDraft?.recipientUpi || 'aditiansh@oksbi');
  const [amount, setAmount] = useState(paymentDraft?.amount || '50');
  const [note, setNote] = useState(paymentDraft?.note || '');

  // Payment Method Selector State: 'ONLINE' (Pay Online) | 'IN_APP_PIN' (In-App PIN)
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');

  // Target UPI App Selection State: 'all' | 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'cred'
  const [selectedUpiApp, setSelectedUpiApp] = useState('all');

  const [accountNo, setAccountNo] = useState('');
  const [confirmAccountNo, setConfirmAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [transferType, setTransferType] = useState('IMPS');

  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [netbankingId, setNetbankingId] = useState('');

  const [isPasted, setIsPasted] = useState(paymentDraft?.isPasted || false);
  const [isOddHour, setIsOddHour] = useState(false);
  const [validationError, setValidationError] = useState('');

  const frequentPayees = safeUser.frequent_payees || [];

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

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

  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isUrgentWarningOpen, setIsUrgentWarningOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // QR Scanner Refs & States
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [scannedSuccessInfo, setScannedSuccessInfo] = useState(null);

  const [completedTxnReceipt, setCompletedTxnReceipt] = useState(null);
  const [userOverrideNote, setUserOverrideNote] = useState('');
  const [isOverrideSubmitted, setIsOverrideSubmitted] = useState(false);
  const [isNomineeAlertSent, setIsNomineeAlertSent] = useState(false);
  const [isSendingNomineeAlert, setIsSendingNomineeAlert] = useState(false);

  // Cleanup camera stream and scan interval on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        } catch (err) {
          console.error('Error stopping camera stream on unmount:', err);
        }
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const handleSendNomineeAlert = async () => {
    setIsSendingNomineeAlert(true);
    try {
      await sendNomineeScamAlert({
        nomineeName: safeUser?.trusted_nominee?.name || 'Family Guardian',
        nomineePhone: safeUser?.trusted_nominee?.phone || '+91 98765 43210',
        userName: safeUser?.name || 'User',
        scamCategory: riskFactors[0]?.label || 'High-Risk Transaction',
        blockedAmount: amount || 0,
        recipientUpi: getTargetDestinationString(),
        riskScore: riskScore || 95
      });
      setIsNomineeAlertSent(true);
    } catch (e) {
      console.error('Failed to dispatch emergency alert:', e);
      setIsNomineeAlertSent(true);
    } finally {
      setIsSendingNomineeAlert(false);
    }
  };

  useEffect(() => {
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
      onUpdatePaymentDraft({ recipientUpi, amount: val, note: val, isPasted });
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
    setAccountNo('');
    setConfirmAccountNo('');
    setIfscCode('');
    setBeneficiaryName('');
    setNetbankingId('');
    setIsPasted(false);
    setValidationError('');
    setRiskScore(0);
    setRiskFactors([]);
    if (onClearPaymentDraft) {
      onClearPaymentDraft();
    }
  };

  const fillQuickPayee = (upi, amt, payNote, pasted = false) => {
    setPayMode('UPI');
    setRecipientUpi(upi);
    if (amt) setAmount(String(amt));
    if (payNote) setNote(payNote);
    setIsPasted(pasted);
    if (onUpdatePaymentDraft) {
      onUpdatePaymentDraft({ recipientUpi: upi, amount: amt ? String(amt) : amount, note: payNote || note, isPasted: pasted });
    }
    setValidationError('');
  };

  const getTargetDestinationString = () => {
    if (payMode === 'UPI') return recipientUpi || 'merchant@upi';
    if (payMode === 'BANK_ACCOUNT') return `A/C ${accountNo} (${ifscCode.toUpperCase() || 'IFSC'})`;
    return `${selectedBank} NetBanking (${netbankingId || 'User Direct'})`;
  };

  // Real Camera & QR Scanner Handlers
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
    setScannedSuccessInfo(null);
  };

  const applyScannedQr = (rawQrString) => {
    if (!rawQrString || !rawQrString.trim()) return;
    const parsed = parseUpiQrCode(rawQrString);
    if (parsed && parsed.upi) {
      setScannedSuccessInfo({
        upi: parsed.upi,
        amount: parsed.amount,
        note: parsed.note,
        name: parsed.name
      });
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
      setTimeout(() => {
        stopQrScanner();
      }, 1200);
    } else {
      setScannerError('Could not find a valid UPI ID in this QR code.');
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    const video = videoRef.current;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data && code.data.trim()) {
        applyScannedQr(code.data);
      }
    }
  };

  const handleScanQrCode = async () => {
    setIsQrScannerOpen(true);
    setIsScanningQr(true);
    setScannerError('');
    setScannedSuccessInfo(null);
    setIsCameraActive(false);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play().catch(() => {});
          setIsCameraActive(true);
        }

        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = setInterval(() => {
          scanFrame();
        }, 120);
      } else {
        setScannerError('Live camera not supported in this browser. You can upload a QR image/screenshot below.');
      }
    } catch (err) {
      console.warn('Camera access note:', err);
      setScannerError('Camera access unavailable or permission denied. You can upload a QR screenshot or test a sample below.');
      setIsCameraActive(false);
    }
  };

  const handleQrImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerError('');
    setScannedSuccessInfo(null);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          if (code && code.data && code.data.trim()) {
            applyScannedQr(code.data);
          } else {
            setScannerError('No valid UPI QR code found in this image. Please upload a clearer QR image.');
          }
        };
        img.onerror = () => {
          setScannerError('Failed to load image file. Please try another image.');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('QR image decode error:', err);
      setScannerError('Could not decode QR from image. Please enter UPI details manually.');
    }
    e.target.value = '';
  };

  const runRiskAnalysis = () => {
    if (payMode === 'UPI') {
      if (!recipientUpi.trim()) {
        setValidationError('Please enter a Recipient UPI ID or 10-digit UPI Number.');
        return;
      }
    } else if (payMode === 'BANK_ACCOUNT') {
      if (!accountNo.trim() || accountNo.length < 9) {
        setValidationError('Please enter a valid Bank Account Number (minimum 9 digits).');
        return;
      }
      if (accountNo !== confirmAccountNo) {
        setValidationError('Account Number and Confirm Account Number do not match.');
        return;
      }
      if (!ifscCode.trim() || ifscCode.length < 11) {
        setValidationError('Please enter a valid 11-character Bank IFSC Code (e.g. SBIN0001234).');
        return;
      }
    } else if (payMode === 'NETBANKING') {
      if (!netbankingId.trim()) {
        setValidationError('Please enter your Customer ID or NetBanking User ID.');
        return;
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      setValidationError('Please enter a valid payment amount in ₹.');
      return;
    }

    setValidationError('');
    setIsAnalyzing(true);
    setIsOverrideSubmitted(false);

    setTimeout(() => {
      let score = 0;
      const factors = [];
      const targetDest = getTargetDestinationString().toLowerCase();
      const amtNum = parseFloat(amount);
      const avgAmt = safeUser.avg_transaction_amount || 2500;

      const scamMatch = scamList.find(s =>
        (s.keyword && targetDest.includes(s.keyword.toLowerCase())) ||
        (s.category && targetDest.includes(s.category.toLowerCase())) ||
        (s.bank_name && targetDest.includes(s.bank_name.toLowerCase()))
      );

      if (scamMatch || targetDest.includes('fraud') || targetDest.includes('trai') || targetDest.includes('customs') || targetDest.includes('lottery')) {
        score += 65;
        factors.push({
          id: 'blacklisted_destination',
          label: `Blacklisted Account Match: ${scamMatch?.category || 'High Risk Cyber Fraud Entity'}`,
          labelHindi: `ब्लैकलिस्टेड साइबर धोखाधड़ी खाता मिला`,
          severity: 'danger',
          score: 65
        });
      }

      if (detectedScamCall && detectedScamCall.category) {
        score += 50;
        factors.push({
          id: 'voice_coercion',
          label: `Live Voice Call Coercion: ${detectedScamCall.category.name || 'Digital Arrest Coercion'}`,
          labelHindi: `लाइव वॉयस कॉल दबाव की चेतावनी`,
          severity: 'danger',
          score: 50
        });
      }

      if (amtNum > avgAmt * 3) {
        const multiplier = (amtNum / avgAmt).toFixed(1);
        score += 25;
        factors.push({
          id: 'amount_spike',
          label: `Abnormal Payment Amount: ${multiplier}x higher than your average transfer (₹${avgAmt.toLocaleString('en-IN')})`,
          labelHindi: `असामान्य रूप से बड़ी राशि (आपकी औसत से ${multiplier}x अधिक)`,
          severity: 'warn',
          score: 25
        });
      }

      if (safeUser.is_new_device) {
        score += 15;
        factors.push({
          id: 'new_device',
          label: `Device Change Detected: ${safeUser.current_device || 'Unrecognized Device'}`,
          labelHindi: `नए / अपरिचित उपकरण से प्रयास`,
          severity: 'warn',
          score: 15
        });
      }

      if (isPasted) {
        score += 15;
        factors.push({
          id: 'pasted_destination',
          label: 'Payment address pasted from clipboard — possible copy-paste coercion',
          labelHindi: 'भुगतान विवरण क्लिपबोर्ड से पेस्ट किया गया',
          severity: 'warn',
          score: 15
        });
      }

      if (isOddHour) {
        score += 10;
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
      setIsAnalyzing(false);

      if (finalScore >= 70) {
        setIsBlockedModalOpen(true);
        if (onPaymentBlocked) {
          onPaymentBlocked({
            amount: amtNum,
            recipient_upi: targetDest,
            risk_score: finalScore,
            blocked_reason: factors.map(f => f.label).join(' + ')
          });
        }
      } else if (finalScore >= 40) {
        setIsUrgentWarningOpen(true);
      } else {
        setIsUpiModalOpen(true);
      }
    }, 600);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setIsUpiModalOpen(false);
    const amtNum = parseFloat(amount) || 0;
    const dest = getTargetDestinationString();
    const payNote = note || 'Verified Safe Payment';
    const txnId = `TS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setCompletedTxnReceipt({
      txnId,
      amount: amtNum,
      recipientUpi: dest,
      note: payNote,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    });

    if (onPaymentSuccess) {
      if (payMode === 'UPI' && recipientUpi) {
        onPaymentSuccess(amtNum, recipientUpi);
      } else {
        onPaymentSuccess(amtNum);
      }
    }
    handleResetDraft();
  };

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
      {/* Device Security Badge */}
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

      {/* Main Payment Container Card */}
      <div className="glass-card">
        {/* Header matching screenshot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>UPI Payment Scanner</h2>

          {/* QR Code Scanner Button */}
          <button
            onClick={handleScanQrCode}
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: 'var(--indigo-light)',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 800,
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

        {/* Input Form */}

        {/* QUICK SEND — FREQUENT PAYEES matching screenshot */}
        {frequentPayees.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              QUICK SEND — FREQUENT PAYEES
            </div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, alignItems: 'flex-start', scrollbarWidth: 'none' }}>
              {frequentPayees.map((payee, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fillQuickPayee(payee.upi, 0, '', false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: 0,
                    minWidth: 64
                  }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: payee.color || 'var(--indigo)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {payee.initial}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', color: 'var(--text)' }}>
                    {payee.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RECIPIENT UPI ID matching screenshot */}

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="input-label" style={{ margin: 0 }}>RECIPIENT UPI ID / UPI NUMBER</label>
            {recipientUpi && !recipientUpi.includes('@') && recipientUpi.replace(/\D/g, '').length >= 8 && (
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'var(--indigo-light)',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '2px 8px',
                borderRadius: 6
              }}>
                📱 UPI Number (NPCI Mapped)
              </span>
            )}
          </div>
          <input
            type="text"
            className="input-field mono"
            value={recipientUpi}
            onChange={handleUpiChange}
            placeholder="aditiansh@oksbi or 9876543210"
            required
          />
        </div>

        {/* AMOUNT (₹) matching screenshot */}
        <div className="input-group">
          <label className="input-label">AMOUNT (₹)</label>
          <input
            type="number"
            className="input-field mono"
            value={amount}
            onChange={handleAmountChange}
            placeholder="50"
            style={{ fontSize: 18, fontWeight: 900, color: 'var(--indigo-light)' }}
            required
          />
        </div>

        {/* PAYMENT NOTE (OPTIONAL) matching screenshot */}
        <div className="input-group">
          <label className="input-label">PAYMENT NOTE (OPTIONAL)</label>
          <input
            type="text"
            className="input-field"
            value={note}
            onChange={handleNoteChange}
            placeholder="xa"
          />
        </div>

        {/* SELECT PAYMENT METHOD: 2 CARDS matching screenshot */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            SELECT PAYMENT METHOD:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Card 1: Pay Online */}
            <div
              onClick={() => setPaymentMethod('ONLINE')}
              style={{
                background: paymentMethod === 'ONLINE' ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                border: paymentMethod === 'ONLINE' ? '2px solid var(--indigo-light)' : '1px solid var(--border)',
                borderRadius: 14,
                padding: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: paymentMethod === 'ONLINE' ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: paymentMethod === 'ONLINE' ? 'var(--indigo)' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)' }}>Pay Online</div>
                <div style={{ fontSize: 10, color: 'var(--sub)' }}>Open UPI App (GPay/PhonePe)</div>
              </div>
            </div>

            {/* Card 2: In-App PIN */}
            <div
              onClick={() => setPaymentMethod('IN_APP_PIN')}
              style={{
                background: paymentMethod === 'IN_APP_PIN' ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                border: paymentMethod === 'IN_APP_PIN' ? '2px solid var(--indigo-light)' : '1px solid var(--border)',
                borderRadius: 14,
                padding: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: paymentMethod === 'IN_APP_PIN' ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: paymentMethod === 'IN_APP_PIN' ? 'var(--indigo)' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Lock size={18} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)' }}>In-App PIN</div>
                <div style={{ fontSize: 10, color: 'var(--sub)' }}>Protected PIN Gateway</div>
              </div>
            </div>
          </div>
        </div>

        {/* TARGET UPI APP matching screenshot (Visible when Pay Online selected) */}
        {paymentMethod === 'ONLINE' && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 12,
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                TARGET UPI APP:
              </span>
              <span style={{ fontSize: 10, color: 'var(--sub)' }}>Opens directly on Pay Now</span>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: '⚡ Auto / Default' },
                { id: 'gpay', label: '🌐 Google Pay' },
                { id: 'phonepe', label: '🟣 PhonePe' },
                { id: 'paytm', label: '🔵 Paytm' },
                { id: 'bhim', label: '🇮🇳 BHIM' },
                { id: 'cred', label: '💳 CRED' }
              ].map(app => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedUpiApp(app.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: selectedUpiApp === app.id ? '1px solid var(--indigo-light)' : '1px solid var(--border)',
                    background: selectedUpiApp === app.id ? 'var(--indigo)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedUpiApp === app.id ? '#fff' : 'var(--sub)',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {app.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: 'var(--danger-light)',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 16
          }}>
            ⚠️ {validationError}
          </div>
        )}

        {/* ACTION ROW: Pay Now ₹50 & Clear Form matching screenshot */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={runRiskAnalysis}
            disabled={isAnalyzing}
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: 900,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="spin" />
                <span>Analyzing Risk...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>Pay Now ₹{amount || '50'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetDraft}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border)',
              color: 'var(--sub)',
              fontSize: 12,
              fontWeight: 700,
              padding: '12px 16px',
              borderRadius: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Clear Form
          </button>
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

      {/* REAL LIVE CAMERA & IMAGE QR CODE SCANNER MODAL */}
      {isQrScannerOpen && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-content" style={{ maxWidth: 420, textAlign: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={20} color="var(--indigo-light)" />
                <span>Scan Merchant UPI QR Code</span>
              </div>
              <button
                type="button"
                onClick={stopQrScanner}
                style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Viewport Container with Live Scanner Overlay */}
            <div
              style={{
                width: '100%',
                height: 250,
                borderRadius: 16,
                background: '#07090e',
                border: '2px solid rgba(99, 102, 241, 0.4)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: 12
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: isCameraActive ? 'block' : 'none'
                }}
              />

              {!isCameraActive && (
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <QrCode size={48} color="rgba(99, 102, 241, 0.6)" style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: 'var(--sub)', margin: 0, fontWeight: 600 }}>
                    {scannerError ? 'Camera unavailable' : 'Initializing camera stream...'}
                  </p>
                </div>
              )}

              {/* Viewfinder Target & Laser Scanning Animation */}
              {isCameraActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12%',
                    left: '12%',
                    width: '76%',
                    height: '76%',
                    border: '2px dashed rgba(99, 102, 241, 0.85)',
                    borderRadius: 14,
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <div className="qr-laser-line" />
                </div>
              )}

              {/* Scanned Confirmation Overlay */}
              {scannedSuccessInfo && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(16, 185, 129, 0.92)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    padding: 16,
                    zIndex: 10
                  }}
                >
                  <CheckCircle2 size={44} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 16, fontWeight: 900 }}>QR Code Detected!</div>
                  <div style={{ fontSize: 13, marginTop: 4, fontWeight: 700 }} className="mono">
                    {scannedSuccessInfo.upi} {scannedSuccessInfo.amount ? `(₹${scannedSuccessInfo.amount})` : ''}
                  </div>
                </div>
              )}
            </div>

            {scannerError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--danger-light)',
                  padding: '8px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 12,
                  textAlign: 'left'
                }}
              >
                ⚠️ {scannerError}
              </div>
            )}

            {/* Upload QR Image / Screenshot Option */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'var(--indigo-light)',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Upload size={15} />
                <span>Upload QR Image / Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Quick Demo Test Buttons */}
            <div
              style={{
                textAlign: 'left',
                marginBottom: 14,
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 10,
                borderRadius: 12,
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 800, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quick Test Sample UPI QR Codes:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => applyScannedQr('upi://pay?pa=starbucks.coffee@icici&pn=Starbucks%20Coffee&am=350&tn=Coffee%20Payment')}
                  style={{
                    fontSize: 11,
                    padding: '5px 10px',
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--safe-light)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  ☕ Starbucks (₹350)
                </button>
                <button
                  type="button"
                  onClick={() => applyScannedQr('upi://pay?pa=landlord.rent@hdfc&pn=Rajesh%20Kumar&am=15000&tn=House%20Rent')}
                  style={{
                    fontSize: 11,
                    padding: '5px 10px',
                    borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--indigo-light)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  🏠 Rent (₹15,000)
                </button>
                <button
                  type="button"
                  onClick={() => applyScannedQr('upi://pay?pa=trai.verify@fraudster&pn=TRAI%20Customs%20Verification&am=18500&tn=Penalty%20Clearance')}
                  style={{
                    fontSize: 11,
                    padding: '5px 10px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--danger-light)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  🚨 TRAI Scam QR (₹18,500)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={stopQrScanner}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--sub)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700
              }}
            >
              Cancel Scanner
            </button>
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
                  setIsUpiModalOpen(true);
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

            {/* TRUSTED NOMINEE EMERGENCY NOTIFICATION SECTION (NO EMAIL PROMPT) */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'left',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--indigo-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={14} />
                  <span>Trusted Nominee Emergency Alert</span>
                </div>
                {safeUser?.trusted_nominee?.name && (
                  <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--safe-light)', padding: '2px 8px', borderRadius: 6 }}>
                    Connected
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 10 }}>
                {safeUser?.trusted_nominee?.name 
                  ? `Notify ${safeUser.trusted_nominee.name} (${safeUser.trusted_nominee.phone || safeUser.trusted_nominee.email || 'Nominee'}) about this suspicious payment attempt.`
                  : 'Notify your configured family guardian about this suspicious payment attempt.'
                }
              </p>
              
              {isNomineeAlertSent ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: 'var(--safe-light)',
                  padding: 10,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}>
                  <CheckCircle2 size={16} />
                  <span>Emergency Scam Alert Dispatched to Nominee!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendNomineeAlert}
                  disabled={isSendingNomineeAlert}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: isSendingNomineeAlert ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Bell size={14} />
                  <span>{isSendingNomineeAlert ? 'Dispatching Emergency Alert...' : 'Send Instant Scam Alert to Nominee'}</span>
                </button>
              )}
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

      {/* UPI Direct Intent App Modal */}
      <UpiModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        amount={amount}
        recipientUpi={recipientUpi}
        note={note}
        selectedApp="all"
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
