import React, { useState } from 'react';
import Silk from './Silk';

export default function StudentDashboard({ user, buses, onLogout, onUpdateBus, onBoardStudent, onDeboardStudent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBus, setSelectedBus] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'input',
    bus: null,
    sapId: '500109999',
    message: ''
  });

  // Find if current student is currently boarded on any bus
  const currentBoardedBus = buses.find(b =>
    b.boardedStudents?.some(s => s.sapId === modalState.sapId || s.name === user?.username)
  );

  const isBoardedOnThisBus = (bus) => {
    return bus.boardedStudents?.some(s => s.sapId === modalState.sapId || s.name === user?.username);
  };

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.busNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.nextStop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || bus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBuses = buses.length;
  const availableBuses = buses.filter(b => b.status !== 'Out of Service').length;
  const totalEmptySeats = buses.reduce((acc, curr) => {
    return curr.status !== 'Out of Service' ? acc + curr.seatsAvailable : acc;
  }, 0);

  return (
    <div className="dashboard-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.55 }}>
        <Silk speed={5} scale={1} color="#1a4a8a" noiseIntensity={0} rotation={0} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-brand">
            <img
              src="/campusride-logo.png"
              alt="CampusRide Logo"
              style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '8px', marginRight: '10px' }}
            />
            <h1>CampusRide</h1>
            <span className="badge badge-student">Student Portal</span>
          </div>
          <div className="user-profile">
            <span className="username">Hello, {user.username}</span>
            {currentBoardedBus && (
              <button 
                className="btn-action-outline" 
                style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#ef4444', color: '#fca5a5', marginRight: '8px', cursor: 'pointer' }}
                onClick={() => setModalState({ isOpen: true, mode: 'deboard', bus: currentBoardedBus, sapId: modalState.sapId, message: '' })}
              >
                🛑 Deboard ({currentBoardedBus.busNo})
              </button>
            )}
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        {/* Active Booking Banner (Only shown if student has booked a seat) */}
        {currentBoardedBus && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            color: '#f87171'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🚌</span>
              <div>
                <strong>Active Boarded Ride:</strong> You are currently booked on <strong>{currentBoardedBus.busNo}</strong> ({currentBoardedBus.route}).
              </div>
            </div>
            <button
              className="btn-action-primary"
              style={{ background: '#ef4444', border: 'none', padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}
              onClick={() => setModalState({ isOpen: true, mode: 'deboard', bus: currentBoardedBus, sapId: modalState.sapId, message: '' })}
            >
              Deboard Now
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <div className="stat-content">
              <h3>Active Buses</h3>
              <p className="stat-number">{availableBuses} <span className="stat-total">/ {totalBuses}</span></p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="stat-content">
              <h3>Seats Free</h3>
              <p className="stat-number">{totalEmptySeats}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div className="stat-content">
              <h3>Active Routes</h3>
              <p className="stat-number">2</p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Left: Bus list */}
          <div className="dashboard-left">
            <div className="filter-bar">
              <div className="search-box">
                <svg className="search-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search by bus number, route (Kandoli / Bidholi)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="status-selector">
                <label>Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="In-Transit">In-Transit</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Active">Active</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
            </div>

            <div className="bus-list">
              {filteredBuses.length === 0 ? (
                <div className="no-results">
                  <p>No campus buses matching your search criteria.</p>
                </div>
              ) : (
                filteredBuses.map((bus) => {
                  const occupancyRate = ((bus.totalCapacity - bus.seatsAvailable) / bus.totalCapacity) * 100;
                  let progressColor = '#10b981';
                  if (bus.seatsAvailable <= 5) progressColor = '#ef4444';
                  else if (bus.seatsAvailable <= 12) progressColor = '#f59e0b';
                  const isSelected = selectedBus && selectedBus.id === bus.id;
                  const isBoarded = isBoardedOnThisBus(bus);

                  return (
                    <div
                      key={bus.id}
                      className={`bus-card ${isSelected ? 'selected' : ''}`}
                      style={isBoarded ? { border: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' } : {}}
                      onClick={() => setSelectedBus(bus)}
                    >
                      <div className="bus-card-header">
                        <div className="bus-identity">
                          <div className="bus-avatar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                          </div>
                          <div>
                            <h4>{bus.busNo} {isBoarded && <span style={{ color: '#f87171', fontSize: '12px', fontWeight: 'bold' }}>(Your Ride)</span>}</h4>
                            <p className="bus-route-text">{bus.route} ({bus.departureTime})</p>
                          </div>
                        </div>
                        <span className={`status-badge status-${bus.status.toLowerCase().replace(' ', '-')}`}>
                          {bus.status}
                        </span>
                      </div>

                      <div className="bus-card-details">
                        <div className="detail-item">
                          <span className="label">Next Stop</span>
                          <span className="value">{bus.nextStop}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">ETA (2 km)</span>
                          <span className="value highlighted">{bus.eta}</span>
                        </div>
                      </div>

                      <div className="capacity-section">
                        <div className="capacity-labels">
                          <span>Free Seats: <strong>{bus.seatsAvailable}</strong></span>
                          <span>Capacity: {bus.totalCapacity}</span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.max(5, occupancyRate)}%`, backgroundColor: progressColor }}
                          ></div>
                        </div>
                        <p className="capacity-description">
                          {bus.seatsAvailable === 0
                            ? 'Bus is full'
                            : bus.seatsAvailable <= 5
                            ? 'Filling fast. Limited seats left.'
                            : 'Plenty of seats available.'}
                        </p>
                      </div>

                      <div className="card-actions">
                        {isBoarded ? (
                          <button
                            className="btn-action-outline"
                            style={{
                              marginRight: '6px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderColor: '#ef4444',
                              color: '#ffffff',
                              background: '#ef4444',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalState({
                                isOpen: true,
                                mode: 'deboard',
                                bus: bus,
                                sapId: modalState.sapId,
                                message: ''
                              });
                            }}
                          >
                            🛑 Deboard Ride
                          </button>
                        ) : bus.status !== 'Out of Service' ? (
                          <button 
                            className="btn-action-primary" 
                            style={{ 
                              marginRight: '6px', 
                              padding: '6px 12px', 
                              background: (bus.seatsAvailable === 0 || currentBoardedBus) ? '#64748b' : '#2185d5', 
                              border: 'none', 
                              color: '#fff', 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              borderRadius: '6px', 
                              cursor: (bus.seatsAvailable === 0 || currentBoardedBus) ? 'not-allowed' : 'pointer',
                              opacity: (bus.seatsAvailable === 0 || currentBoardedBus) ? 0.7 : 1
                            }}
                            disabled={bus.seatsAvailable === 0 || !!currentBoardedBus}
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalState({
                                isOpen: true,
                                mode: 'input',
                                bus: bus,
                                sapId: modalState.sapId,
                                message: ''
                              });
                            }}
                          >
                            {currentBoardedBus ? 'Ride Active' : bus.seatsAvailable === 0 ? 'Full' : 'Book / Board'}
                          </button>
                        ) : null}
                        <button className="btn-action-outline">Track Route</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Campus Map */}
          <div className="dashboard-right">
            <div className="map-card">
              <h3>Live Campus Map (2 Stops: Kandoli & Bidholi)</h3>
              <p className="map-desc">Select a bus on the left to highlight its current pathway between Kandoli & Bidholi.</p>

              <div className="svg-map-wrapper">
                <svg viewBox="0 0 500 400" className="campus-svg-map">
                  <defs>
                    <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2185d5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2185d5" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  <g stroke="#3a4750" strokeWidth="0.5" opacity="0.3">
                    {[50,100,150,200,250,300,350,400,450].map(x => <line key={x} x1={x} y1="0" x2={x} y2="400" />)}
                    {[50,100,150,200,250,300,350].map(y => <line key={y} x1="0" y1={y} x2="500" y2={y} />)}
                  </g>

                  {/* Route lines */}
                  {/* Top Curve: Kandoli -> Bidholi */}
                  <path
                    d="M 70,185 Q 250,90 430,185"
                    fill="none"
                    stroke={selectedBus && selectedBus.route.includes('Kandoli → Bidholi') ? '#2185d5' : '#3a4750'}
                    strokeWidth={selectedBus && selectedBus.route.includes('Kandoli → Bidholi') ? '5' : '4'}
                    strokeLinecap="round"
                    opacity={selectedBus && !selectedBus.route.includes('Kandoli → Bidholi') ? '0.3' : '0.8'}
                    className={selectedBus && selectedBus.route.includes('Kandoli → Bidholi') ? 'animated-route-line' : ''}
                  />

                  {/* Bottom Curve: Bidholi -> Kandoli */}
                  <path
                    d="M 430,215 Q 250,310 70,215"
                    fill="none"
                    stroke={selectedBus && selectedBus.route.includes('Bidholi → Kandoli') ? '#2185d5' : '#3a4750'}
                    strokeWidth={selectedBus && selectedBus.route.includes('Bidholi → Kandoli') ? '5' : '4'}
                    strokeLinecap="round"
                    opacity={selectedBus && !selectedBus.route.includes('Bidholi → Kandoli') ? '0.3' : '0.8'}
                    className={selectedBus && selectedBus.route.includes('Bidholi → Kandoli') ? 'animated-route-line' : ''}
                  />

                  {/* Distance & Route Labels */}
                  <text x="250" y="70" textAnchor="middle" fill="#60b5ff" fontSize="10" fontWeight="bold">
                    Kandoli → Bidholi (Way 1 • 5 Buses)
                  </text>
                  <text x="250" y="335" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                    Bidholi → Kandoli (Way 2 • 5 Buses)
                  </text>
                  <rect x="180" y="190" width="140" height="20" rx="10" fill="#1e293b" stroke="#3a4750" strokeWidth="1" />
                  <text x="250" y="204" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">
                    2.0 km • 15-20 min ETA
                  </text>

                  {/* Stop 1: Kandoli */}
                  <g transform="translate(70, 200)" className="map-node">
                    <circle r="16" fill="#1e293b" stroke="#60b5ff" strokeWidth="2" />
                    <circle r="8" fill="#2185d5" />
                    <text y="-24" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Kandoli Stop</text>
                  </g>

                  {/* Stop 2: Bidholi */}
                  <g transform="translate(430, 200)" className="map-node">
                    <circle r="16" fill="#1e293b" stroke="#34d399" strokeWidth="2" />
                    <circle r="8" fill="#10b981" />
                    <text y="-24" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">Bidholi Stop</text>
                  </g>

                  {/* Buses on Map */}
                  {buses.map((bus) => {
                    let x = 250;
                    let y = 200;
                    const isWay1 = bus.route.includes('Kandoli → Bidholi');
                    const indexInWay = (bus.id - 1) % 5;
                    const tValues = [0.15, 0.32, 0.50, 0.68, 0.85];
                    const t = tValues[indexInWay] || 0.5;

                    if (isWay1) {
                      // Quadratic bezier formula for top curve: P0=(70,185), P1=(250,90), P2=(430,185)
                      x = Math.round((1 - t) * (1 - t) * 70 + 2 * (1 - t) * t * 250 + t * t * 430);
                      y = Math.round((1 - t) * (1 - t) * 185 + 2 * (1 - t) * t * 90 + t * t * 185);
                    } else {
                      // Quadratic bezier formula for bottom curve: P0=(430,215), P1=(250,310), P2=(70,215)
                      x = Math.round((1 - t) * (1 - t) * 430 + 2 * (1 - t) * t * 250 + t * t * 70);
                      y = Math.round((1 - t) * (1 - t) * 215 + 2 * (1 - t) * t * 310 + t * t * 215);
                    }

                    const isBusSelected = selectedBus && selectedBus.id === bus.id;
                    
                    // Status Color map: In-Transit = Green (#10b981), Delayed = Red (#ef4444), Active = Blue (#2185d5), Out of Service = Grey (#64748b)
                    let statusColor = '#10b981';
                    if (bus.status === 'Delayed') statusColor = '#ef4444';
                    else if (bus.status === 'Active') statusColor = '#2185d5';
                    else if (bus.status === 'Out of Service') statusColor = '#64748b';

                    return (
                      <g
                        key={bus.id}
                        transform={`translate(${x}, ${y})`}
                        className={`map-bus-indicator ${isBusSelected ? 'active-bus' : ''}`}
                        onClick={() => setSelectedBus(bus)}
                        style={{ cursor: 'pointer' }}
                      >
                        {isBusSelected && (
                          <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.9" />
                        )}
                        <rect
                          x="-18"
                          y="-11"
                          width="36"
                          height="22"
                          rx="5"
                          fill={statusColor}
                          stroke={isBusSelected ? '#ffffff' : '#1e293b'}
                          strokeWidth={isBusSelected ? '2' : '1.5'}
                        />
                        <text textAnchor="middle" y="4" fill="#ffffff" fontSize="9" fontWeight="bold">
                          {bus.busNo.replace('BUS-', '')}
                        </text>
                        <circle cx="11" cy="11" r="3" fill="#0f172a" />
                        <circle cx="-11" cy="11" r="3" fill="#0f172a" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Status Color Legend */}
              <div style={{ display: 'flex', gap: '14px', marginTop: '14px', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f3f3f3' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  In-Transit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f3f3f3' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                  Delayed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f3f3f3' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#64748b', display: 'inline-block' }}></span>
                  Out of Service
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f3f3f3' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #f59e0b', display: 'inline-block' }}></span>
                  Selected Bus
                </div>
              </div>

              {selectedBus && (
                <div className="map-legend">
                  <h4>Inspecting: {selectedBus.busNo} ({selectedBus.route})</h4>
                  <p>
                    Status: <span className="bold" style={{ color: selectedBus.status === 'Delayed' ? '#f87171' : selectedBus.status === 'Out of Service' ? '#94a3b8' : '#34d399' }}>{selectedBus.status}</span> | 
                    Departure: <span className="bold">{selectedBus.departureTime}</span> | 
                    Next Stop: <span className="bold">{selectedBus.nextStop} (ETA: {selectedBus.eta})</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking / Deboard Modal */}
      {modalState.isOpen && (
        <div className="modal-backdrop" onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            {modalState.mode === 'input' && (
              <>
                <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none' }}>
                  <div className="modal-title-box">
                    <span className="modal-icon">🚌</span>
                    <h3>Book Ride on {modalState.bus?.busNo}</h3>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '16px' }}>
                    Enter your SAP ID to board this bus.
                  </p>
                  <input
                    type="text"
                    value={modalState.sapId}
                    onChange={(e) => setModalState(prev => ({ ...prev, sapId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid #475569',
                      borderRadius: '10px',
                      color: '#f3f3f3',
                      fontSize: '16px',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                    onBlur={(e) => e.target.style.borderColor = '#475569'}
                  />
                </div>
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                  <button className="btn-action-outline" onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}>Cancel</button>
                  <button className="btn-action-primary" onClick={() => {
                    const sapId = modalState.sapId.trim();
                    if (!sapId) return;
                    
                    const fromStop = modalState.bus.route.includes('Kandoli → Bidholi') ? 'Kandoli' : 'Bidholi';
                    const toStop = modalState.bus.route.includes('Kandoli → Bidholi') ? 'Bidholi' : 'Kandoli';
                    
                    if (onBoardStudent) {
                      const res = onBoardStudent(modalState.bus.id, {
                        name: user ? user.username : 'Student',
                        sapId: sapId,
                        from: fromStop,
                        to: toStop
                      });
                      
                      if (res && res.success) {
                        setModalState(prev => ({ ...prev, mode: 'success', message: `Ride booked successfully! SAP ID: ${sapId} on ${modalState.bus.busNo}` }));
                      } else {
                        setModalState(prev => ({ ...prev, mode: 'error', message: res?.message || 'Failed to book ride.' }));
                      }
                    } else {
                      onUpdateBus(modalState.bus.id, { seatsAvailable: Math.max(0, modalState.bus.seatsAvailable - 1) });
                      setModalState(prev => ({ ...prev, mode: 'success', message: `Ride booked successfully! SAP ID: ${sapId} on ${modalState.bus.busNo}` }));
                    }
                  }}>Confirm Booking</button>
                </div>
              </>
            )}

            {modalState.mode === 'deboard' && (
              <>
                <div className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none' }}>
                  <div className="modal-title-box">
                    <span className="modal-icon">🛑</span>
                    <h3>Deboard / Cancel Ride</h3>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '16px' }}>
                    Enter your SAP ID to deboard from your booked bus and free up your seat.
                  </p>
                  <input
                    type="text"
                    value={modalState.sapId}
                    onChange={(e) => setModalState(prev => ({ ...prev, sapId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid #ef4444',
                      borderRadius: '10px',
                      color: '#f3f3f3',
                      fontSize: '16px',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                    onBlur={(e) => e.target.style.borderColor = '#475569'}
                  />
                </div>
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                  <button className="btn-action-outline" onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}>Cancel</button>
                  <button 
                    className="btn-action-primary" 
                    style={{ background: '#ef4444' }}
                    onClick={() => {
                      const sapId = modalState.sapId.trim();
                      if (!sapId) return;

                      let targetBus = null;
                      let targetPassenger = null;

                      for (const b of buses) {
                        const found = b.boardedStudents?.find(s => s.sapId === sapId);
                        if (found) {
                          targetBus = b;
                          targetPassenger = found;
                          break;
                        }
                      }

                      if (targetBus && targetPassenger) {
                        if (onDeboardStudent) {
                          onDeboardStudent(targetBus.id, targetPassenger.id);
                        } else {
                          onUpdateBus(targetBus.id, { seatsAvailable: Math.min(targetBus.totalCapacity, targetBus.seatsAvailable + 1) });
                        }
                        setModalState(prev => ({
                          ...prev,
                          mode: 'deboard_success',
                          message: `Deboarded successfully from ${targetBus.busNo} (${targetBus.route})! Your seat is released and you can now book another bus.`
                        }));
                      } else {
                        setModalState(prev => ({
                          ...prev,
                          mode: 'error',
                          message: `No active ride found for SAP ID: ${sapId}.`
                        }));
                      }
                    }}
                  >
                    Confirm Deboard
                  </button>
                </div>
              </>
            )}
            
            {modalState.mode === 'success' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ color: '#6ee7b7', fontSize: '20px', marginBottom: '12px' }}>Booking Confirmed!</h3>
                <p style={{ color: '#cbd5e1', fontSize: '15px', marginBottom: '24px' }}>{modalState.message}</p>
                <button className="btn-action-primary" onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}>Awesome!</button>
              </>
            )}

            {modalState.mode === 'deboard_success' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏁</div>
                <h3 style={{ color: '#6ee7b7', fontSize: '20px', marginBottom: '12px' }}>Deboarded Successfully!</h3>
                <p style={{ color: '#cbd5e1', fontSize: '15px', marginBottom: '24px' }}>{modalState.message}</p>
                <button className="btn-action-primary" onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}>Book Another Bus</button>
              </>
            )}

            {modalState.mode === 'error' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ color: '#fca5a5', fontSize: '20px', marginBottom: '12px' }}>Notification</h3>
                <p style={{ color: '#cbd5e1', fontSize: '15px', marginBottom: '24px' }}>{modalState.message}</p>
                <button className="btn-action-outline" onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
