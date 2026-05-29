import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  Activity, 
  Archive, 
  Settings,
  GraduationCap,
  LogOut,
  BookOpen,
  Menu
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badgeCount?: number;
  collapsed?: boolean;
}> = ({
  icon, label, active, onClick, badgeCount, collapsed
}) => (
  <div
    onClick={onClick}
    className={`
      group flex items-center gap-4 rounded-[1.5rem] transition-all duration-300 relative overflow-hidden cursor-pointer
      ${collapsed ? 'justify-center p-4' : 'px-5 py-4 mx-2'}
      ${active ? 'bg-white shadow-lg border border-[#eadfce]' : 'hover:bg-white/70 text-slate-500'}
    `}
    title={collapsed ? label : ''}
  >
    {active && (
      <motion.div
        layoutId="activeAdminSidebar"
        className="absolute left-0 top-0 h-full w-1 bg-[#7B1C2A] rounded-r-full"
      />
    )}
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-[#7B1C2A] text-white shadow-md' : 'bg-white text-slate-400 group-hover:text-[#7B1C2A] border border-[#eadfce]'}`}>
      {icon}
    </div>
    {!collapsed && <div className="flex-1">
      <p className={`text-[11px] font-black uppercase tracking-widest transition-all ${active ? 'text-[#7B1C2A]' : 'text-slate-500 group-hover:text-slate-800'}`}>{label}</p>
    </div>}
    {badgeCount !== undefined && badgeCount > 0 && (
      collapsed ? (
        <div className="absolute top-3 right-6 w-2 h-2 bg-rose-500 rounded-full border border-white shadow-sm" />
      ) : (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-rose-500 text-white text-[8px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm"
      >
        {badgeCount > 9 ? '9+' : badgeCount}
      </motion.span>
      )
    )}
  </div>
);

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { setUser, user, behaviorLogs = [] } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    toast.info("Institutional Session Terminated");
  };

  const navGroups = [
    {
      label: 'Home',
      items: [{ icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/admin/dashboard' }]
    },
    {
      label: 'Learners',
      items: [
        { icon: <GraduationCap size={18} />, label: 'Students', path: '/admin/students' },
        { icon: <Users size={18} />, label: 'People', path: '/admin/people' }
      ]
    },
    {
      label: 'Archival',
      items: [{ icon: <Archive size={18} />, label: 'Archive Vault', path: '/admin/archived' }]
    },
    {
      label: 'Intelligence',
      items: [{ icon: <Brain size={18} />, label: 'Analytics', path: '/admin/analytics' }]
    },
    {
      label: 'Reporting',
      items: [
        { icon: <Activity size={18} />, label: 'Logs', path: '/admin/logs' }
      ]
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#FBF7F2] font-['Times_New_Roman',_serif] text-slate-800 overflow-hidden relative">
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-[#f8f4ec] transition-all duration-300 border-r border-[#eadfce] flex flex-col py-4 overflow-hidden whitespace-nowrap z-20 shadow-xl`}>
        <div className={`mb-10 flex items-center transition-all duration-300 ${isSidebarOpen ? 'px-6 gap-4' : 'justify-center'}`}>
          <Menu className="cursor-pointer text-[#7B1C2A] hover:bg-white border border-[#eadfce] rounded-2xl p-2 shadow-sm transition-all" size={40} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <span className="text-2xl font-black text-[#7B1C2A] tracking-tighter uppercase italic leading-none">Sned<span className="text-[#C49A3C]">Link+</span></span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[7px] font-black uppercase tracking-[0.25em] text-[#7B1C2A]/40">Neural Access Layer</span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {isSidebarOpen && (
                <p className="px-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 animate-in fade-in duration-500">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.path}
                  badgeCount={item.label === 'Logs' ? behaviorLogs.length : undefined}
                  collapsed={!isSidebarOpen}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="px-4 mt-auto space-y-2 pb-6 border-t border-[#eadfce] pt-6 bg-white/30">
          <NavItem 
            icon={<Settings size={18} />} 
            label="Profile Config" 
            active={location.pathname === '/admin/profile'} 
            collapsed={!isSidebarOpen}
            onClick={() => navigate('/admin/profile')} 
          />
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 py-3 rounded-[1.5rem] bg-white border border-[#eadfce] hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm ${isSidebarOpen ? 'px-5' : 'justify-center px-0'}`}
            title={!isSidebarOpen ? "Sign Out" : ""}
          >
            <div className={`p-2 rounded-xl bg-rose-50 text-rose-500 ${!isSidebarOpen ? 'mx-auto' : ''}`}>
              <LogOut size={18} />
            </div>
            {isSidebarOpen && <div className="text-left flex-1">
              <p>Sign Out</p>
              <p className="text-[8px] font-bold text-slate-400 mt-0.5">End session</p>
            </div>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Main content wrapper with smooth transition for padding expansion */}
        <div className={`max-w-[1600px] mx-auto w-full transition-all duration-500 ease-in-out ${isSidebarOpen ? 'p-6 md:p-10' : 'p-10 md:p-16'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;