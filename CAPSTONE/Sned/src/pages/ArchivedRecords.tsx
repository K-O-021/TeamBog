import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Archive, RotateCcw, Search, Snowflake, Database, ShieldAlert, Cpu, Activity, Clock, Wifi, WifiOff, Zap, X } from 'lucide-react';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import AdminHeader from '@/components/AdminHeader';
import { onSnapshot, query, where } from 'firebase/firestore';
import { usersRef, studentsRef, UserDoc, StudentDoc, updateStudent as firestoreUpdateStudent, updateUserProfile } from '@/lib/firestoreQueries';

const ArchivedRecords = () => {
  const { isConnected, latency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [restoreTarget, setRestoreTarget] = useState<{ id: string, name: string, category: string } | null>(null);

  const [realTimeArchivedStudents, setRealTimeArchivedStudents] = useState<StudentDoc[]>([]);
  const [realTimeArchivedTeachers, setRealTimeArchivedTeachers] = useState<UserDoc[]>([]);

  useEffect(() => {
    const q = query(studentsRef, where("status", "==", "archived"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: StudentDoc[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as StudentDoc));
      setRealTimeArchivedStudents(list);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(usersRef, where("status", "==", "archived"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserDoc[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as UserDoc));
      setRealTimeArchivedTeachers(list);
    });
    return () => unsubscribe();
  }, []);

  const archivedStudents = realTimeArchivedStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const archivedTeachers = realTimeArchivedTeachers.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allArchived = useMemo(() => {
    const s = archivedStudents.map(item => ({ ...item, nodeCategory: 'Learner Node' }));
    const t = archivedTeachers.map(item => ({ ...item, id: item.email, nodeCategory: 'Faculty Node' }));
    return [...s, ...t];
  }, [archivedStudents, archivedTeachers]);

  const handleRestore = (id: string, name: string, category: string) => {
    setRestoreTarget({ id, name, category });
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    const { id, name, category } = restoreTarget;
    try {
      if (category === 'Learner Node') {
        await firestoreUpdateStudent(id, { status: 'active' });
      } else if (category === 'Faculty Node') {
        await updateUserProfile(id, { status: 'active' });
      }
      toast.success("Packet Transmitted", {
        description: `Signal sent to re-initialize ${name}. Awaiting stream confirmation...`
      });
      setRestoreTarget(null);
    } catch (err) {
      console.error("Restore Error:", err);
      toast.error("Restoration Fault", {
        description: `Failed to re-initialize ${name}. Verify connection status.`
      });
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-500"
      style={{ fontFamily: "'Georgia','Times New Roman',serif", background: '#FBF7F2', minHeight: '100vh' }}
    >
      
      {/* 🧊 COLD STORAGE HEADER - Neural Design Matching Admin Logs */}
      <AdminHeader
        icon={Archive}
        title="Cold"
        highlightedTitle="Storage"
        subtitle={
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase mt-1">
            <Database size={12} className="text-slate-400" />
            <span>Isolated Learner Vaults Registry</span> {/* Original subtitle text */}
            <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1 rounded ml-1">
              Nodes: {allArchived.length}
            </span>
            <div className={`flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded font-mono text-[8px] border ${isConnected ? 'bg-[#F7ECEE] border-[#e8d8da] text-[#7B1C2A]' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {isConnected ? <Wifi size={8} className="animate-pulse" /> : <WifiOff size={8} />}
              {isConnected ? `STREAM ACTIVE [${latency || 0}ms]` : 'DISCONNECTED'}
            </div>
          </div>
        }
        showSystemLink
      >
        <div className="px-6 py-3 bg-[#7B1C2A]/10 backdrop-blur-md border border-[#7B1C2A]/20 rounded-2xl hidden lg:block">
          <p className="text-[9px] font-black text-[#7B1C2A] uppercase tracking-widest leading-none">Vault Status</p>
          <p className="text-xl font-black text-[#7B1C2A] italic tracking-tighter mt-1 uppercase">Encrypted</p>
        </div>
      </AdminHeader>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 backdrop-blur-xl p-3 rounded-[2rem] border border-white/40 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search isolated clusters..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[2rem] border-none bg-white/60 shadow-inner text-sm font-bold text-slate-800 focus:ring-4 ring-[#7B1C2A]/10 outline-none transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* 📑 ARCHIVE BOARD - Neural Stream Feed Style */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B1C2A] animate-pulse" />
            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase italic">Archived Nodes Inventory</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
              <Activity size={10} className="text-blue-500" />
              <span>Live Feed: {isConnected ? 'Synchronized' : 'Offline'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
              <Zap size={10} className="text-amber-500" />
              <span>Relay: WS://PROD_VAULT_01</span>
            </div>
            <div className="px-2 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] tracking-tight uppercase rounded border border-slate-200">
              Secured
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
        {allArchived.length > 0 ? (
          allArchived.map(s => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={s.id} 
              className="p-6 hover:bg-slate-50/60 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 font-black italic text-xs">
                  {s.name ? s.name[0] : '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-slate-400 line-through uppercase italic tracking-tight">{s.name}</p>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-slate-200">{s.nodeCategory}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {('role' in s) ? `${s.role} • Subject: ${s.subject}` : `${s.grade} • Assigned Teacher: ${s.teacher}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="hidden lg:block text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Signal</p>
                  <p className="text-[10px] font-bold text-slate-500 italic mt-1">{s.lastActivity || 'Session Ended'}</p>
                </div>
                <button 
                  onClick={() => handleRestore(s.id, s.name, s.nodeCategory)} 
                  className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                >
                  <RotateCcw className="w-3.5 h-3.5 group-hover/btn:rotate-180 transition-transform duration-500" /> 
                  Re-Initialize
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-24 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
              <Database size={16} />
            </div>
            <h4 className="text-sm font-black text-slate-700 uppercase italic">Vault Empty</h4>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto font-bold uppercase tracking-tight">
              No isolated learner nodes matching query parameters.
            </p>
          </div>
        )}
        </div>

        {/* Minimal Footer Stamp */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 uppercase font-black tracking-widest text-[9px]">
              <ShieldAlert size={12} className="text-emerald-500" /> 
              AES-256 Cold Storage Protocol
            </span>
          </div>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">STORAGE: SECURED</span>
        </div>
      </div>

      {/* ✨ RESTORE CONFIRMATION MODAL */}
      <AnimatePresence>
        {restoreTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md p-8 relative shadow-2xl border border-emerald-100 z-10 overflow-hidden"
            >
              <button 
                onClick={() => setRestoreTarget(null)}
                className="absolute right-6 top-6 p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-emerald-600">
                  <RotateCcw size={20} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                  Restore <span className="text-emerald-600">Node</span>
                </h3>
              </div>

              <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                Are you sure you want to re-initialize <span className="font-black text-slate-800 italic">{restoreTarget.name}</span>? This will hot-plug their clearance levels back into the live active network directories.
              </p>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setRestoreTarget(null)} 
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-100 bg-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500 active:scale-95"
                >
                  Abort Protocol
                </button>
                <button 
                  type="button" 
                  onClick={confirmRestore} 
                  className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95"
                >
                  Re-Plug Live Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArchivedRecords;