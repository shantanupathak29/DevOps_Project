import React, { useState } from 'react';

export default function StudentDashboard({ user, buses, onLogout, onUpdateBus, onBoardStudent, onDeboardStudent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState('All'); // 'All' | 'Kandoli → Bidholi' | 'Bidholi → Kandoli'
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('timetable'); // 'timetable' | 'cards'
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [expandedBusId, setExpandedBusId] = useState(null);

  // Booking & Deboarding modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'input', // 'input' | 'deboard' | 'success' | 'deboard_success' | 'error'
    bus: null,
    sapId: user?.username?.startsWith('500') ? user.username : '500109999',
    message: ''
  });

  // Current student SAP ID or username
  const currentSapId = modalState.sapId;

  // Find if current student is currently boarded on any bus
  const currentBoardedBus = buses.find(b =>
    b.boardedStudents?.some(s => s.sapId === currentSapId || s.name === user?.username)
  );

  const studentBoardingRecord = currentBoardedBus?.boardedStudents?.find(
    s => s.sapId === currentSapId || s.name === user?.username
  );

  const isBoardedOnThisBus = (bus) => {
    return bus.boardedStudents?.some(s => s.sapId === currentSapId || s.name === user?.username);
  };

  // Filter buses based on direction, status, and search
  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.busNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.nextStop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.departureTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDirection = directionFilter === 'All' || bus.route.includes(directionFilter);
    const matchesStatus = statusFilter === 'All' || bus.status === statusFilter;

    return matchesSearch && matchesDirection && matchesStatus;
  });

  // Quick summary counts
  const totalShuttles = buses.length;
  const activeShuttles = buses.filter(b => b.status === 'Active' || b.status === 'In-Transit').length;
  const availableSeats = buses.reduce((acc, curr) => curr.status !== 'Out of Service' ? acc + curr.seatsAvailable : acc, 0);

  // Helper for occupancy color
  const getCapacityMeta = (seatsAvailable, totalCapacity) => {
    const occupancyPercent = ((totalCapacity - seatsAvailable) / totalCapacity) * 100;
    if (seatsAvailable === 0) {
      return { label: 'Full', color: '#b91c1c', badgeClass: 'capacity-full', barColor: '#b91c1c' };
    }
    if (seatsAvailable <= 5) {
      return { label: 'Filling Fast', color: '#b45309', badgeClass: 'capacity-low', barColor: '#b45309' };
    }
    return { label: 'Available', color: '#15803d', badgeClass: 'capacity-good', barColor: '#15803d' };
  };

  return (
    <div className="student-portal-wrapper">
      {/* 1. Portal Header Bar */}
      <header className="portal-subnav">
        <div className="portal-subnav-content">
          <div className="portal-subnav-left">
            <div className="route-tag-pill">
              <span className="route-bullet"></span>
              <span className="route-name-text">UPES Campus Shuttle Network</span>
              <span className="route-corridor-text">Kandoli Terminal &harr; Bidholi Terminal</span>
            </div>
            <h1 className="portal-main-heading">Student Transit Hub</h1>
            <p className="portal-sub-heading">
              Real-time shuttle departures, live seat reservations, and express transit schedule.
            </p>
          </div>

          <div className="portal-subnav-stats">
            <div className="quick-stat-chip">
              <span className="stat-chip-label">Operating Line</span>
              <span className="stat-chip-val">4.0 km &bull; 15-20 min</span>
            </div>
            <div className="quick-stat-chip">
              <span className="stat-chip-label">Active Shuttles</span>
              <span className="stat-chip-val highlighted">{activeShuttles} / {totalShuttles}</span>
            </div>
            <div className="quick-stat-chip">
              <span className="stat-chip-label">Open Seats</span>
              <span className="stat-chip-val text-emerald">{availableSeats}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="portal-body-container">
        {/* 2. Active Boarding Pass / Ticket (Visible when ride is active) */}
        {currentBoardedBus && (
          <section className="active-ticket-section" aria-label="Active Boarding Ticket">
            <div className="boarding-pass-card">
              <div className="pass-header-strip">
                <div className="pass-type-badge">
                  <span className="live-pulse-dot"></span>
                  <span>ACTIVE BOARDING PASS</span>
                </div>
                <span className="pass-route-direction">{currentBoardedBus.route}</span>
              </div>

              <div className="pass-body">
                <div className="pass-col pass-bus-identity">
                  <span className="pass-label">Shuttle Vehicle</span>
                  <h3 className="pass-bus-number">{currentBoardedBus.busNo}</h3>
                  <span className={`status-pill status-${currentBoardedBus.status.toLowerCase().replace(' ', '-')}`}>
                    {currentBoardedBus.status}
                  </span>
                </div>

                <div className="pass-col pass-timing">
                  <span className="pass-label">Departure Time</span>
                  <div className="pass-time-value">{currentBoardedBus.departureTime}</div>
                  <span className="pass-eta-note">ETA: {currentBoardedBus.eta} to {currentBoardedBus.nextStop}</span>
                </div>

                <div className="pass-col pass-passenger">
                  <span className="pass-label">Passenger &amp; SAP ID</span>
                  <div className="pass-passenger-name">{user?.username || 'Student'}</div>
                  <span className="pass-sap-tag">SAP: {studentBoardingRecord?.sapId || currentSapId}</span>
                </div>

                <div className="pass-col pass-actions">
                  <button
                    className="btn-release-pass"
                    onClick={() => setModalState({
                      isOpen: true,
                      mode: 'deboard',
                      bus: currentBoardedBus,
                      sapId: currentSapId,
                      message: ''
                    })}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span>Deboard / Release Seat</span>
                  </button>
                  <span className="pass-note">Releases seat back to campus queue</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Direction Selector & Controls Toolbar */}
        <section className="portal-controls-bar">
          <div className="direction-tabs-group" role="tablist" aria-label="Filter by Direction">
            <button
              type="button"
              className={`direction-tab-btn ${directionFilter === 'All' ? 'active' : ''}`}
              onClick={() => setDirectionFilter('All')}
            >
              <span>All Shuttles</span>
              <span className="tab-count-badge">{buses.length}</span>
            </button>
            <button
              type="button"
              className={`direction-tab-btn ${directionFilter === 'Kandoli → Bidholi' ? 'active' : ''}`}
              onClick={() => setDirectionFilter('Kandoli → Bidholi')}
            >
              <span className="direction-icon">&rarr;</span>
              <span>Kandoli &rarr; Bidholi</span>
              <span className="tab-count-badge">5 Buses</span>
            </button>
            <button
              type="button"
              className={`direction-tab-btn ${directionFilter === 'Bidholi → Kandoli' ? 'active' : ''}`}
              onClick={() => setDirectionFilter('Bidholi → Kandoli')}
            >
              <span className="direction-icon">&larr;</span>
              <span>Bidholi &rarr; Kandoli</span>
              <span className="tab-count-badge">5 Buses</span>
            </button>
          </div>

          <div className="controls-right-group">
            {/* Search Box */}
            <div className="portal-search-box">
              <svg className="portal-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search bus, time, stop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>&times;</button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="portal-filter-dropdown">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active (Ready)</option>
                <option value="In-Transit">In-Transit</option>
                <option value="Delayed">Delayed</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'timetable' ? 'active' : ''}`}
                onClick={() => setViewMode('timetable')}
                title="Timetable Table View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                <span>Timetable</span>
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Cards Grid View"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Cards</span>
              </button>
            </div>

            {/* Route Map Toggle Button */}
            <button
              type="button"
              className={`btn-route-map-toggle ${showRouteMap ? 'active' : ''}`}
              onClick={() => setShowRouteMap(!showRouteMap)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
              <span>{showRouteMap ? 'Hide Map' : 'Route Map'}</span>
            </button>
          </div>
        </section>

        {/* 4. Interactive Route Map & Stops Drawer (Collapsible) */}
        {showRouteMap && (
          <section className="route-corridor-panel" aria-label="Route Map Corridor">
            <div className="corridor-header">
              <div>
                <h3 className="corridor-title">Campus Express Route Corridor (4.0 km)</h3>
                <p className="corridor-subtitle">
                  Connecting Kandoli &amp; Bidholi campuses. Select any bus from the schedule below to track its positioning.
                </p>
              </div>
              <div className="corridor-legend">
                <span className="legend-item"><span className="legend-dot bg-emerald"></span> In-Transit</span>
                <span className="legend-item"><span className="legend-dot bg-amber"></span> Delayed</span>
                <span className="legend-item"><span className="legend-dot bg-primary"></span> Active</span>
                <span className="legend-item"><span className="legend-dot bg-gray"></span> Out of Service</span>
              </div>
            </div>

            <div className="corridor-schematic-wrapper">
              <svg viewBox="0 0 800 240" className="corridor-svg">
                {/* Background Route Lane */}
                <rect x="40" y="30" width="720" height="180" rx="12" fill="#faf6f0" stroke="#d8cdbf" strokeWidth="1.2" />

                {/* Way 1: Kandoli to Bidholi (Top Lane) */}
                <line x1="140" y1="85" x2="660" y2="85" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 4" />
                <path d="M 650 80 L 665 85 L 650 90" fill="#0f766e" />
                <text x="400" y="70" textAnchor="middle" fill="#0f766e" fontSize="11" fontWeight="700">
                  WAY 1: Kandoli &rarr; Bidholi (5 Scheduled Shuttles)
                </text>

                {/* Way 2: Bidholi to Kandoli (Bottom Lane) */}
                <line x1="660" y1="155" x2="140" y2="155" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 4" />
                <path d="M 150 150 L 135 155 L 150 160" fill="#b45309" />
                <text x="400" y="180" textAnchor="middle" fill="#b45309" fontSize="11" fontWeight="700">
                  WAY 2: Bidholi &rarr; Kandoli (5 Scheduled Shuttles)
                </text>

                {/* Terminal A: Kandoli Campus */}
                <g transform="translate(120, 120)">
                  <circle r="32" fill="#ffffff" stroke="#0f766e" strokeWidth="3" />
                  <circle r="12" fill="#0f766e" />
                  <text y="48" textAnchor="middle" fill="#1c1917" fontSize="12" fontWeight="800">Kandoli Terminal</text>
                  <text y="62" textAnchor="middle" fill="#78716c" fontSize="10">Campus Gate 1</text>
                </g>

                {/* Terminal B: Bidholi Campus */}
                <g transform="translate(680, 120)">
                  <circle r="32" fill="#ffffff" stroke="#b45309" strokeWidth="3" />
                  <circle r="12" fill="#b45309" />
                  <text y="48" textAnchor="middle" fill="#1c1917" fontSize="12" fontWeight="800">Bidholi Terminal</text>
                  <text y="62" textAnchor="middle" fill="#78716c" fontSize="10">Academic Hub</text>
                </g>

                {/* Midpoint Distance Marker */}
                <rect x="350" y="108" width="100" height="24" rx="12" fill="#ede5d8" stroke="#d8cdbf" strokeWidth="1" />
                <text x="400" y="124" textAnchor="middle" fill="#292524" fontSize="10.5" fontWeight="700">
                  4.0 km &bull; 15m ETA
                </text>

                {/* Interactive Bus Indicators along lines */}
                {buses.map((bus) => {
                  const isWay1 = bus.route.includes('Kandoli → Bidholi');
                  const busIndex = (bus.id - 1) % 5;
                  const stepX = isWay1 ? 220 + busIndex * 85 : 580 - busIndex * 85;
                  const laneY = isWay1 ? 85 : 155;
                  const isSelected = selectedBus?.id === bus.id;
                  const isBoarded = isBoardedOnThisBus(bus);

                  let busColor = '#15803d';
                  if (bus.status === 'Delayed') busColor = '#b45309';
                  else if (bus.status === 'In-Transit') busColor = '#0284c7';
                  else if (bus.status === 'Out of Service') busColor = '#78716c';

                  return (
                    <g
                      key={bus.id}
                      transform={`translate(${stepX}, ${laneY})`}
                      className="corridor-bus-node"
                      onClick={() => setSelectedBus(bus)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isSelected && (
                        <circle r="20" fill="none" stroke="#b45309" strokeWidth="2.5" strokeDasharray="3 3" />
                      )}
                      {isBoarded && (
                        <circle r="22" fill="none" stroke="#b91c1c" strokeWidth="2.5" />
                      )}
                      <rect
                        x="-20"
                        y="-12"
                        width="40"
                        height="24"
                        rx="6"
                        fill={busColor}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text y="4" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="800">
                        {bus.busNo.replace('BUS-', '')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {selectedBus && (
              <div className="corridor-selected-strip">
                <div className="selected-strip-left">
                  <span className="selected-bus-tag">{selectedBus.busNo}</span>
                  <span className="selected-route-info">{selectedBus.route}</span>
                  <span className="selected-meta-dot">&bull;</span>
                  <span className="selected-driver">Driver: {selectedBus.driver}</span>
                  <span className="selected-meta-dot">&bull;</span>
                  <span className="selected-eta">ETA to {selectedBus.nextStop}: <strong>{selectedBus.eta}</strong></span>
                </div>
                <div className="selected-strip-right">
                  <span className="selected-seats-info">
                    {selectedBus.seatsAvailable} of {selectedBus.totalCapacity} seats free
                  </span>
                  <button
                    className="btn-select-close"
                    onClick={() => setSelectedBus(null)}
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 5. Main Departures Content */}
        {filteredBuses.length === 0 ? (
          <div className="empty-departures-state">
            <div className="empty-state-icon">🚌</div>
            <h3>No Scheduled Shuttles Found</h3>
            <p>No departures match your current search criteria or direction filters.</p>
            <button
              className="btn-reset-filters"
              onClick={() => {
                setSearchTerm('');
                setDirectionFilter('All');
                setStatusFilter('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'timetable' ? (
          /* View A: Structured Departures Timetable */
          <div className="timetable-container">
            <div className="timetable-header-row">
              <span className="th-cell th-time">Departure</span>
              <span className="th-cell th-bus">Shuttle ID</span>
              <span className="th-cell th-direction">Route &amp; Destination</span>
              <span className="th-cell th-status">Status</span>
              <span className="th-cell th-capacity">Seat Availability</span>
              <span className="th-cell th-actions">Action</span>
            </div>

            <div className="timetable-body">
              {filteredBuses.map((bus) => {
                const isBoarded = isBoardedOnThisBus(bus);
                const capacityMeta = getCapacityMeta(bus.seatsAvailable, bus.totalCapacity);
                const isExpanded = expandedBusId === bus.id;
                const canBook = bus.status === 'Active' && bus.seatsAvailable > 0 && !currentBoardedBus;

                return (
                  <div
                    key={bus.id}
                    className={`timetable-row ${isBoarded ? 'row-boarded' : ''} ${selectedBus?.id === bus.id ? 'row-selected' : ''}`}
                    onClick={() => setSelectedBus(bus)}
                  >
                    <div className="td-cell td-time">
                      <div className="departure-time-display">
                        <span className="time-val">{bus.departureTime}</span>
                        <span className="eta-tag">ETA: {bus.eta}</span>
                      </div>
                    </div>

                    <div className="td-cell td-bus">
                      <div className="bus-id-group">
                        <span className="bus-code-badge">{bus.busNo}</span>
                        <span className="bus-driver-name">{bus.driver}</span>
                      </div>
                    </div>

                    <div className="td-cell td-direction">
                      <div className="direction-route-info">
                        <span className="route-main-text">{bus.route}</span>
                        <span className="next-stop-note">Next Stop: <strong>{bus.nextStop}</strong></span>
                      </div>
                    </div>

                    <div className="td-cell td-status">
                      <span className={`status-pill status-${bus.status.toLowerCase().replace(' ', '-')}`}>
                        <span className="status-dot"></span>
                        {bus.status}
                      </span>
                    </div>

                    <div className="td-cell td-capacity">
                      <div className="capacity-bar-group">
                        <div className="capacity-numbers">
                          <span className="seats-count">
                            <strong>{bus.seatsAvailable}</strong> / {bus.totalCapacity} free
                          </span>
                          <span className={`capacity-badge ${capacityMeta.badgeClass}`}>
                            {capacityMeta.label}
                          </span>
                        </div>
                        <div className="capacity-track">
                          <div
                            className="capacity-fill"
                            style={{
                              width: `${Math.max(6, ((bus.totalCapacity - bus.seatsAvailable) / bus.totalCapacity) * 100)}%`,
                              backgroundColor: capacityMeta.barColor
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="td-cell td-actions" onClick={(e) => e.stopPropagation()}>
                      {isBoarded ? (
                        <button
                          className="btn-action-deboard"
                          onClick={() => setModalState({
                            isOpen: true,
                            mode: 'deboard',
                            bus: bus,
                            sapId: currentSapId,
                            message: ''
                          })}
                        >
                          Deboard Seat
                        </button>
                      ) : canBook ? (
                        <button
                          className="btn-action-book"
                          onClick={() => setModalState({
                            isOpen: true,
                            mode: 'input',
                            bus: bus,
                            sapId: currentSapId,
                            message: ''
                          })}
                        >
                          Book Seat
                        </button>
                      ) : currentBoardedBus ? (
                        <span className="action-disabled-note" title="You already have an active ride booked">
                          Already Booked
                        </span>
                      ) : bus.seatsAvailable === 0 ? (
                        <span className="action-disabled-note text-danger">Bus Full</span>
                      ) : (
                        <span className="action-disabled-note">{bus.status}</span>
                      )}

                      <button
                        className="btn-row-expand"
                        onClick={() => setExpandedBusId(isExpanded ? null : bus.id)}
                        title={isExpanded ? "Collapse details" : "Expand passenger details"}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>

                    {/* Expandable Passenger Manifest Drawer */}
                    {isExpanded && (
                      <div className="row-expanded-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-inner-grid">
                          <div className="drawer-info-block">
                            <h4>Vehicle Telemetry</h4>
                            <p><strong>Route Corridor:</strong> {bus.route} (4.0 km)</p>
                            <p><strong>Assigned Driver:</strong> {bus.driver}</p>
                            <p><strong>Operating Status:</strong> {bus.status} &bull; Next Terminal: {bus.nextStop}</p>
                          </div>
                          <div className="drawer-info-block">
                            <h4>Boarded Students ({bus.boardedStudents?.length || 0})</h4>
                            {bus.boardedStudents && bus.boardedStudents.length > 0 ? (
                              <div className="drawer-manifest-pills">
                                {bus.boardedStudents.slice(0, 6).map((student) => (
                                  <span key={student.id} className="manifest-student-chip">
                                    {student.name} ({student.sapId})
                                  </span>
                                ))}
                                {bus.boardedStudents.length > 6 && (
                                  <span className="manifest-more-chip">
                                    +{bus.boardedStudents.length - 6} more students
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted">No students currently boarded on this vehicle.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* View B: Clean Shuttle Cards Grid */
          <div className="cards-grid-layout">
            {filteredBuses.map((bus) => {
              const isBoarded = isBoardedOnThisBus(bus);
              const capacityMeta = getCapacityMeta(bus.seatsAvailable, bus.totalCapacity);
              const canBook = bus.status === 'Active' && bus.seatsAvailable > 0 && !currentBoardedBus;

              return (
                <div
                  key={bus.id}
                  className={`transit-card ${isBoarded ? 'card-boarded' : ''} ${selectedBus?.id === bus.id ? 'card-selected' : ''}`}
                  onClick={() => setSelectedBus(bus)}
                >
                  <div className="card-top-header">
                    <div className="card-bus-code-box">
                      <span className="card-bus-code">{bus.busNo}</span>
                      <span className="card-dep-time">{bus.departureTime}</span>
                    </div>
                    <span className={`status-pill status-${bus.status.toLowerCase().replace(' ', '-')}`}>
                      {bus.status}
                    </span>
                  </div>

                  <div className="card-route-block">
                    <div className="card-route-label">Express Route</div>
                    <div className="card-route-title">{bus.route}</div>
                    <div className="card-meta-line">
                      <span>Next Stop: <strong>{bus.nextStop}</strong></span>
                      <span>ETA: <strong>{bus.eta}</strong></span>
                    </div>
                  </div>

                  <div className="card-capacity-block">
                    <div className="capacity-label-row">
                      <span>Seats Available: <strong>{bus.seatsAvailable}</strong> / {bus.totalCapacity}</span>
                      <span className={`capacity-badge ${capacityMeta.badgeClass}`}>{capacityMeta.label}</span>
                    </div>
                    <div className="capacity-track">
                      <div
                        className="capacity-fill"
                        style={{
                          width: `${Math.max(6, ((bus.totalCapacity - bus.seatsAvailable) / bus.totalCapacity) * 100)}%`,
                          backgroundColor: capacityMeta.barColor
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="card-footer-actions" onClick={(e) => e.stopPropagation()}>
                    {isBoarded ? (
                      <button
                        className="btn-action-deboard full-width"
                        onClick={() => setModalState({
                          isOpen: true,
                          mode: 'deboard',
                          bus: bus,
                          sapId: currentSapId,
                          message: ''
                        })}
                      >
                        Deboard Active Ride
                      </button>
                    ) : canBook ? (
                      <button
                        className="btn-action-book full-width"
                        onClick={() => setModalState({
                          isOpen: true,
                          mode: 'input',
                          bus: bus,
                          sapId: currentSapId,
                          message: ''
                        })}
                      >
                        Reserve Seat
                      </button>
                    ) : currentBoardedBus ? (
                      <button className="btn-action-disabled full-width" disabled>
                        Already Booked Elsewhere
                      </button>
                    ) : bus.seatsAvailable === 0 ? (
                      <button className="btn-action-disabled full-width" disabled>
                        Bus Full
                      </button>
                    ) : (
                      <button className="btn-action-disabled full-width" disabled>
                        {bus.status}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Campus Transit Advisory & Guidelines Strip */}
        <section className="transit-advisory-panel">
          <div className="advisory-card">
            <div className="advisory-icon">🕒</div>
            <div className="advisory-text">
              <h4>Scheduled Operating Hours</h4>
              <p>Campus shuttles operate continuously between 08:00 AM and 06:00 PM with regular 15-minute intervals.</p>
            </div>
          </div>
          <div className="advisory-card">
            <div className="advisory-icon">🎟️</div>
            <div className="advisory-text">
              <h4>Boarding Verification</h4>
              <p>Keep your valid SAP ID ready for driver scanning. Seat reservations automatically expire 2 minutes prior to departure.</p>
            </div>
          </div>
          <div className="advisory-card">
            <div className="advisory-icon">📞</div>
            <div className="advisory-text">
              <h4>Transit Helpdesk</h4>
              <p>For luggage assistance or urgent queries, contact Campus Transport Dispatch at <strong>Ext. 4022</strong>.</p>
            </div>
          </div>
        </section>
      </div>

      {/* 7. Booking & Deboarding Modals */}
      {modalState.isOpen && (
        <div className="modal-backdrop" onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-card-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Modal Close Button */}
            <button
              className="modal-x-btn"
              onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
              aria-label="Close dialog"
            >
              &times;
            </button>

            {modalState.mode === 'input' && (
              <div className="modal-content-area">
                <div className="modal-icon-badge">🚌</div>
                <h3 className="modal-dialog-title">Reserve Shuttle Seat</h3>
                <p className="modal-dialog-desc">
                  Confirm your seat reservation on <strong>{modalState.bus?.busNo}</strong> ({modalState.bus?.route}) scheduled for <strong>{modalState.bus?.departureTime}</strong>.
                </p>

                <div className="modal-form-box">
                  <label htmlFor="student-sap-input">Student SAP ID</label>
                  <input
                    id="student-sap-input"
                    type="text"
                    value={modalState.sapId}
                    onChange={(e) => setModalState(prev => ({ ...prev, sapId: e.target.value }))}
                    placeholder="e.g. 500109999"
                    autoFocus
                  />
                  <span className="input-helper-note">Seats are held instantly upon SAP ID verification.</span>
                </div>

                <div className="modal-buttons-row">
                  <button
                    className="btn-modal-cancel"
                    onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-modal-confirm"
                    onClick={() => {
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
                          setModalState(prev => ({
                            ...prev,
                            mode: 'success',
                            message: `Seat confirmed on ${modalState.bus.busNo} (${modalState.bus.route}) for SAP ID ${sapId}.`
                          }));
                        } else {
                          setModalState(prev => ({
                            ...prev,
                            mode: 'error',
                            message: res?.message || 'Failed to complete booking.'
                          }));
                        }
                      } else {
                        onUpdateBus(modalState.bus.id, { seatsAvailable: Math.max(0, modalState.bus.seatsAvailable - 1) });
                        setModalState(prev => ({
                          ...prev,
                          mode: 'success',
                          message: `Seat confirmed on ${modalState.bus.busNo} (${modalState.bus.route}) for SAP ID ${sapId}.`
                        }));
                      }
                    }}
                  >
                    Confirm Seat Reservation
                  </button>
                </div>
              </div>
            )}

            {modalState.mode === 'deboard' && (
              <div className="modal-content-area">
                <div className="modal-icon-badge bg-rose">🛑</div>
                <h3 className="modal-dialog-title">Release Shuttle Seat</h3>
                <p className="modal-dialog-desc">
                  Are you sure you want to deboard from <strong>{modalState.bus?.busNo}</strong>? This frees up your seat for other students.
                </p>

                <div className="modal-form-box">
                  <label htmlFor="deboard-sap-input">Confirm SAP ID</label>
                  <input
                    id="deboard-sap-input"
                    type="text"
                    value={modalState.sapId}
                    onChange={(e) => setModalState(prev => ({ ...prev, sapId: e.target.value }))}
                    placeholder="Enter SAP ID"
                  />
                </div>

                <div className="modal-buttons-row">
                  <button
                    className="btn-modal-cancel"
                    onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                  >
                    Keep My Seat
                  </button>
                  <button
                    className="btn-modal-danger"
                    onClick={() => {
                      const sapId = modalState.sapId.trim();
                      if (!sapId) return;

                      let targetBus = null;
                      let targetPassenger = null;

                      for (const b of buses) {
                        const found = b.boardedStudents?.find(s => s.sapId.toLowerCase() === sapId.toLowerCase());
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
                          message: `Successfully deboarded from ${targetBus.busNo}. Your seat is returned to circulation.`
                        }));
                      } else {
                        setModalState(prev => ({
                          ...prev,
                          mode: 'error',
                          message: `No active reservation found for SAP ID: ${sapId}.`
                        }));
                      }
                    }}
                  >
                    Yes, Release Seat
                  </button>
                </div>
              </div>
            )}

            {modalState.mode === 'success' && (
              <div className="modal-content-area text-center">
                <div className="modal-status-symbol text-emerald">&#10003;</div>
                <h3 className="modal-dialog-title">Seat Reserved!</h3>
                <p className="modal-dialog-desc">{modalState.message}</p>
                <button
                  className="btn-modal-confirm"
                  onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                >
                  View My Boarding Pass
                </button>
              </div>
            )}

            {modalState.mode === 'deboard_success' && (
              <div className="modal-content-area text-center">
                <div className="modal-status-symbol text-emerald">&#10003;</div>
                <h3 className="modal-dialog-title">Seat Released</h3>
                <p className="modal-dialog-desc">{modalState.message}</p>
                <button
                  className="btn-modal-confirm"
                  onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                >
                  Return to Departures
                </button>
              </div>
            )}

            {modalState.mode === 'error' && (
              <div className="modal-content-area text-center">
                <div className="modal-status-symbol text-danger">&#9888;</div>
                <h3 className="modal-dialog-title">Notice</h3>
                <p className="modal-dialog-desc">{modalState.message}</p>
                <button
                  className="btn-modal-cancel"
                  onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
