import React, { useState } from 'react';
import './Message.css';

export default function Message({ messages = [], onStar }) {
  const [activeId,  setActiveId]  = useState(2);
  const [compose,   setCompose]   = useState(false);
  const [newMsg,    setNewMsg]    = useState({ to: '', subject: '', body: '' });
  const [sent,      setSent]      = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filter,    setFilter]    = useState('all');

  const active = messages.find(m => m.id === activeId);

  const filtered = messages.filter(m => {
    const matchSearch =
      m.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      m.message.toLowerCase().includes(searchVal.toLowerCase());
    const matchFilter = filter === 'starred' ? m.starred : true;
    return matchSearch && matchFilter;
  });

  const handleSend = () => {
    if (!newMsg.to || !newMsg.body) return;
    setSent(true);
    setNewMsg({ to: '', subject: '', body: '' });
    setTimeout(() => { setSent(false); setCompose(false); }, 2000);
  };

  return (
    <div className="msgpage">
      {/* Left — list */}
      <div className="msgpage__list-col">
        <div className="msgpage__list-head">
          <h2 className="msgpage__list-title">Messages</h2>
          <button className="msgpage__compose-btn" onClick={() => setCompose(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Compose
          </button>
        </div>

        <div className="msgpage__search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search messages..." value={searchVal}
            onChange={e => setSearchVal(e.target.value)} />
        </div>

        <div className="msgpage__tabs">
          <button className={`msgpage__tab${filter === 'all' ? ' msgpage__tab--on' : ''}`}
            onClick={() => setFilter('all')}>
            All <span>{messages.length}</span>
          </button>
          <button className={`msgpage__tab${filter === 'starred' ? ' msgpage__tab--on' : ''}`}
            onClick={() => setFilter('starred')}>
            Starred <span>{messages.filter(m => m.starred).length}</span>
          </button>
        </div>

        <div className="msgpage__items">
          {filtered.map(m => (
            <div key={m.id}
              className={`msgpage__item${activeId === m.id ? ' msgpage__item--on' : ''}`}
              onClick={() => setActiveId(m.id)}>
              <div className="msgpage__item-av" style={{ background: m.avatarColor }}>{m.initials}</div>
              <div className="msgpage__item-body">
                <div className="msgpage__item-row">
                  <span className="msgpage__item-name">{m.name}</span>
                  <span className="msgpage__item-date">{m.date}</span>
                </div>
                <p className="msgpage__item-text">{m.message}</p>
              </div>
              <button
                className={`msgpage__item-star${m.starred ? ' msgpage__item-star--on' : ''}`}
                onClick={e => { e.stopPropagation(); onStar(m.id); }}>
                <svg width="13" height="13" viewBox="0 0 24 24"
                  fill={m.starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right — detail / compose */}
      <div className="msgpage__detail-col">
        {compose ? (
          <div className="msgpage__compose">
            <div className="msgpage__compose-head">
              <h3>New Message</h3>
              <button onClick={() => setCompose(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="msgpage__compose-body">
              <div className="msgpage__compose-field">
                <label>To</label>
                <input placeholder="Recipient name or email" value={newMsg.to}
                  onChange={e => setNewMsg(p => ({ ...p, to: e.target.value }))} />
              </div>
              <div className="msgpage__compose-field">
                <label>Subject</label>
                <input placeholder="Message subject" value={newMsg.subject}
                  onChange={e => setNewMsg(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div className="msgpage__compose-field msgpage__compose-field--grow">
                <label>Message</label>
                <textarea placeholder="Write your message here..."
                  value={newMsg.body}
                  onChange={e => setNewMsg(p => ({ ...p, body: e.target.value }))} />
              </div>
              {sent && (
                <div className="msgpage__sent">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                  Message sent successfully!
                </div>
              )}
            </div>
            <div className="msgpage__compose-foot">
              <button className="msgpage__btn-cancel" onClick={() => setCompose(false)}>Cancel</button>
              <button className="msgpage__btn-send" onClick={handleSend}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
                Send Message
              </button>
            </div>
          </div>
        ) : active ? (
          <div className="msgpage__thread">
            <div className="msgpage__thread-head">
              <div className="msgpage__thread-av" style={{ background: active.avatarColor }}>
                {active.initials}
              </div>
              <div>
                <h3 className="msgpage__thread-name">{active.name}</h3>
                <p className="msgpage__thread-date">{active.date}</p>
              </div>
              <button className="msgpage__thread-reply" onClick={() => setCompose(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,17 4,12 9,7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                Reply
              </button>
            </div>
            <div className="msgpage__thread-body">
              <div className="msgpage__bubble msgpage__bubble--in">
                <p>{active.message}</p>
                <span>{active.date}</span>
              </div>
              <div className="msgpage__bubble msgpage__bubble--out">
                <p>Thank you for reaching out! I'll get back to you shortly with an update.</p>
                <span>Just now</span>
              </div>
            </div>
            <div className="msgpage__reply-box">
              <input placeholder={`Reply to ${active.name}...`} />
              <button onClick={() => {}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="msgpage__empty-detail">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b2b7ce" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}