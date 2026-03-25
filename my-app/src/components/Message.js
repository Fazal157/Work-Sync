import React, { useState, useEffect, useRef } from 'react';
import { db }                                  from '../firebase';
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp,
  doc, setDoc,
}                                              from 'firebase/firestore';
import './Message.css';

export default function Message({ messages: clientList = [], onStar }) {
  const [activeClient,  setActiveClient]  = useState(null);
  const [chatMessages,  setChatMessages]  = useState([]);
  const [replyText,     setReplyText]     = useState('');
  const [search,        setSearch]        = useState('');
  const [tab,           setTab]           = useState('all');
  const [composing,     setComposing]     = useState(false);
  const [composeData,   setComposeData]   = useState({ to: '', subject: '', body: '' });
  const [sent,          setSent]          = useState(false);
  const [sending,       setSending]       = useState(false);
  const [unreadCounts,  setUnreadCounts]  = useState({});
  const bottomRef                         = useRef(null);
  const inputRef                          = useRef(null);

  // ── Get current logged in user ──
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser') || '{}'); }
    catch { return {}; }
  })();

  const myId = currentUser.uid || currentUser.id || 'me';

  // ── Generate consistent chat ID ──
  const getChatId = (id1, id2) =>
    [String(id1), String(id2)].sort().join('_');

  // ── Load real-time messages when client selected ──
  useEffect(() => {
    if (!activeClient) {
      setChatMessages([]);
      return;
    }

    const chatId = getChatId(myId, activeClient.id);
    const q      = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChatMessages(msgs);
      // Clear unread for this client
      setUnreadCounts(prev => ({ ...prev, [activeClient.id]: 0 }));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    });

    return () => unsub();
  }, [activeClient?.id]);

  // ── Track unread messages per client ──
  useEffect(() => {
    if (!clientList.length) return;
    const unsubs = [];

    clientList.forEach(client => {
      if (!client?.id) return;
      const chatId = getChatId(myId, client.id);
      const q      = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsub = onSnapshot(q, (snap) => {
        // Only count messages NOT sent by me as unread
        // when this client is NOT currently active
        if (activeClient?.id === client.id) return;
        const unread = snap.docs.filter(
          d => d.data().senderId !== myId
        ).length;

        // Only show unread if there are actual messages from the client
        const hasClientMessages = snap.docs.some(
          d => d.data().senderId !== myId
        );

        setUnreadCounts(prev => ({
          ...prev,
          [client.id]: hasClientMessages ? unread : 0,
        }));
      });

      unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }, [clientList.length, activeClient?.id]);

  // ── Send message ──
  const handleSend = async () => {
    const text = replyText.trim();
    if (!text || !activeClient) return;
    setReplyText('');

    try {
      const chatId = getChatId(myId, activeClient.id);

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId:     myId,
        senderName:   `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Me',
        senderEmail:  currentUser.email || '',
        receiverId:   String(activeClient.id),
        receiverName: activeClient.sender || '',
        createdAt:    serverTimestamp(),
      });

      // Update chat metadata
      await setDoc(doc(db, 'chats', chatId), {
        participants: [myId, String(activeClient.id)],
        lastMessage:  text,
        lastUpdated:  serverTimestamp(),
        clientName:   activeClient.sender || '',
        myName:       `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
      }, { merge: true });

    } catch (err) {
      console.error('Send error:', err);
    }

    inputRef.current?.focus();
  };

  // ── Send composed message ──
  const handleComposeSend = async () => {
    const text = composeData.body.trim();
    const to   = composeData.to.trim();
    if (!text || !to) return;
    setSending(true);

    try {
      // Find matching client
      const target = clientList.find(c =>
        c?.sender?.toLowerCase().includes(to.toLowerCase()) ||
        c?.email?.toLowerCase().includes(to.toLowerCase())
      );

      const receiverId   = target?.id   || to;
      const receiverName = target?.sender || to;
      const chatId       = getChatId(myId, receiverId);

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId:     myId,
        senderName:   `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Me',
        senderEmail:  currentUser.email || '',
        receiverId:   String(receiverId),
        receiverName,
        subject:      composeData.subject || '',
        createdAt:    serverTimestamp(),
      });

      await setDoc(doc(db, 'chats', chatId), {
        participants: [myId, String(receiverId)],
        lastMessage:  text,
        lastUpdated:  serverTimestamp(),
        clientName:   receiverName,
        myName:       `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
      }, { merge: true });

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setSending(false);
        setComposing(false);
        setComposeData({ to: '', subject: '', body: '' });
      }, 1500);

    } catch (err) {
      console.error('Compose error:', err);
      setSending(false);
    }
  };

  // ── Format timestamp ──
  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const date = ts?.toDate ? ts.toDate() : new Date(ts);
      const now  = new Date();
      const diff = Math.floor((now - date) / 1000);
      if (diff < 60)    return 'just now';
      if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  // ── Get initials ──
  const getInitials = (name = '') =>
    (name || '').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  // ── Filter clients safely ──
  const filtered = (clientList || []).filter(c => {
    if (!c || !c.sender) return false;
    const s = search.toLowerCase();
    const matchSearch =
      (c.sender  || '').toLowerCase().includes(s) ||
      (c.preview || '').toLowerCase().includes(s);
    if (tab === 'starred') return matchSearch && c.starred;
    return matchSearch;
  });

  const starredCount = (clientList || []).filter(c => c?.starred).length;

  return (
    <div className="msgpage page-wrap">

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-sub">Chat with your clients in real time</p>
        </div>
        <button
          className="page-save-btn"
          onClick={() => { setComposing(true); setActiveClient(null); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5"  x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
          New Message
        </button>
      </div>

      <div className="msgpage__body">

        {/* ══════════════════
            CLIENT LIST
        ══════════════════ */}
        <div className="msgpage__list-col">

          {/* Search */}
          <div className="msgpage__search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b2b7ce', padding: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6"  x2="6"  y2="18"/>
                  <line x1="6"  y1="6"  x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="msgpage__tabs">
            <button
              className={`msgpage__tab${tab === 'all' ? ' msgpage__tab--on' : ''}`}
              onClick={() => setTab('all')}
            >
              All <span>{clientList.length}</span>
            </button>
            <button
              className={`msgpage__tab${tab === 'starred' ? ' msgpage__tab--on' : ''}`}
              onClick={() => setTab('starred')}
            >
              Starred <span>{starredCount}</span>
            </button>
          </div>

          {/* Client list */}
          <div className="msgpage__items">
            {filtered.length === 0 ? (
              <div className="msgpage__empty-list">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="#b2b7ce" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>{search ? 'No results found' : 'No clients yet'}</p>
              </div>
            ) : (
              filtered.map(c => {
                const unread = unreadCounts[c.id] || 0;
                const isActive = activeClient?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`msgpage__item${isActive ? ' msgpage__item--on' : ''}`}
                    onClick={() => { setActiveClient(c); setComposing(false); }}
                  >
                    <div className="msgpage__item-av" style={{ background: c.color || '#4a8af4' }}>
                      {getInitials(c.sender)}
                    </div>
                    <div className="msgpage__item-body">
                      <div className="msgpage__item-row">
                        <span className="msgpage__item-name">{c.sender}</span>
                        <span className="msgpage__item-date">{formatTime(c.date)}</span>
                      </div>
                      <span className="msgpage__item-text">{c.preview}</span>
                    </div>
                    <div className="msgpage__item-right">
                      {/* Only show unread badge if there are actual unread messages */}
                      {unread > 0 && !isActive && (
                        <span className="msgpage__unread-badge">{unread}</span>
                      )}
                      <button
                        className={`msgpage__item-star${c.starred ? ' msgpage__item-star--on' : ''}`}
                        onClick={e => { e.stopPropagation(); onStar(c.id); }}
                        title={c.starred ? 'Unstar' : 'Star'}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24"
                          fill={c.starred ? '#eab308' : 'none'}
                          stroke={c.starred ? '#eab308' : 'currentColor'}
                          strokeWidth="2" strokeLinecap="round">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════════════
            CHAT PANEL
        ══════════════════ */}
        <div className="msgpage__detail-col">

          {/* Empty state */}
          {!activeClient && !composing && (
            <div className="msgpage__empty-detail">
              <div className="msgpage__empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="#b2b7ce" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p>Select a client to start chatting</p>
              <span>Or compose a new message</span>
              <button
                className="msgpage__compose-btn"
                onClick={() => setComposing(true)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5"  x2="12" y2="19"/>
                  <line x1="5"  y1="12" x2="19" y2="12"/>
                </svg>
                Compose New Message
              </button>
            </div>
          )}

          {/* ── Active chat thread ── */}
          {activeClient && !composing && (
            <div className="msgpage__thread">

              {/* Thread header */}
              <div className="msgpage__thread-head">
                <div
                  className="msgpage__thread-av"
                  style={{ background: activeClient.color || '#4a8af4' }}
                >
                  {getInitials(activeClient.sender)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="msgpage__thread-name">{activeClient.sender}</p>
                  <p className="msgpage__thread-date">
                    {activeClient.role || 'Client'}
                    {chatMessages.length > 0 && (
                      <span style={{ marginLeft: 8, color: '#22c55e', fontWeight: 700 }}>
                        • {chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  className="msgpage__thread-reply"
                  onClick={() => setComposing(true)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Compose
                </button>
              </div>

              {/* Messages area */}
              <div className="msgpage__thread-body">

                {/* Original message from mockData */}
                {activeClient.preview && (
                  <div className="msgpage__day-divider">
                    <span>Original Message</span>
                  </div>
                )}
                {activeClient.preview && (
                  <div className="msgpage__bubble msgpage__bubble--in">
                    <p>{activeClient.preview}</p>
                    <span>{formatTime(activeClient.date)}</span>
                  </div>
                )}

                {/* Firebase real-time messages */}
                {chatMessages.length > 0 && (
                  <div className="msgpage__day-divider">
                    <span>Conversation</span>
                  </div>
                )}

                {chatMessages.map((msg, i) => {
                  const isMe = String(msg.senderId) === String(myId);
                  return (
                    <div
                      key={msg.id}
                      className={`msgpage__bubble ${isMe
                        ? 'msgpage__bubble--out'
                        : 'msgpage__bubble--in'
                      }`}
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      {!isMe && (
                        <span className="msgpage__bubble-sender">
                          {msg.senderName || 'Client'}
                        </span>
                      )}
                      <p>{msg.text}</p>
                      <span>{formatTime(msg.createdAt)}</span>
                    </div>
                  );
                })}

                {/* No messages yet */}
                {chatMessages.length === 0 && (
                  <div className="msgpage__no-msgs">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="#b2b7ce" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>No messages yet</p>
                    <span>Type a message below to start the conversation 👇</span>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              <div className="msgpage__reply-box">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Message ${activeClient.sender}...`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  className={`msgpage__send-btn${replyText.trim() ? ' msgpage__send-btn--active' : ''}`}
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  title="Send message (Enter)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="22" y1="2"  x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── Compose new message ── */}
          {composing && (
            <div className="msgpage__compose">
              <div className="msgpage__compose-head">
                <h3>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  New Message
                </h3>
                <button
                  onClick={() => {
                    setComposing(false);
                    setComposeData({ to: '', subject: '', body: '' });
                    setSent(false);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6"  x2="6"  y2="18"/>
                    <line x1="6"  y1="6"  x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="msgpage__compose-body">

                {/* To field with suggestions */}
                <div className="msgpage__compose-field">
                  <label>To</label>
                  <input
                    type="text"
                    placeholder="Client name or email..."
                    value={composeData.to}
                    onChange={e => setComposeData(p => ({ ...p, to: e.target.value }))}
                    list="client-suggestions"
                    autoFocus
                  />
                  <datalist id="client-suggestions">
                    {(clientList || []).filter(c => c?.sender).map(c => (
                      <option key={c.id} value={c.sender} />
                    ))}
                  </datalist>
                </div>

                {/* Subject */}
                <div className="msgpage__compose-field">
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="Message subject (optional)..."
                    value={composeData.subject}
                    onChange={e => setComposeData(p => ({ ...p, subject: e.target.value }))}
                  />
                </div>

                {/* Message body */}
                <div className="msgpage__compose-field msgpage__compose-field--grow">
                  <label>Message</label>
                  <textarea
                    placeholder="Write your message here..."
                    value={composeData.body}
                    onChange={e => setComposeData(p => ({ ...p, body: e.target.value }))}
                  />
                </div>

                {/* Success alert */}
                {sent && (
                  <div className="msgpage__sent">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Message sent successfully!
                  </div>
                )}
              </div>

              <div className="msgpage__compose-foot">
                <button
                  className="msgpage__btn-cancel"
                  onClick={() => {
                    setComposing(false);
                    setComposeData({ to: '', subject: '', body: '' });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="msgpage__btn-send"
                  onClick={handleComposeSend}
                  disabled={sending || !composeData.body.trim() || !composeData.to.trim()}
                >
                  {sending ? (
                    <><span className="aform__spinner" /> Sending...</>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="22" y1="2"  x2="11" y2="13"/>
                        <polygon points="22,2 15,22 11,13 2,9"/>
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}