import React from 'react';
import { Home, Send, ShieldAlert, Building2, User } from 'lucide-react';

export default function Navigation({ user, activeTab, setActiveTab, pendingBankCount }) {
  const isBankAdmin = user && user.role === 'BANK_ADMIN';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pay', label: 'Pay', icon: Send },
    { id: 'community', label: 'Community', icon: ShieldAlert },
    // Only Bank Risk Admins see the Bank Audit portal tab
    ...(isBankAdmin ? [{ id: 'bank', label: 'Bank Audit', icon: Building2, badge: pendingBankCount }] : []),
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="app-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="nav-icon-wrapper">
              <IconComponent size={20} />
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
