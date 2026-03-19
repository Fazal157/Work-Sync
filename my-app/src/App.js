import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProjectsPanel from './components/ProjectsPanel';
import MessagesPanel from './components/MessagesPanel';
import AddProjectModal from './components/AddProjectModal';
import Profile from './components/Profile';
import Message from './components/Message';
import Calendar from './components/Calender';
import History from './components/History';
import Setting from './components/Setting';
import { projectsData, messagesData } from './data/mockData';
import './App.css';

export default function App() {
  const [activePage,  setActivePage]  = useState('home');
  const [projects,    setProjects]    = useState(projectsData);
  const [messages,    setMessages]    = useState(messagesData);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);

  // ── Profile state — loads from localStorage on startup ──
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleAddProject       = useCallback((p)  => setProjects(prev => [p, ...prev]), []);
  const handleDeleteProject    = useCallback((id) => setProjects(prev => prev.filter(p => p.id !== id)), []);
  const handleEditProject      = useCallback((id, updates) => setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)), []);
  const handleDuplicateProject = useCallback((project) => setProjects(prev => [{ ...project, id: Date.now(), title: `${project.title} (Copy)` }, ...prev]), []);
  const handleStarMessage      = useCallback((id) => setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m)), []);

  // ── Save profile data and update header ──
  const handleProfileSave = useCallback((data) => {
    setUserProfile(data);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'profile':
        return <Profile onProfileSave={handleProfileSave} />;
      case 'messages':
        return <Message messages={messages} onStar={handleStarMessage} />;
      case 'calendar':
        return <Calendar projects={projects} />;
      case 'history':
        return <History  projects={projects} />;
      case 'settings':
        return <Setting userProfile={userProfile} />;
      default:
        return (
          <>
            <ProjectsPanel
              projects={projects}
              onDelete={handleDeleteProject}
              onEdit={handleEditProject}
              onDuplicate={handleDuplicateProject}
              onAdd={() => setModalOpen(true)}
            />
            <MessagesPanel messages={messages} onStar={handleStarMessage} />
          </>
        );
    }
  };

  return (
    <div className="app">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onAddProject={() => setModalOpen(true)}
        activePage={activePage}
        userProfile={userProfile}
      />
      <div className="app__body">
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => { setActivePage(page); setSidebarOpen(false); }}
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className={`app__content${activePage !== 'home' ? ' app__content--full' : ''}`}>
          {renderPage()}
        </div>
      </div>
      {modalOpen && (
        <AddProjectModal onClose={() => setModalOpen(false)} onAdd={handleAddProject} />
      )}
    </div>
  );
}
