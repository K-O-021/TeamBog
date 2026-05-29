import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FileText, Send, User, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const RequestIEP = () => {
  const { addIEPRequest, user, students } = useApp();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !reason) {
      toast.error("Please fill in all fields");
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    
    addIEPRequest({
      parentEmail: student?.parentEmail || '',
      parentName: student?.parentName || 'Parent',
      studentName: student?.name || 'Unknown Student',
    });

    toast.success("IEP Request Submitted", {
      description: `Formal request for ${student?.name} has been logged.`
    });
    
    setReason('');
    setSelectedStudent('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-2xl shadow-xl shadow-emerald-200/20">
            <FileText className="text-emerald-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              IEP <span className="text-emerald-600">Request</span>
            </h1>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
              Institutional Documentation Portal
            </div>
          </div>
        </div>

        <div className="status-low px-4 py-2 rounded-2xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Terminal Status: Ready</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Request Form */}
        <div className="lg:col-span-2 card-elevated p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Learner</label>
              <select 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none"
              >
                <option value="">Select a student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Justification</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the behavioral or academic observations necessitating this IEP update..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 font-medium min-h-[150px] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              className="btn-interactive w-full bg-black text-white rounded-2xl p-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/10"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              Dispatch Request to Admin
            </button>
          </form>
        </div>

        {/* Information Sidebar */}
        <div className="space-y-6">
          <div className="card-elevated p-8 bg-emerald-50/30 border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-emerald-600 w-5 h-5" />
              <h3 className="font-black text-slate-900 uppercase tracking-tighter italic">Process <span className="text-emerald-600">Info</span></h3>
            </div>
            <ul className="space-y-4">
              {[
                "Requests are reviewed by Admin within 24h",
                "Parents are automatically notified via Hub",
                "All clinical logs are attached to this request",
                "Requires final signature from Root Access"
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RequestIEP;
