import React, { useState } from 'react';

export default function StudentDashboard({ user, buses, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBus, setSelectedBus] = useState(null);

  // Filter logic
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
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="logo-icon-sm">🚌</span>
          <h1>CampusRide</h1>
          <span className="badge badge-student">Student Portal</span>
        </div>
        <div className="user-profile">
          <span className="username">👋 Hello, {user.username}</span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚍</div>
          <div className="stat-content">
            <h3>Active Buses</h3>
            <p className="stat-number">{availableBuses} <span className="stat-total">/ {totalBuses}</span></p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💺</div>
          <div className="stat-content">
            <h3>Total Seats Free</h3>
            <p className="stat-number">{totalEmptySeats}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <h3>Active Routes</h3>
            <p className="stat-number">3</p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Left Side: Bus list & Filters */}
        <div className="dashboard-left">
          <div className="filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
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
                let progressColor = '#10b981'; // Green
                if (bus.seatsAvailable <= 5) {
                  progressColor = '#ef4444'; // Red
                } else if (bus.seatsAvailable <= 12) {
                  progressColor = '#f59e0b'; // Amber
                }

                const isSelected = selectedBus && selectedBus.id === bus.id;

                return (
                  <div
                    key={bus.id}
                    className={`bus-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedBus(bus)}
                  >
                    <div className="bus-card-header">
                      <div className="bus-identity">
                        <span className="bus-avatar">🚍</span>
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
                        <span className="label">Next Stop:</span>
                        <span className="value">{bus.nextStop}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">ETA:</span>
                        <span className="value highlighted">{bus.eta}</span>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="capacity-section">
                      <div className="capacity-labels">
                        <span>Free Seats: <strong>{bus.seatsAvailable}</strong></span>
                        <span>Capacity: {bus.totalCapacity}</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.max(5, occupancyRate)}%`,
                            backgroundColor: progressColor
                          }}
                        ></div>
                      </div>
                      <p className="capacity-description">
                        {bus.seatsAvailable === 0 
                          ? 'Bus is full' 
                          : bus.seatsAvailable <= 5 
                          ? 'Filling fast! Limited seats left.' 
                          : 'Plenty of seats available.'}
                      </p>
                    </div>

                    <div className="card-actions">
                      <button className="btn btn-action-outline">Track Route</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Interactive Campus Route Visualization */}
        <div className="dashboard-right">
          <div className="card map-card">
            <h3>Live Campus Map & Routes</h3>
            <p className="map-desc">Select a bus on the left to highlight its current stop and pathway.</p>
            
            <div className="svg-map-wrapper">
              <svg viewBox="0 0 500 400" className="campus-svg-map">
                {/* Defs for gradients */}
                <defs>
                  <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Overlay for high-tech look */}
                <g stroke="#334155" strokeWidth="0.5" opacity="0.3">
                  <line x1="50" y1="0" x2="50" y2="400" />
                  <line x1="100" y1="0" x2="100" y2="400" />
                  <line x1="150" y1="0" x2="150" y2="400" />
                  <line x1="200" y1="0" x2="200" y2="400" />
                  <line x1="250" y1="0" x2="250" y2="400" />
                  <line x1="300" y1="0" x2="300" y2="400" />
                  <line x1="350" y1="0" x2="350" y2="400" />
                  <line x1="400" y1="0" x2="400" y2="400" />
                  <line x1="450" y1="0" x2="450" y2="400" />
                  
                  <line x1="0" y1="50" x2="500" y2="50" />
                  <line x1="0" y1="100" x2="500" y2="100" />
                  <line x1="0" y1="150" x2="500" y2="150" />
                  <line x1="0" y1="200" x2="500" y2="200" />
                  <line x1="0" y1="250" x2="500" y2="250" />
                  <line x1="0" y1="300" x2="500" y2="300" />
                  <line x1="0" y1="350" x2="500" y2="350" />
                </g>

                {/* Routes paths */}
                <path
                  d="M 50,200 Q 150,50 300,100 T 450,200 T 250,350 Z"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                
                {/* Active Route highlight if bus is selected */}
                {selectedBus && (
                  <path
                    d="M 50,200 Q 150,50 300,100 T 450,200 T 250,350 Z"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    className="animated-route-line"
                  />
                )}

                {/* Stops / Nodes */}
                {/* Main Campus Gate */}
                <g transform="translate(50, 200)" className="map-node">
                  <circle r="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <circle r="6" fill="#10b981" />
                  <text y="-18" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">Main Gate</text>
                </g>

                {/* Hostel Block C */}
                <g transform="translate(200, 95)" className="map-node">
                  <circle r="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <circle r="6" fill={selectedBus && selectedBus.nextStop.includes('Hostel') ? '#3b82f6' : '#94a3b8'} />
                  <text y="-18" textAnchor="middle" fill="#f8fafc" fontSize="10">Hostels</text>
                </g>

                {/* Science Block */}
                <g transform="translate(340, 115)" className="map-node">
                  <circle r="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <circle r="6" fill={selectedBus && selectedBus.nextStop.includes('Science') ? '#3b82f6' : '#94a3b8'} />
                  <text y="-18" textAnchor="middle" fill="#f8fafc" fontSize="10">Science Block</text>
                </g>

                {/* Central Library */}
                <g transform="translate(450, 200)" className="map-node">
                  <circle r="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <circle r="6" fill={selectedBus && selectedBus.nextStop.includes('Library') ? '#3b82f6' : '#94a3b8'} />
                  <text x="18" y="4" fill="#f8fafc" fontSize="10">Library</text>
                </g>

                {/* Admin Building */}
                <g transform="translate(250, 350)" className="map-node">
                  <circle r="12" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <circle r="6" fill={selectedBus && selectedBus.nextStop.includes('Admin') ? '#3b82f6' : '#94a3b8'} />
                  <text y="22" textAnchor="middle" fill="#f8fafc" fontSize="10">Admin Bldg</text>
                </g>

                {/* Bus Indicators */}
                {buses.map((bus, idx) => {
                  if (bus.status === 'Out of Service') return null;

                  // Compute visual positions
                  let x = 120;
                  let y = 140;
                  if (bus.nextStop.includes('Hostel')) { x = 170; y = 90; }
                  else if (bus.nextStop.includes('Science')) { x = 320; y = 110; }
                  else if (bus.nextStop.includes('Library')) { x = 430; y = 180; }
                  else if (bus.nextStop.includes('Admin')) { x = 270; y = 330; }

                  const isBusSelected = selectedBus && selectedBus.id === bus.id;

                  return (
                    <g
                      key={bus.id}
                      transform={`translate(${x + (idx * 15)}, ${y})`}
                      className={`map-bus-indicator ${isBusSelected ? 'active-bus' : ''}`}
                    >
                      <rect x="-16" y="-10" width="32" height="20" rx="4" fill={isBusSelected ? '#2563eb' : '#334155'} stroke="#f8fafc" strokeWidth="1.5" />
                      <text textAnchor="middle" y="4" fill="#ffffff" fontSize="8" fontWeight="bold">
                        {bus.busNo.replace('BUS-', '')}
                      </text>
                      <circle cx="10" cy="10" r="3" fill="#000" />
                      <circle cx="-10" cy="10" r="3" fill="#000" />
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {selectedBus && (
              <div className="map-legend">
                <h4>Currently Inspecting: {selectedBus.busNo}</h4>
                <p>Status: <span className="bold">{selectedBus.status}</span> | Next Stop: <span className="bold">{selectedBus.nextStop} ({selectedBus.eta})</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
