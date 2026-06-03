
import React, { useState } from 'react';
import { User, Ticket, TicketStatus, TicketPriority, TicketCategory } from '../types';
import { DBService } from '../services/dbService';
import { GeminiService } from '../services/geminiService';

interface UserDashboardProps {
  user: User;
  tickets: Ticket[];
  onRefresh: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, tickets, onRefresh }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const userTickets = tickets.filter(t => t.userId === user.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    
    try {
      const gemini = GeminiService.getInstance();
      const analysis = await gemini.analyzeTicket(title, description);

      const newTicket: Ticket = {
        id: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        userId: user.id,
        userName: user.name,
        title,
        description,
        status: TicketStatus.OPEN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiAnalysis: analysis,
        replies: []
      };

      DBService.saveTicket(newTicket);
      setTitle('');
      setDescription('');
      setIsCreating(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return 'bg-emerald-100 text-emerald-700';
      case TicketStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TicketStatus.RESOLVED: return 'bg-purple-100 text-purple-700';
      case TicketStatus.CLOSED: return 'bg-slate-100 text-slate-700';
      case TicketStatus.ESCALATED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Grievances</h1>
          <p className="text-slate-500">Submit and track your requests.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center space-x-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Ticket</span>
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Submit New Grievance</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                <input 
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Package not delivered after 5 days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                  placeholder="Provide detailed information about your issue..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" onClick={() => setIsCreating(false)} disabled={analyzing}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={analyzing}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center space-x-2 transition"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>AI Analyzing...</span>
                    </>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userTickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">No tickets found</h3>
          <p className="text-slate-500 mt-1">You haven't submitted any grievances yet.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="mt-6 text-indigo-600 font-semibold hover:underline"
          >
            Submit your first ticket
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {userTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(ticket => (
            <div key={ticket.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-400">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{ticket.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mt-1">{ticket.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <div className="mt-2 flex items-center space-x-2">
                    {ticket.aiAnalysis && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        {ticket.aiAnalysis.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
