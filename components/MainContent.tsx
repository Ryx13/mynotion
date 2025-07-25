import React from 'react';
import Dashboard from './Dashboard';
import Notes from './Notes';
import Flashcards from './Flashcards';
import Courses from './Courses';
import Tasks from './Tasks';
import Timetable from './Timetable';
import Performance from './Performance';
import Schedule from './Schedule';
import Icon from './Icon';
import { View } from '../App';

interface MainContentProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeView: View;
  onNavigate: (view: View) => void;
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarCollapsed, toggleSidebar, activeView, onNavigate }) => {

  const renderContent = () => {
    switch (activeView) {
      case 'notes':
        return <Notes />;
      case 'flashcards':
        return <Flashcards />;
      case 'courses':
        return <Courses />;
      case 'tasks':
        return <Tasks />;
      case 'timetable':
        return <Timetable />;
      case 'schedule':
        return <Schedule />;
      case 'performance':
        return <Performance />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 flex-shrink-0">
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mr-4"
            aria-label="Expand sidebar"
          >
            <Icon name="bars" />
          </button>
        )}
         <div className="flex-1">
          {/* Search bar could go here */}
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainContent;