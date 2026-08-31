import React, { useState } from 'react';
import ColorBends from './ColorBends';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e, role) => {
    e.preventDefault();
    if (!username || !password) return;
    
    // Simple mock auth matching rules
    onLogin({ username, role });
  };

  return (
    <div className="login-page">
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <ColorBends
          colors={["#2185D5"]}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent
          autoRotate={0}
        />
      </div>

      <div className="card login-card">
        <div className="logo-container">
          <span className="logo-icon">🚌</span>
          <div className="title">
            <h2>CampusRide</h2>
          </div>
        </div>
        
        <div className="subtitle-container">
          <p className="subtitle">Smart Bus Seat Availability & Allocation</p>
        </div>

        <form className="login-form">
          <div className="form-group">
            <label htmlFor="username">User ID / Student ID / Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. STU1024 or DRIVER01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="btn-group">
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, 'student')}
              className="btn btn-student"
            >
              Student Login
            </button>
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, 'driver')}
              className="btn btn-driver"
            >
              Driver Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
