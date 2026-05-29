import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import BottomNav from '@/components/BottomNav';
import { useApp } from '@/context/AppContext';
import { Menu, X, Bell, LogOut } from 'lucide-react';
import { toast } from "sonner";
import { NotificationCenter } from './NotificationCenter';

const AppLayout = () => {
  const { user, requestNotificationPermission, setUser } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    toast.info("Session Terminated");
  };

  useEffect(() => {
    // Request device notification permissions when the app layout loads
    if (user) {
      requestNotificationPermission();
    }
  }, [user, requestNotificationPermission]);

  // Show navigation hub for restricted roles on mobile
  const showMobileNav = user?.role === 'admin';

  return (
    <div className={`min-h-screen flex w-full relative overflow-hidden ${user?.role === 'parent' ? "font-['Times_New_Roman',_serif]" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background: #FFFFFF;
          color: #1E293B;
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
        }
        /* Itago ang scrollbar (slider) para sa sidebar at iba pang custom-scrollbar elements */
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none;    /* Firefox */
        }
        /* General Card Style */
        .card-elevated {
          background: white;
          border: 1px solid #F1F5F9;
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
          transition: all 0.2s ease;
        }
        .card-elevated:hover {
          border-color: #10B981;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05);
          transform: translateY(-1px);
        }
        /* Interactive Feedback for Buttons */
        .btn-interactive {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-interactive:hover {
          transform: translateY(-3px) scale(1.03);
          filter: brightness(1.05);
        }
        .btn-interactive:active {
          transform: translateY(0px) scale(0.94);
          filter: brightness(0.9);
        }
        /* Status Badges - Semantic colors with Neural Blue aesthetic */
        .status-positive { background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-attention { background: rgba(245, 158, 11, 0.1); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
        .status-concerning { background: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .status-low { background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-moderate { background: rgba(245, 158, 11, 0.1); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
        .status-high { background: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.2); }
      ` }} />

       {user?.role !== 'admin' && (
        <AppSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      )}      
      <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
        {user?.role !== 'teacher' && user?.role !== 'parent' && (
          <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white flex-shrink-0 shadow-sm">
            <div className="max-w-[1600px] mx-auto h-full flex items-center px-6 md:px-10 gap-4">
              {user?.role !== 'parent' && user?.role !== 'teacher' && (
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors md:hidden"
                >
                  <Menu className="w-5 h-5 text-slate-600" />
                </button>
              )}
              
              <div className="flex-1">
                 {user?.role !== 'teacher' && user?.role !== 'parent' && (
                   <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest hidden md:block">SNED-LINK+ <span className="text-[#7B1C2A]">Mainframe</span></h2>
                 )}
              </div>
              
              {user && (
                <div className="flex items-center gap-4">
                  <NotificationCenter userEmail={user.email} />

                <button 
                  onClick={handleLogout}
                  className="p-2.5 bg-white/80 hover:bg-rose-50 rounded-2xl text-slate-400 hover:text-rose-600 transition-all border border-white/50 shadow-sm"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                </div>
              )}
            </div>
          </header>
        )}

        <main className="flex-1 overflow-auto">
          <div className={`max-w-[1600px] mx-auto w-full ${user?.role === 'teacher' || user?.role === 'parent' ? "" : "p-6 md:p-10"}`}>
            <Outlet />
          </div>
        </main>
        {/* Institutional Bottom Navigation Hub */}
        {showMobileNav && (
          <div className="md:hidden">
            <BottomNav variant={user?.role as any} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
