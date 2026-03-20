import React, { useState } from 'react';
import LoginForm    from './LoginForm';
import SignupForm   from './SignupForm';
import ForgotForm   from './ForgotForm';
import './AuthPage.css';

export default function AuthPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // login | signup | forgot

  return (
    <div className="auth-page">
      {/* Left — branding panel */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <div className="auth-brand-logo">TrackForge</div>
          <h1 className="auth-brand-name">Build.Track.Deliver</h1>
          <p className="auth-brand-tagline">Manage your projects & clients in one place</p>
        </div>
        <div className="auth-features">
          {[
            { icon: '📁', title: 'Project Management',  desc: 'Track all your projects with deadlines and progress' },
            { icon: '💬', title: 'Client Messages',     desc: 'Stay connected with your clients in real time' },
            { icon: '📅', title: 'Smart Calendar',      desc: 'Never miss a deadline with smart scheduling' },
            { icon: '📊', title: 'Activity History',    desc: 'Full audit trail of all your project activities' },
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <span className="auth-feature-icon">{f.icon}</span>
              <div>
                <p className="auth-feature-title">{f.title}</p>
                <p className="auth-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="auth-copy">© 2025 Portfolio Dashboard. All rights reserved.</p>
      </div>

      {/* Right — form panel */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          {mode === 'login'  && <LoginForm  onSwitch={setMode} onSuccess={onLoginSuccess} />}
          {mode === 'signup' && <SignupForm onSwitch={setMode} />}
          {mode === 'forgot' && <ForgotForm onSwitch={setMode} />}
        </div>
      </div>
    </div>
  );
}