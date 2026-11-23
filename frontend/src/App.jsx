import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import DriverDashboard from './components/DriverDashboard';
import NotFound from './components/NotFound';
import Footer from './components/Footer';

// Mock Campus Buses Data (2 Stops: Kandoli & Bidholi, 5 buses each direction with 15 min gaps & 15-20 min ETAs)
const INITIAL_BUSES = [
  // Kandoli -> Bidholi (5 Buses)
  {
    id: 1,
    busNo: "BUS-101",
    route: "Kandoli → Bidholi",
    direction: "Kandoli → Bidholi",
    departureTime: "08:00 AM",
    driver: "DRIVER01",
    seatsAvailable: 14,
    totalCapacity: 30,
    status: "Active",
    nextStop: "Bidholi",
    eta: "15 mins",
    boardedStudents: [
      { id: "s101-1", name: "Sahaj Parikh", sapId: "500108920", boardingTime: "08:02 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-2", name: "Aarav Saxena", sapId: "500109432", boardingTime: "08:04 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-3", name: "Shantanu Pathak", sapId: "500107291", boardingTime: "08:05 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-4", name: "Ananya Verma", sapId: "500110245", boardingTime: "08:07 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-5", name: "Rohan Sharma", sapId: "500106519", boardingTime: "08:09 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-6", name: "Priyansh Mehta", sapId: "500108342", boardingTime: "08:11 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-7", name: "Diya Kapoor", sapId: "500109988", boardingTime: "08:12 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-8", name: "Kabir Sen", sapId: "500107431", boardingTime: "08:14 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-9", name: "Riya Patel", sapId: "500110564", boardingTime: "08:15 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-10", name: "Ayush Gupta", sapId: "500108871", boardingTime: "08:16 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-11", name: "Meera Nair", sapId: "500106992", boardingTime: "08:18 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-12", name: "Tanmay Joshi", sapId: "500107123", boardingTime: "08:19 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-13", name: "Sneha Roy", sapId: "500109876", boardingTime: "08:21 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-14", name: "Vikram Malhotra", sapId: "500105432", boardingTime: "08:22 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-15", name: "Ishaan Choudhury", sapId: "500108119", boardingTime: "08:24 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s101-16", name: "Tara Singhal", sapId: "500109224", boardingTime: "08:25 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" }
    ]
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
    eta: "19 mins",
    boardedStudents: [
      { id: "s102-1", name: "Aditya Roy", sapId: "500110321", boardingTime: "08:14 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s102-2", name: "Kritika Sethi", sapId: "500109123", boardingTime: "08:16 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s102-3", name: "Devansh Rao", sapId: "500107654", boardingTime: "08:18 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s102-4", name: "Pooja Hegde", sapId: "500108765", boardingTime: "08:19 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s102-5", name: "Manish Kumar", sapId: "500111223", boardingTime: "08:20 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s102-6", name: "Nisha Varma", sapId: "500106443", boardingTime: "08:22 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s102-7", name: "Rahul Das", sapId: "500109887", boardingTime: "08:23 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s102-8", name: "Simran Kaur", sapId: "500108332", boardingTime: "08:25 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" }
    ]
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
    eta: "16 mins",
    boardedStudents: [
      { id: "s103-1", name: "Varun Dhawan", sapId: "500108990", boardingTime: "08:28 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s103-2", name: "Kavya Menon", sapId: "500107334", boardingTime: "08:30 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s103-3", name: "Abhishek Pandey", sapId: "500109551", boardingTime: "08:31 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" }
    ]
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
    eta: "18 mins",
    boardedStudents: [
      { id: "s104-1", name: "Gaurav Singh", sapId: "500109772", boardingTime: "08:40 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s104-2", name: "Ananya Dixit", sapId: "500108663", boardingTime: "08:42 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" },
      { id: "s104-3", name: "Pranav Jain", sapId: "500107884", boardingTime: "08:43 AM", from: "Kandoli", to: "Bidholi", status: "Boarded" }
    ]
  },
  {
    id: 5,
    busNo: "BUS-105",
    route: "Kandoli → Bidholi",
    direction: "Kandoli → Bidholi",
    departureTime: "09:00 AM",
    driver: "DRIVER05",
    seatsAvailable: 0,
    totalCapacity: 30,
    status: "Out of Service",
    nextStop: "Kandoli",
    eta: "--",
    boardedStudents: []
  },

  // Bidholi -> Kandoli (5 Buses)
  {
    id: 6,
    busNo: "BUS-201",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "08:00 AM",
    driver: "DRIVER06",
    seatsAvailable: 11,
    totalCapacity: 30,
    status: "Active",
    nextStop: "Kandoli",
    eta: "15 mins",
    boardedStudents: [
      { id: "s201-1", name: "Kunal Ghosh", sapId: "500106771", boardingTime: "08:03 AM", from: "Bidholi", to: "Kandoli", status: "Boarded" },
      { id: "s201-2", name: "Shruti Aggarwal", sapId: "500108552", boardingTime: "08:05 AM", from: "Bidholi", to: "Kandoli", status: "Boarded" }
    ]
  },
  {
    id: 7,
    busNo: "BUS-202",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "08:15 AM",
    driver: "DRIVER07",
    seatsAvailable: 19,
    totalCapacity: 30,
    status: "In-Transit",
    nextStop: "Kandoli",
    eta: "17 mins",
    boardedStudents: [
      { id: "s202-1", name: "Harsh Vardhan", sapId: "500109118", boardingTime: "08:12 AM", from: "Bidholi", to: "Kandoli", status: "Boarded" }
    ]
  },
  {
    id: 8,
    busNo: "BUS-203",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "08:30 AM",
    driver: "DRIVER08",
    seatsAvailable: 26,
    totalCapacity: 30,
    status: "Active",
    nextStop: "Kandoli",
    eta: "15 mins",
    boardedStudents: []
  },
  {
    id: 9,
    busNo: "BUS-204",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "08:45 AM",
    driver: "DRIVER09",
    seatsAvailable: 14,
    totalCapacity: 30,
    status: "Delayed",
    nextStop: "Kandoli",
    eta: "22 mins",
    boardedStudents: [
      { id: "s204-1", name: "Ritika Sen", sapId: "500107889", boardingTime: "08:41 AM", from: "Bidholi", to: "Kandoli", status: "Boarded" }
    ]
  },
  {
    id: 10,
    busNo: "BUS-205",
    route: "Bidholi → Kandoli",
    direction: "Bidholi → Kandoli",
    departureTime: "09:00 AM",
    driver: "DRIVER10",
    seatsAvailable: 0,
    totalCapacity: 30,
    status: "Out of Service",
    nextStop: "Bidholi",
    eta: "--",
    boardedStudents: []
  }
];

