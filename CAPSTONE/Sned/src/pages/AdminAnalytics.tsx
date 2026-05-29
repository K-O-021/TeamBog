import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import StatCard from '@/components/StatCard';
import AISimulationProgress from '@/components/AISimulationProgress';
import {
  Brain, TrendingUp, Sparkles, Activity, ShieldCheck, Zap, Info,
  Target, Loader2, Cpu, Network, Layers, Database,
  Terminal, Fingerprint, AlertTriangle, Timer, ArrowUpRight,
  Send, History, CheckCircle2, X, Clock, MessageSquare,
  GraduationCap
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import AdminHeader from '@/components/AdminHeader';
import { fetchRiskForecast, fetchAiRecommendations, getBehaviorStats } from '@/lib/behaviorUtils';
import { calculateStudentRiskPrediction, calculateStrategyEfficacy } from '@/lib/aiUtils';
import { toast } from 'sonner';

// Constants for AI Analysis Simulation
const ANALYSIS_STEPS_CONST = [
  "Initializing SAIE Neural Pathways (Admin Scope)...",
  "Ingesting Global Multi-Modal Data Layer...",
  "Behavioral Analyzer converts raw data...",
  "Pattern Detector finding cross-institutional trends...",
  "Anomaly Detector identifying significant changes...",
  "IEP Interpreter adjusting per student condition...",
  "Synthesizing Smart Intervention Recommendations (Admin Level)...",
];

const TECHNICAL_LOGS_CONST = [
  "DATA_INPUT: Aggregating all behavior, performance, and context...",
  "PROCESSING: Global Behavioral Analyzer scoring raw inputs for SAIE...",
  "PATTERN_ENGINE: Detecting frequency and severity trends across cohorts...",
  "ANOMALY_LOG: Deviation detected from IEP-based baseline...",
  "CONTEXT_ANALYSIS: Mapping time-based triggers and subjects...",
  "IEP_AWARENESS: Adjusting logic for Cerebral Palsy limitations...",
  "DECISION_LAYER: Core AI producing adaptive recommendations for all users..."
];

// OPTIMIZATION: Memoize expensive chart sections to prevent main-thread blocking
const RiskDistributionChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${value}%`}>
        {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
));
RiskDistributionChart.displayName = 'RiskDistributionChart';

interface RecommendationHistoryEntry {
  id: string;
  studentName: string;
  studentId: string;
  script: string;
  steps: string[];
  rationale: string;
  timestamp: string;
}

const HISTORY_STORAGE_KEY = 'sned_ai_admin_recommendation_history';

const AdminAnalytics = () => {
  const { user, students, behaviorLogs, progressNotes } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(true);

  // New AI Data States
  const [forecast, setForecast] = useState<any[]>([
    { day: 'Mon', riskScore: 45 }, { day: 'Tue', riskScore: 30 }, { day: 'Wed', riskScore: 60 },
    { day: 'Thu', riskScore: 25 }, { day: 'Fri', riskScore: 80 }, { day: 'Sat', riskScore: 50 }, { day: 'Sun', riskScore: 40 }
  ]);
  const [forecastAlert, setForecastAlert] = useState<string | null>("Our AI identifies markers of sensory fatigue in recent logs toward the weekend.");
  const [aiAssistant, setAiAssistant] = useState<{ steps: string[], script: string, rationale: string } | null>(null);

  // Initialize state from localStorage if available
  const [iepDraft, setIepDraft] = useState<string>('');
  const [userQuery, setUserQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [targetStudent, setTargetStudent] = useState<any | null>(null);

  const [selectedVolatilityStudentId, setSelectedVolatilityStudentId] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const allActiveStudents = useMemo(() => students.filter(s => s.status === 'active'), [students]);
  const allBehaviorLogs = useMemo(() => behaviorLogs, [behaviorLogs]);

  // Real-time Risk Distribution based on live learner population
  const liveRiskDistribution = useMemo(() => {
    const total = allActiveStudents.length || 1;
    const low = allActiveStudents.filter(s => s.riskLevel === 'Low').length;
    const mod = allActiveStudents.filter(s => s.riskLevel === 'Moderate').length;
    const high = allActiveStudents.filter(s => s.riskLevel === 'High').length;

    return [
      { name: 'Low Risk', value: Math.round((low / total) * 100), color: '#C49A3C' },
      { name: 'Moderate Risk', value: Math.round((mod / total) * 100), color: 'hsl(38, 80%, 55%)' },
      { name: 'High Risk', value: Math.round((high / total) * 100), color: '#7B1C2A' },
    ].map(item => ({ ...item, color: item.name === 'High Risk' ? 'hsl(var(--destructive))' : item.name === 'Moderate Risk' ? 'hsl(var(--accent))' : 'hsl(var(--primary) / 0.6)' }));
  }, [allActiveStudents]);

  // Real-time Weekly Trends based on institutional activity ledger
  const liveWeeklyTrends = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const counts: Record<string, number> = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0 };
    
    allBehaviorLogs.forEach(log => {
      try {
        const d = new Date(log.date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (counts.hasOwnProperty(dayName)) {
          counts[dayName]++;
        }
      } catch (e) {}
    });
    return days.map(day => ({ day, value: counts[day] }));
  }, [allBehaviorLogs]);

  // Student-Specific Dynamic Data
  const studentSentimentData = useMemo(() => {
    if (!targetStudent) return [];
    const logs = behaviorLogs.filter(l => l.studentId === targetStudent.id);
    const stats = getBehaviorStats(logs);
    return [
      { name: 'Positive', value: stats.positive, color: '#7B1C2A' },
      { name: 'Neutral', value: stats.neutral, color: 'hsl(280, 45%, 55%)' },
      { name: 'Attention', value: stats.concerning + stats.critical, color: 'hsl(0, 65%, 55%)' },
    ].filter(s => s.value > 0);
  }, [targetStudent, behaviorLogs]);

  const studentWeeklyData = useMemo(() => {
    if (!targetStudent) return [];
    // Simulation of daily incident frequency for the specific student
    const baseValues = [2, 1, 3, 1, 2];
    const modifier = targetStudent.riskLevel === 'High' ? 2 : 1;
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => ({
      day,
      value: Math.round(baseValues[i] * modifier + (Math.random() * 2))
    }));
  }, [targetStudent]);

  const studentTriggerData = useMemo(() => {
    const rawTriggers = [
      { name: 'Loud Noise', frequency: 12, impact: 85, fill: 'hsl(var(--primary))' },
      { name: 'Math Class', frequency: 8, impact: 60, fill: 'hsl(var(--accent))' },
      { name: 'Crowded Hallway', frequency: 15, impact: 90, fill: 'hsl(0, 65%, 55%)' },
      { name: 'Transitions', frequency: 10, impact: 70, fill: 'hsl(38, 80%, 55%)' },
    ];

    if (!targetStudent) return rawTriggers;

    // Adjust impact based on student diagnosis
    return rawTriggers.map(t => {
      let impact = t.impact;
      if (targetStudent.diagnosis?.includes('ASD') && (t.name.includes('Noise') || t.name.includes('Transitions'))) {
        impact = Math.min(100, impact + 10);
      }
      return { ...t, impact };
    });
  }, [targetStudent]);

  const strategyEfficacy = useMemo(() => {
    // For admin, calculate overall efficacy across all students
    return calculateStrategyEfficacy(null, [], behaviorLogs, students);
  }, [behaviorLogs, students]);

  const studentEfficacy = useMemo(() => {
    if (!targetStudent) return strategyEfficacy;
    const logs = behaviorLogs.filter(l => l.studentId === targetStudent.id);
    const positive = logs.filter(l => l.type === 'Positive').length;
    const overall = logs.length > 0 ? Math.round((positive / logs.length) * 100) : 0;
    return { ...strategyEfficacy, overall };
  }, [targetStudent, behaviorLogs, strategyEfficacy]);

  const studentRiskPredictions = useMemo(() => {
    return allActiveStudents
      .map(student => calculateStudentRiskPrediction(student, behaviorLogs))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 4);
  }, [allActiveStudents, behaviorLogs]);

  // OPTIMIZATION: Use a Map for O(N) lookup instead of nested O(N*M) filtering
  const volatilityData = useMemo(() => {
    const logsByStudent = new Map<string, any[]>();
    behaviorLogs.forEach(l => {
      if (!l.studentId) return;
      if (!logsByStudent.has(l.studentId)) logsByStudent.set(l.studentId, []);
      logsByStudent.get(l.studentId)?.push(l);
    });

    return allActiveStudents.map(student => {
      const studentLogs = (logsByStudent.get(student.id) || []).filter(l => l.anomalyScore !== undefined);
      if (studentLogs.length === 0) return { id: student.id, name: student.name.split(' ')[0], volatility: 0 };

      // Isolation Forest anomaly_scores < 0 indicate deviations from baseline.
      const anomalies = studentLogs.filter(l => (l.anomalyScore || 0) < 0).length;
      const index = Math.round((anomalies / studentLogs.length) * 100);
      return { id: student.id, name: student.name.split(' ')[0], volatility: index };
    }).sort((a, b) => b.volatility - a.volatility).slice(0, 5);
  }, [allActiveStudents, behaviorLogs, students]);

  const filteredTriggerLogs = useMemo(() => {
    if (!selectedTrigger) return [];
    const triggerLower = selectedTrigger.toLowerCase();
    return allBehaviorLogs.filter(log =>
      log.description.toLowerCase().includes(triggerLower) || log.location.toLowerCase().includes(triggerLower)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allBehaviorLogs, selectedTrigger]);

  const anomalousLogs = useMemo(() => {
    if (!selectedVolatilityStudentId) return [];
    return behaviorLogs.filter(l =>
      l.studentId === selectedVolatilityStudentId &&
      l.anomalyScore !== undefined &&
      l.anomalyScore < 0
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [behaviorLogs, selectedVolatilityStudentId]);

  const diagnosticsData = useMemo(() => {
    return allActiveStudents.map(student => {
      const studentLogs = behaviorLogs.filter(l => l.studentId === student.id && l.confidence !== undefined);
      const avgConfidence = studentLogs.length > 0
        ? studentLogs.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / studentLogs.length
        : 0.94; // Baseline system confidence for new sessions
      return {
        name: student.name,
        confidence: Math.round(avgConfidence * 100)
      };
    });
  }, [allActiveStudents, behaviorLogs]);

  const handleRunAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setShowHistory(false);
    try {
      // Determine context: Individual Student or Global Aggregate
      // If targetStudent is null, we remain in Aggregate mode
      let worker: Worker | null = null;

      if (targetStudent) {
        const student = targetStudent;
  
        // Prepare Behavioral Dataset for SharedArrayBuffer simulation
        const relevantLogs = behaviorLogs.filter(l => l.studentId === student.id);
        const dataSize = relevantLogs.length;
        const sab = new SharedArrayBuffer(dataSize * 8);
        const sharedScores = new Float64Array(sab);
        relevantLogs.forEach((log, index) => { sharedScores[index] = log.anomalyScore || 0; });
  
        // Initialize Web Worker for Background Processing
        worker = new Worker(new URL('../lib/saie-worker.ts', import.meta.url), { type: 'module' });
  
        worker.postMessage({
          type: 'EXECUTE_ANALYSIS',
          payload: { student, sab, dataSize }
        });
  
        worker.onmessage = (e) => {
          const { type, result } = e.data;
          if (type === 'ANALYSIS_COMPLETE') {
            setForecast(result.forecast);
            setForecastAlert(result.recommendation.rationale);
            setAiAssistant({
              steps: [result.recommendation.strategy],
              script: result.recommendation.strategy,
              rationale: result.recommendation.rationale
            });
            setAnalysisComplete(true);
            setIsAnalyzing(false);
            toast.success(`Neural Synthesis Complete for Node: ${student.name}`);
            worker?.terminate();
          }
        };
  
        worker.onerror = (err) => {
          console.error("SAIE Worker Error:", err);
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          toast.error("SAIE Engine Error", { description: "Neural processing link failed." });
          worker?.terminate();
        };
      } else {
        // Global Aggregate Logic: Simulate class-wide telemetry processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        setForecastAlert("Global neural baseline established. High correlation between sensory overload and afternoon sessions detected institution-wide.");
        setAnalysisComplete(true);
        setIsAnalyzing(false);
        toast.success("Global Institutional Intelligence Synchronized");
      }
  
    } catch (error) {
      console.error("[INFRA_ERROR]:", error);
      toast.error("SAIE Engine Offline", { description: "Neural processing link timed out. Verify backend node status." });
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  }, [students, targetStudent, allActiveStudents, behaviorLogs]); 
  // Simplified dependencies to prevent excessive re-runs from stable state setters

  const handleSelectStudent = (studentId: string) => {
    if (!studentId) {
      setTargetStudent(null);
      setSelectedVolatilityStudentId(null);
      return;
    }
    const student = students.find(s => s.id === studentId);
    if (student) setTargetStudent(student);
  };

  // This function is for the "Ask SAIE Brain" input, which remains manual.
  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || !targetStudent) {
      if (!targetStudent) toast.error("Please select a student to query.");
      return;
    }

    setIsQuerying(true);

    // Simulate the AI synthesizing a response based on the query and student context
    setTimeout(() => {
      const childFirstName = targetStudent.name.split(' ')[0];
      const simulatedResponse = {
        steps: [
          "Acknowledge the behavior without judgment.",
          "Pivot to a tactile 'Heavy Work' transition task.",
          "Implement the specific de-escalation script provided below."
        ],
        script: `Hey ${childFirstName}, I can see you're thinking about "${userQuery}". Let's take a deep breath together and then we can look at the visual schedule.`,
        rationale: `Custom insight generated for admin query: "${userQuery}".`
      };

      setAiAssistant(simulatedResponse);
      setIsQuerying(false);
      setUserQuery('');
      toast.success("Neural Insight Received", {
        description: "The AI Assistant panel has been updated with a tailored response."
      });
    }, 1500);
  };

  const suggestedQueries = useMemo(() => {
    if (!targetStudent) return ["Analyze class-wide behavioral momentum", "Top effective strategies today"];

    const name = targetStudent.name.split(' ')[0];
    const studentLogs = behaviorLogs.filter(l => l.studentId === targetStudent.id && l.anomalyScore !== undefined);
    let score = 0;

    if (studentLogs.length > 0) {
      const anomalies = studentLogs.filter(l => (l.anomalyScore || 0) < 0).length;
      score = Math.round((anomalies / studentLogs.length) * 100);
    }

    // Conditional suggestions based on Volatility Score thresholds
    if (score > 60) {
      return [
        `Identify root triggers for ${name}'s volatility`,
        `Generate high-stress de-escalation for ${name}`,
        `Analyze ${name}'s sensory fatigue markers`
      ];
    } else if (score > 30) {
      return [
        `Is ${name} showing stabilization markers?`,
        `Early warning indicators for ${name}`,
        `Adjust transition strategies for ${name}`
      ];
    } else {
      return [
        `Reinforce ${name}'s current positive streak`,
        `Draft a "Win of the Day" for ${name}'s parent`,
        `Analyze ${name}'s path to independence`
      ];
    }
  }, [targetStudent, behaviorLogs]);

  const getRootCauseInsight = (triggerName: string, diagnosis?: string) => {
    if (!diagnosis) return "Environmental stressor impacting behavioral baseline.";

    const d = diagnosis.toLowerCase();
    const t = triggerName.toLowerCase();

    if (d.includes('autism') || d.includes('asd')) {
      if (t.includes('noise')) return "Clinical Insight: Auditory hypersensitivity leading to sensory overload and dysregulation.";
      if (t.includes('transition')) return "Clinical Insight: Difficulty with set-shifting and unexpected changes in routine, causing anxiety and behavioral rigidity.";
      if (t.includes('hallway') || t.includes('crowded')) return "Clinical Insight: Proprioceptive and spatial processing challenges, leading to overwhelm in unpredictable, high-density environments.";
    }

    if (d.includes('adhd')) {
      if (t.includes('math') || t.includes('class') || t.includes('task')) return "Clinical Insight: Executive function fatigue and difficulty sustaining attention on cognitively demanding or prolonged tasks.";
      if (t.includes('transition')) return "Clinical Insight: Impulsivity and challenges with self-regulation during unstructured or low-stimulus intervals.";
    }

    if (d.includes('intellectual disability') || d.includes('id')) {
      if (t.includes('math') || t.includes('class') || t.includes('task')) return "Clinical Insight: Cognitive load exceeding processing capacity, leading to frustration and task avoidance.";
      if (t.includes('transition')) return "Clinical Insight: Difficulty understanding abstract concepts of change and adapting to new routines without explicit instruction.";
    }

    if (d.includes('cerebral palsy') || d.includes('cp')) {
      if (t.includes('motor') || t.includes('writing')) return "Clinical Insight: Physical exertion and fatigue from motor planning challenges, impacting task completion and emotional regulation.";
      if (t.includes('hallway') || t.includes('movement')) return "Clinical Insight: Challenges with spatial awareness and navigating physical barriers, leading to anxiety or perceived threat.";
    }

    return `Clinical Insight: Environmental factors related to '${triggerName}' correlate with observed behavioral patterns for ${diagnosis}.`;
  };

  const CustomTriggerTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isSelected = selectedTrigger === data.name;
      const rootCause = getRootCauseInsight(data.name, targetStudent?.diagnosis);

      return (
        <div className={`p-4 rounded-xl shadow-2xl border-2 transition-all max-w-[260px] ${isSelected ? 'bg-accent border-primary ring-4 ring-primary/20' : 'bg-card border-border'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            <p className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-foreground'}`}>
              {data.name}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-8">
              <span className="text-[10px] text-muted-foreground uppercase font-bold whitespace-nowrap">Frequency</span>
              <span className="text-[10px] font-black text-foreground">{data.frequency} instances</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-[10px] text-muted-foreground uppercase font-bold whitespace-nowrap">Stress Impact</span>
              <span className="text-[10px] font-black text-foreground">{data.impact}%</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
              <Fingerprint className="w-2.5 h-2.5 text-primary" /> Root Cause Insight
            </p>
            <p className="text-[10px] text-foreground font-medium italic leading-relaxed">
              {targetStudent ? (
                <span>{rootCause}</span>
              ) : (
                <span className="opacity-50 italic text-[9px]">Select a student to map clinical root causes.</span>
              )}
            </p>
          </div>

          {isSelected && targetStudent && (
            <div className="mt-3 pt-2 border-t border-primary/10">
              <p className="text-[9px] font-black text-primary uppercase animate-pulse flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Neural Filter applied to {targetStudent.name.split(' ')[0]}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderAnalyticsContent = () => (
    <>
      <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto flex gap-8 p-6 pt-8 flex-col">

        {/* Refined Dashboard Header */}
        <AdminHeader
          icon={Brain}
          title="Neural"
          highlightedTitle="Intelligence"
          subtitle={`${allBehaviorLogs.length} Institutional Tensors Processed`}
        />

        <div className="flex gap-6">

        {/* RIGHT (Main Analytics Core) */}
        <div className="flex-1 space-y-6">

      <div key={`stats-${targetStudent?.id || 'aggregate'}`} className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
        <StatCard label="Global Reliability" value="96.4%" variant="success" />
        <StatCard label="Total Log Density" value={allBehaviorLogs.length} variant="primary" />
        <StatCard
          label="Strategy Efficacy"
          value={`${targetStudent ? studentEfficacy.overall : strategyEfficacy.overall}%`}
          variant="default"
        />
        <StatCard label="SAIE Confidence" value="0.94" variant="primary" />
      </div>

      <div
        key={`main-grid-${targetStudent?.id || 'aggregate'}`}
        className="grid md:grid-cols-12 gap-6 animate-fade-in">
        {/* Moved Admin Risk Distribution Pie Chart */}
        <div className="md:col-span-6 bg-card border rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-tight">
            <Activity className="w-5 h-5 text-primary" /> SAIE Risk Classification
          </h3>
          <RiskDistributionChart data={liveRiskDistribution} />
          <div className="flex justify-center gap-6 mt-4">
            {liveRiskDistribution.map(r => (
              <div key={r.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{r.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Moved Admin Weekly Behavior Trends Bar Chart */}
        <div className="md:col-span-6 bg-card border rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-tight">
            <TrendingUp className="w-5 h-5 text-primary" /> Weekly Behavior Trends
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={liveWeeklyTrends}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 700 }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-800 mt-4 italic text-center font-bold">Aggregated behavioral incident frequency across the institution.</p>
        </div>

        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-700">
            {/* Behavioral Trigger Analysis & Intervention Tracker */}
            <div
              key={`triggers-${targetStudent?.id || 'aggregate'}`}
              className="md:col-span-8 p-8 bg-card border rounded-xl shadow-sm animate-fade-in"
            >
              <div className="flex items-center gap-2 mb-6">
                <Layers className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <h3 className="font-bold text-foreground uppercase tracking-tight">Behavioral Trigger Analysis</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Interactive Stress Factor Mapping</p>
                </div>
                {selectedTrigger && (
                  <button
                    onClick={() => setSelectedTrigger(null)}
                    className="text-[10px] font-black text-primary hover:underline uppercase flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear Filter
                  </button>
                )}
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis type="category" dataKey="name" name="Trigger" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis type="number" dataKey="impact" name="Stress Impact" unit="%" tick={{ fontSize: 10 }} />
                    <ZAxis type="number" dataKey="frequency" range={[100, 1000]} name="Frequency" />
                    <Tooltip content={<CustomTriggerTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter
                      name="Triggers"
                      data={studentTriggerData}
                      fill="hsl(var(--primary))"
                      onClick={(data) => {
                        setSelectedTrigger(data.name);
                        toast.info(`Filtering logs for trigger: ${data.name}`);
                      }}
                      animationDuration={500}
                      className="cursor-pointer"
                    >
                      {studentTriggerData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={selectedTrigger === entry.name ? 'hsl(var(--accent))' : entry.fill}
                          className={selectedTrigger === entry.name ? 'animate-pulse' : ''}
                          stroke={selectedTrigger === entry.name ? 'hsl(var(--primary))' : 'none'}
                          strokeWidth={2}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {selectedTrigger && (
                <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-border/50 pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Logs related to "{selectedTrigger}"</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredTriggerLogs.length > 0 ? filteredTriggerLogs.map(log => (
                      <div key={log.id} className="p-3 bg-muted/20 rounded-xl border border-border/50 group hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[10px] font-black text-foreground uppercase">{log.studentName}</p>
                          <span className="text-[9px] text-muted-foreground">{log.date}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic line-clamp-2 leading-relaxed">"{log.description}"</p>
                      </div>
                    )) : (
                      <p className="text-[10px] text-muted-foreground italic col-span-2 text-center py-4">No specific logs found containing "{selectedTrigger}".</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-4 p-8 bg-card border rounded-xl shadow-sm">
              <h3 className="font-bold text-foreground mb-4 uppercase tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Intervention Success
              </h3>
              <div className="space-y-3">
                {strategyEfficacy.recent.map((strategy, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-border/50">
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-foreground truncate">{strategy?.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{strategy?.id}</p>
                    </div>
                    <span className={`text-[10px] font-black ${strategy?.color} whitespace-nowrap`}>★ {strategy?.rating === 'High' ? '80%' : '65%'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 p-8 bg-card border rounded-xl shadow-sm relative overflow-hidden animate-in zoom-in-95 duration-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary animate-pulse" />
                  <h3 className="font-bold text-foreground uppercase tracking-tight">Predictive Student Forecast</h3>
                </div>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Active Monitoring</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studentRiskPredictions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s.id)}
                    className={`p-4 bg-background/60 rounded-2xl border flex items-center justify-between group transition-all text-left ${targetStudent?.id === s.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-primary font-black text-xs flex items-center justify-center border-2 border-slate-200">
                        {s.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{s.name}</p>
                        <p className="text-xs text-slate-600 uppercase font-black tracking-widest">{s.probability}% Forecasted Risk</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-[10px] text-muted-foreground italic">
                <Info className="w-4 h-4" />
                SAIE identified markers of sensory fatigue in recent afternoon logs.
              </div>
            </div>

            {/* Volatility Index Tracker */}
              <div className="md:col-span-4 p-8 bg-card border rounded-xl shadow-sm h-fit">
              <div className="flex items-center gap-2 mb-6">
                <Fingerprint className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground uppercase tracking-tight">Behavioral Volatility</h3>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volatilityData} layout="vertical">
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} width={60} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />

                    <Bar
                      dataKey="volatility"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      barSize={12}
                      onClick={(data) => {
                        setSelectedVolatilityStudentId(data.id);
                        handleSelectStudent(data.id);
                      }}
                      animationDuration={1000}
                      className="cursor-pointer"
                    >
                      {volatilityData.map((entry, index) => (
                        <Cell key={index} fill={entry.volatility > 50 ? 'hsl(0, 65%, 55%)' : 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[9px] text-muted-foreground mt-4 italic">High index indicates frequent deviations from established behavioral baselines. <span className="text-primary font-bold">Click a bar to inspect.</span></p>

              {selectedVolatilityStudentId && (
                <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Anomalous Clusters</p>
                    <button onClick={() => setSelectedVolatilityStudentId(null)}>
                      <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {anomalousLogs.length > 0 ? anomalousLogs.map(log => (
                      <div key={log.id} className="p-2.5 bg-background/50 rounded-xl border border-border text-[10px] group hover:border-primary/30 transition-colors">
                        <div className="flex justify-between mb-1">
                          <span className="font-black text-foreground uppercase tracking-tighter">{log.date}</span>
                          <span className="text-destructive font-bold">Δ {log.anomalyScore?.toFixed(2)}</span>
                        </div>
                        <p className="text-muted-foreground italic leading-tight">"{log.description}"</p>
                      </div>
                    )) : (
                      <p className="text-[10px] text-muted-foreground italic text-center py-4">No specific anomalies detected for this student.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* pillar 3: Predictive Analytics (The Forecaster - Time of Day Heatmap) */}
            <div className="md:col-span-12 p-8 bg-card border rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-foreground uppercase tracking-tighter">Temporal Trend Forecasting</h3>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Predictive Insights</p>
              </div>
              <div className="h-24 w-full flex items-end justify-between gap-4 px-4">
                {forecast.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-3 group">
                    <div key={d.day} className="relative w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div
                        className={`w-full rounded-2xl transition-all duration-700 ${d.riskScore > 70 ? 'bg-destructive/80 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-primary/40'}`}
                        style={{ height: `${d.riskScore}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  <strong className="text-primary font-black uppercase tracking-widest mr-2">AI Summary:</strong>
                  {forecastAlert || "Analyzing historical stressors..."}
                </p>
              </div> {/* AI Summary closure */}
            </div> {/* Temporal Trend closure */}

            {/* System Diagnostics Modal */}
            {showDiagnostics && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border rounded-2xl w-full max-w-xl p-8 relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="mt-1">
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Neural Path Integrity</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Inference Confidence Breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              {diagnosticsData.map((data, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground">{data.name}</span>
                    <span className="text-[10px] font-black text-primary font-mono">{data.confidence}% Confidence</span>
                  </div>
                  <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden border border-primary/10">
                    <div
                      className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${data.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Global Precision</p>
                <p className="text-2xl font-black text-foreground">0.962</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Latent Drift</p>
                <p className="text-2xl font-black text-emerald-500">Minimal</p>
              </div>
            </div>

            <p className="mt-8 text-[9px] text-muted-foreground italic text-center leading-relaxed">
              "Integrity scores represent the AI's certainty when mapping specific behavioral clusters to intervention tensors."
            </p>
          </div>
        </div>
            )}

            {/* AISimulationProgress Modal */}
            {isAnalyzing && (
        <AISimulationProgress
          isVisible={isAnalyzing}
          onComplete={() => setIsAnalyzing(false)}
          analysisSteps={ANALYSIS_STEPS_CONST}
          technicalLogs={TECHNICAL_LOGS_CONST}
        />
            )}
            </div> {/* close inner grid (md:col-span-12) */}
          </div> {/* close outer grid (grid md:grid-cols-12) */}
          </div> {/* flex-1 space-y-6 */}
        </div> {/* flex gap-6 */}
      </div> {/* max-w-7xl */}
      </div> {/* min-h-screen */}
    </>
  );

  return renderAnalyticsContent();
};

export default AdminAnalytics;