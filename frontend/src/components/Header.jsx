import React from 'react';

export default function Header({ user, onLogout, currentBoardedBus, onDeboardClick }) {
  return (
    <header className="main-app-header">
      <div className="header-glass-container">
        {/* Left Side: Brand Logo & Title */}
        <div className="header-brand-section">
          <div className="header-logo-badge">
            <img
              src="/campusride-logo.png"
              alt="CampusRide Logo"
              className="header-logo-img"
            />
          </div>
          <div className="header-title-group">
            <div className="header-brand-title">
              <span className="brand-name">Campus<span className="brand-highlight">Ride</span></span>
            </div>
            <span className="header-subtitle">Smart Campus Transit Portal</span>
          </div>
        </div>

        {/* Center Side: Campus Route Indicator / Quick Badges */}
        <div className="header-center-info">
          <div className="route-badge">
            <span className="route-pulse-dot"></span>
            <span className="route-label">Express Line:</span>
            <span className="route-stops">Kandoli ↔ Bidholi</span>
          </div>

          {user && (
            <span className={`portal-role-badge ${user.role === 'driver' ? 'role-driver' : 'role-student'}`}>
              <span className="role-icon">{user.role === 'driver' ? '🚍' : '🎓'}</span>
              {user.role === 'driver' ? 'Driver Portal' : 'Student Portal'}
            </span>
          )}
        </div>

        {/* Right Side: User Profile & Actions */}
        <div className="header-user-section">
          {user ? (
            <div className="user-profile-widget">
              <div className="user-avatar-pill">
                <span className="user-avatar-initial">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <div className="user-details">
                  <span className="user-name">{user.username}</span>
                  <span className="user-role-sub text-muted">
                    {user.role === 'driver' ? 'Bus Operator' : 'Student'}
                  </span>
                </div>
              </div>

              {/* Active Ride Badge with Quick Action if Student is Boarded */}
              {user.role === 'student' && currentBoardedBus && onDeboardClick && (
                <button
                  className="header-active-ride-btn"
                  onClick={onDeboardClick}
                  title="Click to deboard from your active ride"
                >
                  <span className="active-bus-icon">🚌</span>
                  <span className="active-bus-text">{currentBoardedBus.busNo}</span>
                  <span className="active-deboard-tag">Deboard</span>
                </button>
              )}

              <button className="btn-header-logout" onClick={onLogout} title="Sign Out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="header-guest-badge">
              <span className="guest-dot"></span>
              <span>Authentication Required</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
