import React, { useState }           from 'react';
import { useGoogleLogin }             from '@react-oauth/google';
import { auth, db,
         signInWithEmailAndPassword,
         googleProvider,
         signInWithPopup,
         doc, setDoc, getDoc }        from '../firebase';

export default function LoginForm({ onSwitch, onSuccess }) {
  const [form,          setForm]          = useState({ email: '', password: '' });
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [showPwd,       setShowPwd]       = useState(false);
  const [alert,         setAlert]         = useState(null);
  const [socialLoading, setSocialLoading] = useState('');

  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    if (errors[f]) setErrors(e => ({ ...e, [f]: '' }));
    setAlert(null);
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password.trim()) e.password = 'Password is required';
    return e;
  };

  /* ── Save user session and redirect ── */
  const saveAndLogin = (user) => {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    setAlert({ type: 'success', msg: `Welcome, ${user.firstName}! Redirecting...` });
    setTimeout(() => onSuccess(user), 1000);
  };

  /* ── Email / Password login via Firebase ── */
  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);

    try {
      // Firebase Auth — works on ALL devices
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      // Get user profile from Firestore
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      const user = snap.exists()
        ? { ...snap.data(), uid: cred.user.uid }
        : {
            uid:       cred.user.uid,
            email:     cred.user.email,
            firstName: cred.user.displayName?.split(' ')[0] || '',
            lastName:  cred.user.displayName?.split(' ')[1] || '',
          };

      saveAndLogin(user);

    } catch (err) {
      if (
        err.code === 'auth/user-not-found'     ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-email'
      ) {
        setAlert({ type: 'error', msg: 'No account found. Please sign up first.' });
      } else if (err.code === 'auth/wrong-password') {
        setErrors({ password: 'Incorrect password.' });
      } else if (err.code === 'auth/too-many-requests') {
        setAlert({ type: 'error', msg: 'Too many attempts. Please try again later.' });
      } else {
        setAlert({ type: 'error', msg: `Login failed: ${err.message}` });
      }
    }
    setLoading(false);
  };

  /* ── Google login via Firebase ── */
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setSocialLoading('google');
      try {
        // Get Google user info
        const res  = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const info = await res.json();

        // Sign in with Firebase Google provider
        const cred = await signInWithPopup(auth, googleProvider);

        // Check if user already exists in Firestore
        const snap = await getDoc(doc(db, 'users', cred.user.uid));

        if (!snap.exists()) {
          // New Google user — save to Firestore
          await setDoc(doc(db, 'users', cred.user.uid), {
            uid:           cred.user.uid,
            firstName:     info.given_name   || '',
            lastName:      info.family_name  || '',
            email:         info.email,
            avatarPreview: info.picture      || null,
            verified:      true,
            provider:      'google',
            createdAt:     new Date().toISOString(),
          });
        }

        const user = snap.exists()
          ? { ...snap.data(), uid: cred.user.uid }
          : {
              uid:           cred.user.uid,
              firstName:     info.given_name  || '',
              lastName:      info.family_name || '',
              email:         info.email,
              avatarPreview: info.picture     || null,
            };

        saveAndLogin(user);

      } catch (err) {
        setAlert({ type: 'error', msg: 'Google sign-in failed. Please try again.' });
        console.error('Google login error:', err);
      }
      setSocialLoading('');
    },
    onError: () => {
      setAlert({ type: 'error', msg: 'Google sign-in was cancelled.' });
      setSocialLoading('');
    },
  });

  /* ── Facebook login using SDK ── */
  const handleFacebookLogin = () => {
    setSocialLoading('facebook');

    if (!window.FB) {
      setAlert({ type: 'error', msg: 'Facebook SDK not loaded. Please refresh and try again.' });
      setSocialLoading('');
      return;
    }

    window.FB.login((response) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo) => {
          if (!userInfo || userInfo.error || !userInfo.email) {
            setAlert({
              type: 'error',
              msg:  'Could not get email from Facebook. Please enable email permission.',
            });
            setSocialLoading('');
            return;
          }

          try {
            // Check if user exists in Firestore by email
            const nameParts = (userInfo.name || '').split(' ');
            const fbUser = {
              uid:           `fb_${userInfo.id}`,
              firstName:     nameParts[0]                 || '',
              lastName:      nameParts.slice(1).join(' ') || '',
              email:         userInfo.email,
              avatarPreview: userInfo.picture?.data?.url  || null,
              verified:      true,
              provider:      'facebook',
              createdAt:     new Date().toISOString(),
            };

            // Save to Firestore if new
            const snap = await getDoc(doc(db, 'users', fbUser.uid));
            if (!snap.exists()) {
              await setDoc(doc(db, 'users', fbUser.uid), fbUser);
            }

            const user = snap.exists()
              ? { ...snap.data(), uid: fbUser.uid }
              : fbUser;

            saveAndLogin(user);

          } catch (err) {
            setAlert({ type: 'error', msg: 'Facebook login failed. Please try again.' });
          }
          setSocialLoading('');
        });
      } else {
        setAlert({ type: 'error', msg: 'Facebook login was cancelled.' });
        setSocialLoading('');
      }
    }, { scope: 'public_profile,email' });
  };

  return (
    <div className="aform">
      <div className="aform__head">
        <h1 className="aform__title">TrackForge ֎🇦🇮</h1>
        <p className="aform__sub">
          Don't have an account?{' '}
          <button onClick={() => onSwitch('signup')}>Sign up free</button>
        </p>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`aform__alert aform__alert--${alert.type}`}>
          {alert.type === 'success'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {alert.msg}
        </div>
      )}

      {/* ── Social Buttons ── */}
      <div className="aform__socials">

        {/* Google */}
        <button
          className="aform__social-btn aform__social-btn--google"
          onClick={() => handleGoogleLogin()}
          disabled={!!socialLoading || loading}
        >
          {socialLoading === 'google' ? (
            <span className="aform__spinner aform__spinner--dark" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Facebook */}
        <button
          className="aform__social-btn aform__social-btn--facebook"
          onClick={handleFacebookLogin}
          disabled={!!socialLoading || loading}
        >
          {socialLoading === 'facebook' ? (
            <span className="aform__spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          Continue with Facebook
        </button>
      </div>

      <div className="aform__divider">or sign in with email</div>

      {/* ── Email fields ── */}
      <div className="aform__fields">

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
              value={form.email}
              onChange={e => set('email', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {errors.email && <span className="aform__err">{errors.email}</span>}
        </div>

        <div className="aform__field">
          <label className="aform__label">
            Password
            <button className="aform__label-link" onClick={() => onSwitch('forgot')}>
              Forgot password?
            </button>
          </label>
          <div className={`aform__input-wrap${errors.password ? ' aform__input-wrap--err' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button className="aform__eye-btn" onClick={() => setShowPwd(s => !s)}>
              {showPwd
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
          {errors.password && <span className="aform__err">{errors.password}</span>}
        </div>
      </div>

      {/* Submit */}
      <button
        className="aform__submit"
        onClick={handleLogin}
        disabled={loading || !!socialLoading}
      >
        {loading
          ? <><span className="aform__spinner" /> Signing in...</>
          : 'Sign In with Email'
        }
      </button>
    </div>
  );
}