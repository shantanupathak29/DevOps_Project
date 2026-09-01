import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import DriverDashboard from './components/DriverDashboard';

import Footer from './components/Footer';

// Mock Campus Buses Data (2 Stops: Kandoli & Bidholi, 5 buses each direction with 15 min gaps & 15-20 min ETAs)
const INITIAL_BUSES = [
  // Kandoli -> Bidholi (5 Buses, 15 min departure gaps)
  {
    id: 1,
    busNo: "BUS-101",
    route: "Kandoli → Bidholi",
    direction: "Kandoli → Bidholi",
    departureTime: "08:00 AM",
    driver: "DRIVER01",
    seatsAvailable: 14,
    totalCapacity: 30,
    status: "In-Transit",
    nextStop: "Bidholi",
    eta: "15 mins"
  },
  {
    id: 2,
    busNo: "BUS-102",
    route: "Kandoli → Bidholi",
    direction: "Kandoli → Bidholi",
    departureTime: "08:15 AM",
    driver: "DRIVER02",
    seatsAvailable: 8,
    totalCapacity: 30,
    status: "Delayed",
    nextStop: "Bidholi",
    eta: "19 mins"
  },
  {
    id: 3,
    busNo: "BUS-103",
    route: "Kandoli → Bidholi",
    direction: "Kandoli → Bidholi",
    departureTime: "08:30 AM",
    driver: "DRIVER03",
    seatsAvailable: 22,
    totalCapacity: 30,
    status: "In-Transit",
    nextStop: "Bidholi",
    eta: "16 mins"
  },
  {
    id: 4,
    busNo: "BUS-104",
    route: "Kandoli → Bidholi",
    direction: "Kandoli → Bidholi",
    departureTime: "08:45 AM",
    driver: "DRIVER04",
    seatsAvailable: 5,
    totalCapacity: 30,
    status: "In-Transit",
    nextStop: "Bidholi",
    eta: "18 mins"
  },
  {
    id: 5,
    busNo: "BUS-105",
    route: "Kandoli → Bidholi",
    direction: "Kandoli → Bidholi",
    departureTime: "09:00 AM",
    driver: "DRIVER05",
    seatsAvailable: 18,
    totalCapacity: 30,
    status: "Delayed",
    nextStop: "Bidholi",
    eta: "20 mins"
  },
  // Bidholi -> Kandoli (5 Buses, 15 min departure gaps)
  {
    id: 6,
    busNo: "BUS-201",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "08:00 AM",
    driver: "DRIVER06",
    seatsAvailable: 11,
    totalCapacity: 30,
    status: "In-Transit",
    nextStop: "Kandoli",
    eta: "15 mins"
  },
  {
    id: 7,
    busNo: "BUS-202",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "08:15 AM",
    driver: "DRIVER07",
    seatsAvailable: 3,
    totalCapacity: 30,
    status: "Delayed",
    nextStop: "Kandoli",
    eta: "18 mins"
  },
  {
    id: 8,
    busNo: "BUS-203",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "08:30 AM",
    driver: "DRIVER08",
    seatsAvailable: 25,
    totalCapacity: 30,
    status: "In-Transit",
    nextStop: "Kandoli",
    eta: "17 mins"
  },
  {
    id: 9,
    busNo: "BUS-204",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "08:45 AM",
    driver: "DRIVER09",
    seatsAvailable: 15,
    totalCapacity: 30,
    status: "In-Transit",
    nextStop: "Kandoli",
    eta: "16 mins"
  },
  {
    id: 10,
    busNo: "BUS-205",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "09:00 AM",
    driver: "DRIVER10",
    seatsAvailable: 9,
    totalCapacity: 30,
    status: "Delayed",
    nextStop: "Kandoli",
    eta: "20 mins"
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
