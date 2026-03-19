import emailjs from '@emailjs/browser';
import React, { useState } from 'react';
import './Profile.css';

const INIT = {
  firstName: '', lastName: '', email: '', phone: '',
  role: '', company: '', website: '', bio: '',
  city: '', country: '', avatar: null, avatarPreview: null,
};

export default function Profile({ onProfileSave }) {
  const [form,        setForm]        = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : INIT;
  });
  const [errors,      setErrors]      = useState({});
  const [saved,       setSaved]       = useState(false);
  const [emailStatus, setEmailStatus] = useState('idle');
  const [verifyCode,  setVerifyCode]  = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeStep,    setCodeStep]    = useState(false);
  const [codeError,   setCodeError]   = useState('');

  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    if (errors[f]) setErrors(e => ({ ...e, [f]: '' }));
    setSaved(false);
    if (f === 'email') {
      setEmailStatus('idle');
      setCodeStep(false);
      setEnteredCode('');
      setCodeError('');
    }
  };

  /* ── Email verification ── */
  const handleVerifyEmail = async () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.email)) {
      setErrors(e => ({ ...e, email: 'Enter a valid email first' }));
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

    } catch (err) {
      console.error('EmailJS error:', err);
      setEmailStatus('idle');
      setErrors(e => ({
        ...e,
        email: 'Failed to send code. Please check your email and try again.',
      }));
    }
  };

  /* ── Check entered code ── */
  const handleCheckCode = () => {
    if (enteredCode === verifyCode) {
      setEmailStatus('verified');
      setCodeStep(false);
      setCodeError('');
    } else {
      setCodeError('Incorrect code. Please try again.');
    }
  };

  /* ── Avatar ── */
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(p => ({ ...p, avatarPreview: ev.target.result }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.email.trim())     e.email     = 'Required';
    else if (emailStatus !== 'verified') e.email = 'Please verify your email first';
    if (!form.role.trim())      e.role      = 'Required';
    return e;
  };

  /* ── Save ── */
  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const profileData = {
      ...form,
      emailVerified: true,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem('userProfile', JSON.stringify(profileData));

    if (onProfileSave) onProfileSave(profileData);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase() || 'HR';

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">Manage your personal information and account details</p>
        </div>
        <button
          className={`page-save-btn${saved ? ' page-save-btn--ok' : ''}`}
          onClick={handleSave}
        >
          {saved ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
              Saved!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
              Save Profile
            </>
          )}
        </button>
      </div>

      <div className="profile-grid">

        {/* ── Avatar card ── */}
        <div className="profile-card profile-card--avatar">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar"
              style={{ background: form.avatarPreview ? 'transparent' : 'linear-gradient(135deg,#f97316,#ec4899)' }}>
              {form.avatarPreview
                ? <img src={form.avatarPreview} alt="avatar" />
                : <span>{initials}</span>
              }
            </div>
            <label className="profile-avatar-upload" title="Upload photo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <input type="file" accept="image/*" onChange={handleAvatar} hidden />
            </label>
          </div>

          <p className="profile-avatar-name">
            {form.firstName || form.lastName
              ? `${form.firstName} ${form.lastName}`
              : 'Your Name'}
          </p>
          <p className="profile-avatar-role">{form.role || 'Your Role'}</p>
          <p className="profile-avatar-company">{form.company || 'Your Company'}</p>

          <div className={`profile-email-badge${emailStatus === 'verified' ? ' profile-email-badge--ok' : ''}`}>
            {emailStatus === 'verified' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Email Verified
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Email Not Verified
              </>
            )}
          </div>

          <div className="profile-mini-stats">
            <div className="profile-mini-stat">
              <span className="profile-mini-val">24</span>
              <span className="profile-mini-lbl">Projects</span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-val">12</span>
              <span className="profile-mini-lbl">Clients</span>
            </div>
            <div className="profile-mini-stat">
              <span className="profile-mini-val">98%</span>
              <span className="profile-mini-lbl">Rating</span>
            </div>
          </div>
        </div>

        {/* ── Form card ── */}
        <div className="profile-card profile-card--form">
          <h3 className="profile-section-title">Personal Information</h3>

          <div className="profile-row">
            <div className={`profile-field${errors.firstName ? ' profile-field--err' : ''}`}>
              <label>First Name <span>*</span></label>
              <div className="profile-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input type="text" placeholder="e.g. Hira" value={form.firstName}
                  onChange={e => set('firstName', e.target.value)} />
              </div>
              {errors.firstName && <span className="profile-err">{errors.firstName}</span>}
            </div>

            <div className={`profile-field${errors.lastName ? ' profile-field--err' : ''}`}>
              <label>Last Name <span>*</span></label>
              <div className="profile-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input type="text" placeholder="e.g. Raza" value={form.lastName}
                  onChange={e => set('lastName', e.target.value)} />
              </div>
              {errors.lastName && <span className="profile-err">{errors.lastName}</span>}
            </div>
          </div>

          {/* ── Email with verification ── */}
          <div className={`profile-field${errors.email ? ' profile-field--err' : ''}`}>
            <label>Email Address <span>*</span></label>
            <div className="profile-email-row">
              <div className={`profile-input-icon profile-input-icon--email
                ${emailStatus === 'verified' ? ' profile-input-icon--verified' : ''}
                ${emailStatus === 'invalid'  ? ' profile-input-icon--invalid'  : ''}
              `}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="hira@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  disabled={emailStatus === 'verified'}
                />
                {emailStatus === 'verified' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                )}
                {emailStatus === 'checking' && (
                  <span className="profile-spinner" />
                )}
              </div>

              {emailStatus !== 'verified' && (
                <button
                  className="profile-verify-btn"
                  onClick={handleVerifyEmail}
                  disabled={emailStatus === 'checking' || emailStatus === 'code_sent'}
                >
                  {emailStatus === 'checking' ? 'Sending...' :
                   emailStatus === 'code_sent' ? 'Code Sent ✓' : 'Verify Email'}
                </button>
              )}
            </div>
            {errors.email && <span className="profile-err">{errors.email}</span>}

            {/* Code input step */}
            {codeStep && (
              <div className="profile-code-box">
                <p className="profile-code-info">
                  Enter the 6-digit code sent to <strong>{form.email}</strong>
                </p>
                <div className="profile-code-row">
                  <input
                    className="profile-code-input"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={enteredCode}
                    onChange={e => { setEnteredCode(e.target.value); setCodeError(''); }}
                  />
                  <button className="profile-code-btn" onClick={handleCheckCode}>
                    Confirm
                  </button>
                </div>
                {codeError && <span className="profile-err">{codeError}</span>}
                <button className="profile-resend-btn" onClick={handleVerifyEmail}>
                  Resend code
                </button>
              </div>
            )}
          </div>

          <div className="profile-row">
            <div className="profile-field">
              <label>Phone Number</label>
              <div className="profile-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.42 2 2 0 0 1 3.57 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input type="tel" placeholder="+1 234 567 890" value={form.phone}
                  onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            <div className={`profile-field${errors.role ? ' profile-field--err' : ''}`}>
              <label>Job Role <span>*</span></label>
              <div className="profile-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <input type="text" placeholder="e.g. UI/UX Designer" value={form.role}
                  onChange={e => set('role', e.target.value)} />
              </div>
              {errors.role && <span className="profile-err">{errors.role}</span>}
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-field">
              <label>Company</label>
              <div className="profile-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <input type="text" placeholder="e.g. Design Studio" value={form.company}
                  onChange={e => set('company', e.target.value)} />
              </div>
            </div>

            <div className="profile-field">
              <label>City</label>
              <div className="profile-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <input type="text" placeholder="e.g. Lahore" value={form.city}
                  onChange={e => set('city', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-field">
              <label>Country</label>
              <div className="profile-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <input type="text" placeholder="e.g. Pakistan" value={form.country}
                  onChange={e => set('country', e.target.value)} />
              </div>
            </div>

            <div className="profile-field">
              <label>Website / Portfolio</label>
              <div className="profile-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <input type="url" placeholder="https://yourportfolio.com" value={form.website}
                  onChange={e => set('website', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="profile-field">
            <label>Bio</label>
            <textarea
              rows={3}
              placeholder="Tell clients about yourself and your expertise..."
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
            />
          </div>

          {saved && (
            <div className="profile-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Profile saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}