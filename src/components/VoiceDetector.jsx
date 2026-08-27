import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  AlertTriangle,
  ShieldAlert,
  Zap,
  PhoneCall,
  Package,
  Landmark,
  TrendingUp,
  CheckCircle2,
  Gift,
  Globe,
  Cpu,
  Trash2,
  PlayCircle,
  StopCircle,
  Search,
  Sparkles
} from 'lucide-react';
import { SpeechRecognition as CapSpeechRecognition } from '@capacitor-community/speech-recognition';
import { CHAKRAVYUH_SCAM_CATEGORIES, classifySpeechAutonomously } from '../data/scamKeywords';

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)' },
  { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' }
];

export default function VoiceDetector({
  onScamDetected,
  isListening,
  setIsListening,
  externalTranscript,
  onTranscriptChange,
  onClearTranscript
}) {
  const [transcript, setTranscript] = useState(externalTranscript || '');
  const [classification, setClassification] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [micStatusText, setMicStatusText] = useState('Tap Microphone to start live speech transcription & threat analysis');
  const [inferenceTimeMs, setInferenceTimeMs] = useState(2);
  const [activeSimulatedCall, setActiveSimulatedCall] = useState(null);

  // Persistent Refs
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(isListening);
  const accumulatedTranscriptRef = useRef(externalTranscript || '');
  const simulationIntervalRef = useRef(null);

  // Synchronize isListening ref with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Keep internal transcript state in sync with externalTranscript prop
  useEffect(() => {
    if (externalTranscript !== undefined && externalTranscript !== transcript) {
      setTranscript(externalTranscript);
      accumulatedTranscriptRef.current = externalTranscript;
      if (externalTranscript) {
        processAutonomousClassification(externalTranscript);
      } else {
        setClassification(null);
      }
    }
  }, [externalTranscript]);

  // Autonomous Classification Processor
  const processAutonomousClassification = (text) => {
    if (!text || !text.trim()) {
      setClassification(null);
      if (onScamDetected) onScamDetected(null);
      return;
    }

    const startTime = performance.now();
    const result = classifySpeechAutonomously(text);
    const elapsed = Math.round(performance.now() - startTime);
    setInferenceTimeMs(Math.max(1, elapsed));

    setClassification(result);

    if (result && result.detected && result.scam_label) {
      if (onScamDetected) {
        onScamDetected({
          category: result.category,
          confidence: result.confidence,
          matchedPatterns: result.matchedPatterns,
          transcript: text
        });
      }
    } else {
      if (onScamDetected) onScamDetected(null);
    }
  };

  // Stable Speech Recognition Initializer for Web / Desktop
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicStatusText('ℹ️ Web Speech API not detected in this browser. You can type audio or use scenario chips.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setMicStatusText(`🎤 Listening in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.label || selectedLanguage}... Speak freely.`);
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let newFinalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            newFinalText += res[0].transcript + ' ';
          } else {
            interimText += res[0].transcript;
          }
        }

        if (newFinalText) {
          accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + ' ' + newFinalText).replace(/\s+/g, ' ').trim();
        }

        const combinedLiveSpeech = (accumulatedTranscriptRef.current + ' ' + interimText).replace(/\s+/g, ' ').trim();

        if (combinedLiveSpeech) {
          setTranscript(combinedLiveSpeech);
          if (onTranscriptChange) onTranscriptChange(combinedLiveSpeech);
          processAutonomousClassification(combinedLiveSpeech);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          setMicStatusText('⚠️ Microphone permission blocked. Click lock icon in browser URL bar to allow.');
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          if (isListeningRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        } else if (event.error === 'network') {
          setMicStatusText('🌐 Speech Recognition active. You can speak or type audio.');
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && !simulationIntervalRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition setup error:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [selectedLanguage]);

  const isCapacitorNative = () => {
    return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
  };

  const startNativeSpeechRecognition = async () => {
    try {
      const hasPerm = await CapSpeechRecognition.hasPermission();
      if (!hasPerm || !hasPerm.permission) {
        const req = await CapSpeechRecognition.requestPermission();
        if (!req || !req.permission) {
          setMicStatusText('⚠️ Microphone permission required for Android speech detection.');
          return false;
        }
      }

      await CapSpeechRecognition.removeAllListeners();

      CapSpeechRecognition.addListener('partialResults', (data) => {
        if (data && data.matches && data.matches.length > 0) {
          const liveText = data.matches[0];
          if (liveText && liveText.trim()) {
            accumulatedTranscriptRef.current = liveText;
            setTranscript(liveText);
            if (onTranscriptChange) onTranscriptChange(liveText);
            processAutonomousClassification(liveText);
          }
        }
      });

      setMicStatusText('🎤 Android Google Speech Active! Speak in English, Hindi, or Hinglish...');

      CapSpeechRecognition.start({
        language: selectedLanguage,
        maxResults: 5,
        prompt: 'Speak call scenario (e.g. "Sir KYC expired tell OTP")...',
        partialResults: true,
        popup: false
      }).then((result) => {
        if (result && result.matches && result.matches.length > 0) {
          const spokenText = result.matches[0];
          if (spokenText && spokenText.trim()) {
            accumulatedTranscriptRef.current = spokenText;
            setTranscript(spokenText);
            if (onTranscriptChange) onTranscriptChange(spokenText);
            processAutonomousClassification(spokenText);
          }
        }
      }).catch((e) => console.warn('Native speech session note:', e));

      return true;
    } catch (err) {
      console.warn('Native speech startup notice:', err);
      return false;
    }
  };

  const stopNativeSpeechRecognition = async () => {
    try {
      await CapSpeechRecognition.stop();
      await CapSpeechRecognition.removeAllListeners();
    } catch (e) {}
  };

  // Toggle Microphone
  const toggleListening = async () => {
    if (isSimulating) {
      stopSimulatedCall();
      setIsListening(false);
      return;
    }

    if (isListening) {
      if (isCapacitorNative()) {
        await stopNativeSpeechRecognition();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setMicStatusText('Microphone paused. Tap to listen or select a quick test scenario.');
    } else {
      setIsListening(true);

      let startedNative = false;
      if (isCapacitorNative()) {
        startedNative = await startNativeSpeechRecognition();
      }

      if (!startedNative && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setMicStatusText(`🎤 Listening in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.label || selectedLanguage}... Speak now.`);
        } catch (e) {
          console.log('Recognition start note:', e);
        }
      }
    }
  };

  // Clear transcript
  const handleClearTranscript = () => {
    setTranscript('');
    setClassification(null);
    accumulatedTranscriptRef.current = '';
    if (onScamDetected) onScamDetected(null);
    if (onClearTranscript) onClearTranscript();
  };

  // Manual Transcript Input Handler
  const handleTranscriptChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    accumulatedTranscriptRef.current = val;
    if (onTranscriptChange) onTranscriptChange(val);
    processAutonomousClassification(val);
  };

  // Common Scam Scenarios for instant testing
  const SCAM_SIMULATION_LIST = [
    {
      id: 'cbi_digital_arrest',
      name: '🚨 CBI Digital Arrest',
      caller: 'Cyber Crime Police (CBI Cell)',
      number: '+91 22 6789 4321',
      text: 'This is Officer Vijay Verma from Mumbai Police Cyber Cell. An international parcel containing 140 grams of MDMA narcotics registered under your Aadhaar was intercepted. You are under digital arrest. Transfer Rs 18,500 customs fee immediately.'
    },
    {
      id: 'sbi_kyc_freeze',
      name: '🏦 Bank KYC & OTP Scam',
      caller: 'SBI Risk Compliance',
      number: '+91 1800 11 2211',
      text: 'Sir, your SBI bank account and debit card are frozen due to unverified PAN KYC. Please share the 6-digit OTP code received on your phone immediately to unblock your account.'
    },
    {
      id: 'electricity_cutoff',
      name: '⚡ Power Cutoff 9:30 PM',
      caller: 'State Electricity Discom',
      number: '+91 98 7654 3210',
      text: 'Dear consumer, your electricity power connection will be disconnected tonight at 9:30 PM due to unpaid bill. Pay Rs 350 reconnect fee via AnyDesk or UPI immediately.'
    },
    {
      id: 'reward_points_scam',
      name: '🎁 Reward Points Expiry',
      caller: 'Credit Card Reward Cell',
      number: '+91 80 4567 8901',
      text: 'Dear customer, your credit card reward points worth Rs 9,850 will expire today. Click the link to redeem cash into your bank account: https://sbi-reward-points.xyz'
    },
    {
      id: 'free_recharge_scam',
      name: '📱 3-Month Free Recharge',
      caller: 'Telecom Offer Bot',
      number: '+91 91 2345 6789',
      text: 'Congratulations! You have won free 3 months 5G recharge under PM Scheme. Click here to activate your free recharge: http://free-recharge.in'
    },
    {
      id: 'video_blackmail',
      name: '⚠️ Video Call Extortion',
      caller: 'Unknown Extortionist',
      number: '+91 99 8877 6655',
      text: 'We have recorded your private video call. Transfer Rs 50,000 immediately or this video will be sent to all your family members and contacts within 15 minutes.'
    }
  ];

  // Stop Active Simulation
  const stopSimulatedCall = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    setIsSimulating(false);
    setActiveSimulatedCall(null);
    setMicStatusText('Simulation finished. Mic is ready for live speech testing.');
  };

  // Start Realistic Scam Call Simulation
  const startSimulatedCall = (scenario) => {
    stopSimulatedCall();

    const targetScenario = scenario || SCAM_SIMULATION_LIST[Math.floor(Math.random() * SCAM_SIMULATION_LIST.length)];
    setActiveSimulatedCall(targetScenario);
    setIsSimulating(true);
    setIsListening(true);
    setTranscript('');
    accumulatedTranscriptRef.current = '';
    if (onTranscriptChange) onTranscriptChange('');
    setClassification(null);
    setMicStatusText(`📞 Call Streaming: ${targetScenario.caller} — Real-time ChakraVyuh Threat Analysis...`);

    // Voice Synthesis Audio Playback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(targetScenario.text);
        utterance.rate = 0.95;
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }

    // Stream speech word by word
    const words = targetScenario.text.split(' ');
    let currentIdx = 0;
    let liveText = '';

    simulationIntervalRef.current = setInterval(() => {
      if (currentIdx < words.length) {
        liveText += (currentIdx > 0 ? ' ' : '') + words[currentIdx];
        currentIdx++;
        setTranscript(liveText);
        accumulatedTranscriptRef.current = liveText;
        if (onTranscriptChange) onTranscriptChange(liveText);
        processAutonomousClassification(liveText);
      } else {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
          simulationIntervalRef.current = null;
        }
        setMicStatusText(`🚨 Threat Analysis Completed! Live call flagged by ChakraVyuh AI.`);
      }
    }, 160);
  };

  // Render Category Icon
  const renderCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert size={22} />;
      case 'Package': return <Package size={22} />;
      case 'PhoneCall': return <PhoneCall size={22} />;
      case 'Zap': return <Zap size={22} />;
      case 'TrendingUp': return <TrendingUp size={22} />;
      case 'Landmark': return <Landmark size={22} />;
      case 'Gift': return <Gift size={22} />;
      default: return <AlertTriangle size={22} />;
    }
  };

  const isScamDetected = classification && classification.scam_label;

  return (
    <div
      className="glass-card"
      style={{
        borderColor: isScamDetected ? 'rgba(239, 68, 68, 0.55)' : isListening ? 'rgba(16, 185, 129, 0.45)' : 'var(--border)',
        boxShadow: isScamDetected ? '0 0 30px rgba(239, 68, 68, 0.3)' : isListening ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Top Status Bar: Engine Status & Language Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        background: 'var(--card-inner)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '8px 12px',
        marginBottom: 14,
        fontSize: 11
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--safe-light)', fontWeight: 700 }}>
          <Cpu size={14} />
          <span>ChakraVyuh AI Engine: <strong>ACTIVE</strong> ({inferenceTimeMs}ms · On-Device Zero Latency)</span>
        </div>

        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={13} color="var(--sub)" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Simulation Alert Banner */}
      {isSimulating && activeSimulatedCall && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(99, 102, 241, 0.2))',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.3)',
              border: '2px solid var(--danger-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--danger-light)'
            }}>
              <PhoneCall size={18} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--danger-light)', textTransform: 'uppercase' }}>
                🔴 SIMULATED INCOMING CALL
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
                {activeSimulatedCall.caller} ({activeSimulatedCall.number})
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={stopSimulatedCall}
            style={{
              background: 'var(--danger)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <StopCircle size={14} />
            <span>End Call</span>
          </button>
        </div>
      )}

      {/* Main Microphone Action Center */}
      <div style={{
        textAlign: 'center',
        padding: '16px 12px',
        background: 'var(--card-inner)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        marginBottom: 14
      }}>
        {/* Pulsing Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            border: `3px solid ${isListening ? '#fca5a5' : '#a7f3d0'}`,
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isListening
              ? '0 0 30px rgba(239, 68, 68, 0.6)'
              : '0 0 25px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.25s ease',
            marginBottom: 10
          }}
        >
          {isListening ? <Mic size={34} /> : <MicOff size={32} />}
        </button>

        <div style={{ fontSize: 16, fontWeight: 900, color: isListening ? 'var(--danger-light)' : 'var(--text)', marginBottom: 4 }}>
          {isListening ? '🔴 Live Audio Transcribing Active' : 'Microphone Ready'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--sub)', maxWidth: 420, margin: '0 auto 12px' }}>
          {micStatusText}
        </div>

        {/* Animated Live Wave Bars */}
        {isListening && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 24, marginBottom: 10 }}>
            {[18, 24, 14, 28, 20, 12, 26, 16, 22, 28, 14, 20, 26, 12, 24, 18].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: `${h}px`,
                  borderRadius: 2,
                  background: isScamDetected ? 'var(--danger-light)' : 'var(--safe-light)',
                  animation: `pulse ${(i % 3) * 0.2 + 0.5}s infinite ease-in-out alternate`
                }}
              />
            ))}
          </div>
        )}

        {/* Quick Simulation Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => startSimulatedCall()}
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--indigo-light)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <PlayCircle size={14} />
            <span>Simulate Scam Call Audio</span>
          </button>
        </div>
      </div>

      {/* Live Speech Transcript Box (Editable & Live Streamed) */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Speech Transcript (Live or Typed):
          </span>
          {transcript && (
            <button
              type="button"
              onClick={handleClearTranscript}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sub)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Trash2 size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          value={transcript}
          onChange={handleTranscriptChange}
          placeholder="Speak into microphone or paste call dialogue here (e.g. 'Sir your bank account KYC has expired, please share the 6-digit OTP immediately')..."
          rows={3}
          style={{
            width: '100%',
            background: 'var(--card-inner)',
            color: 'var(--text)',
            border: `1px solid ${isScamDetected ? 'rgba(239, 68, 68, 0.45)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 13,
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Quick Test Scenario Chips */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--sub)', marginBottom: 6, textTransform: 'uppercase' }}>
          Test Common Scam Scenarios:
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {SCAM_SIMULATION_LIST.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                setTranscript(sc.text);
                accumulatedTranscriptRef.current = sc.text;
                if (onTranscriptChange) onTranscriptChange(sc.text);
                processAutonomousClassification(sc.text);
              }}
              style={{
                background: 'var(--card-inner)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: 20,
                padding: '5px 12px',
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
              <span>{sc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Scam Threat Analysis Card */}
      {classification && (
        <div style={{
          background: isScamDetected
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.08))'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.06))',
          border: `1px solid ${isScamDetected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.35)'}`,
          borderRadius: 14,
          padding: 14,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                color: isScamDetected ? 'var(--danger-light)' : 'var(--safe-light)',
                display: 'flex',
                alignItems: 'center'
              }}>
                {renderCategoryIcon(classification.category?.icon || (isScamDetected ? 'ShieldAlert' : 'CheckCircle2'))}
              </div>
              <div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: isScamDetected ? 'var(--danger-light)' : 'var(--safe-light)',
                  textTransform: 'uppercase'
                }}>
                  {isScamDetected ? `🚨 THREAT DETECTED (${classification.risk_level})` : '✅ CLEAN & SAFE COMMUNICATION'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>
                  {classification.category?.name || (isScamDetected ? 'Suspicious Coercive Pattern' : 'Normal Dialogue')}
                </div>
              </div>
            </div>

            <div style={{
              background: isScamDetected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: `1px solid ${isScamDetected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: 12,
              fontWeight: 900,
              color: isScamDetected ? 'var(--danger-light)' : 'var(--safe-light)'
            }}>
              {classification.confidence}% Match
            </div>
          </div>

          {/* Matched Red Flags / Signal Tags */}
          {classification.matchedPatterns && classification.matchedPatterns.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {classification.matchedPatterns.map((pat, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(239, 68, 68, 0.18)',
                    color: 'var(--danger-light)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 6,
                    padding: '2px 7px',
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                >
                  ⚠️ {pat}
                </span>
              ))}
            </div>
          )}

          {/* Action Recommendation */}
          <div style={{
            marginTop: 10,
            background: 'var(--card-inner)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 11,
            color: 'var(--text)'
          }}>
            <strong>🛡️ Action Plan: </strong>
            {classification.category?.actionPlan || classification.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
