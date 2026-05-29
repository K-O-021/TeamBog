import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Target, Zap, CheckCircle2, Lock, ShieldCheck, 
  FileDown, Clock, ShieldAlert, ChevronRight, Activity, FileText,
  Phone, Video, MessageSquare, Paperclip, Send, Bell, RefreshCw, Camera
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';

const ParentDashboard: React.FC = () => {
  const { 
    user, 
    setUser, 
    sendMessage, 
    messages, 
    students, 
    alerts, 
    isConnected,
    latency,
    behaviorLogs = [],
  iepRequests = [],
  addIEPRequest,
  addSyncRequest // Added to dispatch sync requests
  } = useApp();

  // --- REAL-TIME DATA (Synchronized with Global State) ---
  const myChild = useMemo(() => students.find(s => s.parentEmail === user?.email), [students, user?.email]);
  
  // Fallback structure for real-time input visualization
  const childData = useMemo(() => ({
    id: myChild?.id || 0,
    name: myChild?.name || "Initializing Node...",
    grade: myChild?.grade || "N/A",
    initials: myChild?.initials || "?",
    condition: myChild?.diagnosis || "Not Evaluated",
    reliability: 100,
    teacherName: myChild?.teacher || "Unassigned",
    iep: { communication: "N/A", motor: "N/A", support: "N/A" },
    competency: [
      { subject: 'Social', baseline: 40, current: 65 },
      { subject: 'Emotional', baseline: 30, current: 55 },
      { subject: 'Cognitive', baseline: 50, current: 70 },
      { subject: 'Adaptive', baseline: 35, current: 60 },
      { subject: 'Motor', baseline: 45, current: 75 },
    ],
    hourlyFocus: [
      { hour: '8am', level: 40 }, { hour: '10am', level: 75 }, { hour: '12pm', level: 55 },
      { hour: '2pm', level: 85 }, { hour: '4pm', level: 60 }
    ]
  }), [myChild]);
  // --- STATES ---
  const [activeTab, setActiveTab] = useState<'insights' | 'vault'>('insights');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const myIepRequest = useMemo(() => 
    iepRequests.find((r: any) => r.parentEmail === user?.email),
    [iepRequests, user?.email]
  );

  const currentIepStatus = myIepRequest?.status || 'none';

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load image from localStorage on mount
  useEffect(() => {
    if (user?.email) {
      const savedImage = localStorage.getItem(`student_img_${user.email}`);
      if (savedImage) setProfileImage(savedImage);
    }
  }, [user?.email]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        if (user?.email) {
          localStorage.setItem(`student_img_${user.email}`, base64String);
        }
        toast.success("Learner profile picture updated");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequestSync = () => {
    setIsSyncing(true);
    toast.info(`Stream Request: [${childData.teacherName.toUpperCase()}]`, {
      description: "Dispatched direct packet request for real-time node synchronization..."
    });
    
    // Dispatch the sync request to the global state
    if (user && myChild && addSyncRequest) {
      addSyncRequest({
        studentId: myChild.id,
        studentName: myChild.name,
        teacherName: myChild.teacher, // Use the actual teacher assigned to the student
        parentName: user.name,
      });
    }

    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Node Synchronized", {
        description: "Teacher node has acknowledged. All behavioral tensors are up to date."
      });
    }, 2500);
  };

  const handleRequestIepUpdate = () => {
    if (!myChild || !addIEPRequest) return;
    
    setIsRequesting(true);
    addIEPRequest({ 
      parentEmail: user?.email || '', 
      parentName: user?.name || '', 
      studentName: myChild.name 
    });
    setIsRequesting(false);
    toast.success("IEP Access Request dispatched to Lead Instructor");
  };

  // --- IEP VAULT DATA ---
  const iepHistory = useMemo(() => [
    { id: 'IEP-2026-01', title: 'Individualized Education Plan', period: 'SY 2025-2026', date: 'April 27, 2026', status: 'Active', type: 'Annual Review' },
    { id: 'IEP-2025-01', title: 'Individualized Education Plan', period: 'SY 2024-2025', date: 'June 12, 2025', status: 'Archived', type: 'Initial Placement' },
  ], []);

  const unreadCount = useMemo(() => {
    if (!myChild || !alerts) return 0;
    return alerts.filter(a => a.studentName === myChild.name && !a.reviewed).length;
  }, [myChild, alerts]);

  // --- NEURAL ALERT SOUND LOGIC ---
  const prevUnreadCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(() => {
        console.log("Notification sound blocked by browser policy.");
      });
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const aiAnalysis = useMemo(() => {
    const myLogs = behaviorLogs.filter(l => l.studentId === myChild?.id);
    const positiveCount = myLogs.filter(l => l.type === 'Positive').length;
    const concerningCount = myLogs.filter(l => l.type !== 'Positive').length;

    if (concerningCount > 0 && concerningCount >= positiveCount) {
      return {
        color: "from-rose-700 to-rose-950 shadow-rose-900/20",
        tag: "Priority: Attention Required",
        icon: <ShieldAlert size={10} />,
        rec: "Implement Sensory De-escalation",
        exp: `System detected ${concerningCount} concerning patterns. Institutional analysis recommends sensory regulation and deep pressure exercises tonight.`
      };
    }

    if (positiveCount > 0) {
      return {
        color: "from-emerald-700 to-emerald-900 shadow-emerald-900/20",
        tag: "Neural Status: Optimal",
        icon: <CheckCircle2 size={10} />,
        rec: "Reinforce Positive Momentum",
        exp: `Learner verified with ${positiveCount} constructive sessions. AI recommends social rewards and verbal validation to maintain engagement.`
      };
    }

    return {
      color: "from-[#7B1C2A] to-[#3D0C18]",
      tag: "Neural Sync: Active",
      icon: <Activity size={10} />,
      rec: "Establishing Baseline...",
      exp: "Waiting for classroom telemetry to synthesize detailed behavioral strategies and tailored neural insights."
    };
  }, [myChild, behaviorLogs]);

  return (
    <div className="min-h-screen bg-[#FBF7F2] p-4 font-['Times_New_Roman',_serif]">
      {/* Institutional Mesh Background */}
      <div className="fixed inset-0 -z-10" style={{
        background: '#FBF7F2',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(123, 28, 42, 0.1) 0, transparent 40%), 
          radial-gradient(at 100% 0%, rgba(196, 154, 60, 0.08) 0, transparent 40%)
        `
      }} />

      {/* --- REAL-TIME CONNECTIVITY STATUS --- */}
      <div className="max-w-7xl mx-auto mb-6 px-8 flex items-center justify-between bg-white/80 backdrop-blur-2xl p-4 rounded-[2rem] border border-[#e8d8da]/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full shadow-lg ${isConnected ? 'bg-[#7B1C2A] shadow-[#7B1C2A]/50' : 'bg-rose-500 shadow-rose-500/50'}`} 
            />
            <div className="flex flex-col">
              <span className={`text-[8px] font-black uppercase tracking-[0.25em] ${isConnected ? 'text-[#7B1C2A]' : 'text-rose-800'}`}>
                {isConnected ? `Linked to Teacher Node: [${childData.teacherName.toUpperCase()}]` : 'Neural Link Severed'}
              </span>
              {isConnected && latency && (
                <span className="text-[7px] font-mono text-[#7B1C2A]/60 leading-none">Stream Latency: {latency}ms</span>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={handleRequestSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#3D0C18] text-[#C49A3C] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Request Direct Sync"}
        </button>
      </div>


      {/* --- NEURAL DATA COMMAND WRAPPER --- */}
      <main className="w-full bg-white/40 backdrop-blur-xl rounded-[3rem] p-6 md:p-12 min-h-[85vh] border border-[#e8d8da] shadow-sm max-w-7xl mx-auto relative overflow-hidden">
        
        {/* PROFILE BANNER ROW */}
        <div className="flex items-center gap-6 md:gap-8 mb-12">
          {/* Giant Avatar Wrapper */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 md:w-44 md:h-44 bg-white rounded-full flex items-center justify-center p-2 shadow-sm border border-[#e8d8da]">
              <div className="w-full h-full bg-[#7B1C2A] rounded-full flex items-center justify-center relative overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} className="w-full h-full object-cover" alt="Student Profile" />
                ) : (
                  <span className="text-white text-2xl md:text-5xl font-black uppercase italic tracking-tighter">{myChild?.initials || childData.initials}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-3 bg-white border border-[#e8d8da] rounded-full text-[#7B1C2A] hover:bg-[#3D0C18] hover:text-white transition-all shadow-lg z-10 active:scale-95"
              title="Change Picture"
            >
              <Camera size={18} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          {/* Identity Block */}
          <div className="text-left flex-1">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                {myChild?.name || childData.name}
              </h1>
              <p className="text-[10px] font-black text-[#7B1C2A]/60 uppercase tracking-[0.4em] ml-1">Guardian Node Oversight</p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="text-[9px] font-black bg-[#3D0C18] text-[#C49A3C] px-3 py-1 rounded-md uppercase tracking-widest">
                {myChild?.grade || childData.grade}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Clinical Scope: {childData.condition}
              </span>
            </div>
          </div>

          {/* Quick Tab Selectors */}
          <div className="flex bg-white/60 p-1.5 rounded-2xl border border-[#e8d8da]/50 shadow-sm gap-1 self-center sm:self-end">
            <button 
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'insights' ? 'bg-[#7B1C2A] text-white shadow-sm' : 'text-[#7B1C2A] hover:bg-white/40'}`}
            >
              Progress Insights
            </button>
            <button 
              onClick={() => setActiveTab('vault')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vault' ? 'bg-[#7B1C2A] text-white shadow-sm' : 'text-[#7B1C2A] hover:bg-white/40'}`}
            >
              Security Vault
            </button>
          </div>
        </div>

        {/* --- DYNAMIC CONTENT LAYOUTS --- */}
        <AnimatePresence mode="wait">
          {activeTab === 'insights' ? (
            <motion.div 
              key="insights" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: AI & Core Matrix */}
              <div className="lg:col-span-1 space-y-6">
                {/* AI Node Response */}
                <div className={`bg-gradient-to-br ${aiAnalysis.color} p-6 rounded-[2.5rem] text-white shadow-md relative overflow-hidden`}>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest w-fit mb-3">
                    {aiAnalysis.icon} {aiAnalysis.tag}
                  </div>
                  <h4 className="text-base font-black uppercase tracking-tight mb-1">{aiAnalysis.rec}</h4>
                  <p className="text-[10px] font-medium text-[#F7ECEE]/90 leading-relaxed italic">"{aiAnalysis.exp}"</p>
                </div>

                {/* Metrics Breakdown Card */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-[#e8d8da] shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#F7ECEE] rounded-lg text-[#7B1C2A]"><Target size={18} /></div>
                    <h5 className="text-[9px] font-black uppercase tracking-widest">IEP Status Map</h5>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-[#F7ECEE]/50 rounded-xl border border-[#e8d8da]/50 text-[10px] text-slate-700">
                      <span className="font-black text-[#7B1C2A] uppercase text-[8px] mr-2">Motor Control:</span> {childData.iep.motor}
                    </div>
                    <div className="p-3 bg-[#F7ECEE]/50 rounded-xl border border-[#e8d8da]/50 text-[10px] text-slate-700">
                      <span className="font-black text-[#7B1C2A] uppercase text-[8px] mr-2">Expression:</span> {childData.iep.communication}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Competency Radar Chart */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-[#e8d8da] shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Developmental Domain Matrix</h4>
                  <p className="text-xs font-bold text-slate-700">Current Progress vs Baseline Node</p>
                </div>
                <div className="h-52 my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={childData.competency}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 8, fontWeight: 800, fill: '#475569'}} />
                      <Radar name="Baseline" dataKey="baseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeWidth={1.5} />
                      <Radar name="Active Progress" dataKey="current" stroke="#7B1C2A" fill="#7B1C2A" fillOpacity={0.25} strokeWidth={3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-[8px] font-black uppercase tracking-wider border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /> Baseline</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#7B1C2A]" /> Active Progress</div>
                </div>
              </div>

              {/* Right Column: Neural Focus Pulse Area Chart */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-[#e8d8da] shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Neural Focus Pulse</h4>
                  <p className="text-xs font-bold text-slate-700">Dynamic hourly analytics</p>
                </div>
                <div className="h-44 my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={childData.hourlyFocus}>
                      <defs>
                        <linearGradient id="parentPulse" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7B1C2A" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#7B1C2A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="level" stroke="#7B1C2A" strokeWidth={3} fill="url(#parentPulse)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-4 bg-[#F7ECEE]/50 border border-[#e8d8da] rounded-2xl text-center">
                  <span className="block text-[8px] font-black text-[#7B1C2A] uppercase tracking-widest mb-0.5">Calculated System Reliability</span>
                  <span className="text-2xl font-black text-[#3D0C18] italic">{childData.reliability}% Node Sync</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="vault" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Vault Information Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#3D0C18] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                  <Lock size={120} className="absolute -bottom-8 -right-8 opacity-10 rotate-12" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 bg-[#7B1C2A]/50 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest w-fit mb-4 border border-white/10">
                      <ShieldCheck size={10} className="text-[#C49A3C]" /> Secure Node
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-tight mb-3">IEP Document <br />Vault</h3>
                    <p className="text-[10px] text-[#F7ECEE]/60 font-bold uppercase tracking-widest leading-relaxed">
                      Access legally binding Individualized Education Plans synchronized from the institutional blockchain.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-[#e8d8da] shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#F7ECEE] rounded-lg text-[#7B1C2A]"><ShieldAlert size={18} /></div>
                    <h5 className="text-[9px] font-black uppercase tracking-widest">Compliance Status</h5>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-[#F7ECEE]/50 rounded-2xl border border-[#e8d8da]/50 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] font-black text-[#7B1C2A] uppercase tracking-widest">Current Plan</p>
                        <p className="text-xs font-black text-slate-900 mt-1">SY 2025-2026</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#7B1C2A] animate-pulse" />
                    </div>

                    <button 
                      onClick={handleRequestIepUpdate}
                      disabled={isRequesting || currentIepStatus !== 'none'}
                      className={`w-full py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                        currentIepStatus === 'approved'
                          ? 'bg-[#7B1C2A] text-white cursor-default'
                          : currentIepStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#3D0C18] text-white hover:bg-black'
                      } disabled:opacity-75`}
                    >
                      {isRequesting ? <Activity size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      {currentIepStatus === 'approved' ? 'Access Granted' : currentIepStatus === 'pending' ? 'Access Pending' : 'Request IEP Access'}
                    </button>
                  </div>
                </div>
              </div>

              {/* IEP Document List */}
              <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {currentIepStatus !== 'approved' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white/40 rounded-[3rem] border-2 border-dashed border-[#e8d8da]">
                    <div className="p-4 bg-amber-50 rounded-full text-amber-500 mb-4 animate-pulse">
                      <Lock size={48} />
                    </div>
                    <p className="text-xs font-black text-[#7B1C2A]/40 uppercase tracking-[0.2em]">IEP Access Required</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 max-w-[200px]">Ang iyong request ay kasalukuyang {currentIepStatus === 'pending' ? 'pending approval' : 'hindi pa naipapasa'}.</p>
                  </div>
                ) : iepHistory.length > 0 ? (
                  iepHistory.map((iep) => (
                    <div 
                      key={iep.id}
                      className="bg-white p-6 rounded-[2.5rem] border border-[#e8d8da] shadow-sm hover:shadow-xl hover:shadow-rose-900/5 transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#F7ECEE] rounded-2xl flex items-center justify-center text-[#7B1C2A] border border-[#e8d8da] group-hover:bg-[#7B1C2A] group-hover:text-white transition-all shadow-inner">
                          <FileText size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                              {iep.period}
                            </h4>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                              iep.status === 'Active' ? 'bg-[#F7ECEE] text-[#7B1C2A]' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {iep.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {iep.type} • ID: {iep.id}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[9px] font-black text-[#7B1C2A]/60 uppercase flex items-center gap-1">
                              <Clock size={10} /> {iep.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toast.success(`Downloading ${iep.id}...`)}
                          className="p-3.5 bg-[#F7ECEE] text-[#7B1C2A] rounded-2xl hover:bg-[#3D0C18] hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                        >
                          <FileDown size={20} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white/40 rounded-[3rem] border-2 border-dashed border-[#e8d8da]">
                    <div className="p-4 bg-[#F7ECEE] rounded-full text-[#7B1C2A]/20 mb-4">
                      <FileText size={48} />
                    </div>
                    <p className="text-xs font-black text-[#7B1C2A]/40 uppercase tracking-[0.2em]">No IEP Documents Logged</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ParentDashboard;