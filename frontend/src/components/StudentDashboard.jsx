import React, { useState } from 'react';
import Silk from './Silk';

export default function StudentDashboard({ user, buses, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBus, setSelectedBus] = useState(null);

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
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.45 }}>
        <Silk speed={5} scale={1} color="#152944" noiseIntensity={1.5} rotation={0} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-brand">
            <div className="logo-mark">CR</div>
            <h1>CampusRide</h1>
            <span className="badge badge-student">Student Portal</span>
          </div>
          <div className="user-profile">
            <span className="username">Hello, {user.username}</span>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

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
              <p className="stat-number">3</p>
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
                  placeholder="Search by bus number, route or stop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="status-selector">
                <label>Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="In-Transit">In-Transit</option>
                  <option value="Delayed">Delayed</option>
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

                  return (
                    <div
                      key={bus.id}
                      className={`bus-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedBus(bus)}
                    >
                      <div className="bus-card-header">
                        <div className="bus-identity">
                          <div className="bus-avatar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                          </div>
                          <div>
                            <h4>{bus.busNo}</h4>
                            <p className="bus-route-text">{bus.route}</p>
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
                          <span className="label">ETA</span>
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
              <h3>Live Campus Map and Routes</h3>
              <p className="map-desc">Select a bus on the left to highlight its current stop and pathway.</p>

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

                  <path d="M 50,200 Q 150,50 300,100 T 450,200 T 250,350 Z" fill="none" stroke="#3a4750" strokeWidth="6" strokeLinecap="round" opacity="0.5" />

                  {selectedBus && (
                    <path d="M 50,200 Q 150,50 300,100 T 450,200 T 250,350 Z" fill="none" stroke="#2185d5" strokeWidth="4" strokeLinecap="round" className="animated-route-line" />
                  )}

                  <g transform="translate(50, 200)" className="map-node">
                    <circle r="12" fill="#303841" stroke="#3a4750" strokeWidth="2" />
                    <circle r="6" fill="#10b981" />
                    <text y="-18" textAnchor="middle" fill="#f3f3f3" fontSize="10" fontWeight="bold">Main Gate</text>
                  </g>
                  <g transform="translate(200, 95)" className="map-node">
                    <circle r="12" fill="#303841" stroke="#3a4750" strokeWidth="2" />
                    <circle r="6" fill={selectedBus && selectedBus.nextStop.includes('Hostel') ? '#2185d5' : '#94a3b8'} />
                    <text y="-18" textAnchor="middle" fill="#f3f3f3" fontSize="10">Hostels</text>
                  </g>
                  <g transform="translate(340, 115)" className="map-node">
                    <circle r="12" fill="#303841" stroke="#3a4750" strokeWidth="2" />
                    <circle r="6" fill={selectedBus && selectedBus.nextStop.includes('Science') ? '#2185d5' : '#94a3b8'} />
                    <text y="-18" textAnchor="middle" fill="#f3f3f3" fontSize="10">Science Block</text>
                  </g>
                  <g transform="translate(450, 200)" className="map-node">
                    <circle r="12" fill="#303841" stroke="#3a4750" strokeWidth="2" />
                    <circle r="6" fill={selectedBus && selectedBus.nextStop.includes('Library') ? '#2185d5' : '#94a3b8'} />
                    <text x="18" y="4" fill="#f3f3f3" fontSize="10">Library</text>
                  </g>
                  <g transform="translate(250, 350)" className="map-node">
                    <circle r="12" fill="#303841" stroke="#3a4750" strokeWidth="2" />
                    <circle r="6" fill={selectedBus && selectedBus.nextStop.includes('Admin') ? '#2185d5' : '#94a3b8'} />
                    <text y="22" textAnchor="middle" fill="#f3f3f3" fontSize="10">Admin Bldg</text>
                  </g>

                  {buses.map((bus, idx) => {
                    if (bus.status === 'Out of Service') return null;
                    let x = 120, y = 140;
                    if (bus.nextStop.includes('Hostel')) { x = 170; y = 90; }
                    else if (bus.nextStop.includes('Science')) { x = 320; y = 110; }
                    else if (bus.nextStop.includes('Library')) { x = 430; y = 180; }
                    else if (bus.nextStop.includes('Admin')) { x = 270; y = 330; }
                    const isBusSelected = selectedBus && selectedBus.id === bus.id;
                    return (
                      <g key={bus.id} transform={`translate(${x + (idx * 15)}, ${y})`} className={`map-bus-indicator ${isBusSelected ? 'active-bus' : ''}`}>
                        <rect x="-16" y="-10" width="32" height="20" rx="4" fill={isBusSelected ? '#2185d5' : '#475569'} stroke="#f3f3f3" strokeWidth="1.5" />
                        <text textAnchor="middle" y="4" fill="#ffffff" fontSize="8" fontWeight="bold">{bus.busNo.replace('BUS-', '')}</text>
                        <circle cx="10" cy="10" r="3" fill="#000" />
                        <circle cx="-10" cy="10" r="3" fill="#000" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {selectedBus && (
                <div className="map-legend">
                  <h4>Inspecting: {selectedBus.busNo}</h4>
                  <p>Status: <span className="bold">{selectedBus.status}</span> | Next Stop: <span className="bold">{selectedBus.nextStop} ({selectedBus.eta})</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
