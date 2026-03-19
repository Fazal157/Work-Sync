import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

export default function Header({ onMenuClick, onAddProject, userProfile }) {
  const [searchVal,   setSearchVal]   = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const getTimeAgo = (date) => {
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)      return 'Just now';
    if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800)  return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
    if (diff < 31536000)return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
  };

  const notifs = [
    { id: 1, text: 'New message from David',       date: new Date(Date.now() - 2  * 60 * 1000),           dot: '#4a8af4' },
    { id: 2, text: 'Project deadline in 2 days',   date: new Date(Date.now() - 1  * 60 * 60 * 1000),      dot: '#f97316' },
    { id: 3, text: 'Stephanie approved your work', date: new Date(Date.now() - 3  * 60 * 60 * 1000),      dot: '#22c55e' },
    { id: 4, text: 'New project assigned to you',  date: new Date(Date.now() - 1  * 24 * 60 * 60 * 1000), dot: '#a855f7' },
  ];

  // ── Derive display values from saved profile or fallback to defaults ──
  const displayName    = userProfile
    ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
    : 'Fazal R';

  const displayRole    = userProfile?.role      || 'Full Stack Developer';
  const displayAvatar  = userProfile?.avatarPreview || null;
  const displayInitials = userProfile
    ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase() || 'FR'
    : 'FR';

  return (
    <header className="header">

      {/* Left — hamburger + logo */}
      <div className="header__left">
        <button className="header__hamburger" onClick={onMenuClick} aria-label="Open sidebar">
          <span /><span /><span />
        </button>
        <h1 className="header__logo">Portfolio</h1>
      </div>

      {/* Center — search */}
      <div className={`header__search${searchFocus ? ' header__search--focused' : ''}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search projects, clients..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
        />
        {searchVal && (
          <button onClick={() => setSearchVal('')} aria-label="Clear">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Right */}
      <div className="header__right">

        {/* + Add button */}
        <button className="header__add-btn" onClick={onAddProject} title="Add new project">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {/* Bell notification */}
        <div className="header__notif" ref={notifRef}>
          <button
            className={`header__notif-btn${notifOpen ? ' header__notif-btn--open' : ''}`}
            onClick={() => setNotifOpen(o => !o)}
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="header__notif-badge" aria-label="4 notifications" />
          </button>

          {notifOpen && (
            <div className="header__notif-dropdown">
              <div className="header__notif-head">
                <span>Notifications</span>
                <button onClick={() => setNotifOpen(false)}>Mark all read</button>
              </div>
              {notifs.map(n => (
                <div key={n.id} className="header__notif-item">
                  <span className="header__notif-dot" style={{ background: n.dot }} />
                  <span className="header__notif-text">{n.text}</span>
                  <span className="header__notif-time">{getTimeAgo(n.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header__divider" />

        {/* User — connected to profile */}
        <div className="header__user">
          <div
            className="header__avatar"
            style={{
              background: displayAvatar
                ? 'transparent'
                : 'linear-gradient(135deg, #f97316, #ec4899)',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              displayInitials
            )}
          </div>
          <div className="header__user-info">
            <span className="header__user-name">{displayName}</span>
            <span className="header__user-role">{displayRole}</span>
          </div>
        </div>

      </div>
    </header>
  );
}