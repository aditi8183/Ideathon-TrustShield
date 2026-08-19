// Initial mock datasets for Trust Shield App

export const INITIAL_USER = {
  id: 'u042',
  name: 'Aditi Sharma',
  email: 'aditiansh8183@gmail.com',
  phone: '+91 98765 43210',
  upi_id: 'aditi@okicici',
  bank_name: 'ICICI Bank',
  role: 'CUSTOMER',
  guardian_points: 1250,
  guardian_level: 'Level 3 Guardian',
  streak: 14,
  cases_reported: 5,
  cases_verified: 12,
  total_saved: 0,
  avg_transaction_amount: 2500,
  primary_device: 'POCO X7 Pro (Android 14)',
  current_device: 'Chrome on Windows 11',
  is_new_device: true,
  joined_date: '2025-11-10T08:30:00.000Z'
};

export const INITIAL_COMMUNITY_SCAMS = [];
export const INITIAL_BANK_REVIEWS = [
  {
    id: 'br_901',
    transaction_id: 'TXN8892401',
    user_id: 'u042',
    user_name: 'Aditi Sharma',
    amount: 18500,
    recipient_upi: 'trai.verify@fraudster',
    bank_name: 'ICICI Bank',
    blocked_reason: 'Live Active Call Flagged (Customs Drug Seizure) + Matches active community fraud UPI + Pasted UPI + New Unrecognized Device',
    risk_score: 95,
    coercive_signals: ['Active Voice Call', 'Clipboard Paste', 'New Device Anomaly', 'Odd Hours'],
    device_info: 'Chrome on Windows 11 (New Device)',
    status: 'PENDING',
    is_false_positive_requested: false,
    reviewed_by: 'Pending Officer Review',
    review_note: 'Automatically blocked by Trust Shield Zero-Knowledge AI engine.',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'br_902',
    transaction_id: 'TXN8892398',
    user_id: 'u089',
    user_name: 'Vikram Mehta',
    amount: 45000,
    recipient_upi: 'urgent.medical.hospital@axis',
    bank_name: 'ICICI Bank',
    blocked_reason: 'High amount anomaly (₹45,000 vs avg ₹4,000) + First-time transfer',
    risk_score: 72,
    coercive_signals: ['High Amount Escalation', 'First-time Payee'],
    device_info: 'POCO F5 (Primary Device)',
    status: 'PENDING',
    is_false_positive_requested: true,
    user_override_note: 'This is a genuine medical emergency deposit for my brother hospital admission.',
    reviewed_by: 'Pending Officer Review',
    review_note: 'User marked as False Positive — Urgent Hospital Payment Review Requested.',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

export const INITIAL_POINT_EVENTS = [
  { id: 'e1', label: 'Blocked ₹18,500 TRAI Fraud Payment', pts: 100, time: '25m ago' },
  { id: 'e2', label: 'Reported FedEx Customs Scam', pts: 250, time: 'Yesterday' },
  { id: 'e3', label: 'Completed Daily Security Checkup', pts: 50, time: '2 days ago' }
];
