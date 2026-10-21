import React, { useState } from 'react';
import WeatherWidget from './WeatherWidget';

const passwordRequirements = 'Use at least 8 characters.';

export default function Login({
  onLogin,
  onSignUp,
  onForgotPassword,
  onResendVerification,
  onResetPassword,
  onSignOut,
  onNavigate,
  initialMode = 'login',
  canResetPassword = false,
  systemError = '',
}) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [error, setError] = useState(() => {
    const query = new URLSearchParams(window.location.search);
    return initialMode === 'reset' && (query.has('error') || query.has('error_code'))
      ? 'This password reset link is invalid, expired, or already used. Request a new reset email.'
      : '';
  });
  const [message, setMessage] = useState(
    new URLSearchParams(window.location.search).get('verified') === '1'
      ? 'Email verified. You can now sign in.'
      : '',
  );

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setMessage('');
    setShowResendVerification(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (loading) return;

    if (mode === 'signup') {
      const normalizedUsername = username.trim().toLowerCase();
      const normalizedEmail = email.trim();
      if (!/^[a-z0-9_]{3,32}$/.test(normalizedUsername)) {
        setError('Username must be 3–32 characters using letters, numbers, or underscores.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setError('Enter a valid email address.');
        return;
      }
      if (password.length < 8) {
        setError(`Password is too short. ${passwordRequirements}`);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else if (mode === 'login') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim()) || !password) {
        setError('Enter a valid email address and password.');
        return;
      }
    } else if (mode === 'forgot') {
      if (!identifier.trim()) {
        setError('Enter the email address or username for your account.');
        return;
      }
    } else if (mode === 'reset') {
      if (!canResetPassword) {
        setError('This password reset link is invalid or expired. Request a new reset email.');
        return;
      }
      if (password.length < 8) {
        setError(`Password is too short. ${passwordRequirements}`);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin({ email: identifier.trim(), password, role });
      } else if (mode === 'signup') {
        const result = await onSignUp({
          username: username.trim().toLowerCase(),
          email: email.trim(),
          password,
        });
        setPassword('');
        setConfirmPassword('');
        setIdentifier(email.trim());
        setVerificationEmail(email.trim());
        setShowResendVerification(result.needsEmailConfirmation);
        setMessage(
          result.needsEmailConfirmation
            ? 'Your account was created. Verify your email using the link we sent before signing in.'
            : 'Your account was created successfully.',
        );
        setMode('login');
      } else if (mode === 'forgot') {
        await onForgotPassword(identifier.trim());
        setMessage('If an account matches that information, a password reset email will be sent.');
      } else {
        await onResetPassword(password);
        setPassword('');
        setConfirmPassword('');
        setMessage('Your password has been updated. You can now sign in with your new password.');
        setMode('login');
        onNavigate('/login');
      }
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed. Please try again.');
      if (/verify your email|email not confirmed/i.test(submitError.message || '')) {
        setShowResendVerification(true);
        setVerificationEmail(identifier.includes('@') ? identifier : email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const normalizedEmail = verificationEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter the email address you used to create your account.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await onResendVerification(normalizedEmail);
      setMessage('If this account needs verification, a new email will be sent. Check your inbox and spam folder.');
    } catch (resendError) {
      setError(resendError.message || 'Unable to resend the verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const isReset = mode === 'reset';
  const title = {
    login: 'Welcome to CampusRide',
    signup: 'Create your account',
    forgot: 'Reset your password',
    reset: 'Choose a new password',
  }[mode];
  const description = {
    login: 'Sign in to access campus shuttle schedules or driver operations.',
    signup: 'Register with a unique username and email address.',
    forgot: 'Enter your account email address or username to receive a reset link.',
    reset: canResetPassword
      ? 'Choose a strong password for your CampusRide account.'
      : 'The recovery session is unavailable. Request a new reset email to continue.',
  }[mode];

  return (
    <div className="login-page">
      <div className="login-layout-wrapper">
        <div className="login-brand-panel">
          <div className="brand-hero-text">
            <h1 className="brand-hero-title">
              Effortless Mobility for <span>Campus Life</span>
            </h1>
          </div>

          <div className="brand-stats-row">
            <div className="brand-stat-box">
              <span className="stat-value">10</span>
              <span className="stat-label">Active Shuttles</span>
            </div>
            <div className="brand-stat-box">
              <span className="stat-value">15 min</span>
              <span className="stat-label">Departure Freq</span>
            </div>
            <div className="brand-stat-box">
              <span className="stat-value">4.0 km</span>
              <span className="stat-label">Express Route</span>
            </div>
          </div>

          <div className="route-preview-badge">
            <div className="route-stop-point">
              <span className="stop-circle stop-kandoli"></span>
              <span>Kandoli Campus</span>
            </div>
            <div className="route-arrow-line">
              <span className="route-moving-dot"></span>
            </div>
            <div className="route-stop-point">
              <span className="stop-circle stop-bidholi"></span>
              <span>Bidholi Campus</span>
            </div>
          </div>

          {/* Real-time Campus Weather Telemetry */}
          <WeatherWidget />
        </div>

        <div className="login-card-container">
          <div className="login-card">
            <div className="login-card-header">
              <div className="auth-pill-tag">
                <span>{isReset ? 'ACCOUNT RECOVERY' : 'PORTAL AUTHENTICATION'}</span>
              </div>
              <h2 className="login-form-title">{title}</h2>
              <p className="login-form-desc">{description}</p>
            </div>

            {mode === 'login' && (
              <>
                <div className="role-switch-container">
                  <button
                    type="button"
                    className={`role-tab-btn ${role === 'student' ? 'active-student' : ''}`}
                    onClick={() => setRole('student')}
                  >
                    <span className="tab-icon">🎓</span>
                    <span className="tab-text">Student Portal</span>
                  </button>
                  <button
                    type="button"
                    className={`role-tab-btn ${role === 'driver' ? 'active-driver' : ''}`}
                    onClick={() => setRole('driver')}
                  >
                    <span className="tab-icon">🚍</span>
                    <span className="tab-text">Driver Operations</span>
                  </button>
                </div>
                <p className="auth-role-note">Portal access is assigned to your account by an administrator.</p>
              </>
            )}

            {systemError && <p className="auth-feedback auth-feedback-error" role="alert">{systemError}</p>}
            {error && <p className="auth-feedback auth-feedback-error" role="alert">{error}</p>}
            {message && <p className="auth-feedback auth-feedback-success" role="status">{message}</p>}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {mode === 'signup' && (
                <>
                  <div className="form-group">
                    <label htmlFor="signup-username">Username</label>
                    <div className="input-with-icon">
                      <span className="field-icon">👤</span>
                      <input
                        type="text"
                        id="signup-username"
                        autoComplete="username"
                        minLength={3}
                        maxLength={32}
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="3–32 letters, numbers, or underscores"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="signup-email">Email address</label>
                    <div className="input-with-icon">
                      <span className="field-icon">✉️</span>
                      <input
                        type="email"
                        id="signup-email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {(mode === 'login' || mode === 'forgot') && (
                <div className="form-group">
                  <label htmlFor="login-identifier">
                    {mode === 'forgot' ? 'Email address or username' : 'Email address'}
                  </label>
                  <div className="input-with-icon">
                    <span className="field-icon">✉️</span>
                    <input
                      type={mode === 'login' ? 'email' : 'text'}
                      id="login-identifier"
                      autoComplete="email"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder={mode === 'login' ? 'you@example.com' : 'Enter email or username'}
                      required
                    />
                  </div>
                </div>
              )}

              {(mode === 'login' || mode === 'signup' || isReset) && (
                <div className="form-group">
                  <label htmlFor="login-password">{isReset ? 'New password' : 'Password'}</label>
                  <div className="input-with-icon">
                    <span className="field-icon">🔒</span>
                    <input
                      type="password"
                      id="login-password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={isReset ? 'At least 8 characters' : 'Enter account password'}
                      required
                    />
                  </div>
                </div>
              )}

              {(mode === 'signup' || isReset) && (
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <div className="input-with-icon">
                    <span className="field-icon">🔒</span>
                    <input
                      type="password"
                      id="confirm-password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`btn btn-portal-submit ${role === 'student' ? 'btn-student-submit' : 'btn-driver-submit'}`}
                disabled={loading || (isReset && !canResetPassword)}
              >
                <span>
                  {loading
                    ? 'Please wait…'
                    : {
                        login: role === 'student' ? 'Enter Student Portal' : 'Access Driver Cockpit',
                        signup: 'Create account',
                        forgot: 'Send reset link',
                        reset: 'Update password',
                      }[mode]}
                </span>
                {!loading && <span className="arrow-icon">&rarr;</span>}
              </button>
            </form>

            {mode === 'login' && (
              <div className="auth-secondary-actions">
                <button type="button" onClick={() => switchMode('forgot')}>Forgot Password?</button>
                <button type="button" onClick={() => switchMode('signup')}>Create an account</button>
              </div>
            )}
            {mode === 'login' && showResendVerification && (
              <div className="auth-resend-verification">
                <label htmlFor="verification-email">Account email address</label>
                <div className="auth-resend-row">
                  <input
                    type="email"
                    id="verification-email"
                    autoComplete="email"
                    value={verificationEmail}
                    onChange={(event) => setVerificationEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                  <button type="button" onClick={handleResendVerification} disabled={loading}>
                    {loading ? 'Sending…' : 'Resend verification'}
                  </button>
                </div>
              </div>
            )}
            {mode === 'signup' && (
              <div className="auth-secondary-actions">
                <button type="button" onClick={() => switchMode('login')}>Already registered? Sign in</button>
              </div>
            )}
            {(mode === 'forgot' || isReset) && (
              <div className="auth-secondary-actions">
                {isReset && !canResetPassword && (
                  <button type="button" onClick={() => switchMode('forgot')}>Request a new reset email</button>
                )}
                <button type="button" onClick={() => switchMode('login')}>Return to sign in</button>
              </div>
            )}
            {systemError && onSignOut && (
              <div className="auth-secondary-actions">
                <button type="button" onClick={onSignOut}>Sign out and try again</button>
              </div>
            )}

            <div className="login-trust-notice">
              <span>UPES Transit Network</span> &bull; <span>Verified GPS Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
