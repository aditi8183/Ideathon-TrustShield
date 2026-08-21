import React, { useEffect, useState } from 'react';
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

const calculateLevel = (pts) => {
  const points = Number(pts) || 0;
  if (points >= 2500) return 5;
  if (points >= 1500) return 4;
  if (points >= 800) return 3;
  if (points >= 300) return 2;
  return 1;
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('trust_shield_active_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && (parsed.email || parsed.name)) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const stored = localStorage.getItem('trust_shield_active_user');
      if (!stored) return false;
      const parsed = JSON.parse(stored);
      return !!(parsed && typeof parsed === 'object' && (parsed.email || parsed.name));
    } catch (e) {
      return false;
    }
  });

  // Keep user progress saved after every change
  useEffect(() => {
    if (!user) return;

    try {
      localStorage.setItem('trust_shield_active_user', JSON.stringify(user));
      if (user.email) {
        const storedProfiles = JSON.parse(
          localStorage.getItem('trust_shield_user_profiles') || '{}'
        );
        storedProfiles[user.email.toLowerCase().trim()] = user;
        localStorage.setItem(
          'trust_shield_user_profiles',
          JSON.stringify(storedProfiles)
        );
      }
    } catch (e) {
      console.error('Could not save user progress:', e);
    }
  }, [user]);

  const [activeTab, setActiveTabState] = useState(() => {
    try {
      const storedTab = localStorage.getItem('trust_shield_active_tab');
      return storedTab || 'home';
    } catch (e) {
      return 'home';
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('trust_shield_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('trust_shield_theme', next);
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('trust_shield_active_tab', tab);
    } catch (e) {}
  };
const [scamList, setScamList] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem('trustshield_community_scams') || '[]'
    );
  } catch (e) {
    return [];
  }
});
  const [bankReviews, setBankReviews] = useState(INITIAL_BANK_REVIEWS);
  const [pointEvents, setPointEvents] = useState(INITIAL_POINT_EVENTS);

  // Global Voice & Security state
  const [detectedScamCall, setDetectedScamCall] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Session Transcript state (retained in React memory across tab navigation; resets cleanly on F5 page refresh)
  const [currentTranscript, setCurrentTranscript] = useState('');

// ADD STEP 7 HERE
useEffect(() => {
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  // Already counted today
  if (user.last_active_date === today) {
    return;
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const yesterday = yesterdayDate.toISOString().split('T')[0];

  setUser(prev => {
    if (!prev || prev.last_active_date === today) {
      return prev;
    }

    const previousStreak = Number(prev.streak) || 0;

    const newStreak =
      prev.last_active_date === yesterday
        ? previousStreak + 1
        : 1;

    return {
      ...prev,
      streak: newStreak,
      last_active_date: today
    };
  });
}, [user?.email, user?.last_active_date]);

// YOUR EXISTING CODE CONTINUES
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
  if (!user) return;

  const newBankReview = {
    id: `br_${Date.now()}`,
    transaction_id: `TXN${Date.now()}`,
    user_id: user.id,
    user_name: user.name,
    amount: blockedData.amount,
    recipient_upi: blockedData.recipient_upi,
    bank_name: user.bank_name,
    blocked_reason: blockedData.blocked_reason,
    risk_score: blockedData.risk_score,
    coercive_signals: blockedData.coercive_signals || [],
    device_info: user.current_device,
    status: 'PENDING',
    is_false_positive_requested: false,
    reviewed_by: 'Pending Officer Review',
    review_note: 'Automatically blocked by Trust Shield Zero-Knowledge AI engine.',
    created_at: new Date().toISOString()
  };

  setBankReviews(prev => [newBankReview, ...prev]);

  setUser(prev => {
    const newPoints = (Number(prev.guardian_points) || 0) + 100;
    const newLevel = calculateLevel(newPoints);

    return {
      ...prev,
      total_saved: (Number(prev.total_saved) || 0) + Number(blockedData.amount),
      guardian_points: newPoints,
      level: newLevel,
      guardian_level: `Level ${newLevel} Guardian`
    };
  });

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
  clearPaymentDraft();

  setUser(prev => {
    const newPoints = (Number(prev.guardian_points) || 0) + 25;
    const newLevel = calculateLevel(newPoints);

    return {
      ...prev,
      guardian_points: newPoints,
      level: newLevel,
      guardian_level: `Level ${newLevel} Guardian`
    };
  });

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
  setScamList(prev => {
    const updatedScams = prev.map(s => {
      if (s.id === scamId) {
        return { ...s, votes: (s.votes || 0) + 1 };
      }
      return s;
    });

    try {
      localStorage.setItem(
        'trustshield_community_scams',
        JSON.stringify(updatedScams)
      );
    } catch (e) {
      console.error('Unable to save community upvote:', e);
    }

    return updatedScams;
  });

setUser(prev => {
  const newPoints = (Number(prev.guardian_points) || 0) + 10;
  const newLevel = calculateLevel(newPoints);

  return {
    ...prev,
    guardian_points: newPoints,
    level: newLevel,
    guardian_level: `Level ${newLevel} Guardian`
  };
});

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
  setScamList(prev => {
    const updatedScams = [newScam, ...prev];

    try {
      localStorage.setItem(
        'trustshield_community_scams',
        JSON.stringify(updatedScams)
      );
    } catch (e) {
      console.error('Unable to save community scam:', e);
    }

    return updatedScams;
  });

setUser(prev => {
  const newPoints = (Number(prev.guardian_points) || 0) + 50;
  const newLevel = calculateLevel(newPoints);

  return {
    ...prev,
    guardian_points: newPoints,
    level: newLevel,
    guardian_level: `Level ${newLevel} Guardian`,
    cases_reported: (Number(prev.cases_reported) || 0) + 1
  };
});

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
    return <AuthScreen onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="app-container" data-theme={theme}>
      {/* Header */}
      <Header
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenProfile={() => setIsOnboardingOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Renderer */}
      <main style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomeView
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
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
            theme={theme}
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
            user={user}
            theme={theme}
            scamList={scamList}
            onUpvoteScam={handleUpvoteScam}
            onAddScam={handleAddScam}
          />
        )}

        {/* Bank Audit View: Exclusively accessible to Bank Risk Admins */}
        {activeTab === 'bank' && isBankAdmin && (
          <BankView
            user={user}
            theme={theme}
            bankReviews={bankReviews}
            onResolveReview={handleResolveBankReview}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            theme={theme}
            pointEvents={pointEvents}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onUpdateUser={setUser}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation
        user={user}
        theme={theme}
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
