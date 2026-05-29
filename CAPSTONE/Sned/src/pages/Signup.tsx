import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Smartphone, ShieldAlert, ArrowLeft, UserPlus, GraduationCap, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'teacher' | 'adviser' | 'parent'>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'parent' : 'teacher'
  );
  const [isRegisteredParent, setIsRegisteredParent] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Dito ilalagay ang API logic para sa registration
    // Pagkatapos ng matagumpay na registration:
    if (role === 'parent') {
      setIsRegisteredParent(true);
    } else {
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  // "Not Authorized" View para sa Parent lamang
  if (isRegisteredParent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-rose-50 text-[#7B1C2A] rounded-3xl flex items-center justify-center mx-auto">
            <ShieldAlert size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Not Authorized</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Registration successful! However, the Parent Dashboard is only accessible via our mobile application.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4 border border-slate-100">
            <Smartphone className="mx-auto text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Download the official app
            </p>
            <div className="flex flex-col gap-2">
              <button className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg">
                Download on App Store
              </button>
              <button className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg">
                Get it on Play Store
              </button>
            </div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="text-[#7B1C2A] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto mt-4"
          >
            <ArrowLeft size={14} /> Return to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Join <span className="text-[#7B1C2A]">Sned</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Create your educator or parent account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['teacher', 'adviser', 'parent'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tight transition-all ${
                  role === r ? 'border-[#7B1C2A] bg-rose-50 text-[#7B1C2A]' : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" autoComplete="name" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-[#7B1C2A]/20 transition-all outline-none" required />
            <input type="email" placeholder="Email Address" autoComplete="email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-[#7B1C2A]/20 transition-all outline-none" required />
            <input type="password" placeholder="Password" autoComplete="new-password" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-[#7B1C2A]/20 transition-all outline-none" required />
          </div>

          <button type="submit" className="w-full py-5 bg-[#7B1C2A] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-rose-900/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
            Sign Up Now
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Already have an account? Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;