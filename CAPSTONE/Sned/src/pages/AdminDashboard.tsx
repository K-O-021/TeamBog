import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  GraduationCap, 
  Activity, 
  TrendingUp, 
  Clock,
  LayoutDashboard,
  Shield,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminHeader from '@/components/AdminHeader';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const { users = [], students = [], behaviorLogs = [], isConnected, latency } = useApp();

  // Real-time calculation based on global institutional state
  const stats = useMemo(() => {
    const teachers = users.filter(u => u.role === 'teacher').length;
    const parents = users.filter(u => u.role === 'parent').length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const totalEvents = behaviorLogs.length;

    return { teachers, parents, activeStudents, totalEvents };
  }, [users, students, behaviorLogs]);

  // Audit Trail (Pulse of Teacher and Parent node activity)
  const auditPulse = useMemo(() => {
    return [...behaviorLogs]
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
      .slice(0, 5);
  }, [behaviorLogs]);

  const populationData = [
    { name: 'Teachers', value: stats.teachers, color: '#7B1C2A' },
    { name: 'Parents', value: stats.parents, color: '#C49A3C' },
    { name: 'Learners', value: stats.activeStudents, color: '#3D0C18' },
  ];

  return (
    <div
      className="space-y-8 animate-in fade-in duration-500 pb-12"
      style={{ fontFamily: "'Georgia','Times New Roman',serif", background: '#FBF7F2', minHeight: '100vh' }}
    >
      {/* --- PREMIUM HEADER --- */}
      <AdminHeader
        icon={LayoutDashboard}
        title="Admin"
        highlightedTitle="Dashboard"
        subtitle="Real-Time Institutional Control Node"
        showSystemLink
        isConnected={isConnected}
        latency={latency}
      />

      {/* --- METRICS GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Teachers', value: stats.teachers, sub: 'Instructors', icon: Shield, color: 'text-[#7B1C2A]', bg: 'bg-[#F7ECEE]' },
          { label: 'Parents', value: stats.parents, sub: 'Guardian Nodes', icon: Users, color: 'text-[#C49A3C]', bg: 'bg-[#FAF3E0]' },
          { label: 'Learners', value: stats.activeStudents, sub: 'Active Files', icon: GraduationCap, color: 'text-[#7B1C2A]', bg: 'bg-[#F7ECEE]/50' },
          { label: 'Total Events', value: stats.totalEvents, sub: 'Ledger Tensors', icon: Activity, color: 'text-slate-100', bg: 'bg-[#3D0C18]' },
        ].map((s, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group ${s.bg === 'bg-[#3D0C18]' ? 'bg-[#3D0C18] border-[#3D0C18] text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${s.bg === 'bg-[#3D0C18]' ? 'bg-[#7B1C2A] text-[#C49A3C]' : `${s.bg} ${s.color}`}`}>
                <s.icon size={24} />
              </div>
              <TrendingUp className={`${s.bg === 'bg-[#3D0C18]' ? 'text-[#7B1C2A]' : 'text-slate-100'} group-hover:text-[#C49A3C] transition-colors`} size={20} />
            </div>
            <p className="text-3xl font-black tracking-tighter italic leading-none mb-1">{s.value}</p>
            <p className={`text-[10px] font-black uppercase tracking-widest ${s.bg === 'bg-[#3D0C18]' ? 'text-[#C49A3C]/60' : 'text-slate-400'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* AUDIT PULSE FEED */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2 italic">
            <Zap size={18} className="text-[#7B1C2A] animate-pulse" /> Live Audit stream
          </h3>
          <div className="space-y-6">
            {auditPulse.length > 0 ? auditPulse.map((log, idx) => (
              <div key={idx} className="flex gap-4 items-start border-l-2 border-[#F7ECEE] pl-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#7B1C2A]">{log.studentName}</p>
                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{log.time}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 line-clamp-1 italic">"{log.description}"</p>
                  <p className="text-[8px] font-black text-slate-300 uppercase mt-1">Logged by: {log.teacherName || 'System'}</p>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No node activity detected</div>
            )}
          </div>
        </div>

        {/* POPULATION MAP */}
        <div className="lg:col-span-7 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10">Institutional Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={populationData}>
                <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" radius={[16, 16, 16, 16]} barSize={50}>
                  {populationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex justify-center gap-6">
            {populationData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;