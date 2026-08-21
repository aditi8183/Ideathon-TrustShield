import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Send,
  Radio,
  Sparkles,
  Search,
  MoreVertical,
  Key,
  Flame,
  CreditCard,
  FlaskConical,
  Play,
  TrendingUp,
  ArrowUpRight,
  Radar,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users
} from 'lucide-react';
import VoiceDetector from '../components/VoiceDetector';

export default function HomeView({
  user,
  theme = 'dark',
  toggleTheme,
  scamList = [],
  onNavigate,
  onScamDetected,
  isListening,
  setIsListening,
  currentTranscript,
  onTranscriptChange,
  onClearTranscript
}) {
  const isDark = theme === 'dark';

  const safeUser = user || {
    upi_id: 'user@oksbi',
    bank_name: 'ICICI Bank',
    total_saved: 0,
    streak: 1,
    level: 1
  };

  const totalSavedFormatted = (safeUser.total_saved || 0).toLocaleString('en-IN');
  const streakVal = safeUser.streak || 1;
  const levelVal = safeUser.level || 1;

  // Real-time Tactical Full Scan simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanText, setLastScanText] = useState('2 mins ago');
  const [scanSuccessMessage, setScanSuccessMessage] = useState(null);

  const handleRunFullScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanSuccessMessage(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setLastScanText('Just now');
          setScanSuccessMessage('All 42 diagnostic nodes validated. System 100% secure.');
          setTimeout(() => setScanSuccessMessage(null), 4000);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Test scenario runner helper for Light mode simulation cards
  const triggerSimulationText = (text) => {
    if (onTranscriptChange) {
      onTranscriptChange(text);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {/* ========================================================================= */}
      {/* 1. TACTICAL DARK DASHBOARD (DARK MODE) */}
      {/* ========================================================================= */}
      {isDark && (
        <div className="tactical-dark-dashboard">
          {/* Tactical Hero Card: System Secure */}
          <div
            className="glass-card"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 242, 254, 0.16) 0%, rgba(14, 20, 36, 0.95) 75%)',
              borderColor: 'rgba(0, 242, 254, 0.25)',
              textAlign: 'center',
              padding: '28px 18px',
              position: 'relative'
            }}
          >
            {/* Glowing Center Shield Badge */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 242, 254, 0.25), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(0, 242, 254, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cyan)',
                marginBottom: 14,
                boxShadow: '0 0 28px rgba(0, 242, 254, 0.35)'
              }}
            >
              <Shield size={32} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.3px', color: '#fff' }}>
              System Secure
            </h2>
            <p style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 18, lineHeight: 1.4 }}>
              All diagnostic nodes operating at optimal capacity. Last scan: {lastScanText}.
            </p>

            {/* Run Full Scan Button */}
            <div>
              <button
                type="button"
                className="btn-scan-tactical"
                onClick={handleRunFullScan}
                disabled={isScanning}
              >
                <Radar size={15} className={isScanning ? 'pulse-dot' : ''} />
                <span>{isScanning ? `SCANNING NODES (${scanProgress}%)...` : 'RUN FULL SCAN'}</span>
              </button>
            </div>

            {/* Scanning Progress Bar */}
            {isScanning && (
              <div style={{ marginTop: 14 }}>
                <div className="tactical-bar-bg" style={{ height: 4 }}>
                  <div
                    className="tactical-bar-fill-cyan"
                    style={{ width: `${scanProgress}%`, transition: 'width 0.25s ease' }}
                  />
                </div>
              </div>
            )}

            {/* Scan Success Toast */}
            {scanSuccessMessage && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--safe-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <CheckCircle2 size={14} />
                <span>{scanSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Tactical Metric Card 1: Threats Blocked */}
          <div
            className="glass-card"
            style={{
              padding: '16px 18px',
              marginBottom: 12,
              background: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.6px' }}>
                THREATS BLOCKED
              </span>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--purple-light)'
                }}
              >
                <ShieldAlert size={13} />
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 10 }} className="mono">
              1,248
            </div>

            <div className="tactical-bar-bg" style={{ marginBottom: 8 }}>
              <div className="tactical-bar-fill-cyan" style={{ width: '74%' }} />
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>
              +12% from last week
            </div>
          </div>

          {/* Tactical Metric Card 2: Network Uptime */}
          <div
            className="glass-card"
            style={{
              padding: '16px 18px',
              marginBottom: 12,
              background: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.6px' }}>
                NETWORK UPTIME
              </span>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: 'rgba(0, 242, 254, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan)'
                }}
              >
                <Radio size={13} />
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 10 }} className="mono">
              99.9%
            </div>

            <div className="tactical-bar-bg" style={{ marginBottom: 8 }}>
              <div className="tactical-bar-fill-cyan" style={{ width: '99.9%' }} />
            </div>

            <div style={{ fontSize: 11, color: 'var(--sub)' }}>
              Stable connection
            </div>
          </div>

          {/* Tactical Metric Card 3: Active Nodes */}
          <div
            className="glass-card"
            style={{
              padding: '16px 18px',
              marginBottom: 18,
              background: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.6px' }}>
                ACTIVE NODES
              </span>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--coral)'
                }}
              >
                <Sparkles size={13} />
              </div>
            </div>

            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 10 }} className="mono">
              42
            </div>

            <div className="tactical-bar-bg" style={{ marginBottom: 8 }}>
              <div className="tactical-bar-fill-coral" style={{ width: '85%' }} />
            </div>

            <div style={{ fontSize: 11, color: 'var(--sub)' }}>
              Global distribution
            </div>
          </div>

          {/* Section: Diagnostic Scenarios */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--sub)',
                letterSpacing: '0.6px',
                marginBottom: 10
              }}
            >
              <Search size={14} />
              <span>DIAGNOSTIC SCENARIOS</span>
            </div>

            {/* Scenario Item 1 */}
            <div
              className="glass-card"
              style={{
                padding: '14px 16px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(0, 242, 254, 0.12)',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cyan)'
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                    Firewall Integrity Check
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--sub)' }}>
                    Routine protocol validation
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="tactical-badge-passed">PASSED</span>
                <MoreVertical size={16} color="var(--sub)" style={{ cursor: 'pointer' }} />
              </div>
            </div>

            {/* Scenario Item 2 */}
            <div
              className="glass-card"
              style={{
                padding: '14px 16px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--coral)'
                  }}
                >
                  <Key size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                    Encryption Key Rotation
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--sub)' }}>
                    Scheduled 256-bit AES update
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="tactical-badge-pending">PENDING</span>
                <MoreVertical size={16} color="var(--sub)" style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ORGANIC LIGHT DASHBOARD (LIGHT MODE) */}
      {/* ========================================================================= */}
      {!isDark && (
        <div className="organic-light-dashboard">
          {/* Organic Hero Card: Trust Shield is Active */}
          <div
            className="glass-card"
            style={{
              background: 'radial-gradient(ellipse at 50% -20%, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0.98) 75%)',
              borderColor: 'rgba(99, 102, 241, 0.15)',
              textAlign: 'center',
              padding: '28px 18px',
              marginBottom: 16
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--indigo)',
                marginBottom: 14,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)'
              }}
            >
              <ShieldCheck size={34} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Trust Shield is Active
            </h2>
            <p style={{ fontSize: 13, color: 'var(--sub)', maxWidth: 340, margin: '0 auto', lineHeight: 1.45 }}>
              Real-time background monitoring is enabled. You are protected from sophisticated scams and threats.
            </p>
          </div>

          {/* 2-Column Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {/* Money Saved */}
            <div
              className="glass-card"
              style={{ padding: '16px 14px', margin: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.5px' }}>
                  MONEY SAVED
                </span>
                <CreditCard size={14} color="var(--indigo)" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--indigo)' }}>
                ₹{totalSavedFormatted}
              </div>
            </div>

            {/* Protection Streak */}
            <div
              className="glass-card"
              style={{ padding: '16px 14px', margin: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.5px' }}>
                  PROTECTION STREAK
                </span>
                <Flame size={14} color="var(--indigo)" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--indigo)' }}>
                {streakVal}d
              </div>
            </div>
          </div>

          {/* Safety Level Card */}
          <div
            className="glass-card"
            style={{ padding: '16px 18px', marginBottom: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.5px' }}>
                SAFETY LEVEL
              </span>
              <Shield size={14} color="var(--indigo)" />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--indigo)' }}>
                Lvl {levelVal}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sub)' }}>
                {levelVal === 1 ? 'Basic Defense' : `Level ${levelVal} Defense`}
              </div>
            </div>

            <div className="tactical-bar-bg" style={{ height: 6 }}>
              <div
                className="tactical-bar-fill-purple"
                style={{ width: `${Math.min(100, (levelVal / 5) * 100)}%` }}
              />
            </div>
          </div>

          {/* Live Monitoring Card [ARMED] */}
          <div
            className="glass-card"
            style={{
              padding: '16px 18px',
              marginBottom: 16,
              border: isListening ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                <span className="pulse-dot-red" />
                <span>Live Monitoring</span>
              </div>
              <span className="organic-badge-armed">ARMED</span>
            </div>

            {/* System Status Row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--sub)', width: 50, flexShrink: 0 }}>
                System
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, flex: 1 }}>
                Microphone access active. Awaiting voice input for analysis...
              </div>
            </div>

            {/* Caller Transcript Row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--indigo)', width: 50, flexShrink: 0 }}>
                Caller
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontStyle: 'italic',
                    color: currentTranscript ? 'var(--text)' : 'var(--muted)',
                    lineHeight: 1.4,
                    background: 'var(--card-inner)',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)'
                  }}
                >
                  {currentTranscript || 'Sir, this is from the customs department. A parcel under your name...'}
                </div>
              </div>
            </div>
          </div>

          {/* Test Scenarios Section */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: 10
              }}
            >
              <FlaskConical size={16} color="var(--indigo)" />
              <span>Test Scenarios</span>
            </div>

            {/* CBI Digital Arrest Simulation Card */}
            <div
              className="glass-card"
              style={{
                padding: '14px 16px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => {
                triggerSimulationText(
                  'This is Inspector Sharma from CBI Crime Branch. Your Aadhaar card is involved in money laundering and you are under digital arrest on video call.'
                );
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--indigo)'
                  }}
                >
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    CBI Digital Arrest
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--sub)' }}>
                    Simulate threat call
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--card-inner)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sub)'
                }}
              >
                <Play size={12} style={{ marginLeft: 2 }} />
              </div>
            </div>

            {/* Customs Seizure Simulation Card */}
            <div
              className="glass-card"
              style={{
                padding: '14px 16px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => {
                triggerSimulationText(
                  'Hello, your parcel from customs contains contraband goods. Pay Rs 499 custom clearance charge immediately to avoid arrest.'
                );
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--warn)'
                  }}
                >
                  <Zap size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    Customs Parcel Seizure
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--sub)' }}>
                    Simulate threat call
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--card-inner)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sub)'
                }}
              >
                <Play size={12} style={{ marginLeft: 2 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HARDWARE VOICE DETECTOR & LIVE SCAM CLASSIFICATION ENGINE */}
      {/* ========================================================================= */}
      <VoiceDetector
        onScamDetected={onScamDetected}
        isListening={isListening}
        setIsListening={setIsListening}
        externalTranscript={currentTranscript}
        onTranscriptChange={onTranscriptChange}
        onClearTranscript={onClearTranscript}
      />

      {/* ========================================================================= */}
      {/* 4. QUICK ACTION BUTTONS */}
      {/* ========================================================================= */}
      <div className="actions-grid">
        <button className="btn-primary" onClick={() => onNavigate('pay')}>
          <Send size={18} />
          <span>Pay & Scan UPI</span>
        </button>

        <button className="btn-secondary" onClick={() => onNavigate('community')}>
          <Users size={18} color="var(--indigo)" />
          <span>Community Feed</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. ACTIVE COMMUNITY SCAMS FEED BANNER */}
      {/* ========================================================================= */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="var(--danger)" />
            <span>Active Community Scams</span>
          </div>
          <button
            onClick={() => onNavigate('community')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--indigo)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span>View All</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {(scamList || []).slice(0, 2).map((scam) => (
          <div
            key={scam.id}
            style={{
              background: 'var(--card-inner)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 12,
              marginBottom: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className={`scam-type-pill scam-type-${scam.scam_type || 'VISHING'}`}>
                {scam.scam_type || 'VISHING'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--sub)' }}>{scam.votes || 0} votes</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{scam.title}</div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--sub)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {scam.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
