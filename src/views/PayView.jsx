import React, { useState, useEffect } from 'react';
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
  FileCheck2,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

const UPI_APPS = [
  {
    id: 'chooser',
    name: 'Any UPI app',
    hint: 'Phone chooser',
    intentPackage: ''
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    hint: 'GPay',
    intentPackage: 'com.google.android.apps.nbu.paisa.user'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    hint: 'PhonePe',
    intentPackage: 'com.phonepe.app'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    hint: 'Paytm',
    intentPackage: 'net.one97.paytm'
  },
  {
    id: 'bhim',
    name: 'BHIM',
    hint: 'BHIM',
    intentPackage: 'in.org.npci.upiapp'
  }
];

const createEmptyPaymentReceipt = () => ({
  upiTransactionId: '',
  utrNumber: '',
  senderName: '',
  senderPhone: '',
  senderBank: '',
  receiverName: '',
  receiverPhone: '',
  receiverBank: '',
  paidAtDate: '',
  paidAtTime: ''
});

export default function PayView({
  user,
  scamList = [],
  detectedScamCall,
  onPaymentBlocked,
  onPaymentSuccess
}) {

  // =========================================================
  // SAFE USER FALLBACK
  // =========================================================

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

  // =========================================================
  // PAYMENT INPUT STATES
  // =========================================================

  const [recipientUpi, setRecipientUpi] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // =========================================================
  // BEHAVIORAL / DEVICE SIGNALS
  // =========================================================

  const [isPasted, setIsPasted] = useState(false);
  const [isOddHour, setIsOddHour] = useState(false);
  const [validationError, setValidationError] = useState('');

  // =========================================================
  // RISK ANALYSIS
  // =========================================================

  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);
  const [coerciveSignals, setCoerciveSignals] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // =========================================================
  // MODALS
  // =========================================================

  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isUrgentWarningOpen, setIsUrgentWarningOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isScanningQr, setIsScanningQr] = useState(false);

  // =========================================================
  // TRANSACTION STATES
  // =========================================================

  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentStartedAt, setPaymentStartedAt] = useState(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState('chooser');
  const [paymentReceipt, setPaymentReceipt] = useState(
    createEmptyPaymentReceipt
  );
  const [paymentCaptureMessage, setPaymentCaptureMessage] = useState('');

  // =========================================================
  // FALSE POSITIVE OVERRIDE
  // =========================================================

  const [userOverrideNote, setUserOverrideNote] = useState('');
  const [isOverrideSubmitted, setIsOverrideSubmitted] = useState(false);

  // =========================================================
  // CHECK CURRENT TIME
  // =========================================================

  useEffect(() => {
    const currentHour = new Date().getHours();

    // Late-night warning: 10 PM - 6 AM
    setIsOddHour(currentHour >= 22 || currentHour < 6);
  }, []);

  // =========================================================
  // UPI INPUT
  // =========================================================

  const handleUpiChange = (e) => {
    setRecipientUpi(e.target.value);

    if (validationError) {
      setValidationError('');
    }
  };

  // =========================================================
  // PASTE DETECTION
  // =========================================================

  const handleUpiPaste = () => {
    setIsPasted(true);
  };

  // =========================================================
  // QUICK PAYEE SELECTOR
  // =========================================================

  const fillQuickPayee = (
    upi,
    amt,
    payNote,
    pasted = false,
    payeeName = ''
  ) => {
    setRecipientUpi(upi);
    setRecipientName(payeeName);
    setAmount(String(amt));
    setNote(payNote);
    setIsPasted(pasted);
    setValidationError('');
  };

  // =========================================================
  // QR CODE SCANNER DEMO
  // =========================================================

  const handleScanQrCode = () => {
    setIsQrScannerOpen(true);
    setIsScanningQr(true);

    setTimeout(() => {
      setIsScanningQr(false);

      fillQuickPayee(
        'starbucks.coffee@icici',
        450,
        'Coffee & Snacks Scan',
        false,
        'Cafe Coffee'
      );

      setTimeout(() => {
        setIsQrScannerOpen(false);
      }, 800);

    }, 1500);
  };

  // =========================================================
  // CREATE UNIQUE TRANSACTION REFERENCE
  // =========================================================

  const createTransactionId = () => {
    const timestamp = Date.now();

    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `TS-${timestamp}-${randomPart}`;
  };

  // =========================================================
  // UPI INTENT URL BUILDER
  // =========================================================

  const buildUpiPaymentUrl = (txnId, targetAppId) => {
    const params = new URLSearchParams({
      pa: recipientUpi.trim(),
      pn: recipientName.trim() || recipientUpi.trim(),
      am: parseFloat(amount).toFixed(2),
      cu: 'INR',
      tn: note.trim() || 'Trust Shield Payment',
      tr: txnId
    });

    const selectedApp =
      UPI_APPS.find((app) => app.id === targetAppId) ||
      UPI_APPS[0];

    if (selectedApp.intentPackage) {
      return (
        `intent://pay?${params.toString()}` +
        `#Intent;scheme=upi;package=${selectedApp.intentPackage};end`
      );
    }

    return `upi://pay?${params.toString()}`;
  };

  const handleReceiptChange = (field, value) => {
    setPaymentReceipt((current) => ({
      ...current,
      [field]: value
    }));

    if (paymentCaptureMessage) {
      setPaymentCaptureMessage('');
    }
  };

  // =========================================================
  // VALIDATE PAYMENT
  // =========================================================

  const validatePayment = () => {

    if (!recipientUpi.trim()) {
      setValidationError(
        'Please enter a Recipient UPI ID or tap a Quick Payee.'
      );

      return false;
    }

    if (!recipientUpi.includes('@')) {
      setValidationError(
        'Please enter a valid UPI ID, for example name@upi.'
      );

      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setValidationError(
        'Please enter a valid amount in ₹.'
      );

      return false;
    }

    if (parseFloat(amount) > 1000000) {
      setValidationError(
        'For security, this demo limits payments to ₹10,00,000.'
      );

      return false;
    }

    return true;
  };

  // =========================================================
  // LAUNCH REAL UPI INTENT
  // =========================================================

  const launchUpiPayment = (targetAppId = selectedUpiApp) => {

    if (!validatePayment()) {
      return;
    }

    const txnId = createTransactionId();

    const startedAt = new Date().toISOString();
    const targetApp =
      UPI_APPS.find((app) => app.id === targetAppId) ||
      UPI_APPS[0];

    setTransactionId(txnId);
    setPaymentStartedAt(startedAt);
    setPaymentStatus(`OPENING ${targetApp.name.toUpperCase()}`);
    setPaymentReceipt({
      ...createEmptyPaymentReceipt(),
      senderName: safeUser.name || '',
      senderPhone: safeUser.phone || '',
      senderBank: safeUser.bank_name || '',
      receiverName: recipientName || recipientUpi,
      paidAtDate: startedAt.slice(0, 10),
      paidAtTime: new Date(startedAt).toTimeString().slice(0, 5)
    });
    setPaymentCaptureMessage('');

    /*
     * IMPORTANT:
     *
     * This creates a UPI Intent URL.
     *
     * The user's device decides which compatible UPI
     * application should handle this URL.
     *
     * Example:
     * Google Pay
     * PhonePe
     * Paytm
     * BHIM
     * Other compatible UPI apps
     */

    const upiUrl = buildUpiPaymentUrl(txnId, targetAppId);

    // Store a local pending transaction for the demo.
    const pendingTransaction = {
      transactionId: txnId,
      trustShieldReference: txnId,
      recipientUpi: recipientUpi,
      recipientName: recipientName || recipientUpi,
      amount: parseFloat(amount),
      note: note || 'Trust Shield Payment',
      selectedUpiApp: targetApp.name,
      senderName: safeUser.name || '',
      senderPhone: safeUser.phone || '',
      senderBank: safeUser.bank_name || '',
      receiverName: recipientName || recipientUpi,
      receiverUpi: recipientUpi,
      receiverPhone: '',
      receiverBank: '',
      upiTransactionId: '',
      utrNumber: '',
      paidAtDate: startedAt.slice(0, 10),
      paidAtTime: new Date(startedAt).toTimeString().slice(0, 5),
      riskScore: riskScore,
      riskLevel:
        riskScore >= 70
          ? 'HIGH'
          : riskScore >= 40
            ? 'MEDIUM'
            : 'LOW',
      riskFactors: riskFactors.map(
        (factor) => factor.label
      ),
      status: 'PENDING',
      createdAt: startedAt
    };

    try {
      localStorage.setItem(
        `trustshield_transaction_${txnId}`,
        JSON.stringify(pendingTransaction)
      );

      localStorage.setItem(
        'trustshield_last_transaction',
        JSON.stringify(pendingTransaction)
      );
    } catch (error) {
      console.warn(
        'Could not save transaction locally:',
        error
      );
    }

    console.log(
      'Trust Shield UPI Transaction:',
      pendingTransaction
    );

    /*
     * Launch UPI application.
     *
     * NOTE:
     * This works primarily on mobile devices where
     * UPI applications are installed.
     */
    window.location.href = upiUrl;

    window.setTimeout(() => {
      setPaymentStatus('WAITING FOR PAYMENT CONFIRMATION');
    }, 1200);
  };

  // =========================================================
  // COPY TRANSACTION ID
  // =========================================================

  const copyTransactionId = async () => {

    if (!transactionId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(transactionId);
      alert('Transaction reference copied.');
    } catch (error) {
      console.warn(
        'Could not copy transaction reference:',
        error
      );
    }
  };

  // =========================================================
  // MARK DEMO PAYMENT AS SUCCESSFUL
  // =========================================================

  /*
   * This function is ONLY for your hackathon/demo UI.
   *
   * It must NOT be treated as real payment verification.
   *
   * In production, replace this with a backend verification
   * response from your authorized payment provider/PSP.
   */

  const handleDemoPaymentSuccess = () => {

    setPaymentStatus('SUCCESS');

    if (onPaymentSuccess) {
      onPaymentSuccess(parseFloat(amount));
    }

    try {

      const storedTransaction =
        localStorage.getItem(
          `trustshield_transaction_${transactionId}`
        );

      if (storedTransaction) {

        const parsed =
          JSON.parse(storedTransaction);

        parsed.status = 'SUCCESS';
        parsed.completedAt =
          new Date().toISOString();

        localStorage.setItem(
          `trustshield_transaction_${transactionId}`,
          JSON.stringify(parsed)
        );

        localStorage.setItem(
          'trustshield_last_transaction',
          JSON.stringify(parsed)
        );
      }

    } catch (error) {

      console.warn(
        'Could not update transaction:',
        error
      );
    }
  };

  const handleSavePaymentReceipt = () => {
    if (!transactionId) {
      return;
    }

    const hasRequiredProof =
      paymentReceipt.upiTransactionId.trim() ||
      paymentReceipt.utrNumber.trim();

    if (!hasRequiredProof) {
      setPaymentCaptureMessage(
        'Enter the UPI transaction ID or UTR number from the payment app receipt.'
      );
      return;
    }

    const completedAt = new Date().toISOString();

    const receiptData = {
      transactionId,
      trustShieldReference: transactionId,
      status: 'SUCCESS',
      completedAt,
      paymentStartedAt,
      upiTransactionId: paymentReceipt.upiTransactionId.trim(),
      utrNumber: paymentReceipt.utrNumber.trim(),
      senderName: paymentReceipt.senderName.trim(),
      senderPhone: paymentReceipt.senderPhone.trim(),
      senderBank: paymentReceipt.senderBank.trim(),
      receiverName: paymentReceipt.receiverName.trim(),
      receiverUpi: recipientUpi.trim(),
      receiverPhone: paymentReceipt.receiverPhone.trim(),
      receiverBank: paymentReceipt.receiverBank.trim(),
      paidAtDate: paymentReceipt.paidAtDate,
      paidAtTime: paymentReceipt.paidAtTime,
      amount: parseFloat(amount),
      note: note || 'Trust Shield Payment',
      riskScore
    };

    setPaymentStatus('SUCCESS');
    setPaymentCaptureMessage('Payment proof saved for fraud analysis.');

    if (onPaymentSuccess) {
      onPaymentSuccess(parseFloat(amount));
    }

    try {
      const storedTransaction =
        localStorage.getItem(
          `trustshield_transaction_${transactionId}`
        );

      const parsed = storedTransaction
        ? JSON.parse(storedTransaction)
        : {};

      const updatedTransaction = {
        ...parsed,
        ...receiptData
      };

      localStorage.setItem(
        `trustshield_transaction_${transactionId}`,
        JSON.stringify(updatedTransaction)
      );

      localStorage.setItem(
        'trustshield_last_transaction',
        JSON.stringify(updatedTransaction)
      );
    } catch (error) {
      console.warn(
        'Could not save payment proof:',
        error
      );
    }
  };

  // =========================================================
  // RISK ANALYSIS
  // =========================================================

  const runRiskAnalysis = () => {

    if (!validatePayment()) {
      return;
    }

    setValidationError('');
    setIsAnalyzing(true);
    setIsOverrideSubmitted(false);

    setTimeout(() => {

      let score = 0;

      const factors = [];
      const cSignals = [];

      const amtNum =
        parseFloat(amount) || 0;

      const userAvg =
        safeUser.avg_transaction_amount || 2500;

      // =====================================================
      // 1. LIVE VOICE SCAM / VISHING
      // =====================================================

      if (
        detectedScamCall &&
        detectedScamCall.category
      ) {

        const cat =
          detectedScamCall.category;

        score += 45;

        cSignals.push('Live Active Call');

        factors.push({
          id: 'voice_scam_category',

          label:
            `Coercive Voice Call Active: ${
              cat.name || 'Phishing Scam'
            }`,

          labelHindi:
            `सक्रिय वॉयस कॉल दबाव: ${
              cat.nameHindi ||
              'धोखाधड़ी चेतावनी'
            }`,

          severity: 'danger',

          score: 45
        });
      }

      // =====================================================
      // 2. COMMUNITY FRAUD DATABASE
      // =====================================================

      const safeScamList =
        scamList || [];

      const isBlacklisted =
        safeScamList.some((s) =>
          (s.upi_ids || []).some(
            (u) =>
              u.toLowerCase() ===
              recipientUpi.toLowerCase()
          )
        ) ||
        recipientUpi
          .toLowerCase()
          .includes('fraud') ||
        recipientUpi
          .toLowerCase()
          .includes('trai');

      if (isBlacklisted) {

        score += 55;

        cSignals.push(
          'Blacklisted Fraud Payee'
        );

        factors.push({
          id: 'blacklisted_upi',

          label:
            'Matches community fraud database',

          labelHindi:
            'सक्रिय धोखाधड़ी UPI डेटाबेस से मेल खाता है',

          severity: 'danger',

          score: 55
        });
      }

      // =====================================================
      // 3. AMOUNT ANOMALY
      // =====================================================

      const isHighAmount =
        amtNum > 50000 ||
        amtNum > userAvg * 5;

      if (isHighAmount) {

        score += 25;

        cSignals.push(
          'Amount Spike Escalation'
        );

        factors.push({
          id: 'amount_anomaly',

          label:
            `Coercive Amount Spike (₹${amtNum.toLocaleString(
              'en-IN'
            )} vs avg ₹${userAvg})`,

          labelHindi:
            `असामान्य रूप से बड़ी राशि (औसत ₹${userAvg} से अधिक)`,

          severity: 'danger',

          score: 25
        });
      }

      // =====================================================
      // 4. NEW DEVICE
      // =====================================================

      if (safeUser.is_new_device) {

        score += 15;

        cSignals.push(
          'New Device Anomaly'
        );

        factors.push({
          id: 'new_device',

          label:
            `Device Change Detected: ${
              safeUser.current_device ||
              'Unrecognized Device'
            }`,

          labelHindi:
            'नए / अपरिचित उपकरण से प्रयास',

          severity: 'warn',

          score: 15
        });
      }

      // =====================================================
      // 5. PASTED UPI
      // =====================================================

      if (isPasted) {

        score += 15;

        cSignals.push(
          'Clipboard Paste Interaction'
        );

        factors.push({
          id: 'pasted_upi',

          label:
            'UPI ID pasted from clipboard — possible copy-paste coercion',

          labelHindi:
            'UPI ID क्लिपबोर्ड से पेस्ट की गई — पहचान की जांच करें',

          severity: 'warn',

          score: 15
        });
      }

      // =====================================================
      // 6. FIRST TIME TRANSFER
      // =====================================================

      if (
        recipientUpi &&
        !recipientUpi
          .toLowerCase()
          .includes('aditi')
      ) {

        score += 10;

        cSignals.push(
          'First-Time Transfer'
        );

        factors.push({
          id: 'first_time_payee',

          label:
            'First-time transfer to this recipient',

          labelHindi:
            'इस पते पर पहला लेनदेन',

          severity: 'info',

          score: 10
        });
      }

      // =====================================================
      // 7. LATE NIGHT
      // =====================================================

      if (isOddHour) {

        score += 10;

        cSignals.push(
          'Late Night Hours'
        );

        factors.push({
          id: 'odd_hours',

          label:
            'Late night transaction attempt (10 PM - 6 AM)',

          labelHindi:
            'असामान्य देर रात के समय में लेनदेन',

          severity: 'warn',

          score: 10
        });
      }

      // =====================================================
      // FINAL SCORE
      // =====================================================

      const finalScore =
        Math.min(100, score);

      setRiskScore(finalScore);

      setRiskFactors(factors);

      setCoerciveSignals(cSignals);

      setIsAnalyzing(false);

      // =====================================================
      // HIGH RISK
      // =====================================================

      if (finalScore >= 70) {

        setIsBlockedModalOpen(true);

        if (onPaymentBlocked) {

          onPaymentBlocked({
            amount: amtNum,

            recipient_upi:
              recipientUpi,

            risk_score:
              finalScore,

            blocked_reason:
              factors
                .map((f) => f.label)
                .join(' + ')
          });
        }

      }

      // =====================================================
      // MEDIUM RISK
      // =====================================================

      else if (finalScore >= 40) {

        setIsUrgentWarningOpen(true);

      }

      // =====================================================
      // LOW RISK
      // =====================================================

      else {

        launchUpiPayment();

      }

    }, 600);
  };

  // =========================================================
  // FALSE POSITIVE
  // =========================================================

  const handleSubmitFalsePositive = () => {

    if (!userOverrideNote.trim()) {
      return;
    }

    setIsOverrideSubmitted(true);
  };

  // =========================================================
  // RISK COLOR
  // =========================================================

  const getRiskColor = (score) => {

    if (score >= 70) {
      return 'var(--danger-light)';
    }

    if (score >= 40) {
      return 'var(--warn-light)';
    }

    return 'var(--safe-light)';
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div style={{ padding: 16 }}>

      {/* =====================================================
          DEVICE SECURITY BADGE
      ===================================================== */}

      <div
        style={{
          background:
            'rgba(255, 255, 255, 0.03)',

          border:
            '1px solid var(--border)',

          borderRadius: 12,

          padding: '8px 12px',

          marginBottom: 14,

          display: 'flex',

          alignItems: 'center',

          justifyContent:
            'space-between',

          fontSize: 11
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--sub)'
          }}
        >

          <Smartphone
            size={14}
            color="var(--indigo-light)"
          />

          <span>
            Device:{' '}
            <strong>
              {safeUser.current_device ||
                'Chrome on Windows'}
            </strong>
          </span>

        </div>

        {safeUser.is_new_device && (

          <span
            style={{
              background:
                'rgba(245, 158, 11, 0.15)',

              color:
                'var(--warn-light)',

              border:
                '1px solid rgba(245, 158, 11, 0.3)',

              padding: '2px 6px',

              borderRadius: 4,

              fontWeight: 800
            }}
          >
            New Device Signal
          </span>

        )}

      </div>

      {/* =====================================================
          VOICE SCAM BANNER
      ===================================================== */}

      {detectedScamCall &&
        detectedScamCall.category && (

          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(12, 18, 32, 0.95))',

              border:
                '1px solid rgba(239, 68, 68, 0.4)',

              borderRadius: 16,

              padding: 12,

              marginBottom: 16,

              display: 'flex',

              alignItems: 'center',

              gap: 10
            }}
          >

            <AlertOctagon
              size={24}
              color="var(--danger-light)"
              style={{
                flexShrink: 0
              }}
            />

            <div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color:
                    'var(--danger-light)'
                }}
              >
                LIVE VOICE SCAM WARNING:{' '}
                {detectedScamCall.category.name ||
                  'Vishing Call'}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: 'var(--sub)'
                }}
              >
                Speech engine flagged
                coercion terms. Any transfer
                will be blocked to protect
                your money.
              </div>

            </div>

          </div>

        )}

      {/* =====================================================
          MAIN PAYMENT CARD
      ===================================================== */}

      <div className="glass-card">

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            marginBottom: 16
          }}
        >

          <h2
            style={{
              fontSize: 20,
              fontWeight: 900
            }}
          >
            UPI Payment Scanner
          </h2>

          <button
            onClick={handleScanQrCode}
            style={{
              background:
                'rgba(99, 102, 241, 0.15)',

              border:
                '1px solid rgba(99, 102, 241, 0.35)',

              color:
                'var(--indigo-light)',

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

            <span>
              Scan QR Code
            </span>

          </button>

        </div>

        {/* ===================================================
            QUICK PAYEES
        =================================================== */}

        <div
          style={{
            marginBottom: 14
          }}
        >

          <div
            style={{
              fontSize: 11,
              color: 'var(--sub)',
              fontWeight: 700,
              marginBottom: 6
            }}
          >
            QUICK TAP DEMO PAYEES:
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap'
            }}
          >

            <button
              onClick={() =>
                fillQuickPayee(
                  'starbucks.coffee@icici',
                  350,
                  'Coffee Payment',
                  false,
                  'Cafe Coffee'
                )
              }
              style={{
                background:
                  'rgba(16, 185, 129, 0.1)',

                border:
                  '1px solid rgba(16, 185, 129, 0.25)',

                color:
                  'var(--safe-light)',

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
              onClick={() =>
                fillQuickPayee(
                  'landlord.rent@hdfc',
                  15000,
                  'House Rent',
                  false,
                  'House Rent'
                )
              }
              style={{
                background:
                  'rgba(99, 102, 241, 0.1)',

                border:
                  '1px solid rgba(99, 102, 241, 0.25)',

                color:
                  'var(--indigo-light)',

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
              onClick={() =>
                fillQuickPayee(
                  'trai.verify@fraudster',
                  18500,
                  'Customs Fee Clearance',
                  true,
                  'TRAI Verification'
                )
              }
              style={{
                background:
                  'rgba(239, 68, 68, 0.12)',

                border:
                  '1px solid rgba(239, 68, 68, 0.3)',

                color:
                  'var(--danger-light)',

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

        {/* ===================================================
            RECIPIENT NAME
        =================================================== */}

        <div className="input-group">

          <label className="input-label">
            Recipient Name
          </label>

          <input
            type="text"
            className="input-field"
            value={recipientName}
            onChange={(e) =>
              setRecipientName(
                e.target.value
              )
            }
            placeholder="Merchant / recipient name"
          />

        </div>

        {/* ===================================================
            UPI ID
        =================================================== */}

        <div className="input-group">

          <label className="input-label">
            Recipient UPI ID
          </label>

          <div
            style={{
              position: 'relative'
            }}
          >

            <input
              type="text"
              className="input-field mono"
              value={recipientUpi}
              onChange={handleUpiChange}
              onPaste={handleUpiPaste}
              placeholder="name@upi / phonepe / gpay"
            />

            {isPasted && (

              <span
                style={{
                  position: 'absolute',

                  right: 10,

                  top: 10,

                  fontSize: 10,

                  fontWeight: 800,

                  color:
                    'var(--warn-light)',

                  background:
                    'rgba(245, 158, 11, 0.15)',

                  padding: '2px 6px',

                  borderRadius: 4
                }}
              >
                PASTED
              </span>

            )}

          </div>

        </div>

        {/* ===================================================
            AMOUNT
        =================================================== */}

        <div className="input-group">

          <label className="input-label">
            Amount (₹)
          </label>

          <input
            type="number"
            min="1"
            step="0.01"
            className="input-field mono"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);

              if (validationError) {
                setValidationError('');
              }
            }}
            placeholder="0.00"
            style={{
              fontSize: 18,
              fontWeight: 800
            }}
          />

        </div>

        {/* ===================================================
            PAYMENT NOTE
        =================================================== */}

        <div className="input-group">

          <label className="input-label">
            Payment Note (Optional)
          </label>

          <input
            type="text"
            className="input-field"
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            placeholder="e.g. Rent, Shopping"
          />

        </div>

        {/* ===================================================
            UPI APP SELECTOR
        =================================================== */}

        <div
          style={{
            marginBottom: 12
          }}
        >

          <label className="input-label">
            Open Payment With
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 8
            }}
          >
            {UPI_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() =>
                  setSelectedUpiApp(app.id)
                }
                style={{
                  minHeight: 46,
                  borderRadius: 10,
                  border:
                    selectedUpiApp === app.id
                      ? '1px solid var(--indigo-light)'
                      : '1px solid var(--border)',
                  background:
                    selectedUpiApp === app.id
                      ? 'rgba(99, 102, 241, 0.16)'
                      : 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 10px',
                  textAlign: 'left'
                }}
              >
                <span
                  style={{
                    minWidth: 0
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 900
                    }}
                  >
                    {app.name}
                  </span>

                  <span
                    style={{
                      display: 'block',
                      fontSize: 10,
                      color: 'var(--sub)'
                    }}
                  >
                    {app.hint}
                  </span>
                </span>

                <Smartphone
                  size={15}
                  color={
                    selectedUpiApp === app.id
                      ? 'var(--indigo-light)'
                      : 'var(--muted)'
                  }
                />
              </button>
            ))}
          </div>

        </div>

        {/* ===================================================
            VALIDATION ERROR
        =================================================== */}

        {validationError && (

          <div
            style={{
              background:
                'rgba(239, 68, 68, 0.12)',

              border:
                '1px solid rgba(239, 68, 68, 0.3)',

              color:
                'var(--danger-light)',

              padding: 10,

              borderRadius: 10,

              fontSize: 12,

              fontWeight: 700,

              marginBottom: 12
            }}
          >
            ⚠️ {validationError}
          </div>

        )}

        {/* ===================================================
            PAY BUTTON
        =================================================== */}

        <button
          className="btn-primary"
          onClick={runRiskAnalysis}
          disabled={isAnalyzing}
          style={{
            marginTop: 8
          }}
        >

          {isAnalyzing ? (

            <span>
              Analyzing Zero-Knowledge Risk
              & Coercion Signals...
            </span>

          ) : (

            <>
              <Send size={18} />

              <span>
                Scan & Pay ₹
                {amount || '0'}
              </span>
            </>

          )}

        </button>

      </div>

      {/* =====================================================
          TRANSACTION SESSION
      ===================================================== */}

      {transactionId && (

        <div
          className="glass-card"
          style={{
            marginTop: 14
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              marginBottom: 12
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >

              <ShieldCheck
                size={18}
                color="var(--safe-light)"
              />

              <strong>
                Payment Session
              </strong>

            </div>

            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                color:
                  paymentStatus === 'SUCCESS'
                    ? 'var(--safe-light)'
                    : 'var(--warn-light)'
              }}
            >
              {paymentStatus}
            </span>

          </div>

          <div
            style={{
              fontSize: 11,
              color: 'var(--sub)'
            }}
          >
            Trust Shield Transaction
            Reference
          </div>

          <div
            className="mono"
            style={{
              fontSize: 13,
              fontWeight: 800,
              marginTop: 5,
              wordBreak: 'break-all'
            }}
          >
            {transactionId}
          </div>

          <button
            onClick={copyTransactionId}
            style={{
              marginTop: 10,
              background:
                'rgba(99, 102, 241, 0.12)',
              border:
                '1px solid rgba(99, 102, 241, 0.3)',
              color:
                'var(--indigo-light)',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >

            <Copy size={13} />

            Copy Reference

          </button>

          <div
            style={{
              marginTop: 12,
              padding: 10,
              background:
                'rgba(255, 255, 255, 0.03)',
              borderRadius: 10,
              fontSize: 11,
              color: 'var(--sub)',
              lineHeight: 1.5
            }}
          >
            <strong
              style={{
                color: 'var(--text)'
              }}
            >
              Payment information
            </strong>

            <br />

            Recipient: {recipientName ||
              recipientUpi}

            <br />

            UPI ID: {recipientUpi}

            <br />

            Amount: ₹
            {parseFloat(amount || 0)
              .toLocaleString('en-IN')}

            <br />

            Risk Score: {riskScore}/100

          </div>

        </div>

      )}

      {/* =====================================================
          DEMO VERIFICATION CONTROLS
      ===================================================== */}

      {transactionId && (
        <div
          className="glass-card"
          style={{
            marginTop: 14
          }}
        >

          <div
            style={{
              fontSize: 12,
              color: 'var(--warn-light)',
              fontWeight: 800,
              marginBottom: 8
            }}
          >
            DEMO PAYMENT VERIFICATION
          </div>

          <p
            style={{
              fontSize: 11,
              color: 'var(--sub)',
              lineHeight: 1.5,
              marginBottom: 10
            }}
          >
            After the UPI app completes the
            transfer, enter the receipt details
            below. A web app cannot directly
            read private bank, phone, UTR, or
            sender details from another UPI app.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 10,
              marginBottom: 12
            }}
          >
            <div className="input-group">
              <label className="input-label">
                UPI Txn ID
              </label>
              <input
                className="input-field mono"
                value={
                  paymentReceipt.upiTransactionId
                }
                onChange={(e) =>
                  handleReceiptChange(
                    'upiTransactionId',
                    e.target.value
                  )
                }
                placeholder="e.g. 4289..."
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                UTR Number
              </label>
              <input
                className="input-field mono"
                value={paymentReceipt.utrNumber}
                onChange={(e) =>
                  handleReceiptChange(
                    'utrNumber',
                    e.target.value
                  )
                }
                placeholder="Bank UTR"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Sender
              </label>
              <input
                className="input-field"
                value={paymentReceipt.senderName}
                onChange={(e) =>
                  handleReceiptChange(
                    'senderName',
                    e.target.value
                  )
                }
                placeholder="Sender name"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Sender Phone
              </label>
              <input
                className="input-field mono"
                value={paymentReceipt.senderPhone}
                onChange={(e) =>
                  handleReceiptChange(
                    'senderPhone',
                    e.target.value
                  )
                }
                placeholder="+91..."
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Sender Bank
              </label>
              <input
                className="input-field"
                value={paymentReceipt.senderBank}
                onChange={(e) =>
                  handleReceiptChange(
                    'senderBank',
                    e.target.value
                  )
                }
                placeholder="Bank name"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Receiver
              </label>
              <input
                className="input-field"
                value={paymentReceipt.receiverName}
                onChange={(e) =>
                  handleReceiptChange(
                    'receiverName',
                    e.target.value
                  )
                }
                placeholder="Receiver name"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Receiver Phone
              </label>
              <input
                className="input-field mono"
                value={paymentReceipt.receiverPhone}
                onChange={(e) =>
                  handleReceiptChange(
                    'receiverPhone',
                    e.target.value
                  )
                }
                placeholder="+91..."
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Receiver Bank
              </label>
              <input
                className="input-field"
                value={paymentReceipt.receiverBank}
                onChange={(e) =>
                  handleReceiptChange(
                    'receiverBank',
                    e.target.value
                  )
                }
                placeholder="Bank name"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Date
              </label>
              <input
                type="date"
                className="input-field mono"
                value={paymentReceipt.paidAtDate}
                onChange={(e) =>
                  handleReceiptChange(
                    'paidAtDate',
                    e.target.value
                  )
                }
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                Time
              </label>
              <input
                type="time"
                className="input-field mono"
                value={paymentReceipt.paidAtTime}
                onChange={(e) =>
                  handleReceiptChange(
                    'paidAtTime',
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {paymentCaptureMessage && (
            <div
              style={{
                color:
                  paymentStatus === 'SUCCESS'
                    ? 'var(--safe-light)'
                    : 'var(--warn-light)',
                fontSize: 11,
                fontWeight: 800,
                marginBottom: 10
              }}
            >
              {paymentCaptureMessage}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 10
            }}
          >
            <button
              className="btn-secondary"
              onClick={() =>
                launchUpiPayment(selectedUpiApp)
              }
              style={{
                width: '100%'
              }}
            >
              <ExternalLink size={16} />
              Reopen UPI
            </button>

            <button
              className="btn-secondary"
              onClick={handleSavePaymentReceipt}
              style={{
                width: '100%'
              }}
            >
              <FileCheck2 size={16} />
              Save Proof
            </button>
          </div>

          <button
            className="btn-secondary"
            onClick={handleDemoPaymentSuccess}
            disabled={
              paymentStatus === 'SUCCESS'
            }
            style={{
              width: '100%',
              marginTop: 10,
              opacity:
                paymentStatus === 'SUCCESS'
                  ? 0.6
                  : 1
            }}
          >

            <CheckCircle2 size={16} />

            {paymentStatus === 'SUCCESS'
              ? 'Payment Verified (Demo)'
              : 'Verify Payment (Demo)'}

          </button>

        </div>
      )}

      {/* =====================================================
          AI RISK OUTPUT
      ===================================================== */}

      {riskFactors.length > 0 && (

        <div
          className="glass-card"
          style={{
            marginTop: 14
          }}
        >

          <div
            className="risk-meter"
            style={{
              background:
                'rgba(0, 0, 0, 0.4)'
            }}
          >

            <div>

              <div
                style={{
                  fontSize: 11,
                  color: 'var(--sub)',
                  fontWeight: 700
                }}
              >
                ZERO-KNOWLEDGE AI RISK SCORE
              </div>

              <div
                className="risk-score-display"
                style={{
                  color:
                    getRiskColor(
                      riskScore
                    )
                }}
              >
                {riskScore}/100
              </div>

            </div>

            <div
              className="risk-level-tag"
              style={{
                background:
                  riskScore >= 70
                    ? 'rgba(239, 68, 68, 0.2)'
                    : riskScore >= 40
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',

                color:
                  getRiskColor(
                    riskScore
                  ),

                border:
                  `1px solid ${getRiskColor(
                    riskScore
                  )}`
              }}
            >

              {riskScore >= 70
                ? 'HIGH RISK (BLOCKED)'
                : riskScore >= 40
                  ? 'MODERATE RISK (CONFIRMATION)'
                  : 'SAFE'}

            </div>

          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--sub)',
              marginBottom: 10
            }}
          >
            COERCIVE & BEHAVIORAL
            INTERACTION SIGNALS:
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >

            {riskFactors.map(
              (factor) => (

                <div
                  key={factor.id}
                  style={{
                    background:
                      'rgba(255, 255, 255, 0.03)',

                    border:
                      '1px solid var(--border)',

                    borderRadius: 12,

                    padding: 10,

                    display: 'flex',

                    alignItems:
                      'flex-start',

                    gap: 10
                  }}
                >

                  <AlertTriangle
                    size={16}
                    color={
                      factor.severity ===
                      'danger'
                        ? 'var(--danger-light)'
                        : 'var(--warn-light)'
                    }
                    style={{
                      marginTop: 2,
                      flexShrink: 0
                    }}
                  />

                  <div>

                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700
                      }}
                    >
                      {factor.label}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--sub)'
                      }}
                    >
                      {factor.labelHindi}
                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      )}

      {/* =====================================================
          QR SCANNER MODAL
      ===================================================== */}

      {isQrScannerOpen && (

        <div className="modal-overlay">

          <div
            className="modal-content"
            style={{
              textAlign: 'center',
              maxWidth: 360
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                marginBottom: 16
              }}
            >

              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900
                }}
              >
                Scan Merchant QR Code
              </div>

              <button
                onClick={() =>
                  setIsQrScannerOpen(false)
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--sub)',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

            </div>

            <div
              style={{
                width: '100%',
                height: 220,
                borderRadius: 16,
                background:
                  'rgba(0, 0, 0, 0.6)',
                border:
                  '2px dashed var(--indigo-light)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: 16
              }}
            >

              <Camera
                size={48}
                color="var(--indigo-light)"
                className="pulse"
              />

              <div
                style={{
                  fontSize: 13,
                  color: 'var(--sub)',
                  marginTop: 12
                }}
              >
                {isScanningQr
                  ? 'Aligning QR Code...'
                  : 'QR Code Detected!'}
              </div>

              <div
                style={{
                  position: 'absolute',
                  inset: 30,
                  border:
                    '2px solid var(--safe-light)',
                  borderRadius: 12,
                  boxShadow:
                    '0 0 20px rgba(16, 185, 129, 0.4)'
                }}
              />

            </div>

            {isScanningQr ? (

              <div
                style={{
                  fontSize: 13,
                  color:
                    'var(--indigo-light)',
                  fontWeight: 700
                }}
              >
                Extracting Merchant UPI &
                Amount...
              </div>

            ) : (

              <div
                style={{
                  fontSize: 13,
                  color:
                    'var(--safe-light)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >

                <CheckCircle2 size={16} />

                <span>
                  Extracted:
                  starbucks.coffee@icici
                  (₹450)
                </span>

              </div>

            )}

          </div>

        </div>

      )}

      {/* =====================================================
          MODERATE RISK WARNING
      ===================================================== */}

      {isUrgentWarningOpen && (

        <div className="modal-overlay">

          <div
            className="modal-content"
            style={{
              textAlign: 'center',
              maxWidth: 420
            }}
          >

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background:
                  'rgba(245, 158, 11, 0.2)',
                border:
                  '1px solid rgba(245, 158, 11, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color:
                  'var(--warn-light)',
                marginBottom: 14
              }}
            >
              <AlertTriangle size={30} />
            </div>

            <h3
              style={{
                fontSize: 20,
                fontWeight: 900,
                color:
                  'var(--warn-light)',
                marginBottom: 6
              }}
            >
              Security Warning:
              Confirm Payment
            </h3>

            <div
              style={{
                fontSize: 12,
                color:
                  'var(--warn-light)',
                fontWeight: 700,
                marginBottom: 12
              }}
            >
              सावधान: इस भुगतान पर सुरक्षा
              चेतावनी जारी की गई है।
            </div>

            <p
              style={{
                fontSize: 13,
                color: 'var(--sub)',
                marginBottom: 16,
                lineHeight: '1.4'
              }}
            >
              This transfer of ₹{amount} to{' '}
              <span className="mono">
                {recipientUpi}
              </span>{' '}
              triggered security flags.
            </p>

            <div
              style={{
                background:
                  'rgba(0, 0, 0, 0.4)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                padding: 12,
                textAlign: 'left',
                fontSize: 12,
                marginBottom: 20
              }}
            >

              <strong
                style={{
                  color: 'var(--text)'
                }}
              >
                Before confirming, check:
              </strong>

              <ul
                style={{
                  paddingLeft: 16,
                  marginTop: 6,
                  color: 'var(--sub)'
                }}
              >

                <li>
                  Are you currently on a
                  voice call asking you to
                  transfer money?
                </li>

                <li>
                  Is someone pressuring you
                  with an urgent deadline?
                </li>

                <li>
                  Legitimate banks & police
                  NEVER demand UPI transfers
                  over phone calls.
                </li>

              </ul>

            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 10
              }}
            >

              <button
                className="btn-secondary"
                onClick={() =>
                  setIsUrgentWarningOpen(
                    false
                  )
                }
              >
                Cancel Payment
              </button>

              <button
                className="btn-primary"
                onClick={() => {

                  setIsUrgentWarningOpen(
                    false
                  );

                  launchUpiPayment();

                }}
                style={{
                  background:
                    'var(--indigo)'
                }}
              >
                Confirm & Open UPI →
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          HIGH RISK BLOCK MODAL
      ===================================================== */}

      {isBlockedModalOpen && (

        <div className="modal-overlay">

          <div
            className="modal-content"
            style={{
              textAlign: 'center',
              maxWidth: 440
            }}
          >

            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                background:
                  'rgba(239, 68, 68, 0.2)',
                border:
                  '1px solid rgba(239, 68, 68, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color:
                  'var(--danger-light)',
                marginBottom: 14
              }}
            >
              <AlertOctagon size={32} />
            </div>

            <h3
              style={{
                fontSize: 22,
                fontWeight: 900,
                color:
                  'var(--danger-light)',
                marginBottom: 6
              }}
            >
              Transaction Blocked
            </h3>

            <p
              style={{
                fontSize: 13,
                color: 'var(--sub)',
                marginBottom: 14
              }}
            >
              Trust Shield prevented transfer
              of ₹{amount} to{' '}
              <span className="mono">
                {recipientUpi}
              </span>{' '}
              to safeguard your bank account.
            </p>

            <div
              style={{
                background:
                  'rgba(239, 68, 68, 0.1)',
                border:
                  '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 12,
                padding: 12,
                fontSize: 12,
                textAlign: 'left',
                color:
                  'var(--danger-light)',
                marginBottom: 16
              }}
            >

              <strong>
                Risk Score: {riskScore}/100
              </strong>

              <ul
                style={{
                  paddingLeft: 16,
                  marginTop: 4
                }}
              >

                {riskFactors.map(
                  (factor) => (
                    <li key={factor.id}>
                      {factor.label}
                    </li>
                  )
                )}

              </ul>

            </div>

            {/* FALSE POSITIVE */}

            <div
              style={{
                background:
                  'rgba(255, 255, 255, 0.03)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                padding: 12,
                textAlign: 'left',
                marginBottom: 16
              }}
            >

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color:
                    'var(--indigo-light)',
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >

                <HelpCircle size={14} />

                <span>
                  Is this a False Positive /
                  Legitimate Payment?
                </span>

              </div>

              <p
                style={{
                  fontSize: 11,
                  color: 'var(--sub)',
                  marginBottom: 8
                }}
              >
                If this is a legitimate urgent
                medical bill or family emergency
                transfer, submit a note for your
                Bank Cyber Risk Officer to review.
              </p>

              {isOverrideSubmitted ? (

                <div
                  style={{
                    background:
                      'rgba(16, 185, 129, 0.15)',
                    border:
                      '1px solid rgba(16, 185, 129, 0.35)',
                    color:
                      'var(--safe-light)',
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >

                  <CheckCircle2
                    size={16}
                    style={{
                      display: 'inline',
                      marginRight: 6
                    }}
                  />

                  False Positive Review Case
                  submitted to Bank Cyber Risk
                  Officer!

                </div>

              ) : (

                <div
                  style={{
                    display: 'flex',
                    gap: 6
                  }}
                >

                  <input
                    type="text"
                    className="input-field"
                    value={userOverrideNote}
                    onChange={(e) =>
                      setUserOverrideNote(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Legitimate hospital deposit"
                    style={{
                      fontSize: 11,
                      padding: '6px 10px'
                    }}
                  />

                  <button
                    onClick={
                      handleSubmitFalsePositive
                    }
                    style={{
                      background:
                        'var(--indigo)',
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

            <button
              className="btn-primary"
              onClick={() =>
                setIsBlockedModalOpen(false)
              }
            >
              Acknowledge & Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}