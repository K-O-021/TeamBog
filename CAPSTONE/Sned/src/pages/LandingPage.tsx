import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Menu, X } from 'lucide-react';

const SnedLinkPro = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = ['Home', 'About', 'Contact', 'Portal'];

  return (
    <div className="min-h-screen text-black font-['Georgia','Times_New_Roman',serif] overflow-x-hidden selection:bg-rose-100 bg-[#FBF7F2]">
      <style>{`
        body { font-family: 'Georgia', 'Times New Roman', serif; }
        .bg-orb { position: fixed; border-radius: 50%; filter: blur(80px); opacity: 0.25; z-index: 0; }
        .orb1 { width:400px; height:400px; background:rgba(123, 28, 42, 0.15); top:-10%; left:-5%; }
        .orb2 { width:350px; height:350px; background:rgba(196, 154, 60, 0.12); bottom:-5%; right:-5%; }
        
        .grid-overlay {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(123, 28, 42, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(123, 28, 42, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(61, 12, 24, 0.1);
        }

        .btn-maroon {
          background: linear-gradient(135deg, #7B1C2A, #3D0C18);
          color: white; padding: 12px 28px; border-radius: 12px;
          font-weight: 800; font-size: 11px; letter-spacing: 0.1em;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }
      `}</style>

      {/* Background Elements */}
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
      <div className="grid-overlay" />

      {/* HEADER */}
      <header className="sticky top-0 z-[100] px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="glass-card bg-white/70 px-6 py-3 flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-[#7B1C2A] cursor-pointer" onClick={() => navigate('/')}>
              <div className="p-2 bg-[#F7ECEE] rounded-lg">
                <Sparkles className="text-[#7B1C2A]" size={18} />
              </div>
              <span>SNED-<span className="text-[#C49A3C]">LINK+</span></span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-[11px] font-black text-slate-800/60 uppercase tracking-widest">
              {navLinks.map((link) => (
                <button 
                  key={link} 
                  onClick={link === 'Portal' ? () => navigate('/login', { state: { signup: false } }) : undefined}
                  className="hover:text-[#7B1C2A] transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/signup-verify')} 
                className="btn-maroon hidden sm:block"
              >
                SIGN UP
              </button>
              <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO SECTION - Simplified Layout */}
      <section className="relative z-10 px-8 pt-20 pb-32 max-w-4xl mx-auto text-center">
        <span className="inline-block bg-[#F7ECEE] text-[#7B1C2A] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-[#e8d8da]">
          Institutional Framework v2.0
        </span>
        <h1 className="text-5xl md:text-6xl font-[900] mb-8 leading-[0.95] tracking-tighter text-[#3D0C18] italic">
         Recto Memorial High School <br />
          <span className="text-[#C49A3C]"> - Tiaong Quezon -</span>
        </h1>
        <p className="text-slate-700/80 mb-10 text-xl leading-relaxed mx-auto max-w-2xl font-semibold">
          Recto Memorial High School digital bridge for behavioral monitoring and inclusive excellence.
        </p>
        <div className="flex justify-center gap-4">
          <a 
            href="/sned-link-plus.apk"
            download="sned-link-plus.apk"
            type="application/vnd.android.package-archive"
            className="btn-maroon flex items-center gap-3 active:scale-95 no-underline shadow-xl shadow-rose-900/10"
          >
            Download App  <ArrowRight size={14} />
          </a>
          <button 
            onClick={() => navigate('/signup-verify')} 
            className="btn-maroon flex items-center gap-3 active:scale-95 no-underline shadow-xl shadow-rose-900/10"
          >
          </button>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="relative z-10 py-24 px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-10 col-span-2">
            <h2 className="text-3xl font-black mb-4 text-[#3D0C18] italic">About the Institution</h2>
            <p className="text-slate-700/80 leading-relaxed text-lg font-medium">
              Paaralang Pag-ibig at Pag-asa Integrated School stands as the premier Special Education facility 
              within the San Pablo City division, dedicated to fostering an environment of growth and inclusion.
            </p>
          </div>
          
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-white/40 border-t border-[#e8d8da] py-16 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-left">
            <div className="font-black text-xl text-[#3D0C18] italic">SNED-LINK+</div>
            <p className="text-xs font-bold text-[#7B1C2A]/60 uppercase tracking-widest mt-1">2026 Integrated System</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm font-bold text-slate-800/80">Teomora Ph.1 Brgy. San Gabriel, San Pablo City</p>
            <p className="text-xs text-[#7B1C2A] font-bold mt-1 uppercase tracking-wider">500151@deped.gov.ph | (049) 521 3419</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SnedLinkPro;