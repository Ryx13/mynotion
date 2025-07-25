import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { USER, LOGIN_CREDENTIALS } from './constants';
import LoginScreen from './components/LoginScreen';

export type View = 'dashboard' | 'notes' | 'flashcards' | 'courses' | 'tasks' | 'timetable' | 'performance' | 'schedule';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  
  const handleLogin = (user: string, pass: string): boolean => {
    if (user === LOGIN_CREDENTIALS.username && pass === LOGIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <AppProvider>
      <div className="h-screen flex overflow-hidden animate-fadeIn">
        <Sidebar 
          user={USER}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)}
          activeView={activeView}
          onNavigate={setActiveView}
          onLogout={handleLogout}
        />
        <MainContent 
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)}
            activeView={activeView}
            onNavigate={setActiveView}
        />
      </div>
    </AppProvider>
  );
};

export default App;