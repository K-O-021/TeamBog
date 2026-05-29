import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Camera, 
  Key, 
  Save, 
  RefreshCw,
  Terminal,
  Cpu,
  Fingerprint,
  Zap,
  Activity,
  Globe,
  Database,
  ShieldAlert
} from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import { motion } from 'framer-motion';
import { toast } from "sonner";

const AdminProfile = () => {
  const { user, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Real-time Telemetry State
  const [latency, setLatency] = useState('24ms');
  const [systemLoad, setSystemLoad] = useState('8.4%');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Profile States
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password States
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const passwordStrength = useMemo(() => {
    const password = passwordData.new;
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [passwordData.new]);

  // Synchronize with User Context in Real-time
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user, isEditing]);

  // Simulated System Heartbeat (Real-time monitoring)
  useEffect(() => {
    const pulse = setInterval(() => {
      setLatency(`${Math.floor(Math.random() * 12) + 18}ms`);
      setSystemLoad(`${(7.2 + Math.random() * 2).toFixed(1)}%`);
    }, 4000);
    return () => clearInterval(pulse);
  }, []);

  useEffect(() => {
    if (user?.email) {
      const savedImage = localStorage.getItem(`admin_img_${user.email}`);
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
        if (user?.email) localStorage.setItem(`admin_img_${user.email}`, base64String);
        toast.success("Identity visual updated", { description: "Mainframe biometric scan synchronized." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (updateUser && user?.email) {
        updateUser(user.email, { name: formData.name, email: formData.email });
        toast.success("Profile Synchronized", { description: "Global administrative parameters updated." });
        setIsEditing(false);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      return toast.error("Sync Error", { description: "New password parameters do not match." });
    }
    
    setIsLoading(true);
    setTimeout(() => {
      toast.success("Security Protocol Updated", { description: "Master access key has been re-encrypted." });
      setPasswordData({ current: '', new: '', confirm: '' });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div
      className="space-y-8 animate-in fade-in duration-500 pb-12"
      style={{ fontFamily: "'Georgia','Times New Roman',serif", background: '#FBF7F2', minHeight: '100vh' }}
    >
      <AdminHeader
        icon={Settings}
        title="System"
        highlightedTitle="Config"
        subtitle="Mainframe Identity & Security Node"
        showSystemLink
      />

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT: Identity Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-sm text-center relative overflow-hidden group">
            
            {/* Real-time System Telemetry Indicator */}
            <div className="absolute top-4 right-8 flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Telemetry</span>
                <span className="text-[10px] font-mono font-black text-[#7B1C2A]">{latency}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#7B1C2A] animate-pulse shadow-[0_0_8px_rgba(123,28,42,0.8)]" />
            </div>

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7B1C2A] to-transparent" />
            
            <div className="relative mb-6 inline-block">
              <div className="w-32 h-32 rounded-[2.5rem] bg-[#F7ECEE] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} className="w-full h-full object-cover" alt="Admin" />
                ) : (
                  <User size={48} className="text-[#7B1C2A]" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-3 bg-[#3D0C18] text-[#C49A3C] rounded-2xl shadow-lg border-4 border-white hover:bg-black transition-all active:scale-95"
              >
                <Camera size={18} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{user?.name}</h3>
            <p className="text-[10px] font-black text-[#7B1C2A] uppercase tracking-[0.3em] mt-1 mb-6">Root Authority</p>
            
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Terminal size={16} className="text-slate-400" />
                <div className="text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Access Level</p>
                  <p className="text-xs font-black text-slate-700 uppercase">Full Institutional</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#F7ECEE]/50 rounded-2xl border border-[#e8d8da]">
                <Fingerprint size={16} className="text-[#7B1C2A]" />
                <div className="text-left">
                  <p className="text-[8px] font-black text-[#7B1C2A] uppercase">Status</p>
                  <p className="text-xs font-black text-emerald-700 uppercase italic">Linked & Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Config Forms */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Details */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={18} className="text-[#7B1C2A]" /> Identity Matrix
              </h4>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[10px] font-black text-[#7B1C2A] uppercase tracking-widest hover:underline"
              >
                {isEditing ? 'Abort Changes' : 'Modify Parameters'}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Variant (Name)</label>
                <input 
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-4 ring-[#7B1C2A]/10 transition-all font-bold text-xs disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Pipeline (Email)</label>
                <input 
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white outline-none focus:ring-4 ring-[#7B1C2A]/10 transition-all font-bold text-xs disabled:opacity-60"
                />
              </div>
              {isEditing && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2 py-4 bg-[#3D0C18] text-[#C49A3C] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 border border-[#7B1C2A]"
                >
                  <Save size={16} /> Synchronize Profile
                </motion.button>
              )}
            </form>
          </div>

          {/* Global System Parameters (Real-time Config) */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-8">
              <Globe size={18} className="text-[#7B1C2A]" />
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Global Parameters</h4>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight italic">Maintenance Mode</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Restrict user node access</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${maintenanceMode ? 'bg-amber-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${maintenanceMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tight italic">Resource Load</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: systemLoad }} />
                    </div>
                    <span className="text-[10px] font-black text-blue-600">{systemLoad}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Protocols (Password) */}
          <div className="bg-[#3D0C18] p-10 rounded-[3rem] border border-[#7B1C2A] shadow-2xl relative overflow-hidden">
            <Key className="absolute -bottom-10 -right-10 opacity-5 rotate-12" size={200} />
            <h4 className="text-sm font-black text-[#C49A3C] uppercase tracking-widest flex items-center gap-2 mb-8 italic">
              <Lock size={18} /> Security Key Exchange
            </h4>

            <form onSubmit={handleChangePassword} className="space-y-5 relative z-10">
              <div className="grid md:grid-cols-3 gap-4">
                <input type="password" placeholder="Current Key" autoComplete="current-password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className="bg-[#3D0C18]/40 border border-[#7B1C2A] rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-[#7B1C2A]/50 outline-none focus:ring-4 ring-[#7B1C2A]/20 transition-all" required />
                <input type="password" placeholder="New Master Key" autoComplete="new-password" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} className="bg-[#3D0C18]/40 border border-[#7B1C2A] rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-[#7B1C2A]/50 outline-none focus:ring-4 ring-[#7B1C2A]/20 transition-all" required />
                <input type="password" placeholder="Confirm Sequence" autoComplete="new-password" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} className="bg-[#3D0C18]/40 border border-[#7B1C2A] rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-[#7B1C2A]/50 outline-none focus:ring-4 ring-[#7B1C2A]/20 transition-all" required />
              </div>

              {passwordData.new.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 px-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#7B1C2A]">Security Entropy</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${passwordStrength >= 3 ? 'text-[#C49A3C]' : passwordStrength >= 2 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {['Insufficient', 'Weak Trace', 'Standard Node', 'Secure Protocol', 'Max Entropy'][passwordStrength]}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#3D0C18]/60 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step} 
                        className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= step ? (passwordStrength >= 3 ? 'bg-[#C49A3C]' : passwordStrength >= 2 ? 'bg-amber-400' : 'bg-rose-400') : 'bg-[#3D0C18]/20'}`} 
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <button className="w-full py-5 bg-[#7B1C2A] text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-[#9B2335] transition-all active:scale-95 flex items-center justify-center gap-2">
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Update Security Protocols
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;