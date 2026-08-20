import React, { useState } from 'react';
import { ShieldAlert, Plus, ThumbsUp, Search } from 'lucide-react';
import ReportScamModal from '../components/ReportScamModal';

export default function CommunityView({ scamList = [], onUpvoteScam, onAddScam }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const safeScamList = scamList || [];

  const filteredScams = safeScamList.filter((scam) => {
    const categoryName = scam.category || scam.scam_type || 'VISHING';
    const matchesFilter = filterType === 'ALL' || categoryName.toUpperCase().includes(filterType.toUpperCase());
    const matchesSearch = (scam.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scam.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scam.upi_ids || []).some(u => u.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: 16 }}>
      {/* Header Banner */}
<div
  className="glass-card"
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap'
  }}
>        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900 }}>Community Shield</h2>
          <p style={{ fontSize: 12, color: 'var(--sub)' }}>
            Crowdsourced scam intelligence. Earn Guardian Points for reporting & verifying.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsReportModalOpen(true)}
          style={{ width: 'auto', padding: '10px 14px', fontSize: 13 }}
        >
          <Plus size={16} />
          <span>Report Scam</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={16} color="var(--sub)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scam titles, UPI IDs, keywords..."
            style={{ paddingLeft: 36 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {['ALL', 'CUSTOMS', 'DIGITAL ARREST', 'ELECTRICITY', 'TRAI', 'JOB TASK', 'LOTTERY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: filterType === cat ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: filterType === cat ? 'var(--indigo-light)' : 'var(--sub)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scam Feed */}
      {filteredScams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--sub)' }}>
          <ShieldAlert size={40} color="var(--indigo-light)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>No Scams Match Search</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>Try clearing your search query or filter.</div>
        </div>
      ) : (
        filteredScams.map((scam) => {
          const categoryDisplay = scam.category || scam.scam_type || 'Scam Report';
          const severityDisplay = scam.severity || scam.urgency || 'HIGH';
         const targetedAmt = scam.targeted_amount
  ? scam.targeted_amount.toLocaleString('en-IN')
  : 'Not disclosed';

const victimCount = scam.victim_count || 1;
          const reporterName = scam.reporter_name || scam.reported_by || 'Community Guardian';
          const upiList = scam.upi_ids || [];

          return (
            <div key={scam.id} className="scam-card" style={{ marginBottom: 14 }}>
              <div
  className="scam-header"
  style={{
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap'
  }}
>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="scam-type-pill" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--indigo-light)' }}>
                    {categoryDisplay}
                  </span>
<h3
  style={{
    fontSize: 15,
    fontWeight: 800,
    marginTop: 6,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word'
  }}
>
  {scam.title}
</h3>                </div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: severityDisplay === 'CRITICAL' || severityDisplay === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: severityDisplay === 'CRITICAL' || severityDisplay === 'HIGH' ? 'var(--danger-light)' : 'var(--warn-light)'
                }}>
                  {severityDisplay} SEVERITY
                </div>
              </div>

             <p
  style={{
    fontSize: 12,
    color: 'var(--sub)',
    lineHeight: '1.4',
    margin: '8px 0',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word'
  }}
>
  {scam.description}
</p>

              {/* Details Bar */}
              <div style={{
                display: 'grid',
gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',              
              gap: 8,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 10,
                padding: 8,
                fontSize: 11,
                marginBottom: 10
              }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ color: 'var(--sub)' }}>Extorted Amt: </span>
                  <strong style={{ color: 'var(--text)' }}>₹{targetedAmt}</strong>
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ color: 'var(--sub)' }}>Community Reports: </span>
                  <strong style={{ color: 'var(--danger-light)' }}>{victimCount} victims</strong>
                </div>
              </div>

              {/* Flagged Identifiers */}
              {upiList.length > 0 && (
                <div style={{ fontSize: 11, marginBottom: 10 }}>
                  <div style={{ color: 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>FLAGGED FRAUD UPI IDs</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {upiList.map(upi => (
                      <span
                        key={upi}
                        className="mono"
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: 'var(--danger-light)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 11,
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word'
                        }}
                      >
                        {upi}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upvote & Action Bar */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4
  }}
>             
<span
  style={{
    fontSize: 11,
    color: 'var(--muted)',
    overflowWrap: 'anywhere',
    minWidth: 0,
    flex: 1
  }}
>                  Reported by {reporterName}
                </span>

                <button
                  onClick={() => onUpvoteScam && onUpvoteScam(scam.id)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: 'var(--indigo-light)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ThumbsUp size={14} />
                  <span>{scam.votes || 0} Upvotes</span>
                  <span style={{ color: 'var(--gold)', fontSize: 10 }}>(+25 pts)</span>
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Report Modal */}
      <ReportScamModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onAddScam={onAddScam}
      />
    </div>
  );
}
