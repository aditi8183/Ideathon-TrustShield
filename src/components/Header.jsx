import React from 'react';
import { Shield, Sparkles, LogOut, UserCheck } from 'lucide-react';

export default function Header({ user, onOpenProfile, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand-logo" onClick={onOpenProfile}>
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
            <span className="pulse-dot"></span>
            <span>Active</span>
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
