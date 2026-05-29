import React from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, FileText, User, MessageSquare, LogOut, Brain, Settings, TrendingUp, ShieldCheck } from 'lucide-react';

interface TabItem {
  label: string;
  icon: React.FC<any>;
  path: string;
  badge?: boolean;
}

const teacherTabs: TabItem[] = [
  { label: 'Home', icon: LayoutDashboard, path: '/teacher' },
  { label: 'Students', icon: Users, path: '/teacher/students' },
  { label: 'AI', icon: Brain, path: '/teacher/reports' },
  { label: 'Alerts', icon: Bell, path: '/teacher/alerts' },
  { label: 'More', icon: Settings, path: '/teacher/settings' },
];

const parentTabs = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/parent' },
  { label: 'Progress', icon: TrendingUp, path: '/parent/progress' },
  { label: 'Alerts', icon: Bell, path: '/parent/alerts' },
  { label: 'Reports', icon: FileText, path: '/parent/reports' },
  { label: 'More', icon: ShieldCheck, path: '/parent/profile' },
];

const adminTabs = [
  { label: 'Home', icon: LayoutDashboard, path: '/admin' },
  { label: 'Students', icon: Users, path: '/admin/students' },
  { label: 'AI', icon: Brain, path: '/admin/analytics' },
  { label: 'Reports', icon: FileText, path: '/admin/logs' },
  { label: 'More', icon: Settings, path: '/admin/settings' },
];

const BottomNav: React.FC<{ variant: 'teacher' | 'parent' | 'admin' }> = ({ variant }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { alerts } = useApp();

  const tabs = variant === 'teacher' ? teacherTabs : variant === 'parent' ? parentTabs : adminTabs;
  const newAlertCount = alerts.filter(a => a.isNew).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-foreground/30 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge && newAlertCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {newAlertCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
