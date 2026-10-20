import React, { useState } from 'react';
import WeatherWidget from './WeatherWidget';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'driver'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    onLogin({ username, role: activeTab });
  };

  const handleQuickFill = (role) => {
    setActiveTab(role);
    if (role === 'student') {
      setUsername('STU1024');
      setPassword('password123');
    } else {
      setUsername('DRIVER01');
      setPassword('driver123');
    }
  };

  return (
    <div className="login-page">
      <div className="login-layout-wrapper">
        {/* Left Side: Editorial Transit Banner */}
        <div className="login-brand-panel">
          <div className="brand-hero-text">
            <h1 className="brand-hero-title">
              Effortless Mobility for <span>Campus Life</span>
            </h1>
          </div>

          <div className="brand-stats-row">
            <div className="brand-stat-box">
              <span className="stat-value">10</span>
              <span className="stat-label">Active Shuttles</span>
            </div>
            <div className="brand-stat-box">
              <span className="stat-value">15 min</span>
              <span className="stat-label">Departure Freq</span>
            </div>
            <div className="brand-stat-box">
              <span className="stat-value">4.0 km</span>
              <span className="stat-label">Express Route</span>
            </div>
          </div>

          <div className="route-preview-badge">
            <div className="route-stop-point">
              <span className="stop-circle stop-kandoli"></span>
              <span>Kandoli Campus</span>
            </div>
            <div className="route-arrow-line">
              <span className="route-moving-dot"></span>
            </div>
            <div className="route-stop-point">
              <span className="stop-circle stop-bidholi"></span>
              <span>Bidholi Campus</span>
            </div>
          </div>

          {/* Real-time Campus Weather Telemetry */}
          <WeatherWidget />
        </div>

        {/* Right Side: Interactive Login Portal */}
        <div className="login-card-container">
          <div className="login-card">
            <div className="login-card-header">
              <div className="auth-pill-tag">
                <span>PORTAL AUTHENTICATION</span>
              </div>
              <h2 className="login-form-title">Welcome to CampusRide</h2>
              <p className="login-form-desc">
                Select your role to access shuttle schedules or driver operations.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="role-switch-container">
              <button
                type="button"
                className={`role-tab-btn ${activeTab === 'student' ? 'active-student' : ''}`}
                onClick={() => {
                  setActiveTab('student');
                  if (!username || username === 'DRIVER01') setUsername('STU1024');
                }}
              >
                <span className="tab-icon">🎓</span>
                <span className="tab-text">Student Portal</span>
              </button>
              <button
                type="button"
                className={`role-tab-btn ${activeTab === 'driver' ? 'active-driver' : ''}`}
                onClick={() => {
                  setActiveTab('driver');
                  if (!username || username === 'STU1024') setUsername('DRIVER01');
                }}
              >
                <span className="tab-icon">🚍</span>
                <span className="tab-text">Driver Operations</span>
              </button>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">
                  {activeTab === 'student' ? 'Student SAP ID' : 'Driver Badge ID'}
                </label>
                <div className="input-with-icon">
                  <span className="field-icon">{activeTab === 'student' ? '🆔' : '🪪'}</span>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={activeTab === 'student' ? 'e.g. STU1024 or 500108920' : 'e.g. DRIVER01'}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Security Password</label>
                <div className="input-with-icon">
                  <span className="field-icon">🔒</span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                  />
                </div>
              </div>

              <div className="quick-fill-chips">
                <span className="quick-fill-label">Instant Demo:</span>
                <button
                  type="button"
                  className={`quick-chip ${activeTab === 'student' ? 'active-chip' : ''}`}
                  onClick={() => handleQuickFill('student')}
                >
                  Student (STU1024)
                </button>
                <button
                  type="button"
                  className={`quick-chip ${activeTab === 'driver' ? 'active-chip' : ''}`}
                  onClick={() => handleQuickFill('driver')}
                >
                  Driver (DRIVER01)
                </button>
              </div>

              <button
                type="submit"
                className={`btn btn-portal-submit ${activeTab === 'student' ? 'btn-student-submit' : 'btn-driver-submit'}`}
              >
                <span>{activeTab === 'student' ? 'Enter Student Portal' : 'Access Driver Cockpit'}</span>
                <span className="arrow-icon">&rarr;</span>
              </button>

              <div className="login-trust-notice">
                <span>UPES Transit Network</span> &bull; <span>Verified GPS Sync</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
