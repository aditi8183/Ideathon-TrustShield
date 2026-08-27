import React from 'react';
import { X } from 'lucide-react';

export default function ResultModal({ isOpen, onClose, source, result }) {
  if (!isOpen) return null;

  const { score, flagged, reasons } = result || {};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{source} Scan Result</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <p>Score: {score ?? 'N/A'}</p>
          <p>Flagged: {flagged ? 'Yes' : 'No'}</p>
          {flagged && reasons && (
            <div>
              <p>Reasons:</p>
              <ul>
                {reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button className="btn-primary" style={{ marginTop: 12 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
