import React, { useState } from 'react';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PINModal({ isOpen, onClose, amount, recipientUpi, onSuccess }) {
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleKeyClick = (val) => {
    if (pin.length < 6) {
      const nextPin = pin + val;
      setPin(nextPin);
      if (nextPin.length === 6) {
        submitPin();
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const submitPin = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setPin('');
        onSuccess();
        onClose();
      }, 1400);
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        {isDone ? (
          <div style={{ padding: '20px 0' }}>
            <CheckCircle2 size={64} color="var(--safe-light)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--safe-light)', marginBottom: 6 }}>
              Payment Successful!
            </h3>
            <p style={{ fontSize: 14, color: 'var(--sub)' }}>
              ₹{amount} sent securely to <span className="mono">{recipientUpi}</span>
            </p>
          </div>
        ) : (
          <>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--indigo-light)',
              marginBottom: 12
            }}>
              <Lock size={24} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Enter UPI PIN</h3>
            <p style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 16 }}>
              Paying ₹{amount} to <span className="mono">{recipientUpi}</span>
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 24
            }}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: pin.length > idx ? 'var(--indigo-light)' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid var(--border)',
                    boxShadow: pin.length > idx ? '0 0 10px var(--indigo)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>

            {isProcessing ? (
              <div style={{ fontSize: 14, color: 'var(--sub)', padding: '20px 0' }}>
                Authenticating with Bank Servers...
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                maxWidth: 280,
                margin: '0 auto'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyClick(String(num))}
                    style={{
                      padding: '14px 0',
                      borderRadius: 14,
                      border: '1px solid var(--border)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: 'var(--text)',
                      fontSize: 18,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={onClose}
                  style={{
                    padding: '14px 0',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--sub)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleKeyClick('0')}
                  style={{
                    padding: '14px 0',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text)',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  style={{
                    padding: '14px 0',
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--sub)',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⌫
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
