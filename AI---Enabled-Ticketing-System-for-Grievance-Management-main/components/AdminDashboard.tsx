
import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { DBService } from '../services/dbService';
import Analytics from './Analytics';
import TicketDetail from './TicketDetail';

interface AdminDashboardProps {
  tickets: Ticket[];
  onRefresh: () => void;
  activeTab: 'tickets' | 'analytics';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ tickets, onRefresh, activeTab }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredTickets = useMemo(() => {
    return filterStatus === 'ALL' 
      ? tickets 
      : tickets.filter(t => t.status === filterStatus);
  }, [tickets, filterStatus]);

  const sortedTickets = useMemo(() => {
    const priorityMap = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
    return [...filteredTickets].sort((a, b) => {
      const pA = priorityMap[a.aiAnalysis?.priority || TicketPriority.MEDIUM];
      const pB = priorityMap[b.aiAnalysis?.priority || TicketPriority.MEDIUM];
      if (pA !== pB) return pB - pA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredTickets]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      urgent: tickets.filter(t => t.aiAnalysis?.priority === TicketPriority.URGENT).length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length
    };
  }, [tickets]);

  if (activeTab === 'analytics') {
    return <Analytics tickets={tickets} />;
  }

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tickets', value: stats.total, color: 'indigo' },
          { label: 'Pending Action', value: stats.open, color: 'emerald' },
          { label: 'Urgent Priority', value: stats.urgent, color: 'red' },
          { label: 'Resolution Rate', value: stats.total ? Math.round((stats.resolved / stats.total) * 100) + '%' : '0%', color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
            <div className={`text-3xl font-bold mt-1 text-${stat.color}-600`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Inbox</h2>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-100 border-none rounded-md px-2 py-1 outline-none"
              >
                <option value="ALL">All Status</option>
                {Object.values(TicketStatus).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
              {sortedTickets.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No tickets found.</div>
              ) : (
                sortedTickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full text-left p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition ${selectedTicketId === ticket.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{ticket.id}</span>
                      <span className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm line-clamp-1">{ticket.title}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        ticket.aiAnalysis?.priority === TicketPriority.URGENT ? 'bg-red-100 text-red-700' :
                        ticket.aiAnalysis?.priority === TicketPriority.HIGH ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {ticket.aiAnalysis?.priority}
                      </span>
                      <span className="text-[10px] text-slate-400">{ticket.userName}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-2/3">
          {selectedTicket ? (
            <TicketDetail ticket={selectedTicket} onRefresh={onRefresh} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 h-[700px] flex flex-col items-center justify-center text-center p-12">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Select a ticket to view details</h3>
              <p className="text-slate-500 max-w-sm mt-2">Choose a grievance from the left sidebar to start processing with AI assistance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
