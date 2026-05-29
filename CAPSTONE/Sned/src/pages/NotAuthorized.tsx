import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { toast } from "sonner";

interface NotAuthorizedProps {
  mode: 'web' | 'app';
  role: string;
}

const NotAuthorized: React.FC<NotAuthorizedProps> = ({ mode, role }) => {
  const navigate = useNavigate();
  const { setUser } = useApp();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    toast.info("Session Terminated");
  };

  const isWebDenial = mode === 'web';
  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-['Times_New_Roman',_serif] bg-[#F1F8F6]">
      <style>{`
        body { font-family: 'Times New Roman', Times, serif; }
      `}</style>

       <div className="fixed inset-0 -z-10" style={{
        background: '#ffffff',
        backgroundImage: `
          radial-gradient(at 0% 0%, #D1FAE5 0, transparent 40%), 
          radial-gradient(at 100% 0%, #ECFDF5 0, transparent 40%)
        `
      }} />

      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16 shadow-2xl border border-emerald-100 max-w-2xl w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
        
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl shadow-rose-900/5">
          <ShieldAlert size={48} className="text-rose-500" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
          Platform <span className="text-rose-600">Restricted</span>
        </h1>
        
        <div className="space-y-6 text-slate-600 font-medium mb-10">
          <p className="text-base leading-snug">
            Ang iyong account (<span className="text-emerald-700 font-black uppercase tracking-widest text-sm">{role}</span>) ay hindi pinahihintulutang i-access ang <span className="font-black text-slate-900 uppercase italic">{isWebDenial ? 'Web Administration Portal' : 'Mobile Application Distribution'}</span>.
          </p>
          
          <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 mb-3">Pamantayan ng Institusyon:</h3>
            <ul className="space-y-2 text-xs leading-relaxed">
              {isWebDenial ? (
                <>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Ang <strong>Web Portal</strong> ay nakalaan lamang para sa Administrative Oversight at Teacher Record Management.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Ang mga <strong>Magulang</strong> ay inaanyayahang i-download ang aming mobile app para sa mas mabilis at ligtas na monitoring.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Ang <strong>Mobile App</strong> ay idinisenyo para sa mabilis na monitoring at logging ng mga magulang.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Ang mga <strong>Guro</strong> ay dapat gumamit ng <strong>Web Portal</strong> para sa kabuuang pamamahala ng records.</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          {isWebDenial && (
            <a 
              href="/sned-link-plus.apk"
              download="sned-link-plus.apk"
              type="application/vnd.android.package-archive"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl active:scale-95 w-full sm:w-auto no-underline"
            >
              <Download size={16} /> I-download ang APK
            </a>
          )}

          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
          >
            <ArrowLeft size={16} /> Balik sa Landing
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
          >
            <LogOut size={16} /> Mag-log out / Switch
          </button>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-center gap-6">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Security Layer</p>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">V2.0 Protocol</p>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;