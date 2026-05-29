import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, GraduationCap, Users, ArrowRight, User, Lock, Camera, Sparkles, ShieldCheck, Smartphone, Download, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  addUser as firestoreAddUser, 
  updateUserProfile, 
  updateStudent as firestoreUpdateStudent 
} from '@/lib/firestoreQueries';

const ProgressIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Selection' },
    { id: 2, label: 'Verification' },
    { id: 3, label: 'Registration' }
  ];

  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-2 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 border-2 ${
              currentStep >= step.id 
                ? 'bg-[#3D0C18] border-[#7B1C2A] text-[#C49A3C] shadow-lg shadow-rose-900/20' 
                : 'bg-white border-slate-100 text-slate-300'
            }`}>
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500 whitespace-nowrap ${
              currentStep >= step.id ? 'text-[#7B1C2A]' : 'text-slate-300'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-2 mb-6 bg-slate-100 relative overflow-hidden rounded-full">
              <motion.div initial={{ width: 0 }} animate={{ width: currentStep > step.id ? '100%' : '0%' }} transition={{ duration: 0.8, ease: "easeInOut" }} className="h-full bg-[#7B1C2A]" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
 const { students, users = [], addSystemLog, addUser, updateStudent, updateUser } = useApp();
  
  const [role, setRole] = useState<'teacher' | 'parent' | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSuccessfullyRegistered, setIsSuccessfullyRegistered] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '', name: '', subject: '',
    childName: '', childLRN: '',
    email: '', password: '', confirmPassword: ''
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    let isVerified = false;

    if (role === 'teacher') {
      const inputId = formData.id.trim().toUpperCase();
      const inputName = formData.name.trim().toLowerCase();
      const inputSubject = formData.subject.trim();

      // Verify against the Admin whitelist (users array from context)
      isVerified = users.some(u => 
        (u.role === 'teacher' || u.role === 'adviser') && 
        u.status !== 'archived' &&
        (u.teacherId?.toUpperCase() === inputId || u.id?.toString().toUpperCase() === inputId) && 
        (u.name || '').toLowerCase() === inputName &&
        (u.subject || '').toLowerCase() === inputSubject.toLowerCase()
      );
      
    } else if (role === 'parent') {
      const inputName = formData.childName.trim().toLowerCase();
      const inputLRN = formData.childLRN.trim();

      // Verify against existing Student records to link Parent to child
            isVerified = students.some(s => {
        const studentName = (s.name || '').trim().toLowerCase();
        const studentLRN = String(s.lrn || '').trim();
        const studentID = String(s.id || '').trim();

        return (studentLRN === inputLRN || studentID === inputLRN) && studentName === inputName;
      });
    }

    if (isVerified) {
      toast.success("Institutional Identity Verified!", { 
        description: `Credentials found for ${role === 'teacher' ? formData.name : 'Parent Authority'}.` 
      });
      setIsVerified(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setShowWarning(true);
        // Dispatch security alert to Admin Logs
        addSystemLog?.({
          type: 'SECURITY_ALERT',
          message: `UNAUTHORIZED ACCESS: 3 verification failures for ${role} role. Target: ${formData.id || formData.childLRN}`,
          timestamp: new Date().toISOString()
        });
      } else {
        toast.error(`Verification Failed`, {
          description: `Attempt ${newAttempts}/3. unauthorized access is strictly prohibited and logged.`
        });
      }
    }
  };

  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password Mismatch", { description: "Your passwords do not match." });
      return;
    }

    try {
      if (role === 'teacher') {
        const inputId = formData.id.trim().toUpperCase();
        const inputName = formData.name.trim().toLowerCase();

        const whitelistedUser = users.find(u => 
          (u.teacherId?.toUpperCase() === inputId || u.id?.toString().toUpperCase() === inputId) &&
          (u.name || '').toLowerCase() === inputName
        );

        if (whitelistedUser) {
          // 1. Sync updated credentials to Firestore
          await updateUserProfile(whitelistedUser.email, { 
            email: formData.email,
            // Casting password to any as UserDoc doesn't strictly define it for auth simulation
            ...({ password: formData.password } as any)
          });
          
          // 2. Update local context state
          updateUser?.(whitelistedUser.email, { 
            email: formData.email,
            password: formData.password 
          });
        }
      } else if (role === 'parent') {
        const parentData = {
          name: `Parent of ${formData.childName}`,
          email: formData.email,
          role: 'parent' as const,
          status: 'active' as const
        };

        // 1. Persist Parent User to Firestore
        await firestoreAddUser(parentData);
        
        // 2. Register in local context
        addUser?.(parentData);

        // 3. Link parent email to student record for portal synchronization
        const linkedStudent = students.find(s => 
          (String(s.lrn) === formData.childLRN || String(s.id) === formData.childLRN) && 
          s.name.toLowerCase() === formData.childName.toLowerCase()
        );

        if (linkedStudent) {
          await firestoreUpdateStudent(linkedStudent.id, { parentEmail: formData.email });
          updateStudent?.(linkedStudent.id, { parentEmail: formData.email });
        }
      }

      toast.success("Account Created Successfully", {
        description: "You can now sign in with your new credentials."
      });

      if (role === 'parent') {
        setIsSuccessfullyRegistered(true);
      } else {
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("Registration Fault", {
        description: "Failed to synchronize credentials with the neural network."
      });
    }
  };

  if (isSuccessfullyRegistered && role === 'parent') {
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white/50 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
            <ShieldCheck size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic leading-none">Registration <span className="text-[#7B1C2A]">Successful</span></h2>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mt-2">
              Tapos na ang iyong registration! Ngunit ang Parent Portal ay maaari lamang ma-access gamit ang aming mobile application.
            </p>
          </div>

          <div className="p-6 bg-[#F7ECEE]/50 rounded-[2rem] space-y-4 border border-[#7B1C2A]/10">
            <Smartphone className="mx-auto text-[#7B1C2A]" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              I-download ang official app para sa monitoring
            </p>
            <a 
              href="/sned-link-plus.apk"
              download
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#7B1C2A] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 no-underline"
            >
              <Download size={16} /> I-download ang APK (Android)
            </a>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="text-[#7B1C2A] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto mt-4"
          >
            <ArrowLeft size={14} /> Balik sa Login
          </button>
        </motion.div>
      </div>
    );
  }

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

      <div className="max-w-sm w-full">
        {/* Neural Header Animation */}
        <div className="relative flex items-center justify-center h-24 mb-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-24 h-24 bg-[#7B1C2A]/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-20 h-20 border-t border-b border-[#7B1C2A]/30 rounded-full"
          />
          <div className="relative z-10 w-12 h-12 bg-[#3D0C18] rounded-full flex items-center justify-center shadow-xl border border-[#C49A3C]/50">
            <Sparkles size={18} className="text-[#C49A3C] animate-pulse" />
          </div>
        </div>

        <header className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#7B1C2A] tracking-tighter italic leading-none">
            SNED<span className="text-[#C49A3C]">-LINK+</span>
          </h1>
          <p className="text-[#7B1C2A]/60 font-black uppercase text-[8px] tracking-[0.4em] mt-2">Institutional Identity Initialization</p>
        </header>

        <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl border border-white/50">
          <ProgressIndicator currentStep={isVerified ? 3 : (role ? 2 : 1)} />
          {!role ? (
            <div className="space-y-4">
              <h2 className="text-center font-black text-slate-800 uppercase tracking-widest text-sm mb-6">Select Your Rank</h2>
              <button onClick={() => setRole('teacher')} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-[#F7ECEE] transition-all group border border-slate-100 hover:border-[#7B1C2A]/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-[#7B1C2A] shadow-sm"><GraduationCap size={20}/></div>
                  <span className="font-bold text-slate-700">Teacher / Adviser</span>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setRole('parent')} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-[#F7ECEE] transition-all group border border-slate-100 hover:border-[#7B1C2A]/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-[#C49A3C] shadow-sm"><Users size={20}/></div>
                  <span className="font-bold text-slate-700">Parent / Guardian</span>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="pt-4 text-center">
                <button onClick={() => navigate('/login')} className="text-xs font-bold text-slate-400 hover:text-[#7B1C2A]">Existing Credentials? Return to Login</button>
              </div>
            </div>
          ) : isVerified ? (
            /* STEP 3: CREATE ACCOUNT (Only shown after verification) */
            <form onSubmit={handleFinalSignup} className="space-y-5">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-black uppercase">Identity Node Unlocked</span>
                </div>
                <h2 className="text-lg font-black text-slate-800 mt-2">Create Your Credentials</h2>
              </div>

              <SignupInput label="New Institutional Email" type="email" autoComplete="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} placeholder="Enter your preferred email" />
              <SignupInput label="Master Passkey" type="password" autoComplete="new-password" value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})} placeholder="••••••••" />
              <SignupInput label="Confirm Passkey" type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={(v: string) => setFormData({...formData, confirmPassword: v})} placeholder="••••••••" />

              <button type="submit" className="w-full bg-black text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#7B1C2A] transition-all shadow-lg">
                Initialize Account Node
              </button>
            </form>
          ) : (
            /* STEP 2: VERIFICATION (Identity Node check) */
            <form onSubmit={handleVerify} className="space-y-5">
              <button type="button" onClick={() => setRole(null)} className="text-[10px] font-black text-[#7B1C2A] uppercase tracking-widest hover:underline mb-2">← Back to Selection</button>
              
              <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm italic">
                {role} <span className="text-[#C49A3C]">Verification</span>
              </h2>

              {role === 'teacher' ? (
                <>
                  <SignupInput label="Teacher / Institutional ID" autoComplete="off" value={formData.id} onChange={(v: string) => setFormData({...formData, id: v})} placeholder="Halimbawa: ID-12345" />
                  <SignupInput label="Full Name" autoComplete="name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} placeholder="Name listed in Mainframe" />
                  <SignupInput label="Assigned Subject" autoComplete="off" value={formData.subject} onChange={(v: string) => setFormData({...formData, subject: v})} placeholder="e.g. Science" />
                </>
              ) : (
                <>
                  <SignupInput label="Learner's Full Name" autoComplete="name" value={formData.childName} onChange={(v: string) => setFormData({...formData, childName: v})} placeholder="Enter child's full name" />
                  <SignupInput label="Learner's LRN" autoComplete="off" value={formData.childLRN} onChange={(v: string) => setFormData({...formData, childLRN: v})} placeholder="12-digit number" />
                </>
              )}

              <button disabled={attempts >= 3} type="submit" className="w-full bg-[#7B1C2A] text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Verify Identity
              </button>
            </form>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white max-w-sm w-full p-8 rounded-[3rem] text-center border-4 border-rose-100 shadow-2xl">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Access <span className="text-rose-600">Restricted</span></h3>
              <p className="text-sm text-slate-500 mt-4 font-bold leading-relaxed">
                Verification failed 3 times. Your attempt has been logged and the **Mainframe Admin** has been alerted for potential unauthorized access.
              </p>
              <button onClick={() => navigate('/')} className="mt-8 w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                Return to Landing
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SignupInput = ({ label, value, onChange, placeholder, type = "text", autoComplete }: any) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
    <input required type={type} autoComplete={autoComplete} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#7B1C2A]/10 outline-none transition-all" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default SignupPage;