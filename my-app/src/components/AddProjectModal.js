import React, { useState, useEffect, useRef } from 'react';
import { colorOptions } from '../data/mockData';
import './AddProjectModal.css';

const INIT = { title: '', subtitle: '', date: '', deadline: '', progress: 0, colorIndex: 0 };

export default function AddProjectModal({ onClose, onAdd }) {
  const [form, setForm]     = useState(INIT);
  const [errors, setErrors] = useState({});
  const firstRef            = useRef(null);

  useEffect(() => { firstRef.current?.focus(); }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); if (errors[f]) setErrors(e => ({ ...e, [f]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = 'Project title is required';
    if (!form.subtitle.trim()) e.subtitle = 'Project type is required';
    if (!form.deadline.trim()) e.deadline = 'Deadline is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const c = colorOptions[form.colorIndex];
    const d = form.date ? new Date(form.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    onAdd({ id: Date.now(), title: form.title.trim(), subtitle: form.subtitle.trim(), date: d, progress: Number(form.progress), deadline: form.deadline.trim(), bgColor: c.bg, progressColor: c.progress, avatars: ['Y','O'], avatarColors: ['#4a8af4','#f97316'] });
    onClose();
  };

  const c = colorOptions[form.colorIndex];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div className="modal__header-left">
            <div className="modal__color-preview" style={{ background: c.progress }} />
            <h2 className="modal__title">New Project</h2>
          </div>
          <button className="modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="modal__body">
          <div className={`modal__field${errors.title ? ' modal__field--error' : ''}`}>
            <label>Project Title <span>*</span></label>
            <input ref={firstRef} type="text" placeholder="e.g. Web Designing" value={form.title} onChange={e => set('title', e.target.value)} maxLength={50} />
            {errors.title && <span className="modal__error">{errors.title}</span>}
          </div>

          <div className={`modal__field${errors.subtitle ? ' modal__field--error' : ''}`}>
            <label>Project Type <span>*</span></label>
            <input type="text" placeholder="e.g. Prototyping, Wireframing" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} maxLength={40} />
            {errors.subtitle && <span className="modal__error">{errors.subtitle}</span>}
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label>Start Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className={`modal__field${errors.deadline ? ' modal__field--error' : ''}`}>
              <label>Deadline <span>*</span></label>
              <input type="text" placeholder="e.g. 2 Weeks Left" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              {errors.deadline && <span className="modal__error">{errors.deadline}</span>}
            </div>
          </div>

          <div className="modal__field">
            <label>Progress <strong style={{ color: c.progress }}>{form.progress}%</strong></label>
            <div className="modal__range-wrap">
              <input type="range" min="0" max="100" value={form.progress} onChange={e => set('progress', e.target.value)}
                style={{ '--fill': `${form.progress}%`, '--color': c.progress }} />
            </div>
          </div>

          <div className="modal__field">
            <label>Color Theme</label>
            <div className="modal__colors">
              {colorOptions.map((col, i) => (
                <button key={i} className={`modal__color-dot${form.colorIndex === i ? ' modal__color-dot--on' : ''}`}
                  style={{ background: col.hex }} onClick={() => set('colorIndex', i)} title={col.label} />
              ))}
            </div>
          </div>

          <div className="modal__preview" style={{ background: c.bg }}>
            <div className="modal__preview-content">
              <span className="modal__preview-title">{form.title || 'Project Title'}</span>
              <span className="modal__preview-sub">{form.subtitle || 'Project Type'}</span>
            </div>
            <div className="modal__preview-bar">
              <div className="modal__preview-fill" style={{ width: `${form.progress}%`, background: c.progress }} />
            </div>
            <span className="modal__preview-deadline" style={{ color: c.progress }}>{form.deadline || 'Deadline'}</span>
          </div>
        </div>

        <div className="modal__footer">
          <button className="modal__btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal__btn-submit" onClick={handleSubmit}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}