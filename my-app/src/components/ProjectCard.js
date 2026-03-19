import React, { useState, useRef, useEffect } from 'react';
import './ProjectCard.css';

export default function ProjectCard({ project, onDelete, onEdit, onDuplicate, animDelay = 0 }) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [editOpen,  setEditOpen]  = useState(false);
  const [viewOpen,  setViewOpen]  = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [editForm,  setEditForm]  = useState({
    title:    project.title,
    subtitle: project.subtitle,
    deadline: project.deadline,
    progress: project.progress,
  });

  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setEditOpen(false);
    setViewOpen(false);
    setShareOpen(false);
  };

  const handleEditSave = () => {
    onEdit(project.id, editForm);
    setEditOpen(false);
  };

  const cardUrl = `${window.location.origin}/project/${project.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* ── THE CARD (unchanged design) ── */}
      <div
        className="pcard"
        style={{ background: project.bgColor, animationDelay: `${animDelay}s` }}
      >
        {/* Top */}
        <div className="pcard__top">
          <span className="pcard__date">{project.date}</span>

          <div className="pcard__menu" ref={menuRef}>
            <button
              className={`pcard__menu-btn${menuOpen ? ' pcard__menu-btn--open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Options"
            >
              <span /><span /><span />
            </button>

            {menuOpen && (
              <div className="pcard__dropdown">
                {/* Edit */}
                <button
                  className="pcard__dropdown-item"
                  title="Edit Project"
                  onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                >
                  <span className="pcard__di-icon pcard__di-icon--edit">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </span>
                  <div className="pcard__di-text">
                    <span className="pcard__di-label">Edit</span>
                    <span className="pcard__di-desc">Modify project details</span>
                  </div>
                  <svg className="pcard__di-arrow" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>

                {/* View */}
                <button
                  className="pcard__dropdown-item"
                  title="View Details"
                  onClick={() => { setMenuOpen(false); setViewOpen(true); }}
                >
                  <span className="pcard__di-icon pcard__di-icon--view">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </span>
                  <div className="pcard__di-text">
                    <span className="pcard__di-label">View</span>
                    <span className="pcard__di-desc">See full overview</span>
                  </div>
                  <svg className="pcard__di-arrow" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>

                {/* Duplicate */}
                <button
                  className="pcard__dropdown-item"
                  title="Duplicate"
                  onClick={() => { setMenuOpen(false); onDuplicate(project); }}
                >
                  <span className="pcard__di-icon pcard__di-icon--duplicate">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </span>
                  <div className="pcard__di-text">
                    <span className="pcard__di-label">Duplicate</span>
                    <span className="pcard__di-desc">Create a copy</span>
                  </div>
                  <svg className="pcard__di-arrow" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>

                {/* Share */}
                <button
                  className="pcard__dropdown-item"
                  title="Share"
                  onClick={() => { setMenuOpen(false); setShareOpen(true); }}
                >
                  <span className="pcard__di-icon pcard__di-icon--share">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </span>
                  <div className="pcard__di-text">
                    <span className="pcard__di-label">Share</span>
                    <span className="pcard__di-desc">WhatsApp, email & more</span>
                  </div>
                  <svg className="pcard__di-arrow" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>

                <div className="pcard__dropdown-divider" />

                {/* Delete */}
                <button
                  className="pcard__dropdown-item pcard__dropdown-item--danger"
                  title="Delete"
                  onClick={() => { setMenuOpen(false); onDelete(project.id); }}
                >
                  <span className="pcard__di-icon pcard__di-icon--delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </span>
                  <div className="pcard__di-text">
                    <span className="pcard__di-label">Delete</span>
                    <span className="pcard__di-desc">Cannot be undone</span>
                  </div>
                  <svg className="pcard__di-arrow" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="pcard__body">
          <h3 className="pcard__title">{project.title}</h3>
          <p className="pcard__subtitle">{project.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="pcard__progress-wrap">
          <div className="pcard__progress-label">
            <span>Progress</span>
            <strong>{project.progress}%</strong>
          </div>
          <div className="pcard__track">
            <div className="pcard__fill"
              style={{ width: `${project.progress}%`, background: project.progressColor }} />
          </div>
        </div>

        {/* Footer */}
        <div className="pcard__footer">
          <div className="pcard__avatars">
            {project.avatars.map((a, i) => (
              <div key={i} className="pcard__avatar"
                style={{ background: project.avatarColors[i] || '#ccc', zIndex: project.avatars.length - i }}>
                {a}
              </div>
            ))}
            <button className="pcard__avatar pcard__avatar-add">+</button>
          </div>
          <span className="pcard__deadline" style={{ color: project.progressColor }}>
            {project.deadline}
          </span>
        </div>
      </div>

      {/* ════════ EDIT MODAL ════════ */}
      {editOpen && (
        <div className="pcm-overlay" onClick={closeAll}>
          <div className="pcm" onClick={e => e.stopPropagation()}>
            <div className="pcm__head">
              <div className="pcm__head-left">
                <span className="pcm__hicon pcm__hicon--edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </span>
                <h3 className="pcm__title">Edit Project</h3>
              </div>
              <button className="pcm__close" onClick={closeAll}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="pcm__body">
              <div className="pcm__field">
                <label>Project Title</label>
                <input type="text" value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="pcm__field">
                <label>Project Type</label>
                <input type="text" value={editForm.subtitle}
                  onChange={e => setEditForm(f => ({ ...f, subtitle: e.target.value }))} />
              </div>
              <div className="pcm__field">
                <label>Deadline</label>
                <input type="text" value={editForm.deadline}
                  onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div className="pcm__field">
                <label>
                  Progress &nbsp;
                  <strong style={{ color: project.progressColor }}>{editForm.progress}%</strong>
                </label>
                <input
                  type="range" min="0" max="100"
                  value={editForm.progress}
                  className="pcm__range"
                  style={{ '--pc': project.progressColor, '--pf': `${editForm.progress}%` }}
                  onChange={e => setEditForm(f => ({ ...f, progress: Number(e.target.value) }))}
                />
              </div>

              {/* Live preview */}
              <div className="pcm__preview" style={{ background: project.bgColor }}>
                <p className="pcm__preview-title">{editForm.title || 'Title'}</p>
                <p className="pcm__preview-sub">{editForm.subtitle || 'Type'}</p>
                <div className="pcm__preview-track">
                  <div className="pcm__preview-fill"
                    style={{ width: `${editForm.progress}%`, background: project.progressColor }} />
                </div>
                <span className="pcm__preview-dl" style={{ color: project.progressColor }}>
                  {editForm.deadline || 'Deadline'}
                </span>
              </div>
            </div>

            <div className="pcm__foot">
              <button className="pcm__btn-cancel" onClick={closeAll}>Cancel</button>
              <button className="pcm__btn-save"
                style={{ background: project.progressColor }}
                onClick={handleEditSave}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ VIEW MODAL ════════ */}
      {viewOpen && (
        <div className="pcm-overlay" onClick={closeAll}>
          <div className="pcm pcm--wide" onClick={e => e.stopPropagation()}>
            <div className="pcm__head">
              <div className="pcm__head-left">
                <span className="pcm__hicon pcm__hicon--view">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </span>
                <h3 className="pcm__title">Project Details</h3>
              </div>
              <button className="pcm__close" onClick={closeAll}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="pcm__body">
              {/* Big card */}
              <div className="pcv__card" style={{ background: project.bgColor }}>
                <div className="pcv__card-row">
                  <span className="pcv__date">{project.date}</span>
                  <span className="pcv__dl" style={{ color: project.progressColor }}>
                    {project.deadline}
                  </span>
                </div>
                <h2 className="pcv__title">{project.title}</h2>
                <p className="pcv__sub">{project.subtitle}</p>
                <div className="pcv__plabel">
                  <span>Progress</span>
                  <strong>{project.progress}%</strong>
                </div>
                <div className="pcv__track">
                  <div className="pcv__fill"
                    style={{ width: `${project.progress}%`, background: project.progressColor }} />
                </div>
              </div>

              {/* 3 stat tiles */}
              <div className="pcv__stats">
                <div className="pcv__stat">
                  <span className="pcv__stat-icon" style={{ background: project.bgColor, color: project.progressColor }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                    </svg>
                  </span>
                  <span className="pcv__stat-val">{project.progress}%</span>
                  <span className="pcv__stat-lbl">Progress</span>
                </div>
                <div className="pcv__stat">
                  <span className="pcv__stat-icon" style={{ background: '#e8f8ee', color: '#22c55e' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                  </span>
                  <span className="pcv__stat-val" style={{ fontSize: 11 }}>{project.deadline}</span>
                  <span className="pcv__stat-lbl">Deadline</span>
                </div>
                <div className="pcv__stat">
                  <span className="pcv__stat-icon" style={{ background: '#ede8fd', color: '#a855f7' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <span className="pcv__stat-val">{project.avatars.length}</span>
                  <span className="pcv__stat-lbl">Members</span>
                </div>
              </div>

              {/* Team */}
              <div className="pcv__team">
                <p className="pcv__team-lbl">Team Members</p>
                {project.avatars.map((a, i) => (
                  <div key={i} className="pcv__member">
                    <div className="pcv__member-av"
                      style={{ background: project.avatarColors[i] }}>{a}</div>
                    <span className="pcv__member-name">Member {a}</span>
                    <span className="pcv__member-role">Team Member</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pcm__foot">
              <button className="pcm__btn-cancel" onClick={closeAll}>Close</button>
              <button className="pcm__btn-save"
                style={{ background: project.progressColor }}
                onClick={() => { setViewOpen(false); setEditOpen(true); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ SHARE MODAL ════════ */}
      {shareOpen && (
        <div className="pcm-overlay" onClick={closeAll}>
          <div className="pcm" onClick={e => e.stopPropagation()}>
            <div className="pcm__head">
              <div className="pcm__head-left">
                <span className="pcm__hicon pcm__hicon--share">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </span>
                <h3 className="pcm__title">Share Project</h3>
              </div>
              <button className="pcm__close" onClick={closeAll}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="pcm__body">
              {/* Project chip */}
              <div className="pcs__chip" style={{ background: project.bgColor }}>
                <span className="pcs__chip-dot" style={{ background: project.progressColor }} />
                <div>
                  <p className="pcs__chip-title">{project.title}</p>
                  <p className="pcs__chip-sub">{project.subtitle} · {project.progress}% done</p>
                </div>
              </div>

              {/* Copy link */}
              <div className="pcs__section">
                <p className="pcs__label">Project Link</p>
                <div className="pcs__urlrow">
                  <div className="pcs__urlbox">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b2b7ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <span>{cardUrl}</span>
                  </div>
                  <button
                    className={`pcs__copybtn${copied ? ' pcs__copybtn--ok' : ''}`}
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Share buttons */}
              <div className="pcs__section">
                <p className="pcs__label">Share Via</p>
                <div className="pcs__grid">
                  <button className="pcs__btn pcs__btn--wa"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${project.title} — ${cardUrl}`)}`, '_blank')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>

                  <button className="pcs__btn pcs__btn--email"
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(project.title)}&body=${encodeURIComponent(`Check this project: ${cardUrl}`)}`)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email
                  </button>

                  <button className="pcs__btn pcs__btn--tw"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${project.title} — ${cardUrl}`)}`, '_blank')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                  </button>

                  <button className="pcs__btn pcs__btn--li"
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`, '_blank')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    LinkedIn
                  </button>
                </div>
              </div>
            </div>

            <div className="pcm__foot">
              <button className="pcm__btn-cancel" onClick={closeAll}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}