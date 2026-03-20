import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

export default function ForgotForm({ onSwitch }) {
  const [step,        setStep]        = useState('email'); // email | code | newpwd | done
  const [email,       setEmail]       = useState('');
  const [code,        setCode]        = useState('');
  const [sentCode,    setSentCode]    = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState({});
  const [alert,       setAlert]       = useState(null);

  /* ── Step 1: Send reset code ── */
  const handleSendCode = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Enter a valid email address' });
      return;
    }

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user  = users.find(u => u.email === email);

    if (!user) {
      setErrors({ email: 'No account found with this email address.' });
      return;
    }

    setLoading(true);
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(resetCode);

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          to_name:  user.firstName || 'User',
          code:     resetCode,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );

      setStep('code');
      setAlert({ type: 'info', msg: `Reset code sent to ${email}` });

    } catch {
      setErrors({ email: 'Failed to send reset code. Please try again.' });
    }
    setLoading(false);
  };

  /* ── Step 2: Verify code ── */
  const handleVerifyCode = () => {
    if (!code.trim()) { setErrors({ code: 'Enter the verification code' }); return; }
    if (code !== sentCode) { setErrors({ code: 'Incorrect code. Please try again.' }); return; }
    setErrors({});
    setAlert(null);
    setStep('newpwd');
  };

  /* ── Step 3: Set new password ── */
  const handleResetPassword = () => {
    const e = {};
    if (!newPwd)             e.newPwd     = 'Enter a new password';
    else if (newPwd.length < 8) e.newPwd  = 'Minimum 8 characters';
    if (newPwd !== confirmPwd)  e.confirmPwd = 'Passwords do not match';
    if (Object.keys(e).length) { setErrors(e); return; }

    // Update password in localStorage
    const users   = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updated = users.map(u => u.email === email ? { ...u, password: newPwd } : u);
    localStorage.setItem('registeredUsers', JSON.stringify(updated));

    setStep('done');
    setAlert({ type: 'success', msg: 'Password reset successful! You can now log in.' });
  };

  return (
    <div className="aform">
      <div className="aform__head">
        <div style={{ fontSize: 36, marginBottom: 4 }}>
          {step === 'done' ? '✅' : '🔐'}
        </div>
        <h1 className="aform__title">
          {step === 'email'  && 'Forgot password?'}
          {step === 'code'   && 'Check your email'}
          {step === 'newpwd' && 'Create new password'}
          {step === 'done'   && 'Password reset!'}
        </h1>
        <p className="aform__sub">
          {step === 'email'  && 'Enter your email and we\'ll send a reset code.'}
          {step === 'code'   && <>Enter the 6-digit code sent to <strong>{email}</strong></>}
          {step === 'newpwd' && 'Choose a strong new password for your account.'}
          {step === 'done'   && 'Your password has been reset successfully.'}
        </p>
      </div>

      {alert && (
        <div className={`aform__alert aform__alert--${alert.type}`}>
          {alert.type === 'success' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
          {alert.type === 'info'    && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
          {alert.msg}
        </div>
      )}

      {/* Step indicator */}
      {step !== 'done' && (
        <div style={{ display: 'flex', gap: 6 }}>
          {['email', 'code', 'newpwd'].map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: ['email','code','newpwd'].indexOf(step) >= i ? '#4a8af4' : '#f0f2f8',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
      )}

      <div className="aform__fields">

        {/* ── Step 1: Email ── */}
        {step === 'email' && (
          <div className="aform__field">
            <label className="aform__label">Email Address</label>
            <div className={`aform__input-wrap${errors.email ? ' aform__input-wrap--err' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors({}); }}
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
              />
            </div>
            {errors.email && <span className="aform__err">{errors.email}</span>}
          </div>
        )}

        {/* ── Step 2: Code ── */}
        {step === 'code' && (
          <div className="aform__field">
            <label className="aform__label">Verification Code</label>
            <div className={`aform__input-wrap${errors.code ? ' aform__input-wrap--err' : ''}`}
              style={{ justifyContent: 'center' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => { setCode(e.target.value); setErrors({}); }}
                style={{ textAlign: 'center', letterSpacing: 8, fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif" }}
                onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
              />
            </div>
            {errors.code && <span className="aform__err">{errors.code}</span>}
            <button
              className="aform__resend"
              onClick={() => { setStep('email'); setCode(''); setAlert(null); setErrors({}); }}
            >
              ← Use different email
            </button>
            <button className="aform__resend" onClick={handleSendCode} style={{ marginTop: 4 }}>
              Resend code
            </button>
          </div>
        )}

        {/* ── Step 3: New password ── */}
        {step === 'newpwd' && (
          <>
            <div className="aform__field">
              <label className="aform__label">New Password</label>
              <div className={`aform__input-wrap${errors.newPwd ? ' aform__input-wrap--err' : ''}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={newPwd}
                  onChange={e => { setNewPwd(e.target.value); setErrors({}); }}
                />
                <button className="aform__eye-btn" onClick={() => setShowPwd(s => !s)}>
                  {showPwd
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.newPwd && <span className="aform__err">{errors.newPwd}</span>}
            </div>

            <div className="aform__field">
              <label className="aform__label">Confirm New Password</label>
              <div className={`aform__input-wrap${errors.confirmPwd ? ' aform__input-wrap--err' : ''}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPwd}
                  onChange={e => { setConfirmPwd(e.target.value); setErrors({}); }}
                />
              </div>
              {errors.confirmPwd && <span className="aform__err">{errors.confirmPwd}</span>}
            </div>
          </>
        )}
      </div>

      {/* Buttons */}
      {step === 'email' && (
        <button className="aform__submit" onClick={handleSendCode} disabled={loading}>
          {loading ? <><span className="aform__spinner" /> Sending...</> : 'Send Reset Code'}
        </button>
      )}

      {step === 'code' && (
        <button className="aform__submit" onClick={handleVerifyCode}>
          Verify Code
        </button>
      )}

      {step === 'newpwd' && (
        <button className="aform__submit" onClick={handleResetPassword}>
          Reset Password
        </button>
      )}

      {step === 'done' && (
        <button className="aform__submit aform__submit--ok" onClick={() => onSwitch('login')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
          Go to Login
        </button>
      )}

      {step !== 'done' && (
        <p className="aform__sub" style={{ textAlign: 'center' }}>
          Remember your password?{' '}
          <button onClick={() => onSwitch('login')}>Sign in</button>
        </p>
      )}
    </div>
  );
}