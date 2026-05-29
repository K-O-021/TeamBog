import React, { useState, useMemo, useEffect, useRef, ChangeEvent } from "react";
import { useApp } from '@/context/AppContext';
import {
  FileDown, Heart, Brain, Activity, ShieldCheck, 
  Lock, Clock, ChevronRight, CheckCircle2, User, Camera,
  CalendarDays, ShieldAlert, LogOut, Bell, Wifi, WifiOff, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { generateStudentAiAnalysis } from '@/lib/behaviorUtils';
import { motion, AnimatePresence } from 'framer-motion';

const ParentProfile = () => {
  const [iepStatus, setIepStatus] = useState<'none' | 'pending' | 'approved'>('none'); 
  const [isRequesting, setIsRequesting] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { user, setUser, students, behaviorLogs, progressNotes, alerts, isConnected, latency, addSyncRequest } = useApp();
  const myChild = useMemo(() => students.find(s => s.parentEmail === user?.email), [students, user?.email]);

  // Load image from localStorage on mount
  useEffect(() => {
    if (user?.email) {
      const savedImage = localStorage.getItem(`parent_img_${user.email}`);
      if (savedImage) setProfileImage(savedImage);
    }
  }, [user?.email]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        if (user?.email) {
          localStorage.setItem(`parent_img_${user.email}`, base64String);
        }
        toast.success("Institutional profile picture updated");
      };
      reader.readAsDataURL(file);
    }
  };

  // Real-time Neural Activity Stream
  const childUpdates = useMemo(() => {
    if (!myChild) return [];
    return behaviorLogs
      .filter(l => l.studentId === myChild.id)
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
      .slice(0, 5);
  }, [myChild, behaviorLogs]);

  const unreadCount = useMemo(() => {
    if (!myChild || !alerts) return 0;
    return alerts.filter(a => a.studentName === myChild.name && !a.reviewed).length;
  }, [myChild, alerts]);

  // --- SOUND NOTIFICATION LOGIC ---
  const prevUnreadCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      // Playing a subtle notification ping
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(() => {
        // Fail silently if browser blocks auto-play
        console.log("Neural Alert Audio blocked. User interaction required.");
      });
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const studentAiAnalysis = useMemo(() => {
    if (!myChild) return null;
    return generateStudentAiAnalysis(myChild, behaviorLogs, progressNotes);
  }, [myChild, behaviorLogs, progressNotes]);

  const handleRequestAccess = () => {
    setIsRequesting(true);
    setTimeout(() => {
      setIepStatus('pending');
      setIsRequesting(false);
      toast.success("Authentication request sent to instructor", {
        style: { background: '#064e3b', color: '#fff' }
      });
    }, 1500);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    toast.info("Session Terminated");
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const handleRequestSync = () => {
    setIsSyncing(true);
    if (user && myChild && addSyncRequest) {
      addSyncRequest({
        studentId: myChild.id,
        studentName: myChild.name,
        teacherName: myChild.teacher,
        parentName: user.name,
      });
    }
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Node Synchronized");
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-24 relative font-['Times_New_Roman',_serif]">
      {/* --- REAL-TIME CONNECTIVITY STATUS --- */}
      <div className="max-w-6xl mx-auto mb-6 px-8 flex items-center justify-between bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] border border-[#e8d8da]/50 shadow-sm mt-4">
        <div className="flex items-center gap-1.5">
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full shadow-lg ${isConnected ? 'bg-[#7B1C2A] shadow-[#7B1C2A]/30' : 'bg-rose-500 shadow-rose-500/50'}`} 
          />
          <div className="flex flex-col">
            <span className={`text-[8px] font-black uppercase tracking-[0.25em] ${isConnected ? 'text-[#7B1C2A]' : 'text-rose-800'}`}>
              {isConnected ? 'Mainframe Link Active' : 'Link Severed'}
            </span>
            {isConnected && latency && <span className="text-[7px] font-mono text-[#7B1C2A]/60 leading-none">Latency: {latency}ms</span>}
          </div>
        </div>
        <button onClick={handleRequestSync} disabled={isSyncing} className="flex items-center gap-2 px-4 py-1.5 bg-[#3D0C18] text-[#C49A3C] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50">
          <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync Node"}
        </button>
      </div>

      {/* Consistent Professional Emerald Background */}
      <div className="fixed inset-0 -z-10" style={{
        background: '#FBF7F2',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(123, 28, 42, 0.1) 0, transparent 40%), 
          radial-gradient(at 100% 0%, rgba(196, 154, 60, 0.08) 0, transparent 40%)
        `
      }} />

      {/* --- REFINED PARENT HEADER --- */}
      <header className="flex justify-between items-center bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] border border-[#e8d8da] shadow-xl shadow-rose-950/5 max-w-6xl mx-auto mt-8">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#3D0C18] rounded-2xl shadow-xl shadow-rose-900/10 border border-[#7B1C2A]/20">
             <Heart className="text-[#C49A3C] w-6 h-6" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Parent <span className="text-[#7B1C2A]">Portal</span></h2>
            <p className="text-[10px] font-black text-[#7B1C2A]/60 uppercase tracking-[0.3em] mt-1">Institutional Oversight Link Established</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/parent/alerts">
            <button className="p-3 bg-white border border-[#e8d8da] rounded-2xl text-slate-400 hover:text-[#7B1C2A] transition-all shadow-sm relative active:scale-95">
              <Bell size={20} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm z-10"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </Link>

          <button 
            onClick={handleLogout}
            className="p-3 bg-white border border-[#e8d8da] rounded-2xl text-slate-400 hover:text-rose-600 transition-all shadow-sm active:scale-95"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
          
          <div className="flex items-center gap-4 pl-4 border-l border-[#e8d8da]">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                {myChild?.name || "Authorized Node"}
              </p>
              <p className="text-[9px] font-bold text-[#7B1C2A]/60 uppercase tracking-widest mt-1">
                Student Profile
              </p>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-14 h-14 bg-emerald-800 rounded-full flex items-center justify-center text-white font-black shadow-lg border-2 border-white hover:scale-105 transition-all overflow-hidden relative group"
              >
                {profileImage ? (
                  <img src={profileImage} className="w-full h-full object-cover" alt="Parent Profile" />
                ) : (
                  user?.name?.[0] || <User size={24} />
                )}
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Camera size={16} className="text-white" />
                </div>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-emerald-50 p-2 z-50"
                  >
                    <div className="px-4 py-4 border-b border-slate-50 mb-1">
                      <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-rose-50 text-rose-500 rounded-2xl transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8 mt-4">
        {/* 1. CHILD'S DAILY TIMELINE */}
        <section className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-10 border border-emerald-50 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Activity Stream</h3>
                  <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Real-time classroom updates</p>
                </div>
              </div>
              <div className="px-5 py-2.5 bg-emerald-100/50 rounded-full text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                Today • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
          </div>

          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-100">
            {childUpdates.map((log, index) => (
              <div key={index} className="flex gap-6 relative z-10 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-10 h-10 rounded-2xl bg-white border-2 border-emerald-50 flex items-center justify-center shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${log.type === 'Positive' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                </div>
                <div className="flex-1 flex justify-between items-center bg-white border border-emerald-50 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 group cursor-default">
                  <div>
                    <span className="text-base font-black text-slate-800 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{log.activity}</span>
                    <p className="text-xs text-slate-500 font-bold mt-1 italic">"{log.detail}"</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{log.time}</span>
                    <div className="p-1.5 bg-emerald-50 rounded-lg inline-block">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. AI INSIGHT CARD (Premium Forest Gradient) */}
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-emerald-950/20 group">
          <Brain size={220} className="absolute -bottom-16 -right-16 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full w-fit backdrop-blur-md border border-white/20">
              <Brain size={16} className="text-emerald-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">SAIE Neural Strategy</span>
            </div>
            <h4 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-tight max-w-3xl uppercase">
              "{studentAiAnalysis?.monthlyNarrative || "AI engine is processing classroom behavioral nodes..."}"
            </h4>
            <div className="flex items-center gap-4 pt-4">
              <button className="px-10 py-5 bg-white text-emerald-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-50 transition-colors active:scale-95">
                Access Support Guide
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <div className="bg-emerald-900 text-emerald-100 py-3 px-8 rounded-full w-fit mx-auto shadow-lg fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Node: {myChild?.name || 'Authorized Learner'} • {isConnected ? 'Synchronized' : 'Offline'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentProfile;