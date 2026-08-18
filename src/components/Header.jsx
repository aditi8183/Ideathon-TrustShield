import React from 'react';
import { Shield, Sparkles, LogOut, UserCheck } from 'lucide-react';

export default function Header({ user, onOpenProfile, onLogout }) {
  const isGoogleUser = user?.auth_provider === 'GOOGLE_ACCOUNT' || user?.email?.includes('@gmail.com');

  return (
    <header className="app-header">
      <div className="brand-logo" onClick={onOpenProfile} style={{ cursor: 'pointer' }}>
        <div className="brand-icon-wrapper">
          <Shield size={20} />
        </div>
        <div className="brand-title">
          <span>Trust</span> <span>Shield</span>
        </div>
      </div>

      <div className="header-right">
        {user.role === 'BANK_ADMIN' ? (
          <div className="status-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.35)', color: 'var(--indigo-light)' }}>
            <UserCheck size={13} />
            <span>Bank Officer</span>
          </div>
        ) : (
          <div className="status-badge">
            {isGoogleUser ? (
              <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            ) : (
              <span className="pulse-dot"></span>
            )}
            <span>{isGoogleUser ? 'Google Active' : 'Active'}</span>
          </div>
        )}

        <div className="points-pill" onClick={onOpenProfile} style={{ cursor: 'pointer' }}>
          <Sparkles size={14} color="#fbbf24" />
          <span>{user.guardian_points}</span>
        </div>

        <button
          onClick={onLogout}
          title="Sign Out"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 6,
            color: 'var(--sub)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
