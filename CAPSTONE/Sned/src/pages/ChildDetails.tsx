import React from 'react';
import { useApp } from '@/context/AppContext';
import RiskBadge from '@/components/RiskBadge';
import { Heart, Calendar, TrendingUp } from 'lucide-react';

const ParentChild = () => {
  const { user, students, attendance, progressNotes } = useApp();
  const child = students.find(s => s.parentEmail === user?.email);
  const childAttendance = attendance.filter(r => r.studentId === child?.id);
  const childProgress = progressNotes.filter(n => n.studentId === child?.id);

  if (!child) return (
    <div className="p-6 text-center italic text-muted-foreground">
      Account not linked to a student. Please contact the teacher to link your email ({user?.email}).
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 animate-fade-in font-['Times_New_Roman',_serif]">
      <div className="card-elevated p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center border-2 border-primary/20">{child.initials}</div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{child.name}</h2>
            <p className="text-sm text-slate-600">{child.grade} • {child.teacher}</p>
          </div>
          <RiskBadge level={child.riskLevel} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">Recent Attendance</h3>
        </div>
        <div className="space-y-2">
          {childAttendance.map(r => (
            <div key={r.id} className="card-elevated p-3 flex justify-between items-center">
              <span className="text-sm text-foreground">{r.date}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                r.status === 'Present' ? 'bg-success/10 text-success' :
                r.status === 'Absent' ? 'bg-destructive/10 text-destructive' :
                'bg-warning/10 text-warning'
              }`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">Progress Updates</h3>
        </div>
        <div className="space-y-2">
          {childProgress.map(n => (
            <div key={n.id} className="card-elevated p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{n.category}</span>
                <span className="text-xs text-muted-foreground">{n.date}</span>
              </div>
              <p className="text-sm text-foreground mt-1 font-medium">{n.note}</p>
              <p className="text-xs text-muted-foreground mt-1">By {n.createdBy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentChild;
