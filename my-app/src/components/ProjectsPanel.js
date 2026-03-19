import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import { statsData } from '../data/mockData';
import './ProjectsPanel.css';

export default function ProjectsPanel({ projects, onDelete, onEdit, onDuplicate, onAdd }) {
  const [view, setView] = useState('grid');

  return (
    <section className="projects">
      <div className="projects__header">
        <h2 className="projects__title">Projects</h2>
        <span className="projects__period">July, 2020</span>
      </div>

      <div className="projects__stats">
        {statsData.map((s, i) => (
          <React.Fragment key={i}>
            <div className="projects__stat">
              <span className="projects__stat-num">{s.value}</span>
              <span className="projects__stat-label">{s.label}</span>
            </div>
            {i < statsData.length - 1 && (
              <span className="projects__stat-sep" />
            )}
          </React.Fragment>
        ))}

        <div className="projects__view-toggle">
          <button
            className={`projects__view-btn${view === 'list' ? ' projects__view-btn--on' : ''}`}
            onClick={() => setView('list')}
            title="List view"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="8"  y1="6"  x2="21" y2="6" />
              <line x1="8"  y1="12" x2="21" y2="12" />
              <line x1="8"  y1="18" x2="21" y2="18" />
              <line x1="3"  y1="6"  x2="3.01" y2="6" />
              <line x1="3"  y1="12" x2="3.01" y2="12" />
              <line x1="3"  y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button
            className={`projects__view-btn${view === 'grid' ? ' projects__view-btn--on' : ''}`}
            onClick={() => setView('grid')}
            title="Grid view"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3"  y="3"  width="7" height="7" />
              <rect x="14" y="3"  width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3"  y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`projects__grid${view === 'list' ? ' projects__grid--list' : ''}`}>
        {projects.length === 0 ? (
          <div className="projects__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="#b2b7ce" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8"  y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <p>No projects yet. Click <strong>+</strong> to add one.</p>
          </div>
        ) : (
          projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={onDelete}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              animDelay={i * 0.06}
            />
          ))
        )}
      </div>
    </section>
  );
}