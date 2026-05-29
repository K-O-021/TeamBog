import React from 'react';
import { useApp } from '@/context/AppContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">System Terminal Node</span>
          <button onClick={handleLogout} className="p-2.5 rounded-xl border border-white/60 bg-white/80 hover:bg-black hover:text-white text-slate-400 transition-all shadow-sm group">
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
