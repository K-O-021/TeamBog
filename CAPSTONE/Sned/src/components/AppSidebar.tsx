import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bell, FileText, User, MessageSquare, Menu,
  Calendar, TrendingUp, BookOpen, Archive, ClipboardList, Settings,
  LogOut, Brain, Camera, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const teacherMenu = [ // Removed AI Analytics and Alerts
  { label: 'Home', items: [{ title: 'Overview', url: '/teacher', icon: LayoutDashboard }] },
  { label: 'Learners', items: [{ title: 'My Students', url: '/teacher/students', icon: Users }] },
  { label: 'Clinical', items: [{ title: 'Interventions', url: '/teacher/interventions', icon: ClipboardList }] },
  { label: 'Reporting', items: [{ title: 'Class Logs', url: '/teacher/logs', icon: FileText }] },
];

const parentMenu = [ // Removed Notifications
  { label: 'Overview', items: [{ title: 'Dashboard', url: '/parent', icon: LayoutDashboard }] },
  { label: 'Student Data', items: [
    { title: 'Progress', url: '/parent/progress', icon: TrendingUp },
  ]},
  { label: 'Connect', items: [{ title: 'Messages', url: '/parent/messages', icon: MessageSquare }] },
];

const adminMenu = [
  { label: 'Home', items: [
    { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  ] },
  { label: 'Learners', items: [
    { title: 'Students', url: '/admin/students', icon: GraduationCap },
    { title: 'People', url: '/admin/people', icon: Users },
  ] },
  { label: 'Archival', items: [
    { title: 'Archive Vault', url: '/admin/archived', icon: Archive },
  ] },
  { label: 'Analytics', items: [
    { title: 'Analytics', url: '/admin/analytics', icon: TrendingUp },
  ] },
  { label: 'Reporting', items: [
    { title: 'Logs', url: '/admin/logs', icon: FileText },
  ] },
  { label: 'Profile', items: [
    { title: 'Profile', url: '/admin/profile', icon: User },
  ] },
];

interface AppSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function AppSidebar({ isOpen, setIsOpen }: AppSidebarProps) {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use teacher/parent style for admin sidebar
  const groups = user?.role === 'teacher' ? teacherMenu
    : user?.role === 'parent' ? parentMenu
    : adminMenu;

  const profilePath = user?.role === 'admin' ? '/admin/profile' : user?.role === 'parent' ? '/parent/profile' : '/teacher/profile';
  // Hide sidebar entirely for parent and teacher users, and on mobile for admin
  if (user?.role === 'parent' || user?.role === 'teacher' || (user?.role === 'admin' && window.innerWidth < 768)) {
    return null;
  }

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 border-r border-slate-200 text-slate-700 flex flex-col transition-all duration-300 ease-in-out
        md:relative md:translate-x-0 h-screen sticky top-0 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${isCollapsed ? 'w-20' : 'w-64'}
      bg-white`}
    >
      {/* Profile Avatar Header */}
      <div className={cn(
        "border-b border-slate-100 flex items-center gap-4 relative overflow-hidden group/header transition-all duration-300",
        isCollapsed ? "p-6 justify-center" : "p-10"
      )} style={{background:'#FBF7F2'}}>
        <button 
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            if (window.innerWidth < 768) setIsOpen?.(!isOpen);
          }}
          className="z-10 opacity-40 group-hover/header:opacity-100 transition-opacity cursor-pointer hover:scale-110 active:scale-95"
        >
          <Menu size={18} className="text-emerald-400" />
        </button>
        <div
          className={cn(
            "relative group cursor-pointer transition-all duration-300", 
            isCollapsed ? "opacity-0 w-0 scale-50 pointer-events-none" : "opacity-100 w-16 scale-100"
          )}
          onClick={() => {
            navigate(profilePath);
            setIsOpen?.(false);
          }}
          title="Edit Profile"
        >
          <div className="w-12 h-12 rounded-full bg-[#7B1C2A] text-white font-bold text-xl flex items-center justify-center border border-[#C49A3C] group-hover:border-[#7B1C2A] transition-all overflow-hidden">
            {user?.name ? user.name.charAt(0) : <User className="w-8 h-8" />}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-[#C49A3C] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-sm border-2 border-white">
            <Camera className="w-3 h-3" />
          </div>
        </div>
        {/* SnedLink+ text - this should fade out smoothly */}
        <div className={cn("transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap", isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs")}> 
            <h1 className="text-lg font-bold text-[#7B1C2A] tracking-tight leading-none">Sned<span className="text-[#C49A3C]">Link+</span></h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#C49A3C] font-semibold mt-1">{user?.role} Portal</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar" style={{background:'#FBF7F2'}}>
        {groups.map((group) => (
          <div key={group.label} className="mb-8 last:mb-0">
            <p className={cn("text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 transition-all duration-300 overflow-hidden", isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto")}>
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setIsOpen?.(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group/item 
                      ${isCollapsed ? 'justify-center px-2' : ''} ${
                      isActive 
                      ? 'bg-[#C49A3C] text-white' 
                      : 'text-[#7B1C2A] hover:bg-[#F7ECEE] hover:text-[#7B1C2A]'
                    }`}
                  >
                    <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform", isActive ? "text-white" : "text-[#C49A3C] group-hover:text-[#7B1C2A]")} />
                    <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto")}>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#C49A3C] bg-[#F7ECEE]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#7B1C2A] hover:bg-[#C49A3C] hover:text-white transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5 text-[#C49A3C] group-hover:text-white" />
          <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto")}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
