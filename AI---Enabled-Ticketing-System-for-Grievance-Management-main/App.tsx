
import React, { useState, useEffect } from 'react';
import { User, Ticket, UserRole } from './types';
import { DBService } from './services/dbService';
import Auth from './components/Auth';
import Layout from './components/Layout';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [view, setView] = useState<'dashboard' | 'analytics' | 'chat'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = DBService.getCurrentUser();
    const allTickets = DBService.getTickets();
    setCurrentUser(user);
    setTickets(allTickets);
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    DBService.setCurrentUser(user);
    const allTickets = DBService.getTickets();
    setTickets(allTickets);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    DBService.setCurrentUser(null);
  };

  const refreshTickets = () => {
    setTickets(DBService.getTickets());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      activeView={view} 
      onViewChange={setView}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentUser.role === UserRole.ADMIN ? (
          <AdminDashboard 
            tickets={tickets} 
            onRefresh={refreshTickets} 
            activeTab={view === 'analytics' ? 'analytics' : 'tickets'}
          />
        ) : (
          <>
            {view === 'dashboard' && <UserDashboard user={currentUser} tickets={tickets} onRefresh={refreshTickets} />}
            {view === 'chat' && <Chatbot />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default App;
