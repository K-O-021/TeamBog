import React, { useState } from 'react';
import { addStudent, StudentDoc } from '@/lib/firestoreQueries';
import { toast } from 'sonner';
import { UserPlus, Loader2, GraduationCap, ShieldCheck } from 'lucide-react';

export function AddStudentForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: 'Grade 1',
    teacher: '',
    riskLevel: 'Low' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newStudent: StudentDoc = {
        ...formData,
        status: 'active',
        lastActivity: new Date().toISOString()
      };

      await addStudent(newStudent);
      toast.success(`${formData.name} successfully registered to the institution.`);
      
      // Reset form on success
      setFormData({
        name: '',
        grade: 'Grade 1',
        teacher: '',
        riskLevel: 'Low'
      });
    } catch (error) {
      console.error(error);
      toast.error("Institutional Registry Fault: Unable to save student data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-[#eadfce] shadow-2xl space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6 border-b border-[#eadfce] pb-6">
        <div className="p-3 bg-[#7B1C2A] rounded-2xl text-white shadow-lg">
          <GraduationCap size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-[#7B1C2A]">Learner Registration</h2>
          <p className="text-[10px] font-bold text-[#C49A3C] uppercase tracking-[0.2em]">Institutional Data Entry Layer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Legal Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-5 py-4 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] focus:outline-none focus:ring-4 focus:ring-[#7B1C2A]/5 transition-all text-slate-800 font-medium"
            placeholder="e.g. MEJIA, JOHN CARLO"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Primary Educator</label>
          <input
            required
            type="text"
            value={formData.teacher}
            onChange={e => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
            className="w-full px-5 py-4 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] focus:outline-none focus:ring-4 focus:ring-[#7B1C2A]/5 transition-all text-slate-800 font-medium"
            placeholder="Assign teacher..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Grade Assignment</label>
          <select
            value={formData.grade}
            onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
            className="w-full px-5 py-4 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] focus:outline-none focus:ring-4 focus:ring-[#7B1C2A]/5 transition-all text-slate-800 font-medium appearance-none"
          >
            <option>Grade 10-A</option>
            <option>Grade 10-B</option>
            <option>Grade 1</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Registry Risk Level</label>
          <select
            value={formData.riskLevel}
            onChange={e => setFormData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
            className="w-full px-5 py-4 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] focus:outline-none focus:ring-4 focus:ring-[#7B1C2A]/5 transition-all text-slate-800 font-medium appearance-none"
          >
            <option value="Low">Low Intensity</option>
            <option value="Moderate">Moderate Intensity</option>
            <option value="High">High Intensity</option>
          </select>
        </div>
      </div>

      <button
        disabled={loading}
        type="submit"
        className="w-full mt-8 py-5 bg-[#7B1C2A] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-[#631622] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 border border-white/20"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={18}/> Commit to Registry</>}
      </button>
    </form>
  );
}