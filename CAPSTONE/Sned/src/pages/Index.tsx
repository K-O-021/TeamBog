import React, { useState, useEffect } from 'react';
import { useApp } from "@/context/AppContext";
import { Navigate } from "react-router-dom";
import LoginPage from "./Login.tsx";
import LandingPage from "./LandingPage.tsx";
import TeacherHome from "./TeacherHome";
import NotAuthorized from "./NotAuthorized";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { STORAGE_KEYS, persistData, retrieveData } from "@/lib/storageUtils";

const Index = () => {
  const context = useApp();
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  // Determine if it's a web terminal early
  const currentMode = import.meta.env.MODE;
  const isWebTerminal = currentMode === 'web' || currentMode === 'development';

  // Alternative port-based detection as requested
  // const isWebTerminal = window.location.port === '5173';
  // const isAppMode = window.location.port === '8081';

  const bootProtocols = [
    "Establishing Neural Node Connectivity...",
    "Synchronizing Distributed Behavioral Ledgers...",
    "Calibrating SAIE Predictive Heuristics...",
    "Authenticating Institutional Security Tokens...",
  ];

  useEffect(() => {
    const duration = 9000; // 9 seconds target
    const intervalTime = 50;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + increment));
    }, intervalTime);

    const protocolTimer = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % bootProtocols.length);
    }, 2200);

    const completeTimer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, duration);

    // --- REGISTER NEURAL ALERT SERVICE WORKER ---
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Node Load Error', err));
    }

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
      clearInterval(protocolTimer);
    };
  }, []);

  // ============================================================
  // NEURAL PERSISTENCE ENGINE
  // Automatically synchronizes system state to the local disk
  // ============================================================
  
  // 2. Real-time data sync to storage
  // OPTIMIZATION: Debounce persistence to prevent main-thread blocking during frequent state updates
  useEffect(() => {
    if (!context || !minLoadingComplete) return;

    const syncTimeout = setTimeout(() => {
      const { 
        students = [], 
        behaviorLogs = [], 
        users = [], 
        progressNotes = [], 
        iepRequests = [], 
        alerts = [], 
        user: currentUser 
      } = context;

      // Batch persist operations to minimize blocking I/O
      persistData(STORAGE_KEYS.STUDENTS, students);
      persistData(STORAGE_KEYS.LOGS, behaviorLogs);
      persistData(STORAGE_KEYS.USERS, users);
      persistData(STORAGE_KEYS.NOTES, progressNotes);
      persistData(STORAGE_KEYS.IEP, iepRequests);
      persistData(STORAGE_KEYS.ALERTS, alerts);
      persistData(STORAGE_KEYS.AUTH, currentUser);
    }, 2000); // 2-second debounce for stability

    return () => clearTimeout(syncTimeout);
  }, [
    context?.students, context?.behaviorLogs, context?.users, 
    context?.progressNotes, context?.iepRequests, context?.alerts, 
    context?.user, minLoadingComplete
  ]);

  // 3. Cross-tab synchronization (Logout/Login sync)
  useEffect(() => {
    const handleCrossTabSync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.AUTH && !e.newValue && context?.setUser) {
        // If logged out in another tab, sync this tab
        context.setUser(null);
      }
    };
    window.addEventListener('storage', handleCrossTabSync);
    return () => window.removeEventListener('storage', handleCrossTabSync);
  }, [context?.setUser]);

  // Safety check to prevent crash if context is not yet available
  if (!context) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF7F2]">
        <div className="w-16 h-16 bg-[#3D0C18] rounded-[2rem] flex items-center justify-center shadow-xl border border-[#C49A3C]/30">
          <Sparkles size={24} className="text-[#C49A3C] animate-pulse" />
        </div>
        <p className="mt-8 text-[9px] font-black text-[#7B1C2A]/40 uppercase tracking-[0.3em]">Initializing Node...</p>
      </div>
    );
  }

  const { user, isLoading } = context;

  // Gate 1: If user is not authenticated, show Landing Page first
  if (!isLoading && !user) {
    // If it's a web terminal, show Landing Page
    if (isWebTerminal) {
      return (
        <AnimatePresence mode="wait"><LandingPage /></AnimatePresence>
      );
    } else {
      // If it's an app, go directly to LoginPage
      return (
        <AnimatePresence mode="wait"><LoginPage /></AnimatePresence>
      );
    }
  }

  if (isLoading || !minLoadingComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF7F2] relative overflow-hidden">
        {/* Background Mesh styling consistent with Login Portal */}
        <div className="fixed inset-0 -z-10" style={{
          background: '#FBF7F2',
          backgroundImage: `
            radial-gradient(at 0% 0%, rgba(123, 28, 42, 0.1) 0, transparent 40%), 
            radial-gradient(at 100% 0%, rgba(196, 154, 60, 0.08) 0, transparent 40%)
          `
        }} />

        <div className="relative flex items-center justify-center">
          {/* Outer Glowing Pulse */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-48 h-48 bg-[#7B1C2A]/10 rounded-full blur-3xl"
          />

          {/* Main Rotating Institutional Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-40 h-40 border-t-2 border-b-2 border-[#7B1C2A]/30 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute w-36 h-36 border-l-2 border-r-2 border-[#C49A3C]/20 border-dashed rounded-full"
          />

          {/* Central Logo Circle */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 w-28 h-28 bg-[#3D0C18] rounded-full flex items-center justify-center shadow-2xl border-4 border-[#C49A3C]/50"
          >
            <Sparkles size={40} className="text-[#C49A3C] animate-pulse" />
            
            {/* Percentage Indicator inside circle */}
            <div className="absolute -bottom-2 bg-[#C49A3C] text-white text-[8px] font-black px-2 py-0.5 rounded-full border-2 border-[#3D0C18]">
              {Math.round(progress)}%
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center space-y-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-1">Sned<span className="text-[#7B1C2A]">-Link+</span></h3>
            <p className="text-[10px] font-black text-[#7B1C2A] uppercase tracking-[0.4em]">Neural Core Initialization</p>
          </div>
          
          {/* Progress Bar Container */}
          <div className="w-48 h-1 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <motion.div 
              className="h-full bg-[#7B1C2A]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-[9px] font-black text-[#7B1C2A]/60 uppercase tracking-widest italic animate-pulse">{bootProtocols[statusIndex]}</p>
        </div>
      </div>
    );
  }

  // Institutional Routing Logic
  // Web Distribution: Dedicated for Admin oversight and Teacher record management
  if (isWebTerminal) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;

    // Parents are explicitly prevented from accessing the web dashboard and are redirected to a NotAuthorized page.
    // Parents are restricted to the mobile-optimized Application node
    return <NotAuthorized mode="web" role={user.role} />;
  }

  // Application Distribution (Mobile App)
  // This handles the 'app' mode or standard mobile environment
  if (user.role === 'parent') return <Navigate to="/parent" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />;

  // Fallback redirect to login if no role matches in app mode
  return <Navigate to="/login" replace />;
};

export default Index;