function App() {
  const [user, setUser] = useState(null);
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [currentView, setCurrentView] = useState('app'); // 'app' | '404'

  // Sync route path for 404
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/404') {
      setCurrentView('404');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('app');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('app');
  };

  const handleUpdateBus = (busId, updatedFields) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) =>
        bus.id === busId ? { ...bus, ...updatedFields } : bus
      )
    );
  };

  // Passenger boarding & deboarding management
  const handleBoardStudent = (busId, studentData) => {
    let busFound = buses.find(b => b.id === busId);
    if (!busFound) return { success: false, message: 'Bus not found' };

    // Check if student already booked ANY bus
    const alreadyBoarded = buses.some(b =>
      b.boardedStudents?.some(s => s.sapId.toLowerCase() === studentData.sapId.toLowerCase())
    );

    if (alreadyBoarded) {
      return { success: false, message: `Student (SAP: ${studentData.sapId}) is already checked into an active bus.` };
    }

    if (busFound.seatsAvailable <= 0) {
      return { success: false, message: 'Bus is at full capacity!' };
    }

    const newPassenger = {
      id: `p-${Date.now()}`,
      name: studentData.name,
      sapId: studentData.sapId,
      boardingTime: studentData.boardingTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      from: studentData.from || 'Kandoli',
      to: studentData.to || 'Bidholi',
      status: 'Boarded'
    };

    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (bus.id === busId) {
          return {
            ...bus,
            boardedStudents: [newPassenger, ...(bus.boardedStudents || [])],
            seatsAvailable: Math.max(0, bus.seatsAvailable - 1)
          };
        }
        return bus;
      })
    );
    
    return { success: true };
  };

  const handleDeboardStudent = (busId, studentId) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (bus.id === busId) {
          const currentList = bus.boardedStudents || [];
          const updatedList = currentList.filter(s => s.id !== studentId);
          const newSeats = Math.min(bus.totalCapacity, bus.seatsAvailable + 1);
          return {
            ...bus,
            boardedStudents: updatedList,
            seatsAvailable: newSeats
          };
        }
        return bus;
      })
    );
  };

  const handleDeboardAllStudents = (busId) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) => {
        if (bus.id === busId) {
          return {
            ...bus,
            boardedStudents: [],
            seatsAvailable: bus.totalCapacity
          };
        }
        return bus;
      })
    );
  };

  const navigateToHome = () => {
    setCurrentView('app');
    window.history.pushState(null, '', '/');
  };

  // Find if user has boarded ride
  const currentBoardedBus = user && user.role === 'student' ? buses.find(b =>
    b.boardedStudents?.some(s => s.name === user.username || s.sapId === '500109999' || s.sapId === user.username)
  ) : null;

  return (
    <div className="app-container">
      {/* Universal Top Transit Navigation Bar */}
      <Header
        user={user}
        onLogout={handleLogout}
        currentBoardedBus={currentBoardedBus}
        onDeboardClick={() => {
          if (currentBoardedBus) {
            const studentEntry = currentBoardedBus.boardedStudents?.find(
              s => s.name === user.username || s.sapId === '500109999' || s.sapId === user.username
            );
            if (studentEntry) {
              handleDeboardStudent(currentBoardedBus.id, studentEntry.id);
            }
          }
        }}
      />

      <main className="app-main-content">
        {currentView === '404' ? (
          <NotFound user={user} onNavigateHome={navigateToHome} />
        ) : !user ? (
          <Login onLogin={handleLogin} />
        ) : user.role === 'driver' ? (
          <DriverDashboard
            user={user}
            buses={buses}
            onUpdateBus={handleUpdateBus}
            onBoardStudent={handleBoardStudent}
            onDeboardStudent={handleDeboardStudent}
            onDeboardAllStudents={handleDeboardAllStudents}
            onLogout={handleLogout}
          />
        ) : (
          <StudentDashboard
            user={user}
            buses={buses}
            onLogout={handleLogout}
            onUpdateBus={handleUpdateBus}
            onBoardStudent={handleBoardStudent}
            onDeboardStudent={handleDeboardStudent}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
