import React, { useMemo } from "react";
import { useApp } from '@/context/AppContext';
import { 
  Bell, ShieldAlert, Zap, Clock, Wifi, WifiOff,
  CheckCircle2, BrainCircuit, Info, 
  AlertTriangle, ShieldCheck, Activity
} from "lucide-react";

const ParentAlerts = () => {
  const { user, students, alerts, markAlertReviewed, isConnected, latency } = useApp();
  
  // Filtering specifically for the Parent's child
  const myChild = students.find(s => s.parentEmail === user?.email);
  const childAlerts = useMemo(() => 
    alerts
      .filter(a => a.studentName === myChild?.name)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
    [alerts, myChild]
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in relative min-h-screen font-['Times_New_Roman',_serif]">
      {/* Institutional Emerald Background */}
      <div className="fixed inset-0 -z-10" style={{
        background: '#FBF7F2',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(123, 28, 42, 0.1) 0, transparent 40%), 
          radial-gradient(at 100% 0%, rgba(196, 154, 60, 0.08) 0, transparent 40%)
        `
      }} />

      {/* --- HEADER: CHILD NODE STATUS --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] border border-[#e8d8da] shadow-xl shadow-rose-950/5">
        <div className="space-y-4">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full w-fit border transition-colors ${isConnected ? 'bg-[#F7ECEE] text-[#7B1C2A] border-[#e8d8da]' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
            {isConnected ? <Wifi size={10} className="animate-pulse" /> : <WifiOff size={10} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
              {isConnected ? `Live Feed Active [${latency || 0}ms]` : 'Link Offline'}
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
              Safety & <span className="text-[#7B1C2A]">Support Feed</span>
            </h1>
            <p className="text-[#7B1C2A]/40 font-black text-[10px] uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
              <Activity size={14} /> Learner Profile: {myChild?.name || "Initializing..."}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-4 bg-white border border-[#e8d8da] rounded-2xl shadow-xl shadow-rose-950/5 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Alerts</p>
              <p className="text-sm font-black text-[#7B1C2A] uppercase">{childAlerts.length} Neural Logs</p>
            </div>
            <div className="p-2 bg-[#7B1C2A] rounded-xl text-white">
                <Bell size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* --- NOTIFICATIONS TIMELINE --- */}
      {childAlerts.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-20 text-center border border-emerald-100 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <ShieldCheck className="text-emerald-300" size={40} />
          </div>
          <h3 className="text-xl font-black text-emerald-800/40 uppercase italic tracking-widest">System Status Clear</h3>
          <p className="text-sm text-slate-400 font-bold mt-2">No predictive anomalies or intervention requirements detected.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-[2px] before:bg-emerald-100/50">
          {childAlerts.map((a, index) => (
            <div 
              key={a.id} 
              className={`relative ml-16 p-8 rounded-[2.5rem] border transition-all hover:translate-x-1 shadow-sm flex flex-col gap-6 group ${
                a.reviewed ? 'bg-white border-slate-100 opacity-60' :
                a.priority === 'High' || a.priority === 'Critical'
                  ? 'bg-red-50 border-red-100' 
                  : 'bg-white/80 backdrop-blur-sm border-emerald-50'}`}
            >
              {/* Timeline Icon Node */}
              <div className={`absolute -left-[54px] top-8 w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-xl transition-transform group-hover:rotate-6
                ${a.priority === 'High' || a.priority === 'Critical' 
                  ? 'bg-red-500 text-white shadow-red-500/20' 
                  : 'bg-emerald-950 text-emerald-400 shadow-emerald-950/20'}`}
              >
                {a.priority === 'High' || a.priority === 'Critical' ? <AlertTriangle size={20} /> : <BrainCircuit size={20} />}
              </div>

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${a.priority === 'High' || a.priority === 'Critical' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {a.priority === 'High' || a.priority === 'Critical' ? 'Urgent Intervention Required' : 'AI Behavioral Insight'}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <Clock size={12} /> Logged: {a.timestamp}
                  </p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  a.priority === 'High' || a.priority === 'Critical' 
                    ? 'bg-red-100 text-red-600 border border-red-200' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {a.priority} Priority
                </span>
              </div>

              <div className="space-y-4">
                <p className={`text-base font-black leading-relaxed italic ${a.priority === 'High' || a.priority === 'Critical' ? 'text-red-900' : 'text-slate-800'}`}>
                  "{a.message}"
                </p>
                
                {/* Emerald-Styled Recommendation Box */}
                <div className={`p-5 rounded-3xl border-l-4 flex gap-4 transition-colors
                  ${a.priority === 'High' || a.priority === 'Critical' 
                    ? 'bg-white/60 border-l-red-500 text-red-700' 
                    : 'bg-emerald-50/50 border-l-emerald-950 text-emerald-800'}`}
                >
                  <Info size={16} className="shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Strategic Recommendation</p>
                    <p className="text-xs font-bold leading-relaxed italic">
                      {a.priority === 'High' || a.priority === 'Critical' 
                        ? "Protocol: Confirm physical comfort and initiate direct communication with the Lead Instructor immediately." 
                        : "Reinforce designated sensory or motor exercises during the home-based evening transition."}
                    </p>
                  </div>
                </div>
              </div>

              {!a.reviewed && (
                <div className="flex justify-end pt-2 border-t border-emerald-50/50">
                  <button 
                    onClick={() => markAlertReviewed?.(a.id)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:text-emerald-950 transition-colors"
                  >
                    Acknowledge Receipt <CheckCircle2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- FOOTER AI PROTOCOL CARD --- */}
      <div className="p-10 bg-emerald-950 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group mt-12 border border-emerald-800">
        <BrainCircuit className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000" size={180} />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
           <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-900 flex items-center justify-center shrink-0 border border-emerald-800 shadow-inner">
              <ShieldAlert size={32} className="text-emerald-400" />
           </div>
           <div className="space-y-1">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Institutional Security Protocol</h4>
             <p className="text-base font-bold leading-snug text-emerald-50">
               All notifications are verified by the SNED-LINK+ AI Core. Data encryption is active for all learner nodes.
             </p>
           </div>
           <div className="md:ml-auto">
              <div className="px-6 py-3 bg-emerald-900/50 rounded-2xl border border-emerald-800">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Node Connectivity</p>
                <p className="text-xs font-black text-white">ENCRYPTED</p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-emerald-900 text-emerald-100 py-3 px-8 rounded-full w-fit mx-auto shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Node Status: {isConnected ? 'Synchronized' : 'Offline'} {isConnected && latency && `• RTT: ${latency}ms`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentAlerts;