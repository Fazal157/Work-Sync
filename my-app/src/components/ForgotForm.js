import React, { useState }              from 'react';
import { auth, sendPasswordResetEmail } from '../firebase';

export default function ForgotForm({ onSwitch }) {
  const [step,    setStep]    = useState('email'); // email | done
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [alert,   setAlert]   = useState(null);

  /* ── Send reset link via Firebase ── */
  const handleSendCode = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Enter a valid email address' });
      return;
    }
    setLoading(true);
    setErrors({});

    try {
      // Firebase sends real password reset link to Gmail
      await sendPasswordResetEmail(auth, email.trim());

      setStep('done');
      setAlert({
        type: 'success',
        msg:  `Password reset link sent to ${email}. Check your inbox and click the link to set a new password.`,
      });

    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setErrors({ email: 'No account found with this email address.' });
      } else if (err.code === 'auth/invalid-email') {
        setErrors({ email: 'Invalid email address.' });
      } else if (err.code === 'auth/too-many-requests') {
        setErrors({ email: 'Too many requests. Please wait a few minutes and try again.' });
      } else {
        setErrors({ email: `Failed to send reset email: ${err.message}` });
      }
    }
    setLoading(false);
  };

  return (
    <div className="aform">

      {/* Header */}
      <div className="aform__head">
        <div style={{ fontSize: 40, marginBottom: 4 }}>
          {step === 'done' ? '✅' : '🔐'}
        </div>
        <h1 className="aform__title">
          {step === 'email' ? 'Forgot password?' : 'Check your email!'}
        </h1>
        <p className="aform__sub">
          {step === 'email'
            ? "Enter your registered email and we'll send a reset link."
            : <>We sent a password reset link to <strong>{email}</strong></>
          }
        </p>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`aform__alert aform__alert--${alert.type}`}>
          {alert.type === 'success' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          )}
          {alert.msg}
        </div>
      )}

      {/* Step progress bar */}
      {step === 'email' && (
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#4a8af4', transition: 'background 0.3s ease' }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#f0f2f8', transition: 'background 0.3s ease' }} />
        </div>
      )}

      {step === 'done' && (
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#22c55e' }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#22c55e' }} />
        </div>
      )}

      {/* ── Step 1: Email input ── */}
      {step === 'email' && (
        <div className="aform__fields">
          <div className="aform__field">
            <label className="aform__label">Email Address</label>
            <div className={`aform__input-wrap${errors.email ? ' aform__input-wrap--err' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors({}); setAlert(null); }}
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                autoFocus
              />
            </div>
            {errors.email && <span className="aform__err">{errors.email}</span>}
          </div>
        </div>
      )}

      {/* ── Step 2: Done — instructions ── */}
      {step === 'done' && (
        <div className="aform__fields">
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #bbf7d0',
            borderRadius: 12,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {[
              '1. Open your email inbox',
              '2. Find the email from TrackForge',
              '3. Click the reset link in the email',
              '4. Set your new password',
              '5. Come back and log in',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: '#1a1d2e', fontFamily: "'Nunito', sans-serif",
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Resend option */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 0',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            color: '#7c82a0',
          }}>
            Didn't receive the email?{' '}
            <button
              className="aform__resend"
              onClick={() => {
                setStep('email');
                setAlert(null);
                setErrors({});
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Buttons ── */}
      {step === 'email' && (
        <button
          className="aform__submit"
          onClick={handleSendCode}
          disabled={loading}
        >
          {loading
            ? <><span className="aform__spinner" /> Sending reset link...</>
            : 'Send Reset Link'
          }
        </button>
      )}

      {step === 'done' && (
        <button
          className="aform__submit aform__submit--ok"
          onClick={() => onSwitch('login')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          Back to Login
        </button>
      )}

      {/* Back to login link */}
      {step !== 'done' && (
        <p className="aform__sub" style={{ textAlign: 'center' }}>
          Remember your password?{' '}
          <button onClick={() => onSwitch('login')}>Sign in</button>
        </p>
      )}

    </div>
  );
}