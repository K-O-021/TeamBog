import React, { useState, useEffect } from 'react';
import { UserDoc, updateUserProfile } from '@/lib/firestoreQueries';
import { toast } from 'sonner';
import { X, Save, ShieldCheck, Mail, BookOpen } from 'lucide-react';

interface EditTeacherModalProps {
  teacher: UserDoc | null;
  onClose: () => void;
}

export const EditTeacherModal: React.FC<EditTeacherModalProps> = ({ teacher, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserDoc>>({
    name: '',
    email: '',
    role: 'teacher',
    subject: '',
    teacherId: ''
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        subject: teacher.subject,
        teacherId: teacher.teacherId,
      });
    }
  }, [teacher]);

  if (!teacher) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(teacher.email, formData);
      toast.success(`Faculty node ${formData.name} has been synchronized.`);
      onClose();
    } catch (error) {
      toast.error("Registry Sync Fault: Unable to update faculty data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#eadfce] shadow-2xl space-y-6 max-w-xl w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
        
        <div className="flex items-center gap-4 mb-6 border-b border-[#eadfce] pb-6">
          <div className="p-3 bg-[#7B1C2A] rounded-2xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-[#7B1C2A]">Modify Faculty Node</h2>
            <p className="text-[10px] font-bold text-[#C49A3C] uppercase tracking-[0.2em]">Institutional Access Modification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Legal Name</label>
                <input 
                  required value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] text-sm font-bold outline-none focus:ring-4 ring-[#7B1C2A]/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Faculty ID</label>
                <input 
                  required value={formData.teacherId} 
                  onChange={e => setFormData({...formData, teacherId: e.target.value.toUpperCase()})}
                  className="w-full px-5 py-3 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] text-sm font-bold outline-none focus:ring-4 ring-[#7B1C2A]/5"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Institutional Email</label>
              <input 
                disabled value={formData.email} 
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-[#eadfce] text-sm font-bold opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Clearance Role</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="w-full px-5 py-3 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] text-sm font-bold outline-none"
                >
                  <option value="teacher">Teacher</option>
                  <option value="adviser">Adviser</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Subject</label>
                <input 
                  required value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-[#7B1C2A] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
            {loading ? <span className="animate-spin">⏳</span> : <><Save size={16}/> Commit Parameters</>}
          </button>
        </form>
      </div>
    </div>
  );
};