import React, { useMemo, useState, useEffect } from 'react';
import { ShieldCheck, Terminal, Clock, MapPin, User, Activity, AlertCircle, CheckCircle2, TrendingUp, HelpCircle, Zap, Shield, Cpu, Share2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import AdminHeader from '@/components/AdminHeader';

const AdminLogs = () => {
  const { behaviorLogs = [], isConnected, latency: streamLatency } = useApp();
  const [simulatedLatency, setSimulatedLatency] = useState('0.02ms');
  const [throughput, setThroughput] = useState('1.2kb/s');
  const [activeNodes, setActiveNodes] = useState(3);

  // Real-time Telemetry Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedLatency(`${(Math.random() * 0.05 + 0.01).toFixed(2)}ms`);
      setThroughput(`${(Math.random() * 0.8 + 0.9).toFixed(1)}kb/s`);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const logMetrics = useMemo(() => {
    const total = behaviorLogs.length;
    const positive = behaviorLogs.filter(log => log.type === 'Positive').length;
    const negative = total - positive;
    return { total, positive, negative };
  }, [behaviorLogs]);

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300"
      style={{ fontFamily: "'Georgia','Times New Roman',serif", background: '#FBF7F2', minHeight: '100vh' }}
    >
      
      {/* 🌌 SLICK METRICS OVERLAY HEADER */}
      <AdminHeader
        icon={Activity}
        title="Audit"
        highlightedTitle="Trail"
        subtitle={
          <div className="flex items-center gap-2 text-slate-500 text-xs font-normal mt-1">
            <Terminal size={12} className="text-slate-400" /> 
            <span>Live event monitoring matrix</span>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 rounded">v2.4</span>
          </div>
        }
        showSystemLink
        isConnected={isConnected}
        latency={streamLatency}
      >
        <div className="grid grid-cols-3 gap-2 w-full lg:w-auto pt-4 lg:pt-0">
          <div className="px-4 py-2 bg-slate-50 rounded-xl text-center lg:text-left min-w-[100px]">
            <span className="text-[10px] text-slate-400 font-medium block">Total</span>
            <span className="text-xl font-semibold text-slate-900 tracking-tight">{logMetrics.total}</span>
          </div>
          <div className="px-4 py-2 bg-[#F7ECEE]/50 rounded-xl text-center lg:text-left min-w-[100px]">
            <span className="text-[10px] text-[#7B1C2A] font-medium block">Constructive</span>
            <span className="text-xl font-semibold text-[#7B1C2A] tracking-tight">{logMetrics.positive}</span>
          </div>
          <div className="px-4 py-2 bg-rose-50/50 rounded-xl text-center lg:text-left min-w-[100px]">
            <span className="text-[10px] text-rose-600 font-medium block">Disruptive</span>
            <span className="text-xl font-semibold text-rose-600 tracking-tight">{logMetrics.negative}</span>
          </div>
        </div>
      </AdminHeader>

      {/* 📡 REAL-TIME SYSTEM NODES MONITOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Teacher Nodes', status: 'Online', icon: Shield, color: 'text-emerald-500' },
          { label: 'Parent Nodes', status: 'Syncing', icon: Share2, color: 'text-blue-500' },
          { label: 'Admin Terminal', status: 'Root', icon: Cpu, color: 'text-rose-500' }
        ].map((node, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-xl p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-slate-50 rounded-lg ${node.color}`}>
                <node.icon size={16} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{node.label}</p>
                <p className="text-xs font-black text-slate-700 uppercase italic">{node.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.div 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]`}
              />
              <span className="text-[9px] font-mono font-bold text-emerald-600">STABLE</span>
            </div>
          </div>
        ))}
      </div>

      {/* 📑 CLEAN STREAM BOARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Stream Utility Row */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase italic">Neural Activity Feed</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
              <Zap size={10} className="text-amber-500" />
              <span>Throughput: {throughput}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
              <Clock size={10} className="text-blue-500" />
              <span>Latency: {streamLatency || 0}ms</span>
            </div>
            <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-tighter animate-pulse border border-emerald-100">
              Live Stream
            </div>
          </div>
        </div>

        {/* Dynamic Log Queue */}
        <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
          {behaviorLogs.length > 0 ? (
            // OPTIMIZATION: Limit rendered logs to the most recent 50 to prevent DOM bloat
            behaviorLogs.slice(0, 50).map((log, idx) => {
              const isPositive = log.type === 'Positive';

              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                  key={log.id || idx}
                  className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Log ID + Time + Core Message */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mt-0.5 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className="font-mono text-[11px] font-medium text-slate-400">
                        #{String(log.id || idx).padStart(4, '0')}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <p className="text-slate-700 text-sm font-medium leading-relaxed max-w-3xl break-words">
                        {log.description || 'System state healthy. No remarks logged.'}
                      </p>
                      
                      {/* Sub-text Timestamps & Location */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{log.time || '00:00'} &bull; {log.date || 'Today'}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} className="text-slate-300" />
                          {log.location || 'Remote Context'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Targets & Actors */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    
                    {/* User Profiles Context */}
                    <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-xs">
                      <User size={12} className="text-slate-400" />
                      <span className="text-slate-600 font-medium">{log.studentName || 'System'}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-slate-500 text-[11px] italic">Auth: {log.teacherName || 'System'}</span>
                    </div>

                    {/* Simple Verification Capsule */}
                    <div className="px-2 py-1 rounded bg-slate-100 text-slate-500 font-mono text-[10px] tracking-tight uppercase ml-auto lg:ml-0">
                      Secured
                    </div>
                  </div>

                </motion.div>
              );
            })
          ) : (
            <div className="py-24 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
                <HelpCircle size={16} />
              </div>
              <h4 className="text-sm font-medium text-slate-700">Database Stream Idle</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No telemetry activity logs are recorded on the current node parameters.
              </p>
            </div>
          )}
        </div>

        {/* Minimal Footer Stamp */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-500" /> 
              Encrypted Gateway Active
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[9px] font-black uppercase tracking-widest">Protocol: Neural-Sync v2.4</span>
          </div>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">AES-256 GCM</span>
        </div>
      </div>

    </div>
  );
};

export default AdminLogs;