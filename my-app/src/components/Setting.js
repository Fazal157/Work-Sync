import React, { useState } from 'react';
import './Setting.css';

export default function Setting({ userProfile }) {
  const [saved,  setSaved]  = useState(false);
  const [active, setActive] = useState('general');

  const [general, setGeneral] = useState({
    appName: 'Portfolio Dashboard', language: 'English',
    timezone: 'Asia/Karachi', dateFormat: 'MM/DD/YYYY',
  });

  const [notifs, setNotifs] = useState({
    emailNotifs: true, projectUpdates: true, messageAlerts: true,
    weeklyReport: false, marketingEmails: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light', accentColor: '#4a8af4', fontSize: 'medium', compactMode: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true, showEmail: false, allowMessages: true, twoFactor: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS = [
    { key: 'profile',    label: 'My Profile',     icon: '👤' },
    { key: 'general',    label: 'General',         icon: '⚙' },
    { key: 'notifs',     label: 'Notifications',   icon: '🔔' },
    { key: 'appearance', label: 'Appearance',      icon: '🎨' },
    { key: 'privacy',    label: 'Privacy',         icon: '🔒' },
  ];

  const Toggle = ({ checked, onChange }) => (
    <button
      className={`sett-toggle${checked ? ' sett-toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="sett-toggle-thumb" />
    </button>
  );

  const initials = userProfile
    ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="settpage page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your app preferences and account settings</p>
        </div>
        {active !== 'profile' && (
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
                Save Settings
              </>
            )}
          </button>
        )}
      </div>

      <div className="settpage__layout">
        {/* Tabs */}
        <div className="settpage__tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`settpage__tab${active === t.key ? ' settpage__tab--on' : ''}`}
              onClick={() => setActive(t.key)}
            >
              <span className="settpage__tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settpage__content">

          {/* ── My Profile tab ── */}
          {active === 'profile' && (
            <div className="sett-card">
              <h3 className="sett-card-title">My Profile</h3>

              {!userProfile ? (
                <div className="sett-no-profile">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b2b7ce" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <p>No profile created yet.</p>
                  <span>Go to the <strong>Profile</strong> section from the sidebar to create your profile.</span>
                </div>
              ) : (
                <>
                  {/* Profile header */}
                  <div className="sett-profile-header">
                    <div className="sett-profile-avatar"
                      style={{ background: userProfile.avatarPreview ? 'transparent' : 'linear-gradient(135deg,#f97316,#ec4899)' }}>
                      {userProfile.avatarPreview
                        ? <img src={userProfile.avatarPreview} alt="avatar" />
                        : <span>{initials}</span>
                      }
                    </div>
                    <div className="sett-profile-info">
                      <h3 className="sett-profile-name">
                        {userProfile.firstName} {userProfile.lastName}
                      </h3>
                      <p className="sett-profile-role">{userProfile.role}</p>
                      <p className="sett-profile-company">{userProfile.company}</p>
                      {userProfile.emailVerified && (
                        <span className="sett-verified-badge">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                          Email Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile details grid */}
                  <div className="sett-profile-grid">

                    <div className="sett-profile-field">
                      <span className="sett-profile-lbl">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        Email
                      </span>
                      <span className="sett-profile-val">{userProfile.email || '—'}</span>
                    </div>

                    <div className="sett-profile-field">
                      <span className="sett-profile-lbl">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.42 2 2 0 0 1 3.57 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Phone
                      </span>
                      <span className="sett-profile-val">{userProfile.phone || '—'}</span>
                    </div>

                    <div className="sett-profile-field">
                      <span className="sett-profile-lbl">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        Company
                      </span>
                      <span className="sett-profile-val">{userProfile.company || '—'}</span>
                    </div>

                    <div className="sett-profile-field">
                      <span className="sett-profile-lbl">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        Location
                      </span>
                      <span className="sett-profile-val">
                        {[userProfile.city, userProfile.country].filter(Boolean).join(', ') || '—'}
                      </span>
                    </div>

                    <div className="sett-profile-field">
                      <span className="sett-profile-lbl">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        Website
                      </span>
                      <span className="sett-profile-val">
                        {userProfile.website
                          ? <a href={userProfile.website} target="_blank" rel="noreferrer">{userProfile.website}</a>
                          : '—'}
                      </span>
                    </div>

                    <div className="sett-profile-field">
                      <span className="sett-profile-lbl">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                        Member Since
                      </span>
                      <span className="sett-profile-val">
                        {userProfile.savedAt
                          ? new Date(userProfile.savedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </span>
                    </div>

                  </div>

                  {/* Bio */}
                  {userProfile.bio && (
                    <div className="sett-profile-bio">
                      <span className="sett-profile-lbl">Bio</span>
                      <p>{userProfile.bio}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* General */}
          {active === 'general' && (
            <div className="sett-card">
              <h3 className="sett-card-title">General Settings</h3>
              <div className="sett-row">
                <div className="sett-field">
                  <label>App Name</label>
                  <input type="text" value={general.appName}
                    onChange={e => setGeneral(p => ({ ...p, appName: e.target.value }))} />
                </div>
                <div className="sett-field">
                  <label>Language</label>
                  <select value={general.language}
                    onChange={e => setGeneral(p => ({ ...p, language: e.target.value }))}>
                    <option>English</option>
                    <option>Urdu</option>
                    <option>Arabic</option>
                    <option>French</option>
                  </select>
                </div>
              </div>
              <div className="sett-row">
                <div className="sett-field">
                  <label>Timezone</label>
                  <select value={general.timezone}
                    onChange={e => setGeneral(p => ({ ...p, timezone: e.target.value }))}>
                    <option>Asia/Karachi</option>
                    <option>UTC</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                  </select>
                </div>
                <div className="sett-field">
                  <label>Date Format</label>
                  <select value={general.dateFormat}
                    onChange={e => setGeneral(p => ({ ...p, dateFormat: e.target.value }))}>
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {active === 'notifs' && (
            <div className="sett-card">
              <h3 className="sett-card-title">Notification Preferences</h3>
              {[
                { key: 'emailNotifs',     label: 'Email Notifications',  desc: 'Receive notifications via email' },
                { key: 'projectUpdates',  label: 'Project Updates',       desc: 'Get notified when projects change' },
                { key: 'messageAlerts',   label: 'Message Alerts',        desc: 'Alerts for new client messages' },
                { key: 'weeklyReport',    label: 'Weekly Report',         desc: 'Summary email every Monday' },
                { key: 'marketingEmails', label: 'Marketing Emails',      desc: 'Product updates and offers' },
              ].map(item => (
                <div key={item.key} className="sett-toggle-row">
                  <div>
                    <p className="sett-toggle-label">{item.label}</p>
                    <p className="sett-toggle-desc">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={notifs[item.key]}
                    onChange={v => setNotifs(p => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Appearance */}
          {active === 'appearance' && (
            <div className="sett-card">
              <h3 className="sett-card-title">Appearance</h3>
              <div className="sett-field">
                <label>Theme</label>
                <div className="sett-theme-btns">
                  {['light', 'dark', 'system'].map(t => (
                    <button key={t}
                      className={`sett-theme-btn${appearance.theme === t ? ' sett-theme-btn--on' : ''}`}
                      onClick={() => setAppearance(p => ({ ...p, theme: t }))}>
                      {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'}
                      &nbsp;{t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sett-field">
                <label>Accent Color</label>
                <div className="sett-colors">
                  {['#4a8af4','#22c55e','#f97316','#ec4899','#a855f7','#eab308'].map(c => (
                    <button key={c}
                      className={`sett-color-btn${appearance.accentColor === c ? ' sett-color-btn--on' : ''}`}
                      style={{ background: c }}
                      onClick={() => setAppearance(p => ({ ...p, accentColor: c }))}
                    />
                  ))}
                </div>
              </div>
              <div className="sett-field">
                <label>Font Size</label>
                <select value={appearance.fontSize}
                  onChange={e => setAppearance(p => ({ ...p, fontSize: e.target.value }))}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="sett-toggle-row">
                <div>
                  <p className="sett-toggle-label">Compact Mode</p>
                  <p className="sett-toggle-desc">Reduce spacing for more content</p>
                </div>
                <Toggle
                  checked={appearance.compactMode}
                  onChange={v => setAppearance(p => ({ ...p, compactMode: v }))}
                />
              </div>
            </div>
          )}

          {/* Privacy */}
          {active === 'privacy' && (
            <div className="sett-card">
              <h3 className="sett-card-title">Privacy & Security</h3>
              {[
                { key: 'profileVisible', label: 'Public Profile',  desc: 'Make your profile visible to others' },
                { key: 'showEmail',      label: 'Show Email',       desc: 'Display email on public profile' },
                { key: 'allowMessages', label: 'Allow Messages',   desc: 'Let anyone send you messages' },
                { key: 'twoFactor',     label: 'Two-Factor Auth',  desc: 'Extra security for your account' },
              ].map(item => (
                <div key={item.key} className="sett-toggle-row">
                  <div>
                    <p className="sett-toggle-label">{item.label}</p>
                    <p className="sett-toggle-desc">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={privacy[item.key]}
                    onChange={v => setPrivacy(p => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
              <div className="sett-danger-zone">
                <h4>Danger Zone</h4>
                <button className="sett-danger-btn"
                  onClick={() => { localStorage.removeItem('userProfile'); window.location.reload(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {saved && active !== 'profile' && (
            <div className="sett-saved">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
              Settings saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}