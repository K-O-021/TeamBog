import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Lock, Mail, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, users = [] } = useApp();
  const { usersRef } = require('@/lib/firestoreQueries'); // Assuming usersRef is exported
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const trimmedEmail = email.toLowerCase().trim();
      const trimmedPassword = password.trim(); // In a real app, this would be hashed

      // 1. Check against hardcoded admin credentials (for demo/initial setup)
      if (trimmedEmail === 'admin@sned.edu' && trimmedPassword === 'admin123') {
        setUser({ name: 'SYSTEM ADMIN', email: trimmedEmail, role: 'admin', status: 'active' });
        toast.success("Admin Identity Verified", { description: "Root access granted. Initializing neural handshake..." });
        navigate('/');
        return;
      }

      // 2. Query Firestore for the user
      const q = query(usersRef, where('email', '==', trimmedEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        // In a real app, you would compare the hashed password here.
        // For this example, we'll assume a successful match if the user exists.
        // If you have a 'password' field in UserDoc, you'd check:
        // if (userData.password === trimmedPassword) { ... }

        // For now, we'll just check if the user exists and is active
        if (userData.status === 'active') {
          setUser({
            id: querySnapshot.docs[0].id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            teacherId: userData.teacherId,
            subject: userData.subject,
          });
          toast.success("Identity Verified", { description: "Access granted. Initializing neural handshake..." });
          navigate('/');
        } else if (userData.status === 'archived') {
          toast.error("Access Denied", { description: "Your account has been archived. Please contact support." });
        } else if (userData.status === 'pending') {
          toast.warning("Account Pending", { description: "Your account is awaiting approval. Please try again later." });
        } else {
          toast.error("Authentication Failed", { description: "Invalid credentials or account status." });
        }
      } else {
        // No user found in Firestore with that email
        toast.error("Authentication Failed", { description: "Invalid credentials." });
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Authentication Error", { description: "Failed to connect to the authentication server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F2] flex items-center justify-center p-4 font-['Georgia','Times_New_Roman',serif] relative overflow-hidden">
      {/* Institutional Mesh Background */}
      <div className="fixed inset-0 -z-10" style={{
        background: '#FBF7F2',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(123, 28, 42, 0.1) 0, transparent 40%), 
          radial-gradient(at 100% 0%, rgba(196, 154, 60, 0.08) 0, transparent 40%)
        `
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 shadow-2xl border border-white/50 space-y-6 relative"
      >
        {/* Neural Header Animation */}
        <div className="relative flex items-center justify-center h-32 mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-32 h-32 bg-[#7B1C2A]/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-24 h-24 border-t-2 border-b-2 border-[#7B1C2A]/30 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute w-20 h-24 border-l-2 border-r-2 border-[#C49A3C]/20 border-dashed rounded-full"
          />
          <div className="relative z-10 w-16 h-16 bg-[#3D0C18] rounded-full flex items-center justify-center shadow-xl border-2 border-[#C49A3C]/50">
            <Sparkles size={24} className="text-[#C49A3C] animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">
            Sned<span className="text-[#7B1C2A]">-Link+</span>
          </h1>
          <p className="text-[#7B1C2A]/60 text-[9px] font-black uppercase tracking-[0.4em]">Neural Core Authorization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7B1C2A] transition-colors" size={18} />
            <input 
              type="email" 
              placeholder="Institutional Email" 
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-4 ring-rose-900/5 transition-all outline-none" 
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7B1C2A] transition-colors" size={18} />
            <input 
              type="password" 
              placeholder="Master Passkey" 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-4 ring-rose-900/5 transition-all outline-none" 
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-[#7B1C2A] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <Sparkles size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            {isLoading ? "Verifying..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-slate-50 space-y-4">
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Unregistered Instructor or Guardian?
            </p>
            <Link to="/signup-verify" className="text-[#7B1C2A] font-black text-xs uppercase hover:underline transition-all tracking-wider inline-block mt-1">
              Verify Identity Node
            </Link>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50/50 rounded-full">
            <span className="text-[9px] text-[#7B1C2A] font-black uppercase tracking-wider">
              Neural Protocol v2.4 Secured
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;