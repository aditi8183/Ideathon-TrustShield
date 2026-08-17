import React, { useState } from 'react';
import { Building2, CheckCircle, XCircle, Clock, ShieldAlert, FileText, AlertOctagon, HelpCircle, Smartphone, AlertTriangle } from 'lucide-react';

export default function BankView({ bankReviews, onResolveReview }) {
  const [filter, setFilter] = useState('PENDING'); // 'PENDING' | 'OVERRIDE_REQUESTS' | 'RESOLVED'

  const filteredReviews = bankReviews.filter(r => {
    if (filter === 'PENDING') return r.status === 'PENDING';
    if (filter === 'OVERRIDE_REQUESTS') return r.status === 'PENDING' && r.is_false_positive_requested;
    return r.status !== 'PENDING';
  });

  const pendingCount = bankReviews.filter(r => r.status === 'PENDING').length;
  const fpCount = bankReviews.filter(r => r.status === 'PENDING' && r.is_false_positive_requested).length;

  return (
    <div style={{ padding: 16 }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ borderColor: 'rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--indigo-light)'
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900 }}>Bank Risk Officer Portal</h2>
            <p style={{ fontSize: 12, color: 'var(--sub)' }}>
              Cyber Risk Audit Console & Institutional False Positive Override Engine
            </p>
          </div>
        </div>

        {/* Tab selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 6, marginTop: 12 }}>
          <button
            onClick={() => setFilter('PENDING')}
            className={`btn-secondary ${filter === 'PENDING' ? 'btn-primary' : ''}`}
            style={{ padding: '8px 6px', fontSize: 11 }}
          >
            All Pending ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('OVERRIDE_REQUESTS')}
            className={`btn-secondary ${filter === 'OVERRIDE_REQUESTS' ? 'btn-primary' : ''}`}
            style={{
              padding: '8px 6px',
              fontSize: 11,
              background: filter === 'OVERRIDE_REQUESTS' ? 'var(--indigo)' : 'rgba(245, 158, 11, 0.15)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
              color: filter === 'OVERRIDE_REQUESTS' ? '#fff' : 'var(--warn-light)'
            }}
          >
            False Positives ({fpCount})
          </button>

          <button
            onClick={() => setFilter('RESOLVED')}
            className={`btn-secondary ${filter === 'RESOLVED' ? 'btn-primary' : ''}`}
            style={{ padding: '8px 6px', fontSize: 11 }}
          >
            Audit Log ({bankReviews.filter(r => r.status !== 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Review List */}
      {filteredReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--sub)' }}>
          <CheckCircle size={48} color="var(--safe-light)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>No Audits in Selected Filter</h4>
          <p style={{ fontSize: 12, marginTop: 4 }}>All high-risk transactions have been inspected by the risk officer team.</p>
        </div>
      ) : (
        filteredReviews.map((review) => (
          <div key={review.id} className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--sub)' }}>
                  TXN: {review.transaction_id}
                </span>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--danger-light)' }}>
                  ₹{review.amount.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: review.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : review.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: review.status === 'PENDING' ? 'var(--warn-light)' : review.status === 'APPROVED' ? 'var(--safe-light)' : 'var(--danger-light)'
                }}>
                  {review.status}
                </span>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 4 }}>
                  Risk Score: <strong style={{ color: 'var(--danger-light)' }}>{review.risk_score}/100</strong>
                </div>
              </div>
            </div>

            {/* False Positive Customer Override Request Alert */}
            {review.is_false_positive_requested && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                color: 'var(--indigo-light)',
                borderRadius: 10,
                padding: 10,
                fontSize: 12,
                marginBottom: 10
              }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HelpCircle size={15} />
                  <span>FALSE POSITIVE OVERRIDE REQUESTED BY USER</span>
                </div>
                <div style={{ marginTop: 4, fontStyle: 'italic' }}>
                  "{review.user_override_note || 'User states this is an urgent legitimate transfer.'}"
                </div>
              </div>
            )}

            {/* Recipient & Reason */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 12,
              padding: 10,
              fontSize: 12,
              marginBottom: 12
            }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: 'var(--sub)' }}>Customer: </span>
                <strong>{review.user_name || review.user_id}</strong>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: 'var(--sub)' }}>Recipient UPI: </span>
                <span className="mono" style={{ color: 'var(--indigo-light)' }}>{review.recipient_upi}</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: 'var(--sub)' }}>Device Signal: </span>
                <span>{review.device_info || 'Chrome on Windows 11'}</span>
              </div>
              <div style={{ color: 'var(--danger-light)', fontWeight: 600 }}>
                Coercion Trigger: {review.blocked_reason}
              </div>
            </div>

            {review.status === 'PENDING' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  className="btn-primary btn-safe"
                  style={{ fontSize: 12, padding: '10px' }}
                  onClick={() => onResolveReview(review.id, 'APPROVED', 'Officer verified false positive request — Payment approved & released.')}
                >
                  <CheckCircle size={15} />
                  <span>Approve & Release Funds</span>
                </button>

                <button
                  className="btn-primary btn-danger"
                  style={{ fontSize: 12, padding: '10px' }}
                  onClick={() => onResolveReview(review.id, 'REJECTED', 'Confirmed fraud scam. FIR logged with Cyber Crime Cell.')}
                >
                  <XCircle size={15} />
                  <span>Confirm Cyber Fraud</span>
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--sub)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <div>Reviewed by: <strong>{review.reviewed_by}</strong></div>
                <div>Note: <em>{review.review_note}</em></div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
