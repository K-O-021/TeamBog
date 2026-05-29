import React, { useMemo } from "react";
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, Zap, BrainCircuit, CheckCircle2, 
  Activity, Heart, Info, Calendar, Clock, Wifi, WifiOff,
  TrendingUp, LayoutDashboard, MessageSquare,
  ArrowUpRight, Sparkles, Target, Star
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ParentProgress = () => {
  const { isConnected, latency, students = [], user, behaviorLogs = [], progressNotes = [] } = useApp();
  const myChild = students.find(s => s.parentEmail === user?.email);
  
  const studentData = useMemo(() => ({
    name: myChild?.name || "Authorized Learner",
    condition: myChild?.diagnosis || "N/A",
    specialization: myChild?.grade || "N/A",
    growthIndex: myChild ? `${Math.min(100, (behaviorLogs.filter(l => l.studentId === myChild.id && l.type === 'Positive').length * 12)).toFixed(1)}%` : "0.0%",
    aiConfidence: "94.2%",
    lastUpdate: myChild?.lastActivity || "Never",
    competency: [
      { subject: 'Social', baseline: 40, current: 65 },
      { subject: 'Emotional', baseline: 30, current: 55 },
      { subject: 'Cognitive', baseline: 50, current: 70 },
      { subject: 'Adaptive', baseline: 35, current: 60 },
      { subject: 'Motor', baseline: 45, current: 75 },
    ],
    weeklyTrend: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
      const count = behaviorLogs.filter(l => {
        if (!myChild) return false;
        const logDate = new Date(l.date);
        return l.studentId === myChild.id && logDate.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      }).length;
      return { day, level: Math.min(100, count * 25) };
    }),
    logs: behaviorLogs
      .filter(l => l.studentId === myChild?.id)
      .map(l => ({
        id: l.id,
        category: l.activity || "Monitoring",
        date: l.date,
        note: l.detail || l.description,
        status: l.type === 'Positive' ? 'Improvement' : 'Observation'
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }), [myChild, behaviorLogs]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 relative overflow-x-hidden">
      {/* Institutional Emerald Radial Background */}
      <div className="fixed inset-0 -z-10 bg-[#FBF7F2]" style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(123, 28, 42, 0.1) 0, transparent 40%), 
          radial-gradient(at 100% 0%, rgba(196, 154, 60, 0.08) 0, transparent 40%),
          radial-gradient(at 50% 100%, rgba(123, 28, 42, 0.05) 0, transparent 40%)
        `
      }} />
      
      {/* --- TOP NAV --- */}
      <nav className="bg-white/80 backdrop-blur-2xl border-b border-[#e8d8da] px-8 py-5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#3D0C18] p-2.5 rounded-2xl shadow-xl shadow-rose-900/10 border border-[#7B1C2A]/20">
              <LayoutDashboard className="text-[#C49A3C]" size={18} />
            </div>
            <div>
              <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">SNED-LINK<span className="text-[#7B1C2A]">+</span></h2>
              <p className="text-[9px] font-black text-[#7B1C2A]/40 uppercase tracking-widest">Parent Portal: Institutional Mainframe</p>
            </div>
          </div>
          <div className="px-5 py-2 bg-[#F7ECEE]/50 border border-[#e8d8da] rounded-full flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-[#7B1C2A]' : 'bg-rose-500'}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${isConnected ? 'text-[#7B1C2A]' : 'text-rose-700'}`}>
              {isConnected ? `Mainframe Node Sync [${latency}ms]` : 'Link Offline'}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12">
        
        {/* --- HERO HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white/40 backdrop-blur-sm p-10 rounded-[3rem] border border-white/60 shadow-sm">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#3D0C18] text-white rounded-full shadow-xl shadow-rose-900/10 border border-[#7B1C2A]/20">
              <ShieldCheck size={14} className="text-[#C49A3C]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Progress Node</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              {studentData.name.split(',')[0]}<span className="text-[#7B1C2A]">.</span>
            </h1>
            <div className="flex flex-wrap gap-2">
              {[studentData.condition, studentData.specialization, "Active IEP"].map(tag => (
                <span key={tag} className="px-4 py-2 bg-[#F7ECEE] rounded-xl text-[10px] font-black text-[#7B1C2A] uppercase border border-[#e8d8da] tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
             <div className="px-8 py-6 bg-[#3D0C18] rounded-[2.5rem] shadow-2xl shadow-rose-900/20 flex flex-col items-end group transition-all border border-[#7B1C2A]/30">
                <p className="text-[9px] font-black text-[#C49A3C]/60 uppercase tracking-widest mb-2">Inference Confidence</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black text-[#FBF7F2] italic tracking-tighter">{studentData.aiConfidence}</p>
                  <Sparkles className="text-[#C49A3C]" size={20} />
                </div>
             </div>
          </div>
        </div>

        {/* --- ANALYTICS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* GROWTH SPECTRUM RADAR */}
          <div className="lg:col-span-5 bg-white p-10 rounded-[4rem] border border-emerald-50 shadow-xl shadow-emerald-900/5 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
               <div className="space-y-1">
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Growth Spectrum</h3>
                 <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Baseline vs Current Competency</p>
               </div>
               <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                 <Target size={22} />
               </div>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={studentData.competency}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B', letterSpacing: '0.1em' }} />
                  <Radar name="Baseline" dataKey="baseline" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />
                  <Radar name="Achieved" dataKey="current" stroke="#059669" strokeWidth={4} fill="#10B981" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-10 p-8 bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-[2.5rem] text-white flex justify-between items-center group-hover:scale-[1.02] transition-transform duration-500 shadow-2xl">
                <div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">Aggregate Index</p>
                  <p className="text-xs text-emerald-100/50 font-bold uppercase tracking-widest mt-1">Total Growth Index</p>
                </div>
                <span className="text-5xl font-black italic text-emerald-50 drop-shadow-xl">{studentData.growthIndex}</span>
            </div>
          </div>

          {/* WEEKLY TREND & AI STRATEGY */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* AREA CHART */}
            <div className="bg-white p-10 rounded-[4rem] border border-emerald-50 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Neural Engagement Flow</h3>
                <span className="px-4 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">Active Cycle</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studentData.weeklyTrend}>
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                    <Area type="monotone" dataKey="level" stroke="#059669" strokeWidth={5} fillOpacity={1} fill="url(#emeraldGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI STRATEGY CARD (Emerald Redesign) */}
            <div className="p-10 bg-emerald-600 rounded-[3.5rem] shadow-2xl shadow-emerald-900/20 text-white relative overflow-hidden group border border-emerald-500">
              <BrainCircuit className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000" size={240} />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
                    <Zap size={18} className="text-emerald-200 fill-emerald-200" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100">Neural Support Strategy</h4>
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-4xl font-black leading-tight italic uppercase tracking-tighter">
                    Peak Stability Window: <br /><span className="text-emerald-950 bg-emerald-300 px-3 py-1 rounded-xl">9:00 AM Tomorrow</span>
                  </h5>
                  <p className="text-sm font-bold text-emerald-50/80 leading-relaxed max-w-lg italic border-l-4 border-emerald-300 pl-6">
                    "Heart's fine motor stability is peaking. Institutional analysis recommends using tactile clay or tracing sheets tonight to reinforce classroom progress."
                  </p>
                </div>

                <button className="mt-4 px-10 py-5 bg-emerald-950 text-emerald-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-emerald-950 transition-all shadow-2xl shadow-emerald-950/40 flex items-center gap-3 group active:scale-95">
                  Confirm Strategy Acknowledgment
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- LOGS SECTION --- */}
        <div className="pt-8 space-y-10">
           <div className="flex items-center gap-6">
             <div className="h-px flex-1 bg-emerald-100" />
             <h3 className="text-[11px] font-black text-emerald-800/40 uppercase tracking-[0.4em] italic flex items-center gap-4">
               <MessageSquare size={18} /> Verified Behavioral Logs
             </h3>
             <div className="h-px flex-1 bg-emerald-100" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {studentData.logs.map(log => (
                <div key={log.id} className="bg-white/60 backdrop-blur-sm p-10 rounded-[3rem] border border-emerald-50 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 relative group overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <span className="px-5 py-2 bg-emerald-950 text-emerald-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-emerald-800">
                      {log.category}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Calendar size={14} /> {log.date}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-700 my-8 italic leading-relaxed group-hover:text-slate-900 transition-colors">
                    "{log.note}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-5 py-2.5 rounded-full border border-emerald-100">
                      <CheckCircle2 size={16} /> {log.status}
                    </div>
                    <Star size={16} className="text-emerald-100" />
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-emerald-950 text-emerald-100/50 py-4 px-10 rounded-full w-fit mx-auto shadow-2xl border border-emerald-800">
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">Last Node Update: {studentData.lastUpdate} • SNED-LINK Access Level 4</p>
        </div>
      </main>
    </div>
  );
};

export default ParentProgress;