import React from 'react';
import {
  ShieldCheck,
  Send,
  Users,
  TrendingUp,
  ArrowUpRight
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

  return (
    <div style={{ padding: 16 }}>
      {/* ========================================================================= */}
      {/* 1. HERO CARD: TRUST SHIELD IS ACTIVE (MATCHING 2ND IMAGE) */}
      {/* ========================================================================= */}
      <div
        className="glass-card"
        style={{
          textAlign: 'center',
          padding: '24px 18px',
          marginBottom: 16,
          position: 'relative'
        }}
      >
        {/* Emerald Shield with Checkmark Icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 18,
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.4))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--safe-light)',
            marginBottom: 12,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}
        >
          <ShieldCheck size={32} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, letterSpacing: '-0.3px', color: 'var(--text)' }}>
          Trust Shield is Active
        </h2>
        <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 18 }}>
          Protecting <span className="mono" style={{ color: 'var(--text)', fontWeight: 700 }}>{safeUser.upi_id || 'user@oksbi'}</span> on {safeUser.bank_name || 'ICICI Bank'}
        </p>

        {/* 3-Column Compact Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            background: 'var(--card-inner)',
            padding: '12px 8px',
            borderRadius: 14,
            border: '1px solid var(--border)'
          }}
        >
          {/* Money Saved */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2 }}>
              MONEY SAVED
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--safe-light)' }} className="mono">
              ₹{totalSavedFormatted}
            </div>
          </div>

          {/* Streak */}
          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2 }}>
              STREAK
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--warn-light)' }}>
              🔥 {streakVal}d
            </div>
          </div>

          {/* Level */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2 }}>
              LEVEL
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--gold)' }}>
              🎗️ Lvl {levelVal}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HARDWARE VOICE DETECTOR & LIVE SCAM CLASSIFICATION ENGINE */}
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
      {/* 3. QUICK ACTION BUTTONS */}
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
      {/* 4. ACTIVE COMMUNITY SCAMS FEED BANNER */}
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
