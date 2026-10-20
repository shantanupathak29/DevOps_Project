import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import DriverDashboard from './components/DriverDashboard';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import { supabase, supabaseConfigError } from './lib/supabase';

const normalizeStudentIdentifier = (value = '') => String(value).trim().toLowerCase();

const mapPassengerRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  sapId: row.sap_id,
  boardingTime: new Date(row.boarded_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
  from: row.from_stop,
  to: row.to_stop,
  status: row.status,
});

const mapBusRow = (row, passengers = []) => ({
  id: row.id,
  busNo: row.bus_no,
  route: row.route,
  direction: row.direction,
  departureTime: row.departure_time,
  driver: row.driver,
  seatsAvailable: row.seats_available,
  totalCapacity: row.total_capacity,
  status: row.status,
  nextStop: row.next_stop,
  eta: row.eta,
  boardedStudents: passengers
    .filter((passenger) => passenger.bus_id === row.id)
    .map(mapPassengerRow),
});

const BUS_FIELD_COLUMNS = {
  seatsAvailable: 'seats_available',
  status: 'status',
  nextStop: 'next_stop',
  eta: 'eta',
};

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
  const [authSession, setAuthSession] = useState(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [authError, setAuthError] = useState(supabaseConfigError);
  const [profileNotice, setProfileNotice] = useState('');
  const [busNotice, setBusNotice] = useState('');
  const [busDatabaseUserId, setBusDatabaseUserId] = useState(null);
  const [busRetryCount, setBusRetryCount] = useState(0);
  const [pathname, setPathname] = useState(window.location.pathname);
  const [recoverySession, setRecoverySession] = useState(
    () => window.sessionStorage.getItem('campusride-password-recovery') === 'true',
  );
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const busWriteQueue = useRef(Promise.resolve());
  const [currentView, setCurrentView] = useState('app'); // 'app' | '404'
  const busDatabaseReady = Boolean(authSession?.user?.id)
    && busDatabaseUserId === authSession.user.id;

  useEffect(() => {
    const handlePopState = () => {
      const nextPath = window.location.pathname;
      setPathname(nextPath);
      setCurrentView(nextPath === '/404' ? '404' : 'app');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let active = true;

    if (!authSession?.user?.id || !supabase) {
      return undefined;
    }

    Promise.all([
      supabase.from('buses').select('*').order('id'),
      supabase.from('bus_passengers').select('*').order('boarded_at'),
    ]).then(([busResult, passengerResult]) => {
      if (!active) return;
      const error = busResult.error || passengerResult.error;
      if (error) {
        console.error('Could not load bus data from Supabase:', {
          code: error.code,
          message: error.message,
        });
        setBusNotice('Supabase bus tables are missing or unavailable. Apply both database migrations in order, then retry.');
        setBuses(INITIAL_BUSES);
        setBusDatabaseUserId(null);
        return;
      }
      const passengerRows = passengerResult.data || [];
      setBuses((busResult.data || []).map((row) => mapBusRow(row, passengerRows)));
      setBusDatabaseUserId(authSession.user.id);
    }).catch((error) => {
      if (!active) return;
      console.error('Could not load bus data from Supabase:', error);
      setBusNotice('Could not connect to bus data. Check your connection and try again.');
      setBuses(INITIAL_BUSES);
      setBusDatabaseUserId(null);
    });

    return () => {
      active = false;
    };
  }, [authSession?.user?.id, busRetryCount]);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let active = true;
    let requestId = 0;

    const loadIdentity = async (session) => {
      if (!active) return;
      const currentRequest = ++requestId;
      setAuthSession(session);
      if (!session) {
        window.sessionStorage.removeItem('campusride-password-recovery');
        setRecoverySession(false);
        setUser(null);
        setProfileNotice('');
        setAuthError('');
        setAuthReady(true);
        return;
      }

      setAuthReady(false);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active || currentRequest !== requestId) return;
      if (error) {
        const metadataUsername = session.user.user_metadata?.username;
        const fallbackUsername = typeof metadataUsername === 'string' && metadataUsername.trim()
          ? metadataUsername.trim()
          : session.user.email?.split('@')[0] || 'Student';
        setUser({
          id: session.user.id,
          username: fallbackUsername,
          role: 'student',
        });
        setAuthError('');
        setProfileNotice(error.code === 'PGRST205' || error.code === '42P01'
          ? 'Student portal opened. Supabase profile setup is not applied yet; ask the administrator to apply the profiles migration to enable profile features and driver access.'
          : 'Student portal opened with limited profile access. Check the Supabase profiles table and its RLS policies to restore full account features.');
        console.error('Could not load Supabase profile; opening the account with student-only access.', {
          code: error.code,
          message: error.message,
        });
      } else if (!profile) {
        const metadataUsername = session.user.user_metadata?.username;
        const fallbackUsername = typeof metadataUsername === 'string' && metadataUsername.trim()
          ? metadataUsername.trim()
          : session.user.email?.split('@')[0] || 'Student';
        setUser({
          id: session.user.id,
          username: fallbackUsername,
          role: 'student',
        });
        setAuthError('');
        setProfileNotice('Student portal opened. Your Supabase profile is missing; ask the administrator to apply the profile migration and backfill existing accounts.');
      } else {
        setUser({
          id: profile.id,
          username: profile.username,
          role: profile.role === 'driver' ? 'driver' : 'student',
        });
        setAuthError('');
        setProfileNotice('');
      }
      setAuthReady(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        window.sessionStorage.setItem('campusride-password-recovery', 'true');
        setRecoverySession(true);
      } else if (event === 'SIGNED_OUT') {
        window.sessionStorage.removeItem('campusride-password-recovery');
        setRecoverySession(false);
        setBusDatabaseUserId(null);
        setBuses(INITIAL_BUSES);
        setBusNotice('');
      } else if (event === 'SIGNED_IN') {
        setBusNotice('');
      }
      if (event === 'TOKEN_REFRESHED') {
        setAuthSession(session);
        return;
      }
      queueMicrotask(() => {
        if (active) void loadIdentity(session);
      });
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuthError('Unable to restore your session. Please try signing in again.');
        setAuthReady(true);
      } else {
        void loadIdentity(data.session);
      }
    }).catch(() => {
      if (active) {
        setAuthError('Unable to restore your session. Check your network and try again.');
        setAuthReady(true);
      }
    });

    return () => {
      active = false;
      requestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async ({ email, password }) => {
    if (!supabase) throw new Error(supabaseConfigError);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        throw new Error('Please verify your email address before signing in.');
      }
      if (/fetch|network/i.test(`${error.name} ${error.message}`)) {
        throw new Error('Unable to reach the authentication service. Check your network and try again.');
      }
      throw new Error('Invalid email address or password.');
    }
  };

  const handleSignUp = async ({ username, email, password }) => {
    if (!supabase) throw new Error(supabaseConfigError);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/login?verified=1`,
      },
    });
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('username') || message.includes('23505')) {
        throw new Error('That username is already in use. Choose another one.');
      }
      if (message.includes('database error saving new user')) {
        throw new Error('That username may already be in use. Try another username, or try again later.');
      }
      if (message.includes('already registered') || message.includes('already exists')) {
        throw new Error('An account already exists for this email address.');
      }
      if (/fetch|network/i.test(`${error.name} ${error.message}`)) {
        throw new Error('Unable to reach the authentication service. Check your network and try again.');
      }
      if (/password|weak/i.test(error.message)) {
        throw new Error('Choose a stronger password with at least 8 characters.');
      }
      throw new Error('Unable to create the account. Check the details and try again.');
    }

    return { needsEmailConfirmation: !data.session };
  };

  const handleForgotPassword = async (identifier) => {
    if (!supabase) throw new Error(supabaseConfigError);

    const { error } = await supabase.functions.invoke('request-password-reset', {
      body: { identifier },
    });
    if (error) {
      if (error.name === 'FunctionsFetchError') {
        throw new Error('Unable to reach the password recovery service. Check your network and try again.');
      }
      if ((error.context?.status ?? 0) >= 500) {
        throw new Error('Password recovery is temporarily unavailable. Please try again.');
      }
      throw new Error('Unable to request a reset email. Check the information and try again.');
    }
  };

  const handleResendVerification = async (email) => {
    if (!supabase) throw new Error(supabaseConfigError);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=1`,
      },
    });
    if (error) {
      if (/rate limit|too many requests/i.test(error.message)) {
        throw new Error('Please wait a minute before requesting another verification email.');
      }
      if (/fetch|network/i.test(`${error.name} ${error.message}`)) {
        throw new Error('Unable to reach the authentication service. Check your network and try again.');
      }
      throw new Error('Unable to resend the verification email. Check the address or try again later.');
    }
  };

  const handleResetPassword = async (password) => {
    if (!supabase || !authSession || !recoverySession) {
      throw new Error('This password recovery session has expired. Request a new reset email.');
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error('This password recovery link is invalid or expired. Request a new reset email.');
    }
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    if (signOutError) {
      throw new Error('Your password was updated, but this device could not be signed out. Use Logout before signing in again.');
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      setAuthError('Unable to sign out. Check your network and try again.');
    }
  };

  const navigateTo = (path) => {
    window.history.replaceState(null, '', path);
    setPathname(window.location.pathname);
    setCurrentView(path === '/404' ? '404' : 'app');
  };

  const retryBusDatabase = () => {
    setBusNotice('');
    setBusDatabaseUserId(null);
    setBusRetryCount((count) => count + 1);
  };

  const handleUpdateBus = async (busId, updatedFields) => {
    if (!busDatabaseReady || !supabase) {
      setBusNotice('Bus data is not connected. Apply the bus operations migration before making changes.');
      return false;
    }

    const databaseFields = Object.fromEntries(
      Object.entries(updatedFields)
        .filter(([field]) => BUS_FIELD_COLUMNS[field])
        .map(([field, value]) => [BUS_FIELD_COLUMNS[field], value]),
    );
    if (!Object.keys(databaseFields).length) return true;

    setBuses((previous) => previous.map((bus) => (
      bus.id === busId ? { ...bus, ...updatedFields } : bus
    )));

    const saveUpdate = async () => {
      const { data, error } = await supabase
        .from('buses')
        .update(databaseFields)
        .eq('id', busId)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('The bus was not updated. Check your role and database policies.');

      setBusNotice('');
      return true;
    };

    const pendingUpdate = busWriteQueue.current.then(saveUpdate);
    busWriteQueue.current = pendingUpdate.catch(() => undefined);
    try {
      return await pendingUpdate;
    } catch (error) {
      console.error('Could not save bus details:', { code: error.code, message: error.message });
      setBusNotice(error.code === '42501'
        ? 'Your account does not have permission to update bus operations.'
        : 'Could not save bus changes. Check your connection and account permissions.');
      await busWriteQueue.current;
      const { data } = await supabase.from('buses').select('*').eq('id', busId).maybeSingle();
      if (data) {
        setBuses((previous) => previous.map((bus) => (
          bus.id === busId ? { ...mapBusRow(data), boardedStudents: bus.boardedStudents } : bus
        )));
      }
      return false;
    }
  };

  // Passenger boarding & deboarding management
  const handleBoardStudent = async (busId, studentData) => {
    const normalizedSapId = normalizeStudentIdentifier(studentData.sapId);
    const busFound = buses.find((b) => b.id === busId);
    if (!busFound) return { success: false, message: 'Bus not found' };
    if (!busDatabaseReady || !supabase || !user?.id) {
      return { success: false, message: 'Bus database is not ready. Apply the bus operations migration and try again.' };
    }

    if (normalizedSapId.length === 0) {
      return { success: false, message: 'Please provide a valid SAP ID.' };
    }

    if (buses.some((b) => (b.boardedStudents || []).some(
      (s) => normalizeStudentIdentifier(s.sapId) === normalizedSapId,
    ))) {
      return { success: false, message: `Student (SAP: ${studentData.sapId}) is already checked into an active bus.` };
    }

    if (busFound.seatsAvailable <= 0) {
      return { success: false, message: 'Bus is at full capacity!' };
    }

    const isDriver = user.role === 'driver';
    const { data, error } = await supabase
      .from('bus_passengers')
      .insert({
        bus_id: busId,
        user_id: isDriver ? null : user.id,
        name: studentData.name.trim(),
        sap_id: studentData.sapId.trim(),
        from_stop: studentData.from || 'Kandoli',
        to_stop: studentData.to || 'Bidholi',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Could not save passenger reservation:', { code: error.code, message: error.message });
      const message = error.code === '23505'
        ? 'This student already has an active reservation.'
        : error.code === '23514'
          ? 'This bus has no available seats.'
          : error.code === '42501'
            ? 'Your account does not have permission to create this reservation.'
            : 'Could not save the reservation. Check your connection and try again.';
      return { success: false, message };
    }

    const passenger = mapPassengerRow(data);
    setBuses((previous) => previous.map((bus) => (
      bus.id === busId
        ? {
            ...bus,
            boardedStudents: [passenger, ...bus.boardedStudents],
            seatsAvailable: Math.max(0, bus.seatsAvailable - 1),
          }
        : bus
    )));
    setBusNotice('');
    return { success: true };
  };

  const handleDeboardStudent = async (busId, studentId) => {
    if (!busDatabaseReady || !supabase) {
      return { success: false, message: 'Bus database is not ready. Apply the bus operations migration and try again.' };
    }
    const { data, error } = await supabase
      .from('bus_passengers')
      .delete()
      .eq('bus_id', busId)
      .eq('id', studentId)
      .select('id')
      .maybeSingle();
    if (error || !data) {
      console.error('Could not release passenger reservation:', { code: error?.code, message: error?.message });
      return {
        success: false,
        message: error?.code === '42501'
          ? 'Your account cannot release this reservation.'
          : 'Could not release the reservation. Check your connection and try again.',
      };
    }

    setBuses((previous) => previous.map((bus) => {
      if (bus.id !== busId) return bus;
      return {
        ...bus,
        boardedStudents: bus.boardedStudents.filter((passenger) => passenger.id !== studentId),
        seatsAvailable: Math.min(bus.totalCapacity, bus.seatsAvailable + 1),
      };
    }));
    setBusNotice('');
    return { success: true };
  };

  const handleDeboardAllStudents = async (busId) => {
    if (!busDatabaseReady || !supabase) return false;
    const { data, error } = await supabase
      .from('bus_passengers')
      .delete()
      .eq('bus_id', busId)
      .select('id');
    if (error) {
      console.error('Could not clear passengers from bus:', { code: error.code, message: error.message });
      setBusNotice(error.code === '42501'
        ? 'Your account does not have permission to clear this bus.'
        : 'Could not clear bus passengers. Check your connection and try again.');
      return false;
    }
    setBuses((previous) => previous.map((bus) => (
      bus.id === busId
        ? {
            ...bus,
            boardedStudents: [],
            seatsAvailable: Math.min(bus.totalCapacity, bus.seatsAvailable + (data?.length ?? 0)),
          }
        : bus
    )));
    setBusNotice('');
    return true;
  };

  const navigateToHome = () => {
    setCurrentView('app');
    window.history.pushState(null, '', '/');
    setPathname('/');
  };

  // Find if user has boarded ride
  const currentBoardedBus = user && user.role === 'student' ? buses.find((b) =>
    (b.boardedStudents || []).some((s) =>
      s.userId === user.id ||
      (!s.userId && (
        normalizeStudentIdentifier(s.name) === normalizeStudentIdentifier(user.username) ||
        normalizeStudentIdentifier(s.sapId) === normalizeStudentIdentifier(user.username) ||
        normalizeStudentIdentifier(s.sapId) === '500109999'
      ))
    )
  ) : null;

  if (authReady && user && !busDatabaseReady && !busNotice) {
    return (
      <div className="auth-loading-screen" role="status">
        <span className="auth-loading-indicator" />
        <span>Loading live shuttle information…</span>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="auth-loading-screen" role="status">
        <span className="auth-loading-indicator" />
        <span>Restoring your secure session…</span>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Universal Top Transit Navigation Bar */}
      <Header
        user={user}
        onLogout={handleLogout}
        currentBoardedBus={currentBoardedBus}
        onDeboardClick={() => {
          if (currentBoardedBus) {
            const studentEntry = currentBoardedBus.boardedStudents?.find((s) =>
              s.userId === user.id ||
              (!s.userId && (
                normalizeStudentIdentifier(s.name) === normalizeStudentIdentifier(user.username) ||
                normalizeStudentIdentifier(s.sapId) === normalizeStudentIdentifier(user.username) ||
                normalizeStudentIdentifier(s.sapId) === '500109999'
              ))
            );
            if (studentEntry) {
              handleDeboardStudent(currentBoardedBus.id, studentEntry.id);
            }
          }
        }}
      />

      <main className="app-main-content">
        {user && profileNotice && (
          <div className="auth-profile-notice" role="status">
            {profileNotice}
          </div>
        )}
        {user && busNotice && (
          <div className="auth-profile-notice" role="status">
            {busNotice}
            <button
              type="button"
              className="auth-profile-retry"
              onClick={retryBusDatabase}
            >
              Retry connection
            </button>
          </div>
        )}
        {currentView === '404' ? (
          <NotFound user={user} onNavigateHome={navigateToHome} />
        ) : pathname === '/reset-password' ? (
          <Login
            initialMode="reset"
            canResetPassword={Boolean(authSession && recoverySession)}
            onLogin={handleLogin}
            onSignUp={handleSignUp}
            onForgotPassword={handleForgotPassword}
            onResendVerification={handleResendVerification}
            onResetPassword={handleResetPassword}
            onNavigate={navigateTo}
            systemError={authError}
            onSignOut={authSession ? handleLogout : undefined}
          />
        ) : !user ? (
          <Login
            onLogin={handleLogin}
            onSignUp={handleSignUp}
            onForgotPassword={handleForgotPassword}
            onResendVerification={handleResendVerification}
            onResetPassword={handleResetPassword}
            onNavigate={navigateTo}
            systemError={authError}
            onSignOut={authSession ? handleLogout : undefined}
          />
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
