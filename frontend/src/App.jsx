import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import DriverDashboard from './components/DriverDashboard';

import Footer from './components/Footer';

// Mock Campus Buses Data
const INITIAL_BUSES = [
  {
    id: 1,
    busNo: "BUS-101",
    route: "North Campus ⇄ Science Block",
    driver: "DRIVER01",
    seatsAvailable: 12,
    totalCapacity: 30,
    status: "Active",
    nextStop: "Science Block",
    eta: "4 mins"
  },
  {
    id: 2,
    busNo: "BUS-204",
    route: "Hostel Block ⇄ Admin Building",
    driver: "DRIVER02",
    seatsAvailable: 4,
    totalCapacity: 30,
    status: "In-Transit",
    nextStop: "Hostel Block C",
    eta: "8 mins"
  },
  {
    id: 3,
    busNo: "BUS-305",
    route: "Metro Station ⇄ Central Library",
    driver: "DRIVER03",
    seatsAvailable: 35,
    totalCapacity: 40,
    status: "Active",
    nextStop: "Central Library",
    eta: "2 mins"
  },
  {
    id: 4,
    busNo: "BUS-402",
    route: "Main Gate ⇄ Central Library",
    driver: "DRIVER04",
    seatsAvailable: 0,
    totalCapacity: 30,
    status: "Out of Service",
    nextStop: "Main Gate",
    eta: "N/A"
  }
];

function App() {
  const [user, setUser] = useState(null);
  const [buses, setBuses] = useState(INITIAL_BUSES);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUpdateBus = (busId, updatedFields) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) =>
        bus.id === busId ? { ...bus, ...updatedFields } : bus
      )
    );
  };

  return (
    <div className="app-container">
      <main className="app-main-content">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : user.role === 'driver' ? (
          <DriverDashboard
            user={user}
            buses={buses}
            onUpdateBus={handleUpdateBus}
            onLogout={handleLogout}
          />
        ) : (
          <StudentDashboard
            user={user}
            buses={buses}
            onLogout={handleLogout}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
