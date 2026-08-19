import React from 'react';
import { ShieldCheck, Send, ShieldAlert, Zap, Flame, Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import VoiceDetector from '../components/VoiceDetector';

export default function HomeView({
  user,
  scamList,
  onNavigate,
  onScamDetected,
  isListening,
  setIsListening,
  currentTranscript,
  onTranscriptChange,
  onClearTranscript
}) {
  return (
    <div style={{ padding: 16 }}>
      {/* Hero Security Card */}
      <div
        className="glass-card"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.25) 0%, rgba(12, 18, 32, 0.95) 75%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          textAlign: 'center',
          padding: '24px 18px'
        }}
      >
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(16, 185, 129, 0.2))',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--safe-light)',
          marginBottom: 12,
          boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)'
        }}>
          <ShieldCheck size={36} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
          Trust Shield is Active
        </h2>
        <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 16 }}>
          Protecting <span className="mono" style={{ color: 'var(--text)' }}>{user.upi_id}</span> on {user.bank_name}
        </p>

        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 14,
          padding: 10,
          border: '1px solid var(--border)'
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 700 }}>MONEY SAVED</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--safe-light)' }}>
              ₹{user.total_saved.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 700 }}>STREAK</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Flame size={14} />
              <span>{user.streak}d</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 700 }}>LEVEL</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Award size={14} />
<span>Lvl {user.level || 1}</span>            </div>
          </div>
        </div>
      </div>

      {/* Voice Phishing Detector Widget */}
      <VoiceDetector
        onScamDetected={onScamDetected}
        isListening={isListening}
        setIsListening={setIsListening}
        externalTranscript={currentTranscript}
        onTranscriptChange={onTranscriptChange}
        onClearTranscript={onClearTranscript}
      />

      {/* Quick Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <button className="btn-primary" onClick={() => onNavigate('pay')}>
          <Send size={18} />
          <span>Pay & Scan UPI</span>
        </button>

        <button className="btn-secondary" onClick={() => onNavigate('community')}>
          <ShieldAlert size={18} color="var(--warn-light)" />
          <span>Community Feed</span>
        </button>
      </div>

      {/* Trending Scams Banner */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="var(--danger-light)" />
            <span>Active Community Scams</span>
          </div>
          <button
            onClick={() => onNavigate('community')}
            style={{ background: 'none', border: 'none', color: 'var(--indigo-light)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span>View All</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {scamList.slice(0, 2).map((scam) => (
          <div
            key={scam.id}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 12,
              marginBottom: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className={`scam-type-pill scam-type-${scam.scam_type}`}>
                {scam.scam_type}
              </span>
              <span style={{ fontSize: 11, color: 'var(--sub)' }}>{scam.votes} votes</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{scam.title}</div>
            <div style={{ fontSize: 11, color: 'var(--sub)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {scam.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
