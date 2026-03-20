import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)         score++;
  if (/[A-Z]/.test(pwd))       score++;
  if (/[0-9]/.test(pwd))       score++;
  if (/[^A-Za-z0-9]/.test(pwd))score++;
  return score;
};

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'weak', 'fair', 'good', 'strong'];

export default function SignupForm({ onSwitch }) {
  const [form,         setForm]         = useState({ firstName: '', lastName: '', email: '', password: '', confirmPwd: '' });
  const [errors,       setErrors]       = useState({});
  const [showPwd,      setShowPwd]      = useState(false);
  const [showCPwd,     setShowCPwd]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [terms,        setTerms]        = useState(false);
  const [alert,        setAlert]        = useState(null);
  const [emailStatus,  setEmailStatus]  = useState('idle'); // idle|checking|code_sent|verified
  const [verifyCode,   setVerifyCode]   = useState('');
  const [enteredCode,  setEnteredCode]  = useState('');
  const [codeStep,     setCodeStep]     = useState(false);
  const [codeError,    setCodeError]    = useState('');

  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    if (errors[f]) setErrors(e => ({ ...e, [f]: '' }));
    setAlert(null);
    if (f === 'email') {
      setEmailStatus('idle');
      setCodeStep(false);
      setEnteredCode('');
      setCodeError('');
    }
  };

  const strength = getStrength(form.password);

  /* ── Send verification code ── */
  const handleVerifyEmail = async () => {
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setErrors(e => ({ ...e, email: 'Enter a valid email first' }));
      return;
    }

    // Check if already registered
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (users.find(u => u.email === form.email)) {
      setErrors(e => ({ ...e, email: 'This email is already registered. Please log in.' }));
      return;
    }

    setEmailStatus('checking');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerifyCode(code);

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_email: form.email,
          to_name:  form.firstName || 'User',
          code:     code,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );
      setEmailStatus('code_sent');
      setCodeStep(true);
      setAlert({ type: 'info', msg: `Verification code sent to ${form.email}` });
    } catch {
      setEmailStatus('idle');
      setErrors(e => ({ ...e, email: 'Failed to send code. Please check your email.' }));
    }
  };

  const handleCheckCode = () => {
    if (enteredCode === verifyCode) {
      setEmailStatus('verified');
      setCodeStep(false);
      setCodeError('');
      setAlert({ type: 'success', msg: 'Email verified successfully!' });
    } else {
      setCodeError('Incorrect code. Please try again.');
    }
  };

  /* ── Validate ── */
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName   = 'Required';
    if (!form.lastName.trim())  e.lastName    = 'Required';
    if (!form.email.trim())     e.email       = 'Required';
    else if (emailStatus !== 'verified') e.email = 'Please verify your email first';
    if (!form.password)         e.password    = 'Required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPwd) e.confirmPwd = 'Passwords do not match';
    if (!terms) e.terms = 'You must accept the terms';
    return e;
  };

  /* ── Send account verification link ── */
  const sendVerificationLink = async (user) => {
    const verifyToken = btoa(JSON.stringify({ email: user.email, ts: Date.now() }));
    const verifyLink  = `${window.location.origin}?verify=${verifyToken}`;

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_VERIFY_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_email:    user.email,
          to_name:     user.firstName,
          verify_link: verifyLink,
          code:        'Click the link below to verify your account',
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );
    } catch (err) {
      console.error('Verification link email failed:', err);
    }
  };

  /* ── Submit ── */
  const handleSignup = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);

    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const newUser = {
        id:        Date.now(),
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        password:  form.password,
        verified:  true, // verified via email code already
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      // Send welcome / verification link email
      await sendVerificationLink(newUser);

      setAlert({
        type: 'success',
        msg:  'Account created! A confirmation email has been sent. You can now log in.',
      });

      setTimeout(() => onSwitch('login'), 2500);

    } catch {
      setAlert({ type: 'error', msg: 'Something went wrong. Please try again.' });
    }

    setLoading(false);
  };

  return (
    <div className="aform">
      <div className="aform__head">
        <h1 className="aform__title">Create account ✨</h1>
        <p className="aform__sub">
          Already have an account?{' '}
          <button onClick={() => onSwitch('login')}>Sign in</button>
        </p>
      </div>

      {alert && (
        <div className={`aform__alert aform__alert--${alert.type}`}>
          {alert.type === 'success' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
          {alert.type === 'error'   && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          {alert.type === 'info'    && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          {alert.msg}
        </div>
      )}

      <div className="aform__fields">
        {/* Name row */}
        <div className="aform__row">
          <div className="aform__field">
            <label className="aform__label">First Name</label>
            <div className={`aform__input-wrap${errors.firstName ? ' aform__input-wrap--err' : ''}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" placeholder="Hira" value={form.firstName}
                onChange={e => set('firstName', e.target.value)} />
            </div>
            {errors.firstName && <span className="aform__err">{errors.firstName}</span>}
          </div>
          <div className="aform__field">
            <label className="aform__label">Last Name</label>
            <div className={`aform__input-wrap${errors.lastName ? ' aform__input-wrap--err' : ''}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" placeholder="Raza" value={form.lastName}
                onChange={e => set('lastName', e.target.value)} />
            </div>
            {errors.lastName && <span className="aform__err">{errors.lastName}</span>}
          </div>
        </div>

        {/* Email with verification */}
        <div className="aform__field">
          <label className="aform__label">Email Address</label>
          <div className="aform__verify-row">
            <div className={`aform__input-wrap
              ${errors.email ? ' aform__input-wrap--err' : ''}
              ${emailStatus === 'verified' ? ' aform__input-wrap--ok' : ''}
            `}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                disabled={emailStatus === 'verified'}
              />
              {emailStatus === 'verified' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
              )}
              {emailStatus === 'checking' && <span className="aform__spinner" style={{ borderTopColor: '#4a8af4', borderColor: '#e4e7f0' }} />}
            </div>
            {emailStatus !== 'verified' && (
              <button
                className="aform__verify-btn"
                onClick={handleVerifyEmail}
                disabled={emailStatus === 'checking' || emailStatus === 'code_sent'}
              >
                {emailStatus === 'checking' ? <><span className="aform__spinner" />Sending</> :
                 emailStatus === 'code_sent' ? 'Sent ✓' : 'Verify'}
              </button>
            )}
          </div>
          {errors.email && <span className="aform__err">{errors.email}</span>}

          {codeStep && (
            <div className="aform__code-box">
              <p className="aform__code-info">
                Enter the 6-digit code sent to <strong>{form.email}</strong>
              </p>
              <div className="aform__code-row">
                <input
                  className="aform__code-input"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={enteredCode}
                  onChange={e => { setEnteredCode(e.target.value); setCodeError(''); }}
                />
                <button className="aform__code-confirm" onClick={handleCheckCode}>Confirm</button>
              </div>
              {codeError && <span className="aform__err">{codeError}</span>}
              <button className="aform__resend" onClick={handleVerifyEmail}>Resend code</button>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="aform__field">
          <label className="aform__label">Password</label>
          <div className={`aform__input-wrap${errors.password ? ' aform__input-wrap--err' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
            />
            <button className="aform__eye-btn" onClick={() => setShowPwd(s => !s)}>
              {showPwd
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
          {errors.password && <span className="aform__err">{errors.password}</span>}
          {form.password && (
            <div className="aform__strength">
              <div className="aform__strength-bars">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`aform__strength-bar${i <= strength ? ` aform__strength-bar--${STRENGTH_COLORS[strength]}` : ''}`} />
                ))}
              </div>
              <span className="aform__strength-label">
                {STRENGTH_LABELS[strength]} password
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="aform__field">
          <label className="aform__label">Confirm Password</label>
          <div className={`aform__input-wrap${errors.confirmPwd ? ' aform__input-wrap--err' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type={showCPwd ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirmPwd}
              onChange={e => set('confirmPwd', e.target.value)}
            />
            <button className="aform__eye-btn" onClick={() => setShowCPwd(s => !s)}>
              {showCPwd
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
          {errors.confirmPwd && <span className="aform__err">{errors.confirmPwd}</span>}
        </div>

        {/* Terms */}
        <label className="aform__terms">
          <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); if (errors.terms) setErrors(er => ({ ...er, terms: '' })); }} />
          I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
        </label>
        {errors.terms && <span className="aform__err">{errors.terms}</span>}
      </div>

      <button
        className={`aform__submit${alert?.type === 'success' ? ' aform__submit--ok' : ''}`}
        onClick={handleSignup}
        disabled={loading || alert?.type === 'success'}
      >
        {loading
          ? <><span className="aform__spinner" /> Creating account...</>
          : alert?.type === 'success'
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg> Account Created!</>
            : 'Create Account'
        }
      </button>
    </div>
  );
}