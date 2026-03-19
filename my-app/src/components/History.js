import React, { useState } from 'react';
import './History.css';

export default function History({ projects }) {
  const [search, setSearch] = useState('');

  const activities = [
    ...projects.map((p, i) => ({
      id: `create-${p.id}`,
      type: 'created',
      project: p.title,
      detail: `Project created — ${p.subtitle}`,
      time: `${i + 1} day${i > 0 ? 's' : ''} ago`,
      color: p.progressColor,
      bg: p.bgColor,
      progress: p.progress,
    })),
    ...projects.filter(p => p.progress > 0).map((p, i) => ({
      id: `update-${p.id}`,
      type: 'updated',
      project: p.title,
      detail: `Progress updated to ${p.progress}%`,
      time: `${i + 2} days ago`,
      color: p.progressColor,
      bg: p.bgColor,
      progress: p.progress,
    })),
    ...projects.filter(p => p.progress === 100).map((p) => ({
      id: `done-${p.id}`,
      type: 'completed',
      project: p.title,
      detail: 'Project marked as completed',
      time: '1 week ago',
      color: '#22c55e',
      bg: '#e8f8ee',
      progress: 100,
    })),
  ].sort(() => Math.random() - 0.5);

  const icons = {
    created:   { icon: '✦', bg: '#e9f1fe', color: '#4a8af4' },
    updated:   { icon: '↑', bg: '#fff3e8', color: '#f97316' },
    completed: { icon: '✓', bg: '#e8f8ee', color: '#22c55e' },
  };

  const filtered = activities.filter(a =>
    a.project.toLowerCase().includes(search.toLowerCase()) ||
    a.detail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="histpage page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity History</h1>
          <p className="page-sub">Track all project activities and changes</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="histpage__summary">
        <div className="histpage__summary-card" style={{ background: '#e9f1fe' }}>
          <span className="histpage__summary-num" style={{ color: '#4a8af4' }}>{projects.length}</span>
          <span className="histpage__summary-lbl">Total Projects</span>
        </div>
        <div className="histpage__summary-card" style={{ background: '#fff3e8' }}>
          <span className="histpage__summary-num" style={{ color: '#f97316' }}>
            {projects.filter(p => p.progress > 0 && p.progress < 100).length}
          </span>
          <span className="histpage__summary-lbl">In Progress</span>
        </div>
        <div className="histpage__summary-card" style={{ background: '#e8f8ee' }}>
          <span className="histpage__summary-num" style={{ color: '#22c55e' }}>
            {projects.filter(p => p.progress === 100).length}
          </span>
          <span className="histpage__summary-lbl">Completed</span>
        </div>
        <div className="histpage__summary-card" style={{ background: '#ede8fd' }}>
          <span className="histpage__summary-num" style={{ color: '#a855f7' }}>{activities.length}</span>
          <span className="histpage__summary-lbl">Activities</span>
        </div>
      </div>

      {/* Search */}
      <div className="histpage__search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search activity..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Timeline */}
      <div className="histpage__timeline">
        {filtered.length === 0 ? (
          <div className="histpage__empty">No activity found</div>
        ) : (
          filtered.map((a, i) => (
            <div key={a.id} className="histpage__item"
              style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="histpage__item-icon"
                style={{ background: icons[a.type]?.bg, color: icons[a.type]?.color }}>
                {icons[a.type]?.icon}
              </div>
              <div className="histpage__item-line" />
              <div className="histpage__item-card" style={{ borderLeft: `3px solid ${a.color}` }}>
                <div className="histpage__item-top">
                  <span className="histpage__item-project">{a.project}</span>
                  <span className="histpage__item-time">{a.time}</span>
                </div>
                <p className="histpage__item-detail">{a.detail}</p>
                {a.progress !== undefined && (
                  <div className="histpage__item-prog">
                    <div className="histpage__item-track">
                      <div style={{ width: `${a.progress}%`, background: a.color, height: '100%', borderRadius: 3 }} />
                    </div>
                    <span>{a.progress}%</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}