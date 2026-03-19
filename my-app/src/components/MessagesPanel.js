import React, { useState } from 'react';
import MessageItem from './MessageItem';
import './MessagesPanel.css';

export default function MessagesPanel({ messages, onStar }) {
  const [activeId, setActiveId]     = useState(2);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const [filter, setFilter]         = useState('all');

  const filtered = messages.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchVal.toLowerCase()) || m.message.toLowerCase().includes(searchVal.toLowerCase());
    const matchFilter = filter === 'starred' ? m.starred : true;
    return matchSearch && matchFilter;
  });

  return (
    <aside className="messages">
      <div className="messages__header">
        <h2 className="messages__title">Client Messages</h2>
        <div className="messages__actions">
          <button className={`messages__icon-btn${searchOpen ? ' messages__icon-btn--on' : ''}`}
            onClick={() => { setSearchOpen(o => !o); setSearchVal(''); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button className={`messages__icon-btn${filter === 'starred' ? ' messages__icon-btn--on' : ''}`}
            onClick={() => setFilter(f => f === 'starred' ? 'all' : 'starred')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={filter === 'starred' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="messages__search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input autoFocus type="text" placeholder="Search messages..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          {searchVal && <button onClick={() => setSearchVal('')}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
        </div>
      )}

      <div className="messages__tabs">
        <button className={`messages__tab${filter === 'all' ? ' messages__tab--on' : ''}`} onClick={() => setFilter('all')}>
          All <span className="messages__tab-badge">{messages.length}</span>
        </button>
        <button className={`messages__tab${filter === 'starred' ? ' messages__tab--on' : ''}`} onClick={() => setFilter('starred')}>
          Starred <span className="messages__tab-badge">{messages.filter(m => m.starred).length}</span>
        </button>
      </div>

      <div className="messages__list">
        {filtered.length === 0 ? (
          <div className="messages__empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p>No messages found</p>
          </div>
        ) : (
          filtered.map(msg => (
            <MessageItem key={msg.id} message={msg} active={activeId === msg.id} onSelect={setActiveId} onStar={onStar} />
          ))
        )}
      </div>

      <div className="messages__footer">
        <button className="messages__compose-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Message
        </button>
      </div>
    </aside>
  );
}