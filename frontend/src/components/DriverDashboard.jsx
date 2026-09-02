import React, { useState } from 'react';
import Silk from './Silk';

export default function DriverDashboard({ user, buses, onUpdateBus, onBoardStudent, onDeboardStudent, onLogout }) {
  const defaultBus = buses.find(b => b.driver.toLowerCase() === user.username.toLowerCase()) || buses[0];
  const [selectedBusId, setSelectedBusId] = useState(defaultBus ? defaultBus.id : 1);
  const driverBus = buses.find(b => b.id === selectedBusId) || buses[0] || defaultBus;

  // Search & Filter for Boarded Students
  const [studentSearch, setStudentSearch] = useState('');
  const [stopFilter, setStopFilter] = useState('All');

  // Manual Boarding Form Modal State
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentSap, setNewStudentSap] = useState('');
  const [newStudentFrom, setNewStudentFrom] = useState(
    driverBus.route.includes('Kandoli → Bidholi') ? 'Kandoli' : 'Bidholi'
  );
  const [newStudentTo, setNewStudentTo] = useState(
    driverBus.route.includes('Kandoli → Bidholi') ? 'Bidholi' : 'Kandoli'
  );

  // Filtered list of currently boarded students
  const boardedList = driverBus.boardedStudents || [];
  const filteredStudents = boardedList.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.sapId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.from.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.to.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStop =
      stopFilter === 'All' ||
      student.from === stopFilter ||
      student.to === stopFilter;
    return matchesSearch && matchesStop;
  });

  const handleIncrementSeats = () => {
    if (driverBus.seatsAvailable < driverBus.totalCapacity) {
      onUpdateBus(driverBus.id, { seatsAvailable: driverBus.seatsAvailable + 1 });
    }
  };

  const handleDecrementSeats = () => {
    if (driverBus.seatsAvailable > 0) {
      onUpdateBus(driverBus.id, { seatsAvailable: driverBus.seatsAvailable - 1 });
    }
  };

  const handleStatusChange = (e) => {
    onUpdateBus(driverBus.id, { status: e.target.value });
  };

  const handleStopChange = (e) => {
    const newStop = e.target.value;
    const autoEta = newStop.includes('Kandoli') ? '15 mins' : '18 mins';
    onUpdateBus(driverBus.id, { nextStop: newStop, eta: autoEta });
  };

  const handleEtaChange = (e) => {
    onUpdateBus(driverBus.id, { eta: e.target.value });
  };

  const handleManualBoardSubmit = (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentSap.trim()) {
      alert('Please provide both Student Name and SAP ID.');
      return;
    }

    if (driverBus.seatsAvailable <= 0) {
      alert('Cannot board student: Bus has reached full capacity.');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (onBoardStudent) {
      onBoardStudent(driverBus.id, {
        name: newStudentName.trim(),
        sapId: newStudentSap.trim(),
        boardingTime: timeStr,
        from: newStudentFrom,
        to: newStudentTo
      });
    }

    // Reset Form
    setNewStudentName('');
    setNewStudentSap('');
    setShowBoardModal(false);
  };

  const handleDeboard = (studentId, studentName) => {
    if (window.confirm(`Mark ${studentName} as reached destination / deboarded from ${driverBus.busNo}?`)) {
      if (onDeboardStudent) {
        onDeboardStudent(driverBus.id, studentId);
      }
    }
  };

  const occupancyRate = Math.round(
    ((driverBus.totalCapacity - driverBus.seatsAvailable) / driverBus.totalCapacity) * 100
  );

  return (
    <div className="dashboard-container" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.55 }}>
        <Silk speed={5} scale={1} color="#1a4a8a" noiseIntensity={0} rotation={0} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-brand">
            <h1>CampusRide</h1>
            <span className="badge badge-driver">Driver Portal</span>
          </div>
          <div className="user-profile">
            <span className="username">Driver: <strong>{user.username}</strong></span>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        {/* Top Summary Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="stat-content">
              <h3>Currently Boarded</h3>
              <p className="stat-number">{boardedList.length} <span className="stat-total">/ {driverBus.totalCapacity}</span></p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <div className="stat-content">
              <h3>Empty Seats Free</h3>
              <p className="stat-number">{driverBus.seatsAvailable}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="stat-content">
              <h3>Next Stop &amp; ETA</h3>
              <p className="stat-number" style={{ fontSize: '18px', paddingTop: '4px' }}>
                {driverBus.nextStop} <span style={{ fontSize: '13px', color: '#38bdf8' }}>({driverBus.eta})</span>
              </p>
            </div>
          </div>
        </section>

        {/* Bus Selector Bar */}
        <div className="driver-bus-selector-bar">
          <div className="selector-left">
            <label htmlFor="bus-select-id">Assigned Bus Management:</label>
            <select
              id="bus-select-id"
              value={selectedBusId}
              onChange={(e) => {
                const newId = parseInt(e.target.value, 10);
                setSelectedBusId(newId);
                const b = buses.find(x => x.id === newId);
                if (b) {
                  setNewStudentFrom(b.route.includes('Kandoli → Bidholi') ? 'Kandoli' : 'Bidholi');
                  setNewStudentTo(b.route.includes('Kandoli → Bidholi') ? 'Bidholi' : 'Kandoli');
                }
              }}
              className="form-control bus-select-dropdown"
            >
              {buses.map(b => (
                <option key={b.id} value={b.id}>
                  {b.busNo} &mdash; {b.route} ({b.driver})
                </option>
              ))}
            </select>
          </div>

          <div className="selector-right">
            <span className={`status-badge status-${driverBus.status.toLowerCase().replace(' ', '-')}`}>
              Trip Status: {driverBus.status}
            </span>
            <button
              type="button"
              className="btn btn-student btn-sm-board"
              onClick={() => setShowBoardModal(true)}
              disabled={driverBus.seatsAvailable <= 0 || driverBus.status === 'Out of Service'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>+ Board Student</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            SECTION: CURRENTLY BOARDED STUDENTS RECORD TABLE
            =================================================================== */}
        <div className="boarded-students-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <div className="panel-icon-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h2>Currently Boarded Students Record</h2>
                <p className="panel-subtitle">
                  Live passenger manifest for <strong>{driverBus.busNo}</strong> ({driverBus.route})
                </p>
              </div>
            </div>

            <div className="panel-badge-count">
              <span className="live-dot-ping"></span>
              <span>{boardedList.length} Students Onboard</span>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="boarded-filter-bar">
            <div className="boarded-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search by student name, SAP ID, from/to stop..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              {studentSearch && (
                <button className="clear-search-btn" onClick={() => setStudentSearch('')}>&times;</button>
              )}
            </div>

            <div className="boarded-stop-filter">
              <label>Filter Stop:</label>
              <select value={stopFilter} onChange={(e) => setStopFilter(e.target.value)}>
                <option value="All">All Stops</option>
                <option value="Kandoli">Kandoli</option>
                <option value="Bidholi">Bidholi</option>
              </select>
            </div>
          </div>

          {/* Table of Boarded Students */}
          {filteredStudents.length === 0 ? (
            <div className="boarded-empty-state">
              <div className="empty-icon-box">🪪</div>
              <h3>No Boarded Students Found</h3>
              <p>
                {studentSearch || stopFilter !== 'All'
                  ? 'No passenger records match your filter criteria.'
                  : `There are currently no students checked in on ${driverBus.busNo}. Use the "+ Board Student" button to record walk-in passengers.`}
              </p>
              {driverBus.seatsAvailable > 0 && driverBus.status !== 'Out of Service' && (
                <button
                  type="button"
                  className="btn btn-student"
                  style={{ marginTop: '14px' }}
                  onClick={() => setShowBoardModal(true)}
                >
                  + Board First Student
                </button>
              )}
            </div>
          ) : (
            <div className="boarded-table-responsive">
              <table className="boarded-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>SAP ID</th>
                    <th>Boarding Time</th>
                    <th>Route (From &rarr; To)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    // Extract initials
                    const initials = student.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <tr key={student.id || idx} className="boarded-row">
                        <td className="col-idx">{idx + 1}</td>
                        <td className="col-name">
                          <div className="student-profile-cell">
                            <span className="student-avatar-chip">{initials}</span>
                            <span className="student-full-name">{student.name}</span>
                          </div>
                        </td>
                        <td className="col-sap">
                          <span className="sap-badge">{student.sapId}</span>
                        </td>
                        <td className="col-time">
                          <div className="time-badge">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>{student.boardingTime}</span>
                          </div>
                        </td>
                        <td className="col-route">
                          <div className="travel-path-badge">
                            <span className="stop-badge from-stop">{student.from}</span>
                            <span className="path-arrow">&rarr;</span>
                            <span className="stop-badge to-stop">{student.to}</span>
                          </div>
                        </td>
                        <td className="col-status">
                          <span className="status-pill on-board">
                            <span className="pill-dot"></span>
                            Onboard
                          </span>
                        </td>
                        <td className="col-action">
                          <button
                            type="button"
                            className="btn-deboard"
                            title="Mark student as deboarded / dropped"
                            onClick={() => handleDeboard(student.id, student.name)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            <span>Deboard</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===================================================================
            DRIVER CONTROLS & LIVE PREVIEW GRID
            =================================================================== */}
        <div className="driver-dashboard-grid" style={{ marginTop: '24px' }}>
          {/* Quick Bus Controls Card */}
          <div className="control-card">
            <h2>Bus Operations &amp; Seat Controls</h2>
            <p className="card-subtitle">Manage seats and schedule for <strong>{driverBus.busNo}</strong></p>

            <div className="driver-form">
              {/* Seat Counter */}
              <div className="form-group seats-counter-group">
                <label>Empty Seats Available</label>
                <div className="counter-controls">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={handleDecrementSeats}
                    disabled={driverBus.seatsAvailable <= 0 || driverBus.status === 'Out of Service'}
                  >
                    -
                  </button>
                  <span className="counter-display">{driverBus.seatsAvailable}</span>
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={handleIncrementSeats}
                    disabled={driverBus.seatsAvailable >= driverBus.totalCapacity || driverBus.status === 'Out of Service'}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn-reset-seats"
                    onClick={() => onUpdateBus(driverBus.id, { seatsAvailable: driverBus.totalCapacity })}
                    disabled={driverBus.status === 'Out of Service'}
                  >
                    Reset All Free
                  </button>
                </div>

                <div className="progress-bar-container driver-progress">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${occupancyRate}%`,
                      backgroundColor: driverBus.seatsAvailable <= 5 ? '#ef4444' : driverBus.seatsAvailable <= 12 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
                <p className="input-hint">
                  {occupancyRate}% Full &bull; {boardedList.length} Occupied &bull; {driverBus.totalCapacity} Total Capacity
                </p>
              </div>

              {/* Status Dropdown */}
              <div className="form-group">
                <label htmlFor="bus-status-select">Trip Status</label>
                <select id="bus-status-select" value={driverBus.status} onChange={handleStatusChange}>
                  <option value="Active">Active</option>
                  <option value="In-Transit">In-Transit</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>

              {/* Next Stop Dropdown */}
              <div className="form-group">
                <label htmlFor="bus-next-stop-select">Next Campus Stop</label>
                <select
                  id="bus-next-stop-select"
                  value={driverBus.nextStop}
                  onChange={handleStopChange}
                  disabled={driverBus.status === 'Out of Service'}
                >
                  <option value="Kandoli">Kandoli</option>
                  <option value="Bidholi">Bidholi</option>
                </select>
              </div>

              {/* ETA Input */}
              <div className="form-group">
                <label htmlFor="bus-eta-input">Estimated Time of Arrival (ETA)</label>
                <input
                  type="text"
                  id="bus-eta-input"
                  value={driverBus.eta}
                  onChange={handleEtaChange}
                  placeholder="e.g. 15 mins"
                  disabled={driverBus.status === 'Out of Service'}
                />
              </div>
            </div>
          </div>

          {/* Student Portal Live Sync Card */}
          <div className="preview-card">
            <h2>Live Student Portal Sync</h2>
            <p className="card-subtitle">Real-time view rendered on students' devices:</p>

            <div className="preview-bus-card-wrapper">
              <div className="bus-card selected">
                <div className="bus-card-header">
                  <div className="bus-identity">
                    <div className="bus-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    </div>
                    <div>
                      <h4>{driverBus.busNo}</h4>
                      <p className="bus-route-text">{driverBus.route} ({driverBus.departureTime})</p>
                    </div>
                  </div>
                  <span className={`status-badge status-${driverBus.status.toLowerCase().replace(' ', '-')}`}>
                    {driverBus.status}
                  </span>
                </div>

                <div className="bus-card-details">
                  <div className="detail-item">
                    <span className="label">Next Stop</span>
                    <span className="value">{driverBus.status === 'Out of Service' ? 'N/A' : driverBus.nextStop}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Live ETA</span>
                    <span className="value highlighted">{driverBus.status === 'Out of Service' ? 'N/A' : driverBus.eta}</span>
                  </div>
                </div>

                <div className="capacity-section">
                  <div className="capacity-labels">
                    <span>Free Seats: <strong>{driverBus.status === 'Out of Service' ? 0 : driverBus.seatsAvailable}</strong></span>
                    <span>Boarded: {boardedList.length} / {driverBus.totalCapacity}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${driverBus.status === 'Out of Service' ? 100 : occupancyRate}%`,
                        backgroundColor: driverBus.status === 'Out of Service' ? '#64748b' : driverBus.seatsAvailable <= 5 ? '#ef4444' : driverBus.seatsAvailable <= 12 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>All student boarding records and seat updates sync instantly with zero latency.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MODAL: MANUAL BOARD STUDENT
          =================================================================== */}
      {showBoardModal && (
        <div className="modal-backdrop" onClick={() => setShowBoardModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <span className="modal-icon">🪪</span>
                <h3>Board New Student onto {driverBus.busNo}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowBoardModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleManualBoardSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-student-name">Student Full Name *</label>
                <input
                  type="text"
                  id="modal-student-name"
                  placeholder="e.g. Sahaj Parikh"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-student-sap">SAP ID *</label>
                <input
                  type="text"
                  id="modal-student-sap"
                  placeholder="e.g. 500108920"
                  value={newStudentSap}
                  onChange={(e) => setNewStudentSap(e.target.value)}
                  required
                />
              </div>

              <div className="modal-grid-2">
                <div className="form-group">
                  <label htmlFor="modal-from-stop">Boarding Stop (From)</label>
                  <select
                    id="modal-from-stop"
                    value={newStudentFrom}
                    onChange={(e) => setNewStudentFrom(e.target.value)}
                  >
                    <option value="Kandoli">Kandoli Campus</option>
                    <option value="Bidholi">Bidholi Campus</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-to-stop">Destination (To)</label>
                  <select
                    id="modal-to-stop"
                    value={newStudentTo}
                    onChange={(e) => setNewStudentTo(e.target.value)}
                  >
                    <option value="Bidholi">Bidholi Campus</option>
                    <option value="Kandoli">Kandoli Campus</option>
                  </select>
                </div>
              </div>

              <div className="modal-info-bar">
                <span>⏰ Boarding Time: <strong>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                <span>💺 Remaining Seats: <strong>{driverBus.seatsAvailable}</strong></span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary-custom"
                  onClick={() => setShowBoardModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-student"
                >
                  Confirm &amp; Board Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
