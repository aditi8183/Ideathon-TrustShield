import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertTriangle, Play, ShieldAlert, Zap, PhoneCall, Package, Landmark, TrendingUp, Sparkles, CheckCircle2, Radar, Gift, Volume2, Activity, Globe, MessageSquare } from 'lucide-react';
import { CHAKRAVYUH_SCAM_CATEGORIES, classifySpeechAutonomously } from '../data/scamKeywords';

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
  const [micStatusText, setMicStatusText] = useState('Turn on Mic to speak — Speech gets typed live & flags issues automatically');
  const [audioLevel, setAudioLevel] = useState(0); // Live mic volume level (0-100)

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const accumulatedTranscriptRef = useRef(externalTranscript || '');
  const lastSoundTimeRef = useRef(Date.now());

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

  // Universal Cross-Browser Speech Recognition Engine (AI4Bharat Indic & Web Speech ASR Integration)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      try {
        recognition.lang = 'en-IN';
      } catch (e) {
        recognition.lang = navigator.language || 'en-US';
      }

      recognition.onstart = () => {
        setMicStatusText('🎤 Mic Active & Listening! Speak in English, Hindi, Hinglish or Indic languages...');
      };

      recognition.onresult = (event) => {
        lastSoundTimeRef.current = Date.now();
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
          accumulatedTranscriptRef.current += newFinalText;
        }

        const combinedLiveSpeech = (accumulatedTranscriptRef.current + interimText).trim();

        if (combinedLiveSpeech) {
          setTranscript(combinedLiveSpeech);
          if (onTranscriptChange) onTranscriptChange(combinedLiveSpeech);
          processAutonomousClassification(combinedLiveSpeech);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setMicStatusText('⚠️ Mic access denied. Please click the lock icon in your browser address bar to allow microphone.');
        } else if (event.error === 'network') {
          setMicStatusText('🎤 Listening... If speech lags, you can also type call audio directly into the box.');
        } else if (event.error === 'no-speech') {
          if (isListening && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }
      };

      recognition.onend = () => {
        if (isListening && recognitionRef.current && !isSimulating) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    } else {
      setMicStatusText('⚠️ Web Speech ASR not supported in this browser. Type call audio into the box below.');
    }
  }, [isListening, isSimulating]);

  // Autonomous Classification Processor
  const processAutonomousClassification = (text) => {
    const result = classifySpeechAutonomously(text);
    setClassification(result);

    if (result.detected) {
      onScamDetected({
        category: result.category,
        confidence: result.confidence,
        matchedPatterns: result.matchedPatterns,
        transcript: text
      });
    }
  };

  // Web Audio Hardware Microphone Level Analyzer
  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        }
      });
      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 64) * 100));
        setAudioLevel(normalized);

        if (normalized > 15 && (Date.now() - lastSoundTimeRef.current > 4000) && isListening && recognitionRef.current) {
          lastSoundTimeRef.current = Date.now();
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              try { recognitionRef.current.start(); } catch (e) {}
            }, 100);
          } catch (e) {}
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Web Audio API stream error:', err);
    }
  };

  const stopAudioAnalyzer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    setAudioLevel(0);
  };

  // Clear transcript explicitly
  const handleClearTranscript = () => {
    setTranscript('');
    setClassification(null);
    accumulatedTranscriptRef.current = '';
    if (onClearTranscript) onClearTranscript();
  };

  // Toggle Microphone
  const toggleListening = async () => {
    if (isListening) {
      stopAudioAnalyzer();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setIsSimulating(false);
      setMicStatusText('Turn on Mic to speak — Speech gets typed live & flags issues automatically');
    } else {
      await startAudioAnalyzer();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setMicStatusText('🎤 Microphone Active & Listening! Speak in English, Hindi or Indic languages...');
        } catch (e) {
          console.log('Speech recognition active');
        }
      }
      setIsListening(true);
    }
  };

  // Manual Transcript Input Handler
  const handleTranscriptChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    if (onTranscriptChange) onTranscriptChange(val);
    processAutonomousClassification(val);
  };

  // Simulation Trigger with Indic Multi-Lingual Speech Streams
  const triggerRandomIncomingCall = () => {
    setIsListening(true);
    setIsSimulating(true);
    setTranscript('');
    if (onTranscriptChange) onTranscriptChange('');
    setClassification(null);
    accumulatedTranscriptRef.current = '';
    setMicStatusText('Simulated Call Active... Parsing spoken Indic speech word-by-word');

    const SIMULATED_CALL_SPEECH_STREAM = [
      "Sir aapka SBI bank KYC expire ho gaya hai. Agar abhi OTP nahi diya toh account block ho jayega.",
      "Hello, your Flipkart parcel containing illegal contraband and fake passports has been detained. Pay Rs 499 clearance duty fee immediately.",
      "This is Inspector Sharma from Delhi Cyber Crime Cell and CBI. Your Aadhaar card is involved in money laundering. You are under digital arrest.",
      "TRAI Alert Notice: Your mobile numbers will be disconnected within 2 hours due to illegal broadcasting. Press 9 to talk to officer.",
      "Dear consumer, your electricity bill is unpaid. Power connection will be disconnected tonight at 9:30 PM by electricity discom office.",
      "Please send the invoice to accounts department for payment processing." // Negative legitimate example
    ];

    const randomSpeech = SIMULATED_CALL_SPEECH_STREAM[Math.floor(Math.random() * SIMULATED_CALL_SPEECH_STREAM.length)];

    let currentText = '';
    const words = randomSpeech.split(' ');
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setTranscript(currentText);
        if (onTranscriptChange) onTranscriptChange(currentText);
        processAutonomousClassification(currentText);
        wordIndex++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 140);
  };

  const renderCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert size={24} />;
      case 'Package': return <Package size={24} />;
      case 'PhoneCall': return <PhoneCall size={24} />;
      case 'Zap': return <Zap size={24} />;
      case 'TrendingUp': return <TrendingUp size={24} />;
      case 'Landmark': return <Landmark size={24} />;
      case 'Gift': return <Gift size={24} />;
      default: return <AlertTriangle size={24} />;
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        borderColor: classification && classification.scam_label ? 'rgba(239, 68, 68, 0.45)' : isListening ? 'rgba(16, 185, 129, 0.35)' : 'var(--border)',
        boxShadow: classification && classification.scam_label ? '0 0 28px rgba(239, 68, 68, 0.25)' : 'none'
      }}
    >
      {/* Header & Mic Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: isListening ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isListening ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isListening ? 'var(--safe-light)' : 'var(--sub)'
          }}>
            {isListening ? <Radar size={24} className="pulse" /> : <MicOff size={22} />}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Autonomous Vishing Detector</span>
              <Sparkles size={14} color="var(--gold)" />
            </div>
            <div style={{ fontSize: 12, color: isListening ? 'var(--safe-light)' : 'var(--sub)' }}>
              {micStatusText}
            </div>
          </div>
        </div>

        {isListening && (
          <div style={{ textAlign: 'right' }}>
            <div className="voice-bar-container">
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
              <div className="voice-bar"></div>
            </div>
            <div style={{ fontSize: 9, color: audioLevel > 20 ? 'var(--safe-light)' : 'var(--warn-light)', fontWeight: 800, marginTop: 4 }}>
              MIC VOL: {audioLevel}% {audioLevel > 20 ? '🔊' : '🔉'}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Live Typed / Editable Speech Field */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 700, letterSpacing: '0.5px' }}>
            SPEECH TEXT TYPED IN REAL-TIME FROM MIC / CALL:
          </span>
          <span style={{ fontSize: 10, color: 'var(--indigo-light)', fontWeight: 600 }}>
            (Type or speak live)
          </span>
        </div>
        <textarea
          className="input-field"
          rows={3}
          value={transcript}
          onChange={handleTranscriptChange}
          placeholder='Click "Start Mic Recording" and speak (e.g. "Sir aapka KYC expire ho gaya hai, OTP bata dijiye") or type call audio here...'
          style={{
            fontSize: 13,
            lineHeight: '1.4',
            fontStyle: 'italic',
            resize: 'none',
            background: 'rgba(0, 0, 0, 0.4)',
            borderColor: classification && classification.scam_label ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'
          }}
        />
      </div>

      {/* DETECTED MULTI-LINGUAL SCAM CARD OR SAFE STATE */}
      {classification && classification.detected && classification.scam_label ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(12, 18, 32, 0.98))',
          border: '1px solid rgba(239, 68, 68, 0.45)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger-light)' }}>
              {renderCategoryIcon(classification.category.icon)}
              <div>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 800 }}>AUTONOMOUSLY DETECTED SCENARIO</div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{classification.category.name}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: 11,
                fontWeight: 900,
                padding: '4px 8px',
                borderRadius: 6,
                background: classification.risk_level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)',
                color: classification.risk_level === 'CRITICAL' ? 'var(--danger-light)' : 'var(--warn-light)',
                border: '1px solid rgba(239, 68, 68, 0.5)'
              }}>
                🚨 {classification.risk_level} RISK ({classification.confidence}%)
              </span>
            </div>
          </div>

          {/* AI4Bharat Language & IndicTrans2 Translation Layer */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--indigo-light)', fontWeight: 800, marginBottom: 4 }}>
              <Globe size={13} />
              <span>DETECTED LANGUAGE: {classification.language}</span>
            </div>
            {classification.english_translation && classification.english_translation !== classification.original_text && (
              <div style={{ fontSize: 11, color: 'var(--sub)', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <MessageSquare size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                <div><strong>English Translation (IndicTrans2):</strong> "{classification.english_translation}"</div>
              </div>
            )}
          </div>

          {/* Granular Multi-Factor Indicator Badges */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: 12,
            padding: 10,
            marginBottom: 10
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>DETECTED THREAT SIGNALS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {classification.signals.impersonation && <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-light)', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.4)' }}>🔴 Impersonation Claim</span>}
              {classification.signals.urgency && <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warn-light)', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.4)' }}>🔴 Urgency Pressure</span>}
              {classification.signals.threat && <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-light)', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.4)' }}>🔴 Authority Lockout Threat</span>}
              {classification.signals.credential_request && <span style={{ background: 'rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, border: '1px solid #f87171' }}>🔑 OTP / Credential Theft</span>}
              {classification.signals.payment_request && <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warn-light)', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.4)' }}>💸 Extortion Payment Fee</span>}
              {classification.signals.screen_share && <span style={{ background: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger-light)', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.5)' }}>💻 Remote AnyDesk Control</span>}
            </div>

            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>MATCHED INTENT PATTERNS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {classification.matchedPatterns.map((pat) => (
                <span
                  key={pat}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--danger-light)',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4
                  }}
                >
                  "{pat}"
                </span>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            fontSize: 11,
            color: 'var(--warn-light)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: 10,
            borderRadius: 10
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div><strong>Recommended Action:</strong> {classification.category.actionPlan}</div>
          </div>
        </div>
      ) : isListening ? (
        /* CLEAN SAFE STATE (ENRON NEGATIVE & NORMAL STATEMENTS) */
        <div style={{
          padding: 14,
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 14,
          color: 'var(--safe-light)',
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--safe-light)' }}>
              Looks clean, you are good to go!
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500, marginTop: 2 }}>
              {transcript ? `Parsed in ${classification?.language || 'English'} — zero threat signals, coercive tactics, or scam keywords found.` : 'Microphone active & volume analyzing... Speak or type call audio into the box above.'}
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          onClick={toggleListening}
          className={`btn-primary ${isListening ? 'btn-danger' : ''}`}
          style={{ fontSize: 13 }}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          <span>{isListening ? 'Stop Mic' : 'Start Mic Recording'}</span>
        </button>

        <button
          onClick={triggerRandomIncomingCall}
          className="btn-secondary"
          disabled={isSimulating}
          style={{
            fontSize: 13,
            background: 'rgba(99, 102, 241, 0.12)',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            color: 'var(--indigo-light)'
          }}
        >
          <Play size={15} />
          <span>{isSimulating ? 'Simulating Call...' : 'Simulate Scam Call'}</span>
        </button>
      </div>
    </div>
  );
}
