import React, { useState } from 'react';
import './Calender.css';

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Calender({ projects }) {
  const today    = new Date();
  const [year,   setYear]   = useState(today.getFullYear());
  const [month,  setMonth]  = useState(today.getMonth());
  const [selDay, setSelDay] = useState(today.getDate());

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Map projects to calendar days (spread them across month for demo)
  const projectDays = {};
  projects.forEach((p, i) => {
    const day = (i * 4 + 2) % daysInMonth + 1;
    if (!projectDays[day]) projectDays[day] = [];
    projectDays[day].push(p);
  });

  const selectedProjects = projectDays[selDay] || [];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calpage page-wrap">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">Track your project deadlines and schedules</p>
        </div>
      </div>

      <div className="calpage__grid">
        {/* Calendar */}
        <div className="calpage__cal">
          <div className="calpage__nav">
            <button className="calpage__nav-btn" onClick={prevMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
            </button>
            <span className="calpage__nav-label">{MONTHS[month]} {year}</span>
            <button className="calpage__nav-btn" onClick={nextMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>
            </button>
          </div>

          <div className="calpage__daynames">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="calpage__cells">
            {cells.map((d, i) => (
              <button
                key={i}
                className={[
                  'calpage__cell',
                  d === null              ? 'calpage__cell--empty'   : '',
                  d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                                         ? 'calpage__cell--today'   : '',
                  d === selDay           ? 'calpage__cell--selected' : '',
                  projectDays[d]         ? 'calpage__cell--has-event': '',
                ].join(' ')}
                onClick={() => d && setSelDay(d)}
                disabled={!d}
              >
                {d}
                {projectDays[d] && (
                  <span className="calpage__cell-dot" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected day */}
        <div className="calpage__detail">
          <h3 className="calpage__detail-title">
            {MONTHS[month]} {selDay}, {year}
          </h3>

          {selectedProjects.length === 0 ? (
            <div className="calpage__no-events">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b2b7ce" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <p>No events on this day</p>
            </div>
          ) : (
            <div className="calpage__events">
              {selectedProjects.map(p => (
                <div key={p.id} className="calpage__event" style={{ borderLeft: `4px solid ${p.progressColor}` }}>
                  <div className="calpage__event-top">
                    <span className="calpage__event-title">{p.title}</span>
                    <span className="calpage__event-badge" style={{ background: p.bgColor, color: p.progressColor }}>
                      {p.deadline}
                    </span>
                  </div>
                  <p className="calpage__event-sub">{p.subtitle}</p>
                  <div className="calpage__event-progress">
                    <div className="calpage__event-track">
                      <div className="calpage__event-fill"
                        style={{ width: `${p.progress}%`, background: p.progressColor }} />
                    </div>
                    <span>{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming list */}
          <h3 className="calpage__detail-title" style={{ marginTop: 20 }}>All Projects</h3>
          <div className="calpage__upcoming">
            {projects.map(p => (
              <div key={p.id} className="calpage__upcoming-item">
                <div className="calpage__upcoming-dot" style={{ background: p.progressColor }} />
                <div className="calpage__upcoming-info">
                  <span className="calpage__upcoming-name">{p.title}</span>
                  <span className="calpage__upcoming-dead">{p.deadline}</span>
                </div>
                <div className="calpage__upcoming-prog">
                  <div className="calpage__upcoming-track">
                    <div style={{ width: `${p.progress}%`, background: p.progressColor, height: '100%', borderRadius: 3 }} />
                  </div>
                  <span>{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}