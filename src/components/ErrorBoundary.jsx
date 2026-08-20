import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🛡️ [TRUST SHIELD RECOVERY BOUNDARY CATCH]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem('trust_shield_active_user');
      localStorage.removeItem('trust_shield_active_tab');
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'var(--bg-dark, #0b0f19)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            marginBottom: 16
          }}>
            🛡️
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#f8fafc' }}>
            Trust Shield Safeguard Mode
          </h1>

          <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 360, marginBottom: 20, lineHeight: 1.5 }}>
            Trust Shield detected a state initialization anomaly. Tap below to clear cached session state and restart the application cleanly.
          </p>

          <button
            onClick={this.handleClearCacheAndReload}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
            }}
          >
            Clear Cache & Restart App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
