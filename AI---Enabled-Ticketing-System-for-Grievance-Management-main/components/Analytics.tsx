
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Ticket, TicketCategory, TicketStatus } from '../types';

interface AnalyticsProps {
  tickets: Ticket[];
}

const Analytics: React.FC<AnalyticsProps> = ({ tickets }) => {
  const categories = Object.values(TicketCategory);
  
  const categoryData = categories.map(cat => ({
    name: cat,
    count: tickets.filter(t => t.aiAnalysis?.category === cat).length
  }));

  const statusData = [
    { name: 'Open', value: tickets.filter(t => t.status === TicketStatus.OPEN).length, color: '#10b981' },
    { name: 'In Progress', value: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'Resolved', value: tickets.filter(t => t.status === TicketStatus.RESOLVED).length, color: '#8b5cf6' },
    { name: 'Escalated', value: tickets.filter(t => t.status === TicketStatus.ESCALATED).length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const sentimentData = [
    { name: 'Positive', count: tickets.filter(t => t.aiAnalysis?.sentiment === 'POSITIVE').length },
    { name: 'Neutral', count: tickets.filter(t => t.aiAnalysis?.sentiment === 'NEUTRAL').length },
    { name: 'Negative', count: tickets.filter(t => t.aiAnalysis?.sentiment === 'NEGATIVE').length }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operational Insights</h1>
          <p className="text-slate-500">Real-time performance and grievance trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Volume by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" fontSize={12} stroke="#64748b" width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Resolution Progress</h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-2">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-slate-600 font-medium">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sentiment Pulse</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} stroke="#64748b" />
                <YAxis fontSize={12} stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Root Cause Analysis */}
        <div className="bg-indigo-600 p-8 rounded-2xl text-white">
          <h3 className="text-xl font-bold mb-4">AI Prediction Engine</h3>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="text-xs uppercase font-bold text-indigo-200 mb-1">Bottleneck Warning</div>
              <p className="text-sm">Logistics in Region-7 shows a 24% increase in 'Delivery Delay' grievances. Resolving this could prevent ~40 new tickets next week.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="text-xs uppercase font-bold text-indigo-200 mb-1">SLA Alert</div>
              <p className="text-sm">4 'Payment Problems' are reaching 48h resolution threshold. Immediate routing to Financial Specialists suggested.</p>
            </div>
            <button className="w-full bg-white text-indigo-600 py-2 rounded-lg font-bold mt-4 hover:bg-indigo-50 transition">
              Generate Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
