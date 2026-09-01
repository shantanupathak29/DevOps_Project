import React, { useState } from 'react';
import Silk from './Silk';

export default function DriverDashboard({ user, buses, onUpdateBus, onLogout }) {
  const driverBus = buses.find(b => b.driver.toLowerCase() === user.username.toLowerCase()) || buses[0];

  const [seats, setSeats] = useState(driverBus.seatsAvailable);
  const [status, setStatus] = useState(driverBus.status);
  const [nextStop, setNextStop] = useState(driverBus.nextStop);
  const [eta, setEta] = useState(driverBus.eta);

  const handleIncrement = () => {
    if (seats < driverBus.totalCapacity) {
      const newSeats = seats + 1;
      setSeats(newSeats);
      onUpdateBus(driverBus.id, { seatsAvailable: newSeats });
    }
  };

  const handleDecrement = () => {
    if (seats > 0) {
      const newSeats = seats - 1;
      setSeats(newSeats);
      onUpdateBus(driverBus.id, { seatsAvailable: newSeats });
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onUpdateBus(driverBus.id, { status: newStatus });
  };

  const handleStopChange = (e) => {
    const newStop = e.target.value;
    setNextStop(newStop);
    let autoEta = '15 mins';
    if (newStop.includes('Kandoli')) autoEta = '15 mins';
    else if (newStop.includes('Bidholi')) autoEta = '18 mins';
    setEta(autoEta);
    onUpdateBus(driverBus.id, { nextStop: newStop, eta: autoEta });
  };

  const handleEtaChange = (e) => {
    const newEta = e.target.value;
    setEta(newEta);
    onUpdateBus(driverBus.id, { eta: newEta });
  };

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
            <span className="username">Driver Panel ({user.username})</span>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <div className="driver-dashboard-grid">
          {/* Control Card */}
          <div className="control-card">
            <h2>Update Bus Status</h2>
            <p className="card-subtitle">Manage details for assigned bus: <strong>{driverBus.busNo}</strong></p>
            <p className="route-detail">Route: {driverBus.route}</p>

            <div className="driver-form">
              {/* Seat Control */}
              <div className="form-group seats-counter-group">
                <label>Empty Seats Available</label>
                <div className="counter-controls">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={handleDecrement}
                    disabled={seats <= 0 || status === 'Out of Service'}
                  >
                    -
                  </button>
                  <span className="counter-display">{seats}</span>
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={handleIncrement}
                    disabled={seats >= driverBus.totalCapacity || status === 'Out of Service'}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    style={{ marginLeft: '12px', padding: '6px 12px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => {
                      setSeats(0);
                      onUpdateBus(driverBus.id, { seatsAvailable: 0 });
                    }}
                    disabled={status === 'Out of Service'}
                  >
                    Reset to 0
                  </button>
                </div>
                <div className="progress-bar-container driver-progress">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${((driverBus.totalCapacity - seats) / driverBus.totalCapacity) * 100}%`,
                      backgroundColor: seats <= 5 ? '#ef4444' : seats <= 12 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
                <p className="input-hint">Capacity: {driverBus.totalCapacity} total seats</p>
              </div>

              {/* Status Dropdown */}
              <div className="form-group">
                <label htmlFor="bus-status">Bus Trip Status</label>
                <select id="bus-status" value={status} onChange={handleStatusChange}>
                  <option value="In-Transit">In-Transit</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Active">Active</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>

              {/* Next Stop */}
              <div className="form-group">
                <label htmlFor="next-stop">Next Campus Stop</label>
                <select id="next-stop" value={nextStop} onChange={handleStopChange} disabled={status === 'Out of Service'}>
                  <option value="Kandoli">Kandoli</option>
                  <option value="Bidholi">Bidholi</option>
                </select>
              </div>

              {/* ETA */}
              <div className="form-group">
                <label htmlFor="eta">ETA to Next Stop</label>
                <input
                  type="text"
                  id="eta"
                  value={eta}
                  onChange={handleEtaChange}
                  placeholder="e.g. 5 mins"
                  disabled={status === 'Out of Service'}
                />
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="preview-card">
            <h2>Live Student Preview</h2>
            <p className="card-subtitle">This is how students see your bus in real time:</p>

            <div className="preview-bus-card-wrapper">
              <div className="bus-card selected">
                <div className="bus-card-header">
                  <div className="bus-identity">
                    <div className="bus-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    </div>
                    <div>
                      <h4>{driverBus.busNo}</h4>
                      <p className="bus-route-text">{driverBus.route}</p>
                    </div>
                  </div>
                  <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
                    {status}
                  </span>
                </div>

                <div className="bus-card-details">
                  <div className="detail-item">
                    <span className="label">Next Stop</span>
                    <span className="value">{status === 'Out of Service' ? 'N/A' : nextStop}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ETA</span>
                    <span className="value highlighted">{status === 'Out of Service' ? 'N/A' : eta}</span>
                  </div>
                </div>

                <div className="capacity-section">
                  <div className="capacity-labels">
                    <span>Free Seats: <strong>{status === 'Out of Service' ? 0 : seats}</strong></span>
                    <span>Capacity: {driverBus.totalCapacity}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${status === 'Out of Service' ? 100 : ((driverBus.totalCapacity - seats) / driverBus.totalCapacity) * 100}%`,
                        backgroundColor: status === 'Out of Service' ? '#64748b' : seats <= 5 ? '#ef4444' : seats <= 12 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p>Updates are synchronized instantly to the Student Portal without reloading.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
