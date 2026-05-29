import React, { useState } from "react";
import {
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  Camera,
  Menu,
  User as UserIcon,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isDesktopApp } from "@/lib/platform";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: ("admin" | "teacher" | "parent")[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // =========================
  // ADMIN ONLY SIDEBAR
  // =========================
  if (user?.role !== "admin") {
    return null;
  }

  const profilePath = "/admin/profile";

  // =========================
  // NAVIGATION
  // =========================
  const desktopGroups: NavGroup[] = [
    {
      label: "Dashboard",
      items: [
        {
          title: "Admin Console",
          href: "/admin",
          icon: ShieldCheck,
          roles: ["admin"],
        },
      ],
    },

    {
      label: "Management",
      items: [
        {
          title: "Students",
          href: "/students",
          icon: Users,
          roles: ["admin"],
        },
      ],
    },

    {
      label: "System",
      items: [
        {
          title: "Settings",
          href: "/settings",
          icon: Settings,
          roles: ["admin"],
        },
      ],
    },
  ];

  const activeGroups = desktopGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !item.roles ||
          (user && item.roles.includes(user.role))
      ),
    }))
    .filter((group) => group.items.length > 0);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    if (isDesktopApp) {
      const confirmExit = window.confirm(
        "Are you sure you want to logout?"
      );

      if (!confirmExit) return;
    }

    setUser(null);
    navigate("/");

    toast.success(
      isDesktopApp
        ? "Admin session ended"
        : "Successfully logged out"
    );
  };

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "h-full flex flex-col transition-all duration-300 border-r border-[#eadfce] bg-[#f8f4ec] text-slate-700 shadow-lg",
        isCollapsed ? "w-20" : "w-60"
      )}
    >
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="p-4 border-b border-[#eadfce]">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-5">

          {/* LOGO */}
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden",
              isCollapsed
                ? "opacity-0 w-0"
                : "opacity-100 w-auto"
            )}
          >
            <h1 className="text-xl font-black tracking-tight uppercase text-[#7B1C2A] leading-none">
              Sned<span className="text-[#C49A3C]">Link+</span>
            </h1>

            <p className="text-[8px] uppercase tracking-[0.25em] font-black text-[#7B1C2A]/40 mt-1">
              Admin Layer
            </p>
          </div>

          {/* MENU BUTTON */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 rounded-xl bg-white border border-[#eadfce] text-[#7B1C2A] hover:scale-105 transition-all shadow-sm"
          >
            <Menu size={16} />
          </button>
        </div>

        {/* PROFILE CARD */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate(profilePath)}
          className={cn(
            "bg-white border border-[#eadfce] rounded-3xl p-3 cursor-pointer shadow-sm transition-all",
            isCollapsed && "items-center justify-center p-2"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}
          >
            {/* AVATAR */}
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-[#7B1C2A] text-white flex items-center justify-center font-black text-lg shadow-md overflow-hidden">
                {user?.name ? (
                  user.name.charAt(0)
                ) : (
                  <UserIcon className="w-6 h-6" />
                )}
              </div>

              <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-[#C49A3C] text-white shadow-md">
                <Camera size={9} />
              </div>
            </div>

            {/* USER INFO */}
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-xs font-black uppercase text-slate-800 truncate">
                  {user?.name || "Admin"}
                </h2>

                <div className="flex items-center gap-1 mt-1">
                  <Sparkles
                    size={9}
                    className="text-[#C49A3C]"
                  />

                  <p className="text-[9px] font-black uppercase tracking-widest text-[#7B1C2A]/60">
                    Admin Authority
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ========================= */}
      {/* NAVIGATION */}
      {/* ========================= */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">

        {activeGroups.map((group) => (
          <div key={group.label} className="mb-6">

            {/* LABEL */}
            {!isCollapsed && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C49A3C]" />

                <p className="text-[9px] uppercase tracking-[0.25em] font-black text-[#7B1C2A]/40">
                  {group.label}
                </p>
              </div>
            )}

            {/* ITEMS */}
            <div className="space-y-2">

              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl transition-all duration-300 relative overflow-hidden",
                      isCollapsed
                        ? "justify-center p-3"
                        : "px-4 py-3",

                      isActive
                        ? "bg-white shadow-md border border-[#eadfce]"
                        : "hover:bg-white/70"
                    )}
                  >
                    {/* ACTIVE BAR */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebar"
                        className="absolute left-0 top-0 h-full w-1 bg-[#7B1C2A] rounded-r-full"
                      />
                    )}

                    {/* ICON */}
                    <div
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        isActive
                          ? "bg-[#7B1C2A] text-white shadow-sm"
                          : "bg-white text-slate-400 group-hover:text-[#7B1C2A]"
                      )}
                    >
                      <item.icon size={14} />
                    </div>

                    {/* TITLE */}
                    {!isCollapsed && (
                      <>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest transition-all",
                              isActive
                                ? "text-[#7B1C2A]"
                                : "text-slate-500 group-hover:text-slate-800"
                            )}
                          >
                            {item.title}
                          </p>
                        </div>

                        <ChevronRight
                          size={12}
                          className={cn(
                            "transition-all",
                            isActive
                              ? "text-[#7B1C2A]"
                              : "text-slate-300 group-hover:text-slate-500"
                          )}
                        />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ========================= */}
      {/* FOOTER */}
      {/* ========================= */}
      <div className="p-3 border-t border-[#eadfce] bg-white/50">

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 rounded-2xl transition-all duration-300",
            isCollapsed
              ? "justify-center p-3"
              : "px-4 py-3",

            "bg-white hover:bg-rose-50 border border-[#eadfce] shadow-sm"
          )}
        >
          <div className="p-2 rounded-xl bg-rose-50 text-rose-500">
            <LogOut size={14} />
          </div>

          {!isCollapsed && (
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                Logout
              </p>

              <p className="text-[8px] font-bold text-slate-400 mt-1">
                End session
              </p>
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;