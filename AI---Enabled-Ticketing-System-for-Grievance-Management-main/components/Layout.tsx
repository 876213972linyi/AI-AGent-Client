
import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeView: 'dashboard' | 'analytics' | 'chat';
  onViewChange: (view: 'dashboard' | 'analytics' | 'chat') => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeView, onViewChange, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">AI-Grievance Management System</span>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <button 
              onClick={() => onViewChange('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {user.role === UserRole.ADMIN ? 'Manage Tickets' : 'My Tickets'}
            </button>
            {user.role === UserRole.ADMIN && (
              <button 
                onClick={() => onViewChange('analytics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeView === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Analytics
              </button>
            )}
            {user.role === UserRole.USER && (
              <button 
                onClick={() => onViewChange('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeView === 'chat' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                AI Assistant
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-800">{user.name}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">{user.role}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-red-600 transition"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} AI-Grievance Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
