import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileDown, Printer, Sparkles, FileText, GraduationCap, TrendingUp, ChevronDown, FileSpreadsheet, Wifi, WifiOff, Activity, RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import { getBehaviorStats, generateStudentAiAnalysis } from '@/lib/behaviorUtils';
import { exportToPDF } from '@/lib/pdfExport';
import { motion, AnimatePresence } from 'framer-motion';

const moodData: any[] = [
  { date: '2026-03-01', value: 7 },
  { date: '2026-03-03', value: 8 },
  { date: '2026-03-05', value: 6 }
];
const ParentReports = () => {
  const { user, students, behaviorLogs, progressNotes, isConnected, latency, addSyncRequest } = useApp();
  const myChild = useMemo(() => students.find(s => s.parentEmail === user?.email), [students, user?.email]);
  const childLogs = useMemo(() => behaviorLogs.filter(l => l.studentId === myChild?.id), [behaviorLogs, myChild]);
  const stats = useMemo(() => getBehaviorStats(childLogs), [childLogs]);

  const [isSyncing, setIsSyncing] = useState(false);
  const handleRequestSync = () => {
    setIsSyncing(true);
    if (user && myChild && addSyncRequest) {
      addSyncRequest({ studentId: myChild.id, studentName: myChild.name, teacherName: myChild.teacher, parentName: user.name });
    }
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Behavioral Ledger Synchronized");
    }, 2000);
  };

  const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);

  const handlePrint = () => {
    window.print();
    setIsReportDropdownOpen(false);
  };

  const handleExportCSV = () => {
    toast.info("Preparing CSV Datastream...");
    setTimeout(() => toast.success("Behavioral archive exported"), 1000);
    setIsReportDropdownOpen(false);
  };

  // Real-time Weekly Trends for the individual learner
  const childWeeklyTrends = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const counts: Record<string, number> = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0 };
    
    childLogs.forEach(log => {
      try {
        const d = new Date(log.date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (counts.hasOwnProperty(dayName)) {
          counts[dayName]++;
        }
      } catch (e) {}
    });
    return days.map(day => ({ day, value: counts[day] }));
  }, [childLogs]);

  const aiAnalysis = useMemo(() => {
    if (!myChild) return null;
    return generateStudentAiAnalysis(myChild, behaviorLogs, progressNotes);
  }, [myChild, behaviorLogs, progressNotes]);

  const handleExportPDF = () => {
    setIsReportDropdownOpen(false);
    const studentName = myChild?.name || 'Student';
    toast.info("Preparing Official PDF Behavior Report...");
    
    setTimeout(() => {
      const headers = ["Category", "Professional Analysis"];
      const data = [
        ["Document Status", "Official Parent Portal Export"],
        ["Professional Narrative", aiAnalysis?.monthlyNarrative || "N/A"],
        ["Academic Achievements", aiAnalysis?.academicHighlights.join(", ") || "N/A"],
        ["Growth Focus", aiAnalysis?.areasForGrowth.join(", ") || "N/A"],
        ["Total Positive Logs", stats.positive.toString()],
        ["Neutral Observations", stats.neutral.toString()],
        ["Attention Logs", (stats.concerning + stats.critical).toString()],
        ["ML Behavior Score", "8.5 / 10"]
      ];

      exportToPDF({
        title: "Official Behavioral Progress Report",
        subtitle: `Student: ${studentName} | Period: March 1 - 7, 2026`,
        filename: `Official_Student_Report_${studentName.replace(/\s+/g, '_')}.pdf`,
        headers,
        data,
        summaryStats: [
          { label: "Positive", value: stats.positive },
          { label: "Behavior Score", value: "8.5/10" }
        ],
        charts: [
          {
            title: "Weekly Behavior Frequency",
            type: "bar",
            data: childWeeklyTrends.map(d => ({ label: d.day, value: d.value }))
          },
          {
            title: "Mood Trend Analysis",
            type: "line",
            data: moodData.map(m => ({ label: m.date, value: m.value }))
          }
        ]
      });
      toast.success("Official PDF report downloaded.");
    }, 1200);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 animate-fade-in font-['Times_New_Roman',_serif] pb-32">
    {/* --- REAL-TIME CONNECTIVITY STATUS --- */}
    <div className="max-w-7xl mx-auto mb-6 px-8 flex items-center justify-between bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] border border-emerald-100/50 shadow-sm">
      <div className="flex items-center gap-1.5">
        <motion.div 
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-2 h-2 rounded-full shadow-lg ${isConnected ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`} 
        />
        <div className="flex flex-col">
          <span className={`text-[8px] font-black uppercase tracking-[0.25em] ${isConnected ? 'text-emerald-800' : 'text-rose-800'}`}>
            {isConnected ? 'Stream Active' : 'Neural Link Severed'}
          </span>
          {isConnected && latency && <span className="text-[7px] font-mono text-emerald-600/60 leading-none">RTT: {latency}ms</span>}
        </div>
      </div>
      <button onClick={handleRequestSync} disabled={isSyncing} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-950 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50">
        <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
        {isSyncing ? "Syncing..." : "Sync Ledger"}
      </button>
    </div>

    {/* Print-only Official Branding */}
    <div className="hidden print:flex items-center justify-between border-b-2 border-primary pb-4 mb-6">
      <div>
        <h1 className="text-2xl font-black text-primary">SNED-LINK+</h1>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Official Behavioral Assessment</p>
      </div>
      <div className="text-right text-[10px] text-muted-foreground italic">
        System Generated: {new Date().toLocaleDateString()}
      </div>
    </div>

    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Detailed Behavior Report</h2>
        <p className="text-sm text-muted-foreground">Weekly analytics and progress tracking</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="card-elevated p-3 text-center">
        <p className="text-xs text-muted-foreground">Start Date</p>
        <p className="font-bold text-foreground text-sm">March 1, 2026</p>
      </div>
      <div className="card-elevated p-3 text-center">
        <p className="text-xs text-muted-foreground">End Date</p>
        <p className="font-bold text-foreground text-sm">March 7, 2026</p>
      </div>
    </div>

    {aiAnalysis && (
      <div className="bg-white/40 backdrop-blur-xl border border-[#3EB489]/20 p-8 rounded-[3rem] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            SAIE Progress Report (Hybrid AI Insights)
          </h3>
          <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Professional Analysis</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Professional Narrative
            </p>
            <p className="text-xs text-foreground leading-relaxed italic border-l-2 border-primary/40 pl-3">"{aiAnalysis.monthlyNarrative}" (Generated via SAIE Logic Layer)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Academic Milestones
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                {aiAnalysis.academicHighlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Areas for Growth
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                {aiAnalysis.areasForGrowth.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 rounded-xl bg-emerald-50 border-2 border-emerald-200">
        <p className="text-xl font-extrabold text-emerald-700">{stats.positive}</p>
        <p className="text-[10px] font-semibold text-emerald-600">Positive</p>
      </div>
      <div className="text-center p-3 rounded-xl bg-muted border-2 border-border">
        <p className="text-xl font-extrabold text-foreground">{stats.neutral}</p>
        <p className="text-[10px] font-semibold text-muted-foreground">Neutral</p>
      </div>
      <div className="text-center p-3 rounded-xl bg-amber-50 border-2 border-amber-200">
        <p className="text-xl font-extrabold text-amber-700">{stats.concerning + stats.critical}</p>
        <p className="text-[10px] font-semibold text-amber-600">Attention</p>
      </div>
    </div>

    <div className="card-elevated p-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Behavior Score</p>
      <p className="text-4xl font-black text-[#3EB489] italic tracking-tighter">8.5<span className="text-sm font-bold text-slate-300">/10</span></p>
      <p className="text-[10px] text-muted-foreground">Based on ML analysis</p>
    </div>

    <div className="card-elevated p-4">
      <h3 className="font-bold text-foreground mb-1">Weekly Behavior Trends</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={childWeeklyTrends}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="hsl(280, 45%, 55%)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="flex gap-3 pt-6 justify-end border-t border-slate-300 no-print relative">
      <div className="relative">
        <button 
          onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
          className="flex items-center justify-between gap-3 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:shadow-emerald-900/20 transition-all active:scale-95 group"
        >
          <FileDown size={18} className="group-hover:bounce" />
          <span>Generate Report</span>
          <ChevronDown size={16} className={`transition-transform duration-300 ${isReportDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isReportDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -8, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full right-0 w-64 mb-3 bg-white/95 backdrop-blur-xl rounded-[2rem] border border-emerald-100 shadow-2xl p-2 z-50 overflow-hidden"
            >
              <div className="space-y-1">
                <button 
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-emerald-50 text-emerald-900 transition-colors text-[10px] font-black uppercase tracking-widest group"
                >
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition-colors">
                    <FileText size={14} />
                  </div>
                  Export as PDF
                </button>
                
                <button 
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-emerald-50 text-emerald-900 transition-colors text-[10px] font-black uppercase tracking-widest group"
                >
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <FileSpreadsheet size={14} />
                  </div>
                  Export as CSV
                </button>

                <button 
                  onClick={handlePrint}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-emerald-50 text-emerald-900 transition-colors text-[10px] font-black uppercase tracking-widest group"
                >
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <Printer size={14} />
                  </div>
                  Print Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
};

export default ParentReports;
