import React from 'react';
import { User } from '../types';
import Icon from './Icon';

type View = 'dashboard' | 'notes' | 'flashcards' | 'courses' | 'tasks' | 'timetable' | 'performance' | 'schedule';

interface SidebarProps {
  user: User;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  activeView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isCollapsed, toggleSidebar, activeView, onNavigate, onLogout }) => {
  
  const navItems: { view: View; label: string; icon: string }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: 'home' },
    { view: 'notes', label: 'Notes', icon: 'book' },
    { view: 'flashcards', label: 'Flashcards', icon: 'layer-group' },
    { view: 'courses', label: 'Courses', icon: 'graduation-cap' },
    { view: 'tasks', label: 'Tasks', icon: 'check-square' },
    { view: 'timetable', label: 'Timetable', icon: 'calendar-alt' },
    { view: 'schedule', label: 'Schedule', icon: 'calendar-check' },
    { view: 'performance', label: 'Performance', icon: 'chart-line' },
  ];

  return (
    <div
      className={`
        bg-slate-100 dark:bg-gray-900/70 backdrop-blur-lg
        border-r border-slate-200 dark:border-slate-800
        h-full flex flex-col overflow-hidden transition-all duration-300 flex-shrink-0
        ${isCollapsed ? 'w-0' : 'w-64'}
      `}
    >
      <div className="p-4 flex items-center border-b border-solid border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
          {user.initials}
        </div>
        <div className="ml-3 overflow-hidden">
          <div className="font-medium text-sm truncate text-slate-800 dark:text-slate-100">{user.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Personal Workspace</div>
        </div>
        <button
          onClick={toggleSidebar}
          className="ml-auto text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          aria-label="Collapse sidebar"
        >
          <Icon name="chevron-left" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = activeView === item.view;
          const activeClasses = 'bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400';
          const inactiveClasses = 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800';
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex items-center w-full text-left text-sm rounded py-2 px-3 transition-colors ${isActive ? activeClasses : inactiveClasses}`}
            >
              <Icon name={item.icon} className="w-5" />
              <span className="ml-3">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          onClick={onLogout}
          className="flex items-center w-full text-left text-sm rounded py-2 px-3 transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <Icon name="sign-out-alt" className="w-5"/>
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
