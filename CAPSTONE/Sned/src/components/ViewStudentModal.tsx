import React, { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { 
  StudentDoc, 
  BehaviorLogDoc, 
  getStudentLogsQuery, 
  getMonthlyNotesQuery 
} from '@/lib/firestoreQueries';
import { X, User, Activity, FileText, Calendar, Clock, MapPin } from 'lucide-react';
import BehaviorBadge from './BehaviorBadge';

interface ViewStudentModalProps {
  student: StudentDoc | null;
  onClose: () => void;
}

export const ViewStudentModal: React.FC<ViewStudentModalProps> = ({ student, onClose }) => {
  const [logs, setLogs] = useState<BehaviorLogDoc[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'notes'>('logs');

  useEffect(() => {
    if (!student?.id) return;

    // Subscribe sa Behavior Logs
    const logsQuery = getStudentLogsQuery(student.id);
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BehaviorLogDoc));
      setLogs(logsList);
    });

    // Subscribe sa Progress Notes
    const notesQuery = getMonthlyNotesQuery(student.id);
    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      const notesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeNotes();
    };
  }, [student]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FBF7F2] w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] border border-[#eadfce] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 bg-white border-b border-[#eadfce] flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#7B1C2A] rounded-2xl text-white shadow-lg">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-[#7B1C2A]">{student.name}</h2>
              <p className="text-xs font-bold text-[#C49A3C] uppercase tracking-widest">{student.grade} • Adviser: {student.teacher}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-8 pt-4 gap-4 bg-white border-b border-[#eadfce]">
          <button 
            onClick={() => setActiveTab('logs')}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'logs' ? 'border-[#7B1C2A] text-[#7B1C2A]' : 'border-transparent text-slate-400'}`}
          >
            Behavioral Ledger ({logs.length})
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'notes' ? 'border-[#7B1C2A] text-[#7B1C2A]' : 'border-transparent text-slate-400'}`}
          >
            Progress Narratives ({notes.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'logs' ? (
            <div className="space-y-4">
              {logs.length > 0 ? logs.map((log: any) => (
                <div key={log.id} className="bg-white p-5 rounded-2xl border border-[#eadfce] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <BehaviorBadge type={log.type} />
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <span className="flex items-center gap-1"><Calendar size={12}/> {log.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/> {log.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed italic mb-3">"{log.description}"</p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                    <MapPin size={12} /> {log.location}
                  </div>
                </div>
              )) : (
                <EmptyState icon={<Activity size={40}/>} message="No behavioral records found for this learner node." />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {notes.length > 0 ? notes.map((note: any) => (
                <div key={note.id} className="bg-white p-6 rounded-2xl border border-[#eadfce] shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-lg border border-emerald-100">
                      {note.category || 'General Progress'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{note.date}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{note.note}</p>
                  <p className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Authored by: {note.createdBy || 'System'}
                  </p>
                </div>
              )) : (
                <EmptyState icon={<FileText size={40}/>} message="No clinical progress notes available in the vault." />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-[#eadfce] flex justify-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Neural Data Access Level: Administrative
          </p>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, message }: { icon: React.ReactNode, message: string }) => (
  <div className="py-20 text-center flex flex-col items-center justify-center opacity-40">
    <div className="mb-4 text-[#7B1C2A]">{icon}</div>
    <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">{message}</p>
  </div>
);

const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #eadfce;
    border-radius: 10px;
  }
`;
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}