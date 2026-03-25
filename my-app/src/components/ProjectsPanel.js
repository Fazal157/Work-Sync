import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import './ProjectsPanel.css';

export default function ProjectsPanel({ projects, onDelete, onEdit, onDuplicate, onAdd }) {
  const [view,   setView]   = useState('grid');
  const [filter, setFilter] = useState('All');

  // ── Live stats calculated from real projects ──
  const liveStats = [
    {
      key:   'In Progress',
      label: 'In Progress',
      value: projects.filter(p => p.progress > 0 && p.progress < 100).length,
    },
    {
      key:   'Completed',
      label: 'Completed',
      value: projects.filter(p => p.progress === 100).length,
    },
    {
      key:   'Upcoming',
      label: 'Upcoming',
      value: projects.filter(p => p.progress === 0).length,
    },
    {
      key:   'All',
      label: 'Total Projects',
      value: projects.length,
    },
  ];

  // ── Filter projects by active stat ──
  const visibleProjects = projects.filter(p => {
    if (filter === 'All')         return true;
    if (filter === 'In Progress') return p.progress > 0 && p.progress < 100;
    if (filter === 'Completed')   return p.progress === 100;
    if (filter === 'Upcoming')    return p.progress === 0;
    return true;
  });

  return (
    <section className="projects">

      {/* Header */}
      <div className="projects__header">
        <h2 className="projects__title">Projects</h2>
        <span className="projects__period">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Live stats row */}
      <div className="projects__stats">
        {liveStats.map((s, i) => (
          <React.Fragment key={s.key}>
            <button
              className={`projects__stat${filter === s.key ? ' projects__stat--on' : ''}`}
              onClick={() => setFilter(s.key)}
              title={`Show ${s.label}`}
            >
              <span className="projects__stat-num">{s.value}</span>
              <span className="projects__stat-label">{s.label}</span>
              {filter === s.key && <span className="projects__stat-bar" />}
            </button>
            {i < liveStats.length - 1 && (
              <span className="projects__stat-sep" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}

        {/* View toggle */}
        <div className="projects__view-toggle">
          <button
            className={`projects__view-btn${view === 'list' ? ' projects__view-btn--on' : ''}`}
            onClick={() => setView('list')}
            title="List view"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="8"    y1="6"  x2="21"   y2="6"  />
              <line x1="8"    y1="12" x2="21"   y2="12" />
              <line x1="8"    y1="18" x2="21"   y2="18" />
              <line x1="3"    y1="6"  x2="3.01" y2="6"  />
              <line x1="3"    y1="12" x2="3.01" y2="12" />
              <line x1="3"    y1="18" x2="3.01" y2="18" />
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

      {/* Active filter pill */}
      {filter !== 'All' && (
        <div className="projects__filter-row">
          <span className="projects__filter-pill">
            {filter}
            <button
              className="projects__filter-clear"
              onClick={() => setFilter('All')}
              aria-label="Clear filter"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6"  x2="6"  y2="18" />
                <line x1="6"  y1="6"  x2="18" y2="18" />
              </svg>
            </button>
          </span>
          <span className="projects__filter-count">
            {visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Cards */}
      <div className={`projects__grid${view === 'list' ? ' projects__grid--list' : ''}`}>
        {visibleProjects.length === 0 ? (
          <div className="projects__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="#b2b7ce" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8"  y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <p>
              {filter === 'All'
                ? <>No projects yet. Click <strong>+</strong> to add one.</>
                : <>No <strong>{filter}</strong> projects found.</>
              }
            </p>
            {filter !== 'All' && (
              <button
                className="projects__empty-btn"
                onClick={() => setFilter('All')}
              >
                Show all projects
              </button>
            )}
          </div>
        ) : (
          visibleProjects.map((p, i) => (
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