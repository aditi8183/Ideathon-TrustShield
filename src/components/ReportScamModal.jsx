import React, { useState } from 'react';
import { AlertTriangle, Sparkles, X, Send } from 'lucide-react';

export default function ReportScamModal({ isOpen, onClose, onAddScam }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scamType, setScamType] = useState('VISHING');
  const [amount, setAmount] = useState('');
  const [upiIds, setUpiIds] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [urgency, setUrgency] = useState('MEDIUM');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;

    const newScam = {
      id: `scam_${Date.now()}`,
      title,
      description,
      reported_by: "You (Verified)",
      scam_type: scamType,
      targeted_amount: parseFloat(amount) || 0,
      victim_count: 1,
      status: "OPEN",
      votes: 1,
      urgency,
      reward: 750,
      upi_ids: upiIds.split(',').map(s => s.trim()).filter(Boolean),
      phone_numbers: phoneNumbers.split(',').map(s => s.trim()).filter(Boolean),
      created_at: new Date().toISOString()
    };

    onAddScam(newScam);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--danger-light)'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900 }}>Report a Scam</h3>
              <div style={{ fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={13} />
                <span>Earn +250 Guardian Points</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Scam Title</label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TRAI SIM Deactivation Fraud Call"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="input-group">
              <label className="input-label">Scam Category</label>
              <select
                className="input-field"
                value={scamType}
                onChange={(e) => setScamType(e.target.value)}
              >
                <option value="VISHING">Voice Phishing (Vishing)</option>
                <option value="COURIER">Courier / Customs</option>
                <option value="INVESTMENT">Investment Fraud</option>
                <option value="LOTTERY">Lottery / Tax Claim</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Targeted Amount (₹)</label>
              <input
                type="number"
                className="input-field mono"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Scammer UPI IDs (comma separated)</label>
            <input
              type="text"
              className="input-field mono"
              value={upiIds}
              onChange={(e) => setUpiIds(e.target.value)}
              placeholder="fraud@paytm, scammer@gpay"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Scammer Phone Numbers (comma separated)</label>
            <input
              type="text"
              className="input-field mono"
              value={phoneNumbers}
              onChange={(e) => setPhoneNumbers(e.target.value)}
              placeholder="+91 99999 00000"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description of Fraud</label>
            <textarea
              className="input-field"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how the scammer approached you, words used, or payment pressure..."
              required
              style={{ resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn-primary btn-danger" style={{ marginTop: 10 }}>
            <Send size={16} />
            <span>Submit Scam Report (+250 Pts)</span>
          </button>
        </form>
      </div>
    </div>
  );
}
