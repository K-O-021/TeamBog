import React from 'react';
import { Bell, User, LucideIcon, Wifi, WifiOff } from 'lucide-react';

interface AdminHeaderProps {
  icon: LucideIcon;
  title: string;
  highlightedTitle: string;
  subtitle: string | React.ReactNode;
  showSystemLink?: boolean;
  isConnected?: boolean;
  latency?: string | number;
  children?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  icon: Icon,
  title,
  highlightedTitle,
  subtitle,
  showSystemLink = false,
  isConnected = true,
  latency,
  children
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/80 backdrop-blur-2xl p-6 md:p-10 rounded-[3rem] border border-[#e8d8da] shadow-xl shadow-rose-950/5">
      <div className="flex items-center gap-4">
        <div className="p-3.5 bg-[#3D0C18] rounded-2xl shadow-xl shadow-rose-900/10 border border-[#7B1C2A]/20">
          <Icon className="text-[#C49A3C] w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            {title} <span className="text-[#7B1C2A]">{highlightedTitle}</span>
          </h2>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            {subtitle}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {children}

        {showSystemLink && (
          <div className="hidden sm:flex px-5 py-3 bg-[#F7ECEE]/50 backdrop-blur-md rounded-2xl border border-[#e8d8da] items-center gap-3 shadow-inner">
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-[#7B1C2A] shadow-[0_0_8px_rgba(123,28,42,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
             <div className="flex flex-col">
               <span className={`text-[9px] font-black uppercase tracking-widest ${isConnected ? 'text-[#7B1C2A]' : 'text-rose-800'}`}>
                 Mainframe Link: {isConnected ? 'Synchronized' : 'Offline'}
               </span>
               {isConnected && latency && <span className="text-[7px] font-mono text-[#7B1C2A]/60 leading-none">RTT: {latency}ms</span>}
             </div>
          </div>
        )}

        <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-[#7B1C2A] transition-all relative active:scale-95">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-900 uppercase leading-tight tracking-tight">Institutional Terminal</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Root Authority</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-950 p-0.5 shadow-lg shadow-slate-900/10">
            <div className="w-full h-full rounded-[0.85rem] bg-white flex items-center justify-center">
              <User size={22} className="text-slate-900" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;