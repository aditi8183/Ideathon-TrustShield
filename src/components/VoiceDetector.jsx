import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertTriangle, Play, ShieldAlert, Zap, PhoneCall, Package, Landmark, TrendingUp, Sparkles, CheckCircle2, Radar, Gift, Volume2 } from 'lucide-react';
import { CHAKRAVYUH_SCAM_CATEGORIES, classifySpeechAutonomously } from '../data/scamKeywords';

export default function VoiceDetector({ onScamDetected, isListening, setIsListening }) {
  const [transcript, setTranscript] = useState('');
  const [classification, setClassification] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [micStatusText, setMicStatusText] = useState('Turn on Mic to speak — Speech gets typed live & flags issues automatically');
  const [audioLevel, setAudioLevel] = useState(0); // Live mic volume level (0-100)

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');

  // Preset live speech samples for simulation testing
  const SIMULATED_CALL_SPEECH_STREAM = [
    "Hello, your FedEx package containing illegal contraband and 5 fake passports has been detained at Mumbai Customs. Pay Rs 1,500 clearance duty fee immediately via UPI.",
    "Sir, this is Inspector Sharma from Delhi Cyber Crime Cell and CBI. Your name and Aadhaar card are involved in a money laundering case. This is a digital arrest. Do not hang up the call or inform anyone.",
    "TRAI Alert Notice: All mobile numbers under your Aadhaar will be disconnected within 2 hours due to illegal broadcasting. Press 9 to talk to telecom officer or transfer verification fee.",
    "Dear consumer, your electricity bill of previous month is unpaid. Power connection will be disconnected tonight at 9:30 PM by electricity office officer. Call helpline and pay immediately.",
    "Hi! Earn Rs 5,000 daily part time job by liking YouTube videos and Google reviews. Guaranteed 300% return on prepaid VIP tasks. Deposit money via UPI to start.",
    "Congratulations! You won Rs 25 Lakh in KBC Lottery Lucky Draw. You must deposit 2% GST tax upfront via UPI to claim prize money."
  ];

  // Universal Cross-Browser Speech Recognition Engine
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Automatically adopt the browser's primary language or fallback to English
      recognition.lang = navigator.language || 'en-IN';

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
          accumulatedTranscriptRef.current += newFinalText;
        }

        const combinedLiveSpeech = (accumulatedTranscriptRef.current + interimText).trim();

        if (combinedLiveSpeech) {
          setTranscript(combinedLiveSpeech);
          processAutonomousClassification(combinedLiveSpeech);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setMicStatusText('⚠️ Mic access denied. Please click the lock icon in your browser address bar to allow microphone.');
        } else if (event.error === 'network') {
          setMicStatusText('🎤 Listening... Speak into your microphone to parse speech.');
        }
      };

      recognition.onend = () => {
        // Continuous listening auto-restart
        if (isListening && recognitionRef.current && !isSimulating) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    } else {
      setMicStatusText('⚠️ Speech Recognition API not supported in this browser. Please open in Google Chrome or Microsoft Edge.');
    }
  }, [isListening, isSimulating]);

  // Autonomous Classification Processor
  const processAutonomousClassification = (text) => {
    const result = classifySpeechAutonomously(text);
    if (result.detected) {
      setClassification(result);
      onScamDetected({
        category: result.category,
        confidence: result.confidence,
        matchedPatterns: result.matchedPatterns,
        transcript: text
      });
    } else {
      setClassification(null);
    }
  };

  // Web Audio Hardware Microphone Level Analyzer
  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

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
      setTranscript('');
      setClassification(null);
      accumulatedTranscriptRef.current = '';

      await startAudioAnalyzer();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setMicStatusText('🎤 Microphone Active & Listening! Speak clearly into your mic...');
        } catch (e) {
          console.log('Speech recognition active');
        }
      }
      setIsListening(true);
    }
  };

  // Manual Transcript Input Handler (allows direct typing/pasting spoken call text)
  const handleTranscriptChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    processAutonomousClassification(val);
  };

  // Simulation Trigger
  const triggerRandomIncomingCall = () => {
    setIsListening(true);
    setIsSimulating(true);
    setTranscript('');
    setClassification(null);
    accumulatedTranscriptRef.current = '';
    setMicStatusText('Simulated Call Active... Parsing spoken text word-by-word');

    const randomSpeech = SIMULATED_CALL_SPEECH_STREAM[Math.floor(Math.random() * SIMULATED_CALL_SPEECH_STREAM.length)];

    let currentText = '';
    const words = randomSpeech.split(' ');
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setTranscript(currentText);
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
        borderColor: classification ? 'rgba(239, 68, 68, 0.45)' : isListening ? 'rgba(16, 185, 129, 0.35)' : 'var(--border)',
        boxShadow: classification ? '0 0 28px rgba(239, 68, 68, 0.25)' : 'none'
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
            <div style={{ fontSize: 9, color: 'var(--safe-light)', fontWeight: 800, marginTop: 4 }}>
              MIC VOL: {audioLevel}%
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
          placeholder='Click "Start Mic Recording" and speak (e.g. "FedEx parcel detained at customs with illegal drugs") or type/paste call audio here...'
          style={{
            fontSize: 13,
            lineHeight: '1.4',
            fontStyle: 'italic',
            resize: 'none',
            background: 'rgba(0, 0, 0, 0.4)',
            borderColor: classification ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'
          }}
        />
      </div>

      {/* DETECTED SCAM CARD OR "LOOKS CLEAN, YOU ARE GOOD TO GO" */}
      {classification && classification.category ? (
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
                background: 'rgba(239, 68, 68, 0.3)',
                color: 'var(--danger-light)',
                border: '1px solid rgba(239, 68, 68, 0.5)'
              }}>
                {classification.confidence}% MATCH
              </span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--danger-light)', fontWeight: 700, marginBottom: 6 }}>
            {classification.category.nameHindi}
          </div>

          <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 10 }}>
            {classification.category.description}
          </div>

          {/* Extortion Tactics & Trigger Words */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: 12,
            padding: 10,
            marginBottom: 10
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>DETECTED EXTORTION TACTICS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {classification.category.tactics.map(tac => (
                <span
                  key={tac}
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: 'var(--indigo-light)',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4
                  }}
                >
                  {tac}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>KEY TRIGGER WORDS DETECTED</div>
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
            <div><strong>Recommended Defensive Action:</strong> {classification.category.actionPlan}</div>
          </div>
        </div>
      ) : isListening ? (
        /* CLEAN SAFE STATE WHEN NO SCAM/SUSPICIOUS ISSUES FOUND */
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
              {transcript ? 'Speech text typed & analyzed — zero threat keywords, coercion tactics, or vishing signals found.' : 'Microphone active & volume analyzing... Speak or type call audio into the box above.'}
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
