import React, { useState, useCallback } from 'react';
import AuthPage        from './components/AuthPage';
import Header          from './components/Header';
import Sidebar         from './components/Sidebar';
import ProjectsPanel   from './components/ProjectsPanel';
import MessagesPanel   from './components/MessagesPanel';
import AddProjectModal from './components/AddProjectModal';
import Profile         from './components/Profile';
import Message         from './components/Message';
import Calendar        from './components/Calender';
import History         from './components/History';
import Setting         from './components/Setting';
import { projectsData, messagesData } from './data/mockData';
import './App.css';

// ── Helper: load projects from localStorage or fallback to mockData ──
const loadProjects = () => {
  try {
    const saved = localStorage.getItem('savedProjects');
    return saved ? JSON.parse(saved) : projectsData;
  } catch { return projectsData; }
};

// ── Helper: load messages from localStorage or fallback to mockData ──
const loadMessages = () => {
  try {
    const saved = localStorage.getItem('savedMessages');
    return saved ? JSON.parse(saved) : messagesData;
  } catch { return messagesData; }
};

export default function App() {
  const [activePage,  setActivePage]  = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);

  // ── Projects — load from localStorage on startup ──
  const [projects, setProjects] = useState(loadProjects);

  // ── Messages — load from localStorage on startup ──
  const [messages, setMessages] = useState(loadMessages);

  // ── Auth state ──
  const [loggedIn, setLoggedIn] = useState(() => {
    try { return !!localStorage.getItem('loggedInUser'); }
    catch { return false; }
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // ── Save projects to localStorage every time they change ──
  const saveProjects = (newProjects) => {
    setProjects(newProjects);
    try {
      localStorage.setItem('savedProjects', JSON.stringify(newProjects));
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  };

  // ── Save messages to localStorage every time they change ──
  const saveMessages = (newMessages) => {
    setMessages(newMessages);
    try {
      localStorage.setItem('savedMessages', JSON.stringify(newMessages));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  };

  const handleLoginSuccess = (user) => {
    setLoggedIn(true);
    setUserProfile(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setLoggedIn(false);
    setActivePage('home');
  };

  // ── Project handlers — all persist to localStorage ──
  const handleAddProject = useCallback((p) => {
    setProjects(prev => {
      const updated = [p, ...prev];
      localStorage.setItem('savedProjects', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDeleteProject = useCallback((id) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('savedProjects', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleEditProject = useCallback((id, updates) => {
    setProjects(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      localStorage.setItem('savedProjects', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDuplicateProject = useCallback((project) => {
    setProjects(prev => {
      const updated = [{
        ...project,
        id:    Date.now(),
        title: `${project.title} (Copy)`,
      }, ...prev];
      localStorage.setItem('savedProjects', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── Message handlers — all persist to localStorage ──
  const handleStarMessage = useCallback((id) => {
    setMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m);
      localStorage.setItem('savedMessages', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── Profile save ──
  const handleProfileSave = useCallback((data) => {
    setUserProfile(data);
    // Also update loggedInUser so header stays in sync
    try {
      const loggedIn = localStorage.getItem('loggedInUser');
      if (loggedIn) {
        const user = JSON.parse(loggedIn);
        localStorage.setItem('loggedInUser', JSON.stringify({ ...user, ...data }));
      }
    } catch (e) {
      console.error('Failed to sync profile:', e);
    }
  }, []);

  // ── Show auth if not logged in ──
  if (!loggedIn) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'profile':
        return (
          <Profile
            onProfileSave={handleProfileSave}
            projects={projects}
            messages={messages}
          />
        );
      case 'messages':
  return (
    <Message
      messages={messages}
      onStar={handleStarMessage}
      userProfile={userProfile}
    />
  );
      case 'calendar':
        return <Calendar projects={projects} />;
      case 'history':
        return <History  projects={projects} />;
      case 'settings':
        return <Setting  userProfile={userProfile} />;
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
        onLogout={handleLogout}
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
        <AddProjectModal
          onClose={() => setModalOpen(false)}
          onAdd={handleAddProject}
        />
      )}
    </div>
  );
}