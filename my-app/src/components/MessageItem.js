import React from 'react';
import './MessageItem.css';

export default function MessageItem({ message, active, onSelect, onStar }) {
  return (
    <div className={`msg-item${active ? ' msg-item--active' : ''}`} onClick={() => onSelect(message.id)}
      role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onSelect(message.id)}>
      <div className="msg-item__avatar" style={{ background: message.avatarColor }}>{message.initials}</div>
      <div className="msg-item__content">
        <div className="msg-item__row">
          <span className="msg-item__name">{message.name}</span>
          <span className="msg-item__date">{message.date}</span>
        </div>
        <p className="msg-item__text">{message.message}</p>
      </div>
      <button
        className={`msg-item__star${message.starred ? ' msg-item__star--on' : ''}`}
        onClick={e => { e.stopPropagation(); onStar(message.id); }}
        aria-label={message.starred ? 'Unstar' : 'Star'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill={message.starred ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </button>
    </div>
  );
}