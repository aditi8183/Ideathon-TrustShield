import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Building2, User, Phone, Wallet } from 'lucide-react';

export default function OnboardingModal({ isOpen, onClose, user, setUser }) {
  const [name, setName] = useState(user?.name || '');
  const [upi, setUpi] = useState(user?.upi_id || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bank, setBank] = useState(user?.bank_name || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name: name.trim(),
      upi_id: upi.trim(),
      phone: phone.trim(),
      bank_name: bank
    });
    onClose();
  };

  const banksList = ['ICICI Bank', 'SBI Bank', 'HDFC Bank', 'Axis Bank', 'Bank of Baroda', 'Kotak Mahindra'];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: 'linear-gradient(135deg, var(--indigo), var(--indigo-dark))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 12,
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldCheck size={30} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Welcome to Trust Shield</h2>
          <p style={{ fontSize: 13, color: 'var(--sub)' }}>
            Privacy-preserving fraud detection. On-device intelligence that never leaves your phone.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aditi Sharma"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Primary UPI ID</label>
            <input
              type="text"
              className="input-field mono"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder="aditi@okicici"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <input
              type="text"
              className="input-field mono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Primary Bank</label>
            <select
              className="input-field"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              style={{ cursor: 'pointer' }}
              required
            >
              <option value="" disabled>Select your primary bank</option>
              {banksList.map((b) => (
                <option key={b} value={b} style={{ background: 'var(--surf)', color: 'var(--text)' }}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: 20 }}>
            <span>Activate Trust Shield</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
