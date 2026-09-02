import React from 'react';
import TRexGame from './TRexGame';
import ColorBends from './ColorBends';

export default function NotFound({ onNavigateHome, user }) {
  return (
    <div className="not-found-page">
      {/* Background WebGL / Visual Canvas */}
      <div className="not-found-bg-canvas">
        <ColorBends
          colors={["#2185D5", "#111827", "#1e293b"]}
          rotation={45}
          speed={0.15}
          scale={1.2}
          frequency={0.8}
          warpStrength={0.8}
          mouseInfluence={0.5}
          noise={0}
          parallax={0.3}
          iterations={1}
          intensity={1.2}
          bandWidth={8}
          transparent={false}
          autoRotate={0}
        />
      </div>

      <div className="not-found-overlay"></div>

      <div className="not-found-container">
        {/* Navigation Bar / Brand Header */}
        <header className="not-found-header">
          <div className="not-found-brand" onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
            <span className="not-found-brand-icon">🚌</span>
            <span className="not-found-brand-text">CampusRide</span>
          </div>
          <div className="not-found-status-tag">
            <span className="status-ping"></span>
            <span>ERROR 404 &bull; ROUTE LOST</span>
          </div>
        </header>

        {/* 404 Hero Content */}
        <div className="not-found-hero">
          <div className="not-found-glitch-wrapper">
            <h1 className="not-found-code" data-text="404">404</h1>
          </div>
          <h2 className="not-found-title">Bus Route Not Found</h2>
          <p className="not-found-desc">
            Looks like you've wandered off the official campus route or this bus stop doesn't exist.
            While our dispatch team recalculates the route, jump in and set a high score in the <strong>Campus T-Rex Runner</strong>!
          </p>
        </div>

        {/* Arcade Frame with Embedded T-Rex Game */}
        <div className="arcade-cabinet">
          <div className="arcade-bezel">
            <div className="arcade-screen-header">
              <div className="screen-dots">
                <span className="screen-dot red"></span>
                <span className="screen-dot yellow"></span>
                <span className="screen-dot green"></span>
              </div>
              <div className="screen-title">
                CAMPUS_BUS_OFFLINE_RUNNER.EXE
              </div>
              <div className="screen-fps">60 FPS</div>
            </div>

            <div className="arcade-game-area">
              <TRexGame />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <button
            className="btn btn-student btn-hero"
            onClick={onNavigateHome}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>{user ? 'Return to Dashboard' : 'Return to Login'}</span>
          </button>

          <button
            className="btn btn-secondary-custom"
            onClick={onNavigateHome}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2"></rect>
              <path d="M16 8h4l3 4v4h-7V8z"></path>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>View Bus Timetable</span>
          </button>
        </div>

        {/* Campus Info Quick Cards */}
        <div className="not-found-tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📍</div>
            <div className="tip-text">
              <h4>Kandoli &harr; Bidholi Express</h4>
              <p>Buses run every 15 minutes between 8:00 AM and 6:00 PM with real-time seat tracking.</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⚡</div>
            <div className="tip-text">
              <h4>Live Seat Availability</h4>
              <p>Check empty seats before arriving at the bus terminal to save time during rush hours.</p>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🎮</div>
            <div className="tip-text">
              <h4>Dino Pro-Tip</h4>
              <p>Press <kbd>▼</kbd> (Down Arrow) mid-jump for a rapid drop-down to avoid tricky pterodactyls!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
