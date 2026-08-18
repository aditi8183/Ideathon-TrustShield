import React from 'react';
import { User, ShieldCheck, Award, Flame, Sparkles, FileText, Download, Edit3, Check, Mail, CheckCircle2 } from 'lucide-react';

export default function ProfileView({ user, pointEvents, onOpenOnboarding }) {
  const isGoogleUser = user?.auth_provider === 'GOOGLE_ACCOUNT' || user?.email?.includes('@gmail.com');
  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div style={{ padding: 16 }}>
      {/* Profile Card */}
      <div className="glass-card" style={{ textAlign: 'center', position: 'relative' }}>
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

        {/* User Avatar with Initials or Picture */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          background: user.role === 'BANK_ADMIN' 
            ? 'linear-gradient(135deg, #10b981, #059669)' 
            : 'linear-gradient(135deg, var(--indigo), var(--indigo-dark))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 28,
          fontWeight: 900,
          marginBottom: 12,
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
          position: 'relative'
        }}>
          {user.picture ? (
            <img 
              src={user.picture} 
              alt={user.name} 
              style={{ width: '100%', height: '100%', borderRadius: 24, objectFit: 'cover' }} 
            />
          ) : (
            <span>{userInitial}</span>
          )}

          {isGoogleUser && (
            <div style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
          )}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 2 }}>{user.name}</h2>
        <div className="mono" style={{ fontSize: 13, color: 'var(--indigo-light)', marginBottom: 6 }}>
          {user.upi_id}
        </div>

        {/* Email & Google Account Verification Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--sub)',
          marginBottom: 10,
          background: 'rgba(255,255,255,0.03)',
          padding: '4px 10px',
          borderRadius: 8,
          border: '1px solid var(--border)'
        }}>
          {isGoogleUser ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google Account: <strong style={{ color: 'var(--text)' }}>{user.email}</strong></span>
              <CheckCircle2 size={12} color="var(--safe-light)" />
            </>
          ) : (
            <>
              <Mail size={12} />
              <span>{user.email}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
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

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--safe-light)',
            fontSize: 12,
            fontWeight: 800
          }}>
            <ShieldCheck size={15} />
            <span>{user.bank_name}</span>
          </div>
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
