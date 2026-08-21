import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Award,
  Flame,
  Sparkles,
  FileText,
  Download,
  Edit3,
  Check,
  Mail,
  CheckCircle2,
  Phone,
  Bell,
  ShieldAlert,
  Users,
  Settings,
  Plus,
  Trash2,
  X,
  Sliders,
  UserPlus
} from 'lucide-react';

export default function ProfileView({ user, pointEvents, onOpenOnboarding, onUpdateUser }) {
  const isGoogleUser = user?.auth_provider === 'GOOGLE_ACCOUNT' || user?.email?.includes('@gmail.com');
  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  // Multiple Trusted Nominees State
  const [nominees, setNominees] = useState(() => {
    if (Array.isArray(user?.nominees) && user.nominees.length > 0) {
      return user.nominees;
    }
    if (user?.trusted_nominee?.name) {
      return [{
        id: `nom_1`,
        name: user.trusted_nominee.name,
        phone: user.trusted_nominee.phone || '',
        email: user.trusted_nominee.email || '',
        relationship: 'Family Guardian',
        enabled: user.trusted_nominee.enabled ?? true
      }];
    }
    return [
      {
        id: 'nom_default_1',
        name: 'Papa (Rajesh Sharma)',
        phone: '+91 98765 43210',
        email: 'rajesh.sharma@gmail.com',
        relationship: 'Father / Parent',
        enabled: true
      }
    ];
  });

  const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Nominee Form Inputs (inside Settings Modal)
  const [newNomName, setNewNomName] = useState('');
  const [newNomPhone, setNewNomPhone] = useState('');
  const [newNomEmail, setNewNomEmail] = useState('');
  const [newNomRelation, setNewNomRelation] = useState('Parent');

  const handleAddNominee = (e) => {
    e?.preventDefault();
    if (!newNomName.trim()) return;
    const newEntry = {
      id: `nom_${Date.now()}`,
      name: newNomName.trim(),
      phone: newNomPhone.trim(),
      email: newNomEmail.trim(),
      relationship: newNomRelation || 'Family Member',
      enabled: true
    };
    setNominees(prev => [...prev, newEntry]);
    setNewNomName('');
    setNewNomPhone('');
    setNewNomEmail('');
    setNewNomRelation('Parent');
  };

  const handleRemoveNominee = (idToRemove) => {
    setNominees(prev => prev.filter(n => n.id !== idToRemove));
  };

  const handleToggleNomineeEnabled = (idToToggle) => {
    setNominees(prev => prev.map(n => n.id === idToToggle ? { ...n, enabled: !n.enabled } : n));
  };

  const handleSaveNomineesSettings = () => {
    const primaryNominee = nominees[0] || null;
    const updatedUser = {
      ...user,
      nominees: nominees,
      trusted_nominee: primaryNominee ? {
        name: primaryNominee.name,
        phone: primaryNominee.phone,
        email: primaryNominee.email,
        enabled: primaryNominee.enabled
      } : null
    };
    if (onUpdateUser) onUpdateUser(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsNomineeModalOpen(false);
    }, 1200);
  };

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
          background: 'var(--card-inner)',
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

      {/* Clean Emergency Guardians Summary Card (No input fields on main screen) */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={20} color="var(--indigo-light)" />
            <h3 style={{ fontSize: 16, fontWeight: 900 }}>Emergency Guardians</h3>
          </div>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--safe-light)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 800
          }}>
            {nominees.filter(n => n.enabled).length} ACTIVE GUARDIANS
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 14 }}>
          Emergency SMS & Email alerts are dispatched to your configured trusted guardians if high-risk fraud or coercion is detected.
        </p>

        {/* Clean Badges for Configured Nominees */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {nominees.length > 0 ? (
            nominees.map(n => (
              <div
                key={n.id}
                style={{
                  background: n.enabled ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${n.enabled ? 'rgba(99, 102, 241, 0.3)' : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: n.enabled ? 'var(--text)' : 'var(--sub)'
                }}
              >
                <Users size={14} color={n.enabled ? 'var(--indigo-light)' : 'var(--sub)'} />
                <span>{n.name} <span style={{ opacity: 0.7, fontSize: 11 }}>({n.relationship})</span></span>
                {n.enabled ? (
                  <span style={{ fontSize: 9, background: 'rgba(16, 185, 129, 0.2)', color: 'var(--safe-light)', padding: '1px 6px', borderRadius: 6, fontWeight: 900 }}>
                    ACTIVE
                  </span>
                ) : (
                  <span style={{ fontSize: 9, background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-light)', padding: '1px 6px', borderRadius: 6, fontWeight: 900 }}>
                    PAUSED
                  </span>
                )}
              </div>
            ))
          ) : (
            <div style={{ fontSize: 12, color: 'var(--sub)', fontStyle: 'italic' }}>
              No emergency guardians configured yet.
            </div>
          )}
        </div>

        {/* Action Button to Open Settings Drawer / Modal */}
        <button
          className="btn-primary"
          onClick={() => setIsNomineeModalOpen(true)}
          style={{ width: '100%', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Settings size={16} />
          <span>Manage Emergency Guardians Settings</span>
        </button>
      </div>

      {/* Gamification Stats Grid (Small compact 2x2 cards) */}
      <div className="stats-grid">
        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="stat-label">MONEY SAVED</span>
            <div style={{ padding: '4px 6px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--safe-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="stat-val" style={{ color: 'var(--safe-light)' }}>
            ₹{user.total_saved.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="stat-label">GUARDIAN PTS</span>
            <div style={{ padding: '4px 6px', borderRadius: 8, background: 'rgba(251, 191, 36, 0.15)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} />
            </div>
          </div>
          <div className="stat-val" style={{ color: 'var(--gold)' }}>
            {user.guardian_points} <span style={{ fontSize: 13, fontWeight: 700 }}>pts</span>
          </div>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="stat-label">DAY STREAK</span>
            <div style={{ padding: '4px 6px', borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={14} />
            </div>
          </div>
          <div className="stat-val" style={{ color: 'var(--orange)' }}>
            {user.streak} <span style={{ fontSize: 13, fontWeight: 700 }}>{user.streak === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="stat-label">SCAMS REPORTED</span>
            <div style={{ padding: '4px 6px', borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={14} />
            </div>
          </div>
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
                background: 'var(--card-inner)',
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

      {/* ========================================================================= */}
      {/* MANAGE EMERGENCY GUARDIANS SETTINGS MODAL */}
      {/* ========================================================================= */}
      {isNomineeModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={22} color="var(--indigo-light)" />
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>Emergency Guardians Settings</h3>
                  <div style={{ fontSize: 11, color: 'var(--sub)' }}>Manage multiple trusted nominees for fraud alert dispatch</div>
                </div>
              </div>
              <button
                onClick={() => setIsNomineeModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Configured Nominees List */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--sub)', marginBottom: 10, textTransform: 'uppercase' }}>
                Configured Guardians ({nominees.length})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {nominees.map(nom => (
                  <div
                    key={nom.id}
                    style={{
                      background: 'var(--card-inner)',
                      border: '1px solid var(--border)',
                      borderRadius: 14,
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ fontSize: 14 }}>{nom.name}</strong>
                        <span style={{ fontSize: 10, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--indigo-light)', padding: '2px 6px', borderRadius: 6, fontWeight: 800 }}>
                          {nom.relationship}
                        </span>
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>
                        {nom.phone} {nom.email ? `• ${nom.email}` : ''}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleNomineeEnabled(nom.id)}
                        style={{
                          background: nom.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: nom.enabled ? 'var(--safe-light)' : 'var(--danger-light)',
                          border: `1px solid ${nom.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          borderRadius: 12,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {nom.enabled ? 'ON' : 'OFF'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveNominee(nom.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: 'var(--danger-light)',
                          borderRadius: 8,
                          padding: 6,
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Nominee Form */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 16
            }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--indigo-light)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserPlus size={16} /> Add Another Emergency Guardian
              </h4>

              <form onSubmit={handleAddNominee}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)', display: 'block', marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={newNomName}
                      onChange={(e) => setNewNomName(e.target.value)}
                      placeholder="e.g. Sunita Sharma"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)', display: 'block', marginBottom: 4 }}>Relationship</label>
                    <select
                      className="input-field"
                      value={newNomRelation}
                      onChange={(e) => setNewNomRelation(e.target.value)}
                    >
                      <option value="Parent">Parent</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Trusted Friend">Trusted Friend</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)', display: 'block', marginBottom: 4 }}>Mobile Number (+91)</label>
                    <input
                      type="tel"
                      className="input-field mono"
                      value={newNomPhone}
                      onChange={(e) => setNewNomPhone(e.target.value)}
                      placeholder="+91 98765 12345"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)', display: 'block', marginBottom: 4 }}>Email Address</label>
                    <input
                      type="email"
                      className="input-field mono"
                      value={newNomEmail}
                      onChange={(e) => setNewNomEmail(e.target.value)}
                      placeholder="nominee@gmail.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: 'var(--indigo-light)',
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Plus size={14} /> Add Nominee to List
                </button>
              </form>
            </div>

            {/* Modal Save Button */}
            <button
              className="btn-primary"
              onClick={handleSaveNomineesSettings}
              style={{ width: '100%', fontSize: 13 }}
            >
              {savedSuccess ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Saved All Guardians Settings!
                </span>
              ) : (
                <span>Save All Emergency Guardians Settings</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
