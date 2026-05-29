import React, { useState, useEffect } from 'react';
import { StudentDoc, updateStudent } from '@/lib/firestoreQueries';
import { toast } from 'sonner';
import { X, Save, User, GraduationCap, ShieldCheck } from 'lucide-react';

interface EditStudentModalProps {
  student: StudentDoc | null;
  onClose: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentDoc>>({
    name: '',
    grade: '',
    teacher: '',
    riskLevel: 'Low',
    status: 'active',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        grade: student.grade,
        teacher: student.teacher,
        riskLevel: student.riskLevel,
        status: student.status,
      });
    }
  }, [student]);

  if (!student) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure student.id exists before updating
      if (!student.id) {
        toast.error("Error: Student ID is missing.");
        setLoading(false);
        return;
      }

      await updateStudent(student.id, formData);
      toast.success(`${formData.name}'s data successfully updated.`);
      onClose(); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#eadfce] shadow-2xl space-y-6 max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-6 border-b border-[#eadfce] pb-6">
          <div className="p-3 bg-[#7B1C2A] rounded-2xl text-white shadow-lg">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-[#7B1C2A]">Edit Learner Profile</h2>
            <p className="text-[10px] font-bold text-[#C49A3C] uppercase tracking-[0.2em]">Institutional Data Modification Layer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Legal Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] focus:outline-none focus:ring-4 focus:ring-[#7B1C2A]/5 transition-all text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Primary Educator</label>
              <input
                required
                type="text"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-[#FBF7F2] border border-[#eadfce] focus:outline-none focus:ring-4 focus:ring-[#7B1C2A]/5 transition-all text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Grade Assignment</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
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
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
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
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18}/> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};