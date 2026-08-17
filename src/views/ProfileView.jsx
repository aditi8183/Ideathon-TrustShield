import React from 'react';
import { User, ShieldCheck, Award, Flame, Sparkles, FileText, Download, Edit3, Check } from 'lucide-react';

export default function ProfileView({ user, pointEvents, onOpenOnboarding }) {
  return (
    <div style={{ padding: 16 }}>
      {/* Profile Card */}
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <div style={{ position: 'absolute', right: 16, top: 16 }}>
          <button
            onClick={onOpenOnboarding}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 6,
              color: 'var(--sub)',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={16} />
          </button>
        </div>

        <div style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          background: 'linear-gradient(135deg, var(--indigo), var(--indigo-dark))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          marginBottom: 12,
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
        }}>
          <User size={36} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 2 }}>{user.name}</h2>
        <div className="mono" style={{ fontSize: 13, color: 'var(--indigo-light)', marginBottom: 8 }}>
          {user.upi_id}
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 20,
          background: 'rgba(251, 191, 36, 0.15)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          color: 'var(--gold)',
          fontSize: 12,
          fontWeight: 800
        }}>
          <Award size={15} />
          <span>{user.guardian_level}</span>
        </div>
      </div>

      {/* Gamification Stats Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label">MONEY SAVED</div>
          <div className="stat-val" style={{ color: 'var(--safe-light)' }}>
            ₹{user.total_saved.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-label">GUARDIAN POINTS</div>
          <div className="stat-val" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={18} />
            <span>{user.guardian_points}</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-label">DAY STREAK</div>
          <div className="stat-val" style={{ color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Flame size={18} />
            <span>{user.streak} days</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-label">SCAMS REPORTED</div>
          <div className="stat-val" style={{ color: 'var(--indigo-light)' }}>
            {user.cases_reported}
          </div>
        </div>
      </div>

      {/* Points History Ledger */}
      <div className="glass-card">
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Points & Reward Activity</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pointEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)'
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{evt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)' }}>{evt.time}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--gold)' }}>
                +{evt.pts} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PWA Install Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.1))',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Install Trust Shield</div>
          <div style={{ fontSize: 12, color: 'var(--sub)' }}>Add to home screen for native mobile experience</div>
        </div>

        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }}
          onClick={() => alert('To install: Tap your browser share menu and select "Add to Home Screen"!')}
        >
          <Download size={14} />
          <span>Install App</span>
        </button>
      </div>
    </div>
  );
}
