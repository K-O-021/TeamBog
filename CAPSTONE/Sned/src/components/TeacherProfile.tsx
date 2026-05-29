import React from 'react';
import { useApp } from '@/context/AppContext';
import { User, Mail, Shield, ShieldCheck, Camera, Activity, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const TeacherProfile = () => {
  const { user } = useApp();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Institutional Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-2xl shadow-xl shadow-emerald-200/20">
            <User className="text-emerald-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Teacher <span className="text-emerald-600">Profile</span>
            </h1>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
              Institutional Identity Hub
            </div>
          </div>
        </div>

        <div className="status-low px-4 py-2 rounded-2xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Terminal Status: Verified</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Portal */}
        <div className="lg:col-span-2 card-elevated p-8 md:p-10 space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 text-emerald-600 font-bold text-4xl flex items-center justify-center border-4 border-white shadow-2xl transition-all group-hover:scale-105 group-hover:border-emerald-500/30">
                {user?.name?.charAt(0) || 'T'}
              </div>
              <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 text-white rounded-2xl shadow-lg border-4 border-white transition-transform group-hover:rotate-12">
                <Camera size={18} />
              </div>
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{user?.name}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Personnel Rank: {user?.role} Node</p>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                <div className="status-positive px-4 py-2 rounded-2xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Duty Status: Active</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HUB-ID: {user?.id?.slice(0, 6) || 'AUTH-V4'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Address</label>
              <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-inner group transition-all hover:bg-white hover:shadow-md">
                <Mail className="text-emerald-500 w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-bold text-slate-700">{user?.email}</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Clearance</label>
              <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-inner group transition-all hover:bg-white hover:shadow-md">
                <ShieldCheck className="text-emerald-500 w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-bold text-slate-700 capitalize">{user?.role} Portal Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Sidebar */}
        <div className="space-y-6">
          <div className="card-elevated p-8 bg-black text-white border-none shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Activity className="text-emerald-400 w-5 h-5" />
                <h3 className="font-black uppercase tracking-tighter italic">System <span className="text-emerald-400">Notice</span></h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Identity node verified against Institutional Master Database. Your session is encrypted and audited under Root Protocol for compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeacherProfile;