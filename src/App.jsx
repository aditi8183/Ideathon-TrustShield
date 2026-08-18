import React, { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import AuthScreen from './components/AuthScreen';
import HomeView from './views/HomeView';
import PayView from './views/PayView';
import CommunityView from './views/CommunityView';
import BankView from './views/BankView';
import ProfileView from './views/ProfileView';
import OnboardingModal from './components/OnboardingModal';

import {
  INITIAL_COMMUNITY_SCAMS,
  INITIAL_BANK_REVIEWS,
  INITIAL_POINT_EVENTS
} from './data/initialData';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('trust_shield_active_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('trust_shield_active_user');
    } catch (e) {
      return false;
    }
  });

  const [activeTab, setActiveTabState] = useState(() => {
    try {
      const storedTab = localStorage.getItem('trust_shield_active_tab');
      return storedTab || 'home';
    } catch (e) {
      return 'home';
    }
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('trust_shield_active_tab', tab);
    } catch (e) {}
  };

  const [scamList, setScamList] = useState(INITIAL_COMMUNITY_SCAMS);
  const [bankReviews, setBankReviews] = useState(INITIAL_BANK_REVIEWS);
  const [pointEvents, setPointEvents] = useState(INITIAL_POINT_EVENTS);

  // Global Voice & Security state
  const [detectedScamCall, setDetectedScamCall] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Session Transcript state (retained in React memory across tab navigation; resets cleanly on F5 page refresh)
  const [currentTranscript, setCurrentTranscript] = useState('');

  const handleTranscriptChange = (text) => {
    setCurrentTranscript(text);
  };

  const clearTranscript = () => {
    setCurrentTranscript('');
    setDetectedScamCall(null);
  };

  // Session Payment Draft state (retained in React memory across tab navigation; resets cleanly on F5 page refresh)
  const [paymentDraft, setPaymentDraft] = useState({ recipientUpi: '', amount: '', note: '', isPasted: false });

  const updatePaymentDraft = (newDraft) => {
    setPaymentDraft(newDraft);
  };

  const clearPaymentDraft = () => {
    setPaymentDraft({ recipientUpi: '', amount: '', note: '', isPasted: false });
  };

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    const initialTab = authenticatedUser.role === 'BANK_ADMIN' ? 'bank' : 'home';
    setActiveTab(initialTab);
    try {
      localStorage.setItem('trust_shield_active_user', JSON.stringify(authenticatedUser));
    } catch (e) {}
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setDetectedScamCall(null);
    clearTranscript();
    clearPaymentDraft();
    try {
      localStorage.removeItem('trust_shield_active_user');
      localStorage.removeItem('trust_shield_active_tab');
    } catch (e) {}
  };

  const handleScamDetected = (scamData) => {
    setDetectedScamCall(scamData);
    if (scamData && scamData.transcript) {
      handleTranscriptChange(scamData.transcript);
    }
  };

  const handlePaymentBlocked = (blockedData) => {
    const newBankReview = {
      id: `br_${Date.now()}`,
      transaction_id: `TXN${Math.floor(1000000 + Math.random() * 9000000)}`,
      user_id: user ? user.id : 'u042',
      user_name: user ? user.name : 'Aditi Sharma',
      amount: blockedData.amount,
      recipient_upi: blockedData.recipient_upi,
      bank_name: user ? user.bank_name : 'ICICI Bank',
      blocked_reason: blockedData.blocked_reason,
      risk_score: blockedData.risk_score,
      coercive_signals: ['Active Voice Call', 'Clipboard Paste', 'New Device Anomaly'],
      device_info: user ? user.current_device : 'Chrome on Windows 11',
      status: 'PENDING',
      is_false_positive_requested: false,
      reviewed_by: 'Pending Officer Review',
      review_note: 'Automatically blocked by Trust Shield Zero-Knowledge AI engine.',
      created_at: new Date().toISOString()
    };

    setBankReviews(prev => [newBankReview, ...prev]);

    setUser(prev => ({
      ...prev,
      total_saved: (prev.total_saved || 0) + blockedData.amount,
      guardian_points: (prev.guardian_points || 0) + 100
    }));

    setPointEvents(prev => [
      {
        id: `e_${Date.now()}`,
        label: `Blocked ₹${blockedData.amount} Fraud Payment`,
        pts: 100,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handlePaymentSuccess = (amount) => {
    // Payment cycle completed -> clear payment draft & active call transcript
    clearPaymentDraft();

    setUser(prev => ({
      ...prev,
      guardian_points: (prev.guardian_points || 0) + 25
    }));

    setPointEvents(prev => [
      {
        id: `e_${Date.now()}`,
        label: `Verified Safe Payment ₹${amount}`,
        pts: 25,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleUpvoteScam = (scamId) => {
    setScamList(prev => prev.map(s => {
      if (s.id === scamId) {
        return { ...s, votes: s.votes + 1 };
      }
      return s;
    }));

    setUser(prev => ({
      ...prev,
      guardian_points: (prev.guardian_points || 0) + 10
    }));

    setPointEvents(prev => [
      {
        id: `e_${Date.now()}`,
        label: 'Upvoted Community Scam Signal',
        pts: 10,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleAddScam = (newScam) => {
    setScamList(prev => [newScam, ...prev]);

    setUser(prev => ({
      ...prev,
      guardian_points: (prev.guardian_points || 0) + 50
    }));

    setPointEvents(prev => [
      {
        id: `e_${Date.now()}`,
        label: 'Reported New Threat Vector',
        pts: 50,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  const handleResolveBankReview = (reviewId, newStatus, note) => {
    setBankReviews(prev => prev.map(rev => {
      if (rev.id === reviewId) {
        return {
          ...rev,
          status: newStatus,
          reviewed_by: user ? `Officer ${user.name} · ${user.bank_name}` : 'Officer · Risk Cell',
          review_note: note
        };
      }
      return rev;
    }));
  };

  const pendingBankCount = bankReviews.filter(r => r.status === 'PENDING').length;
  const isBankAdmin = user && user.role === 'BANK_ADMIN';

  // Render AuthScreen if not logged in
  if (!isAuthenticated || !user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        user={user}
        onOpenProfile={() => setIsOnboardingOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Renderer */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomeView
            user={user}
            scamList={scamList}
            onNavigate={(tab) => setActiveTab(tab)}
            onScamDetected={handleScamDetected}
            isListening={isListening}
            setIsListening={setIsListening}
            currentTranscript={currentTranscript}
            onTranscriptChange={handleTranscriptChange}
            onClearTranscript={clearTranscript}
          />
        )}

        {activeTab === 'pay' && (
          <PayView
            user={user}
            scamList={scamList}
            detectedScamCall={detectedScamCall}
            onPaymentBlocked={handlePaymentBlocked}
            onPaymentSuccess={handlePaymentSuccess}
            paymentDraft={paymentDraft}
            onUpdatePaymentDraft={updatePaymentDraft}
            onClearPaymentDraft={clearPaymentDraft}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            scamList={scamList}
            onUpvoteScam={handleUpvoteScam}
            onAddScam={handleAddScam}
          />
        )}

        {/* Bank Audit View: Exclusively accessible to Bank Risk Admins */}
        {activeTab === 'bank' && isBankAdmin && (
          <BankView
            bankReviews={bankReviews}
            onResolveReview={handleResolveBankReview}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            pointEvents={pointEvents}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingBankCount={pendingBankCount}
      />

      {/* Profile Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={user}
        setUser={setUser}
      />
    </div>
  );
}
