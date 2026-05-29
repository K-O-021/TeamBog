import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

// ── Design Tokens ─────────────────────────────────────────────────────────
const M = {
  maroon: "#7B1C2A", maroonDark: "#5A1220", maroonDeep: "#3D0C18",
  maroonMid: "#9B2335", gold: "#C49A3C", cream: "#FBF7F2", white: "#FFFFFF",
  g100: "#F0EAEA", g200: "#D9CECE", g400: "#A89090", g500: "#7A6060",
  g600: "#5A4040", g700: "#3A2828", g800: "#1E1010",
  red: "#C0392B", amber: "#B8860B", sky: "#1A6B8A", purple: "#6C3483",
  green: "#1A7A4A",
};
const TNR = `'Georgia','Times New Roman',serif`;

// ── Icons ─────────────────────────────────────────────────────────────────
type IName = 'home' | 'users' | 'bell' | 'plus' | 'search' | 'check' | 'alert' | 'chart' | 'brain' | 'shield' | 'file' | 'logout' | 'arrow' | 'clock' | 'star' | 'target' | 'eye' | 'send' | 'activity' | 'download' | 'x' | 'menu' | 'info' | 'grid' | 'save' | 'zap' | 'sparkle' | 'layers' | 'trending' | 'printer' | 'mail' | 'refresh' | 'checkCircle' | 'xCircle' | 'chevronDown' | 'chevronUp' | 'smile' | 'thumbsUp' | 'chevronLeft';
const Icon: React.FC<{ name: IName; size?: number; color?: string }> = ({ name, size = 16, color = "currentColor" }) => {
  const p = { width: size, height: size, display: "inline-block" as const, verticalAlign: "middle" as const, flexShrink: 0 as const };
  const ic: Record<IName, React.ReactNode> = {
    home: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z" /><path d="M9 21V12h6v9" /></svg>,
    users: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" /><path d="M19 8a3 3 0 110 6M22 21v-2a3 3 0 00-2-2.83" /></svg>,
    bell: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
    plus: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    search: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>,
    check: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    alert: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    chart: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" /><rect x="10" y="7" width="4" height="14" /><rect x="17" y="3" width="4" height="18" /></svg>,
    brain: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5a2.5 2.5 0 00-4.96-.46 2.5 2.5 0 00-1.98 3 2.5 2.5 0 00-1.32 4.24 3 3 0 00.34 5.58 2.5 2.5 0 002.96 3.08A2.5 2.5 0 0012 21.5" /><path d="M12 4.5a2.5 2.5 0 014.96-.46 2.5 2.5 0 011.98 3 2.5 2.5 0 011.32 4.24 3 3 0 01-.34 5.58 2.5 2.5 0 01-2.96 3.08A2.5 2.5 0 0112 21.5" /><path d="M15 5a3 3 0 010 6M9 5a3 3 0 000 6M12 12v9" /></svg>,
    shield: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>,
    file: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    logout: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    arrow: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
    clock: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    star: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    target: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    eye: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    send: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
    activity: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    download: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    x: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    menu: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
    info: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
    grid: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>,
    save: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    zap: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    sparkle: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="M5 3l.75 2.5L8 6.5 5.75 7.25 5 9.75l-.75-2.5L2 6.5l2.25-.75z" /></svg>,
    layers: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    trending: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    printer: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><path d="M6 14h12v8H6z" /></svg>,
    mail: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    refresh: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>,
    checkCircle: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    xCircle: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    chevronDown: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
    chevronUp: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>,
    chevronLeft: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
    smile: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
    thumbsUp: <svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" /><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>,
  };
  return <>{ic[name] || null}</>;
};

// ── Behavior Data ──────────────────────────────────────────────────────────
interface BehaviorCategory { label: string; desc: string; type: 'positive' | 'negative'; }
const BEHAVIOR_CATEGORIES: BehaviorCategory[] = [
  { label: "Self-Regulation", desc: "Manage emotions and behavior.", type: "positive" },
  { label: "Sensory Management", desc: "Handling sensory inputs effectively.", type: "positive" },
  { label: "Safe Behavior", desc: "Protecting oneself and others.", type: "positive" },
  { label: "Social Engagement", desc: "Positive social participation.", type: "positive" },
  { label: "Flexible Thinking", desc: "Changing perspectives.", type: "positive" },
  { label: "Functional Communication", desc: "Using language effectively.", type: "positive" },
  { label: "Smooth Transitions", desc: "Moving between activities.", type: "positive" },
  { label: "Sustained Attention", desc: "Staying focused on tasks.", type: "positive" },
  { label: "Task Completion", desc: "Finishing assigned activities.", type: "positive" },
  { label: "Emotional Regulation", desc: "Managing feelings appropriately.", type: "positive" },
  { label: "Task Independence", desc: "Completing activities independently.", type: "positive" },
  { label: "Good Decision-Making", desc: "Choosing safe and helpful actions.", type: "positive" },
  { label: "Clear Communication", desc: "Expressing ideas clearly.", type: "positive" },
  { label: "Stimming", desc: "Repetitive self-stimulation movements.", type: "negative" },
  { label: "Sensory Overload", desc: "Overwhelmed by environment.", type: "negative" },
  { label: "Self-Harm", desc: "Intentional physical injury.", type: "negative" },
  { label: "Social Difficulty", desc: "Challenges in social interaction.", type: "negative" },
  { label: "Echolalia", desc: "Repeating others' words.", type: "negative" },
  { label: "Inattention", desc: "Difficulty staying focused.", type: "negative" },
  { label: "Hyperactivity", desc: "Excessive physical movement.", type: "negative" },
  { label: "Impulsivity", desc: "Acting without thinking.", type: "negative" },
  { label: "Emotional Outbursts", desc: "Sudden intense reactions.", type: "negative" },
  { label: "Aggression", desc: "Hostile actions toward others.", type: "negative" },
  { label: "Wandering", desc: "Leaving safe area without permission.", type: "negative" },
  { label: "Forgetfulness", desc: "Forgetting steps in routines.", type: "negative" },
  { label: "Destructive Behavior", desc: "Intentionally damaging property.", type: "negative" },
];
const POSITIVE_CATS = BEHAVIOR_CATEGORIES.filter(c => c.type === "positive");
const NEGATIVE_CATS = BEHAVIOR_CATEGORIES.filter(c => c.type === "negative");

interface Student { 
  id: string | number; 
  name: string; 
  grade: string; 
  initials: string; 
  riskLevel: string; 
  section?: string;
  status?: string;
  teacher?: string;
}

interface ReportType { id: string; icon: IName; title: string; desc: string; color: string; tags: string[]; }
const REPORT_TYPES: ReportType[] = [
  { id: "behavioral_progress", icon: "chart", title: "Behavioral Progress Report", desc: "Behavior summary, mood patterns, incident trends.", color: M.maroon, tags: ["Primary"] },
  { id: "intervention_recommendation", icon: "target", title: "Intervention Recommendation", desc: "AI-detected concerns with suggested interventions.", color: M.sky, tags: ["AI-Generated"] },
  { id: "risk_classification", icon: "shield", title: "Risk Classification Report", desc: "Risk level, classification basis, and XAI explanation.", color: M.amber, tags: ["XAI"] },
  { id: "anomaly_detection", icon: "eye", title: "Anomaly Detection Report", desc: "Unusual behavior changes and identified triggers.", color: M.purple, tags: ["Anomaly"] },
  { id: "predictive_alert", icon: "zap", title: "Predictive Alert Report", desc: "Predicted behavioral concerns and preventive actions.", color: M.red, tags: ["Early Warning"] },
  { id: "parent_teacher", icon: "send", title: "Parent-Teacher Communication", desc: "Teacher updates and meeting summaries.", color: M.maroon, tags: ["Collaboration"] },
  { id: "behavioral_summary", icon: "layers", title: "Student Behavioral Summary", desc: "Overall behavioral status and improvement indicators.", color: M.maroonDark, tags: ["Admin"] },
  { id: "competency_analytics", icon: "trending", title: "Competency Analytics Report", desc: "Social, emotional, and adaptive behavior analytics.", color: M.g700, tags: ["Analytics"] },
];

const STEPS = [{ num: 1, label: "Student" }, { num: 2, label: "Log" }, { num: 3, label: "Save" }, { num: 4, label: "AI" }, { num: 5, label: "Risk" }, { num: 6, label: "Alerts" }, { num: 7, label: "Analytics" }, { num: 8, label: "Reports" }];

// ── Report Builder ─────────────────────────────────────────────────────────
export interface LogState { obs: string; category: string; mood: string; participation: number; incident: string; interventions: Record<string, boolean>; remarks: string; }
interface ReportData { student: Student; obs: string; category: string; mood: string; participation: number; incident: string; interventions: Record<string, boolean>; remarks: string; }

function buildReportHTML(report: ReportType, data: ReportData): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  const iList = Object.entries(data.interventions).filter(([, v]) => v).map(([k]) => k);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${report.title}</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Georgia',serif;padding:20px;color:#1E1010;background:#fff;}h1{font-size:18px;color:#3D0C18;font-style:italic;}h3{color:#7B1C2A;font-size:14px;margin:14px 0 8px;}table{width:100%;border-collapse:collapse;font-size:12px;}td{padding:8px;border-bottom:1px solid #f0e8ea;}ul{padding-left:18px;font-size:12px;line-height:2;}@media print{body{padding:10px;}}</style>
</head><body>
<div style="border-bottom:2px solid #7B1C2A;padding-bottom:12px;margin-bottom:16px;">
<div style="font-size:9px;color:#C49A3C;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">SNED-LINK+ · Special Needs Education</div>
<h1>${report.title}</h1>
<div style="font-size:11px;color:#7A6060;margin-top:3px;">${dateStr} at ${timeStr}</div>
<div style="margin-top:8px;"><strong>${data.student.name}</strong> · Section ${data.student.section}</div>
</div>
<h3>Behavioral Overview</h3>
<table><tr><td><b>Category</b></td><td>${data.category}</td></tr><tr><td><b>Mood</b></td><td>${data.mood}</td></tr><tr><td><b>Participation</b></td><td>${data.participation}/5</td></tr><tr><td><b>Incident</b></td><td>${data.incident}</td></tr><tr><td><b>Observation</b></td><td>${data.obs || "No observation recorded."}</td></tr></table>
<h3>Interventions Applied</h3>
<ul>${iList.length ? iList.map(i => `<li>${i}</li>`).join("") : "<li>None applied.</li>"}</ul>
${data.remarks ? `<h3>Remarks</h3><p style="font-size:12px;line-height:1.7;">${data.remarks}</p>` : ""}
<div style="border-top:1px solid #e8d8da;margin-top:20px;padding-top:12px;font-size:10px;color:#7A6060;">
<div>Prepared by: Mrs. Santos · Mathematics · Grade 7</div>
<div style="margin-top:4px;">SNED-LINK+ · Confidential — For School Use Only</div>
<div style="margin-top:8px;"><button onclick="window.print()" style="background:#7B1C2A;color:#fff;border:none;border-radius:6px;padding:8px 16px;font-size:12px;cursor:pointer;">🖨️ Print / Save as PDF</button></div>
</div>
</body></html>`;
}

// ── Shared Primitives ──────────────────────────────────────────────────────
const riskColor: Record<string, string> = { low: M.green, moderate: M.amber, critical: M.red };

const Av: React.FC<{ initials: string; size?: number }> = ({ initials, size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, fontWeight: 800, fontSize: size * 0.33, fontFamily: TNR, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 3px 10px ${M.maroon}50`, letterSpacing: 0.5 }}>{initials}</div>
);

const Tag: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = M.maroon }) => (
  <span style={{ background: color + "18", color, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, fontFamily: TNR, letterSpacing: 0.8, border: `1px solid ${color}30`, textTransform: "uppercase" as const }}>{children}</span>
);

const PBar: React.FC<{ val: number; max?: number; color?: string; h?: number }> = ({ val, max = 100, color = M.maroon, h = 5 }) => (
  <div style={{ height: h, borderRadius: h, background: "rgba(0,0,0,0.07)", overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${(val / max) * 100}%`, background: `linear-gradient(90deg,${color}cc,${color})`, borderRadius: h, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
  </div>
);

const MCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style = {} }) => (
  <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.55)", borderRadius: 14, boxShadow: "0 4px 18px rgba(61,12,24,0.08)", padding: 14, ...style }}>{children}</div>
);

const inputSt: React.CSSProperties = { width: "100%", padding: "11px 13px", border: "1.5px solid rgba(0,0,0,0.11)", borderRadius: 10, fontSize: 14, fontFamily: TNR, outline: "none", boxSizing: "border-box" as const, color: M.g800, fontWeight: 600, background: "rgba(255,255,255,0.8)", WebkitAppearance: "none" };

// ── Mobile Header ──────────────────────────────────────────────────────────
const MobileHeader: React.FC<{ title: string; subtitle?: string; showBack?: boolean; onBack?: () => void; onMenu?: () => void }> = ({ title, subtitle, showBack, onBack, onMenu }) => (
  <header style={{ background: `linear-gradient(135deg,${M.maroonDeep},${M.maroon})`, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: `0 3px 16px ${M.maroonDeep}55`, position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
      {showBack ? (
        <button onClick={onBack} style={{ width: 34, height: 34, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="chevronLeft" size={18} color={M.white} />
        </button>
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="sparkle" size={15} color={M.gold} />
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: M.white, fontFamily: TNR, fontStyle: "italic", letterSpacing: 0.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: TNR, fontWeight: 600 }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
      <div style={{ position: "relative" }}>
        <button style={{ width: 34, height: 34, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="bell" size={15} color="rgba(255,255,255,0.8)" />
        </button>
        <span style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, background: `linear-gradient(135deg,${M.gold},#9B7520)`, borderRadius: "50%", fontSize: 8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", color: M.white, border: "1.5px solid rgba(255,255,255,0.9)" }}>3</span>
      </div>
      <button onClick={onMenu} style={{ width: 34, height: 34, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="menu" size={15} color="rgba(255,255,255,0.8)" />
      </button>
    </div>
  </header>
);

// ── Mobile Step Bar ────────────────────────────────────────────────────────
const MobileStepBar: React.FC<{ current: number }> = ({ current }) => (
  <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(123,28,42,0.08)", padding: "8px 16px", display: "flex", alignItems: "center", overflowX: "auto", gap: 0, flexShrink: 0 }}>
    {STEPS.map((s, i) => (
      <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.num <= current ? `linear-gradient(135deg,${M.maroon},${M.maroonDeep})` : "rgba(0,0,0,0.07)", color: s.num <= current ? M.white : M.g500, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 9, fontFamily: TNR, flexShrink: 0 }}>
            {s.num < current ? <Icon name="check" size={10} color={M.white} /> : s.num}
          </div>
          <div style={{ fontSize: 7.5, fontWeight: s.num === current ? 800 : 600, color: s.num === current ? M.maroon : M.g500, whiteSpace: "nowrap", textTransform: "uppercase" as const, letterSpacing: 0.5, fontFamily: TNR }}>{s.label}</div>
        </div>
        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1.5, marginBottom: 12, background: s.num < current ? M.maroon : "rgba(0,0,0,0.08)", borderRadius: 1 }} />}
      </div>
    ))}
  </div>
);

// ── Mobile Bottom Nav ──────────────────────────────────────────────────────
const BottomNav: React.FC<{ active: string; onNavigate: (v: string) => void }> = ({ active, onNavigate }) => {
  const items = [
    { id: "dashboard", icon: "home" as IName, label: "Home" },
    { id: "students", icon: "users" as IName, label: "Students" },
  ];
  return (
    <nav style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNavigate(item.id)} style={{ flex: 1, background: "none", border: "none", padding: "10px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: active === item.id ? `${M.maroon}14` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            <Icon name={item.icon} size={18} color={active === item.id ? M.maroon : M.g500} />
          </div>
          <span style={{ fontSize: 9.5, fontWeight: active === item.id ? 800 : 600, color: active === item.id ? M.maroon : M.g500, fontFamily: TNR, letterSpacing: 0.3 }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

// ── Drawer Menu ────────────────────────────────────────────────────────────
const DrawerMenu: React.FC<{ open: boolean; onClose: () => void; onLogout: () => void }> = ({ open, onClose, onLogout }) => {
  const { user } = useApp();
  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, backdropFilter: "blur(2px)" }} />}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "72vw", maxWidth: 280, background: M.white, zIndex: 201, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)", boxShadow: open ? "-8px 0 32px rgba(0,0,0,0.2)" : "none", display: "flex", flexDirection: "column" }}>
        <div style={{ background: `linear-gradient(135deg,${M.maroonDeep},${M.maroon})`, padding: "48px 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Av initials={user?.name ? user.name.split(' ').map((n:any)=>n[0]).join('').slice(0,2) : 'T'} size={44} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, color: M.white, fontFamily: TNR }}>{user?.name}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", fontFamily: TNR }}>{user?.subject || 'Faculty'} · {user?.teacherId || 'Node'}</div>
            </div>
          </div>
        </div>
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
        {[
          { icon: "home" as IName, label: "Dashboard" },
          { icon: "users" as IName, label: "My Students" },
          { icon: "file" as IName, label: "Activity Logs" },
          { icon: "brain" as IName, label: "AI Analysis" },
          { icon: "shield" as IName, label: "Risk Reports" },
          { icon: "chart" as IName, label: "Analytics" },
          { icon: "bell" as IName, label: "Notifications" },
          { icon: "info" as IName, label: "Settings" },
        ].map(item => (
          <button key={item.label} onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", fontFamily: TNR, fontWeight: 700, fontSize: 13, color: M.g800, textAlign: "left" as const }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${M.maroon}0e`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={item.icon} size={16} color={M.maroon} />
            </div>
            {item.label}
          </button>
        ))}
        <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "8px 0" }} />
        <button onClick={() => { onClose(); onLogout(); /* Simulated redirect to register */ window.location.hash = "register"; }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", fontFamily: TNR, fontWeight: 700, fontSize: 13, color: M.g800, textAlign: "left" as const }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `${M.sky}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="plus" size={16} color={M.sky} />
          </div>
          Register New Teacher
        </button>
      </div>
      <div style={{ padding: 16, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 10, border: "none", background: `${M.red}0c`, cursor: "pointer", fontFamily: TNR, fontWeight: 800, fontSize: 13, color: M.red }}>
          <Icon name="logout" size={16} color={M.red} /> Sign Out
        </button>
      </div>
    </div>
    </>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────
const MobileDashboard: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { user, students = [], iepRequests = [], updateIEPRequest } = useApp();

  const allWhitelistedStudents = React.useMemo(() => 
    students.filter((s: any) => s.status !== 'archived' && s.teacher === user?.name), 
    [students, user?.name]
  );

  const stats = [
    { label: "Students", val: allWhitelistedStudents.length.toString(), icon: "users" as IName, color: M.maroon },
    { label: "Logs Today", val: "0", icon: "check" as IName, color: M.green },
    { label: "Pending", val: iepRequests.filter(r => r.status === 'pending').length.toString(), icon: "clock" as IName, color: M.amber },
    { label: "Alerts", val: "0", icon: "alert" as IName, color: M.red },
  ];

  return (
    <div style={{ padding: "16px 14px", paddingBottom: 8 }}>
      {/* Welcome banner */}
      <div style={{ background: `linear-gradient(135deg,${M.maroonDeep},${M.maroon})`, borderRadius: 16, padding: "16px 18px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(196,154,60,0.12)" }} />
        <div style={{ fontSize: 9.5, color: M.gold, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 4 }}>May 24, 2025</div>
        <div style={{ fontSize: 17, fontWeight: 900, color: M.white, fontFamily: TNR, fontStyle: "italic", marginBottom: 2 }}>Welcome, {user?.name || 'Authorized Node'}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontFamily: TNR, marginBottom: 14 }}>{user?.subject || 'Faculty'} · {user?.teacherId || 'Node'}</div>
        <button onClick={onStart} style={{ background: "rgba(255,255,255,0.15)", color: M.white, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "9px 16px", fontSize: 12.5, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, backdropFilter: "blur(6px)" }}>
          <Icon name="plus" size={14} color={M.white} /> Start Activity Log
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {stats.map(s => (
          <MCard key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 13px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={s.icon} size={16} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: M.g800, fontFamily: TNR, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: M.g700, fontWeight: 700, fontFamily: TNR, marginTop: 1 }}>{s.label}</div>
            </div>
          </MCard>
        ))}
      </div>

      {/* Needs attention */}
      <MCard style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: M.red + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="alert" size={12} color={M.red} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: M.g800, textTransform: "uppercase" as const, letterSpacing: 0.8, fontFamily: TNR }}>Needs Attention</span>
        </div>
        {allWhitelistedStudents.filter((s: Student) => s.riskLevel !== 'Low').slice(0, 3).map((s: Student) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Av initials={s.initials || s.name.split(" ").map((w: any) => w[0]).join("").slice(0, 2)} size={34} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: M.g800, fontFamily: TNR }}>{s.name}</div>
                <div style={{ fontSize: 10.5, color: M.g700, fontFamily: TNR, fontWeight: 600 }}>{s.grade}</div>
              </div>
            </div>
            <Tag color={riskColor[s.riskLevel?.toLowerCase()] || M.amber}>{s.riskLevel}</Tag>
          </div>
        ))}
      </MCard>

      {/* IEP requests */}
      <MCard>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: M.maroon + "12", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="file" size={12} color={M.maroon} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: M.g800, textTransform: "uppercase" as const, letterSpacing: 0.8, fontFamily: TNR }}>IEP Access Requests</span>
        </div>
        {iepRequests.filter(r => r.status === "pending").length > 0
          ? iepRequests.filter(r => r.status === "pending").map(req => (
            <div key={req.id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 800, fontSize: 12.5, color: M.g800, fontFamily: TNR }}>{req.studentName}</div>
              <div style={{ fontSize: 11, color: M.g700, fontFamily: TNR, marginBottom: 8 }}>Parent: {req.parentName}</div>
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={() => updateIEPRequest(req.id, "approved")} style={{ flex: 1, background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 8, padding: "8px", fontSize: 11.5, cursor: "pointer", fontWeight: 800, fontFamily: TNR }}>Approve</button>
                <button onClick={() => updateIEPRequest(req.id, "rejected")} style={{ flex: 1, background: "rgba(0,0,0,0.06)", color: M.g700, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "8px", fontSize: 11.5, cursor: "pointer", fontWeight: 800, fontFamily: TNR }}>Reject</button>
              </div>
            </div>
          ))
          : <div style={{ textAlign: "center" as const, color: M.g600, fontStyle: "italic", fontSize: 12.5, fontFamily: TNR, padding: "14px 0" }}>No pending requests</div>
        }
      </MCard>
    </div>
  );
};

// ── Select Student ─────────────────────────────────────────────────────────
const MobileSelectStudent: React.FC<{ onSelect: (s: any) => void }> = ({ onSelect }) => {
  const { user, students = [] } = useApp();
  const [search, setSearch] = useState("");
  const allWhitelistedStudents = React.useMemo(() => 
    students.filter((s: any) => s.status !== 'archived' && s.teacher === user?.name), 
    [students, user?.name]
  );
  const filtered = allWhitelistedStudents.filter((s: Student) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "14px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Step 1 of 8</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>Select Student</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputSt}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {filtered.map((s: Student) => (
          <MCard key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Av initials={s.initials || "?"} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: M.g800, fontFamily: TNR }}>{s.name}</div>
              <div style={{ fontSize: 11, color: M.g700, fontFamily: TNR, fontWeight: 600, marginBottom: 4 }}>{s.grade}</div>
              <Tag color={riskColor[s.riskLevel?.toLowerCase()] || M.amber}>{s.riskLevel || 'N/A'}</Tag>
            </div>
            <button onClick={() => onSelect(s)} style={{ width: 36, height: 36, background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="arrow" size={14} color={M.white} />
            </button>
          </MCard>
        ))}
      </div>
      <div style={{ fontSize: 11, color: M.g700, marginTop: 10, fontFamily: TNR, fontWeight: 700 }}>Showing {filtered.length} of {allWhitelistedStudents.length} students</div>
    </div>
  );
};

// ── Select Session ─────────────────────────────────────────────────────────
const MobileSelectSession: React.FC<{ student: Student; onContinue: () => void }> = ({ student, onContinue }) => {
  const { user } = useApp();
  const [date, setDate] = useState("2025-05-24");
  const [session, setSession] = useState("3rd Period - 10:30 AM - 11:30 AM");
  return (
    <div style={{ padding: "14px 14px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Step 1 of 8</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>Select Session</div>
      </div>
      <MCard style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12, borderLeft: `3px solid ${M.maroon}` }}>
        <Av initials={student.initials} size={40} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: M.maroonDeep, fontFamily: TNR }}>{student.name}</div>
          <div style={{ fontSize: 11, color: M.g700, fontFamily: TNR, fontWeight: 700 }}>{student.section}</div>
        </div>
      </MCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {[
          { label: "Date", el: <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputSt} /> },
          { label: "Period", el: <select value={session} onChange={e => setSession(e.target.value)} style={inputSt}>{["1st Period - 7:30 AM - 8:30 AM", "2nd Period - 8:30 AM - 9:30 AM", "3rd Period - 10:30 AM - 11:30 AM", "4th Period - 1:00 PM - 2:00 PM", "5th Period - 2:00 PM - 3:00 PM"].map(s => <option key={s}>{s}</option>)}</select> },
          { label: "Subject", el: <input value={user?.subject || "Mathematics"} readOnly style={{ ...inputSt, background: "rgba(0,0,0,0.04)", color: M.g700 }} /> },
        ].map(({ label, el }) => (
          <div key={label}>
            <label style={{ fontSize: 10.5, fontWeight: 800, color: M.g800, display: "block", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: 0.7, fontFamily: TNR }}>{label}</label>
            {el}
          </div>
        ))}
      </div>
      <button onClick={onContinue} style={{ width: "100%", marginTop: 20, background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Continue <Icon name="arrow" size={15} color={M.white} />
      </button>
    </div>
  );
};

// ── Activity Log ───────────────────────────────────────────────────────────
const MobileActivityLog: React.FC<{ student: Student; onSave: (state: LogState) => void }> = ({ student, onSave }) => {
  const [obs, setObs] = useState("");
  const [category, setCategory] = useState(BEHAVIOR_CATEGORIES[0].label);
  const [mood, setMood] = useState("Happy");
  const [participation, setParticipation] = useState(3);
  const [incident, setIncident] = useState("No Incident");
  const [interventions, setInterventions] = useState<Record<string, boolean>>({ "Verbal Reminder": true, "Seat Adjustment": false, "Task Modification": false, "Counseling / Check-in": false, "Referral to Guidance": false, "Positive Reinforcement": false });
  const [remarks, setRemarks] = useState("");
  const [saved, setSaved] = useState(false);
  const [showPosCats, setShowPosCats] = useState(true);

  const moods = [{ label: "Happy", icon: "😊" }, { label: "Anxious", icon: "😰" }, { label: "Frustrated", icon: "😤" }, { label: "Fatigued", icon: "😴" }, { label: "Sad", icon: "😢" }];
  const incidents = ["No Incident", "Minor Disruption", "Behavioral Incident", "Physical Aggression"];
  const incidentColor = (i: string) => i === "No Incident" ? M.green : i === "Minor Disruption" ? M.amber : M.red;

  const sLabel = (icon: IName, label: string) => (
    <div style={{ fontSize: 10.5, fontWeight: 800, color: M.g800, display: "flex", alignItems: "center", gap: 7, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: 0.7, fontFamily: TNR }}>
      <div style={{ width: 22, height: 22, borderRadius: 7, background: M.maroon + "14", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={12} color={M.maroon} /></div>{label}
    </div>
  );

  const handleSave = () => { setSaved(true); setTimeout(() => onSave({ obs, category, mood, participation, incident, interventions, remarks }), 600); };

  return (
    <div style={{ padding: "14px 14px", paddingBottom: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Step 2 of 8</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>Activity Log</div>
        <div style={{ fontSize: 11.5, color: M.g700, fontFamily: TNR, fontWeight: 600 }}>{student.name} · Math · May 24, 2025</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {/* Observation */}
        <MCard>
          {sLabel("file", "Observation")}
          <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Describe observed behavior…" style={{ ...inputSt, minHeight: 90, resize: "vertical" as const, lineHeight: 1.7, fontSize: 13 }} />
          <div style={{ fontSize: 10, color: obs.length > 450 ? M.red : M.g600, textAlign: "right" as const, marginTop: 3, fontFamily: TNR, fontWeight: 700 }}>{obs.length}/500</div>
        </MCard>

        {/* Behavior Category */}
        <MCard>
          {sLabel("brain", "Behavior Category")}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button onClick={() => setShowPosCats(true)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1.5px solid ${showPosCats ? M.green : "rgba(0,0,0,0.1)"}`, background: showPosCats ? "rgba(26,122,74,0.08)" : "transparent", color: showPosCats ? M.green : M.g600, fontSize: 11.5, fontWeight: 800, fontFamily: TNR, cursor: "pointer" }}>
              👍 Positive
            </button>
            <button onClick={() => setShowPosCats(false)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1.5px solid ${!showPosCats ? M.red : "rgba(0,0,0,0.1)"}`, background: !showPosCats ? "rgba(192,57,43,0.08)" : "transparent", color: !showPosCats ? M.red : M.g600, fontSize: 11.5, fontWeight: 800, fontFamily: TNR, cursor: "pointer" }}>
              ⚠️ Concerning
            </button>
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
            {(showPosCats ? POSITIVE_CATS : NEGATIVE_CATS).map(c => (
              <button key={c.label} title={c.desc} onClick={() => setCategory(c.label)} style={{ padding: "8px 11px", borderRadius: 8, border: "1.5px solid", borderColor: category === c.label ? (showPosCats ? M.green : M.red) : "rgba(0,0,0,0.08)", background: category === c.label ? (showPosCats ? "rgba(26,122,74,0.1)" : "rgba(192,57,43,0.09)") : "rgba(255,255,255,0.5)", color: category === c.label ? (showPosCats ? M.green : M.red) : M.g700, fontSize: 12.5, fontFamily: TNR, fontWeight: category === c.label ? 800 : 600, cursor: "pointer", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: category === c.label ? (showPosCats ? M.green : M.red) : "rgba(0,0,0,0.15)", flexShrink: 0 }} />{c.label}
              </button>
            ))}
          </div>
          {category && (
            <div style={{ marginTop: 9, padding: "8px 10px", background: BEHAVIOR_CATEGORIES.find(c => c.label === category)?.type === "positive" ? "rgba(26,122,74,0.07)" : "rgba(192,57,43,0.07)", borderRadius: 8, fontSize: 11.5, color: M.g800, fontFamily: TNR, fontWeight: 700, borderLeft: `3px solid ${BEHAVIOR_CATEGORIES.find(c => c.label === category)?.type === "positive" ? M.green : M.red}` }}>
              <strong>{category}</strong> — {BEHAVIOR_CATEGORIES.find(c => c.label === category)?.desc}
            </div>
          )}
        </MCard>

        {/* Mood */}
        <MCard>
          {sLabel("star", "Mood")}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            {moods.map(m => (
              <button key={m.label} onClick={() => setMood(m.label)} style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid", borderColor: mood === m.label ? M.maroon : "rgba(0,0,0,0.1)", background: mood === m.label ? "rgba(123,28,42,0.09)" : "rgba(255,255,255,0.6)", color: mood === m.label ? M.maroon : M.g700, fontSize: 12.5, fontFamily: TNR, fontWeight: mood === m.label ? 800 : 600, cursor: "pointer" }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </MCard>

        {/* Participation */}
        <MCard>
          {sLabel("activity", `Participation Level — ${participation}/5`)}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: M.g700, fontFamily: TNR, fontWeight: 700, flexShrink: 0 }}>Low</span>
            <input type="range" min="1" max="5" step="1" value={participation} onChange={e => setParticipation(+e.target.value)} style={{ flex: 1, accentColor: M.maroon, height: 4 }} />
            <span style={{ fontSize: 11, color: M.g700, fontFamily: TNR, fontWeight: 700, flexShrink: 0 }}>High</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{ width: 22, height: 22, borderRadius: "50%", background: n <= participation ? M.maroon : "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: n <= participation ? M.white : "transparent" }} />
              </div>
            ))}
          </div>
        </MCard>

        {/* Incident */}
        <MCard>
          {sLabel("alert", "Incident Type")}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {incidents.map(inc => (
              <button key={inc} onClick={() => setIncident(inc)} style={{ padding: "10px 12px", borderRadius: 10, border: "1.5px solid", borderColor: incident === inc ? incidentColor(inc) : "rgba(0,0,0,0.09)", background: incident === inc ? incidentColor(inc) + "12" : "rgba(255,255,255,0.55)", color: incident === inc ? incidentColor(inc) : M.g700, fontSize: 12.5, fontFamily: TNR, fontWeight: incident === inc ? 800 : 600, cursor: "pointer", textAlign: "left" as const }}>
                {inc}
              </button>
            ))}
          </div>
        </MCard>

        {/* Interventions */}
        <MCard>
          {sLabel("target", "Interventions Applied")}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.keys(interventions).map(k => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer", color: interventions[k] ? M.maroon : M.g800, fontFamily: TNR, fontWeight: 700, padding: "8px 10px", borderRadius: 9, background: interventions[k] ? "rgba(123,28,42,0.06)" : "transparent", border: `1px solid ${interventions[k] ? "rgba(123,28,42,0.15)" : "transparent"}` }}>
                <input type="checkbox" checked={interventions[k]} onChange={() => setInterventions(p => ({ ...p, [k]: !p[k] }))} style={{ accentColor: M.maroon, width: 16, height: 16, flexShrink: 0 }} />
                {k}
              </label>
            ))}
          </div>
        </MCard>

        {/* Remarks */}
        <MCard>
          {sLabel("file", "Remarks")}
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Additional notes…" style={{ ...inputSt, minHeight: 70, resize: "vertical" as const, lineHeight: 1.7 }} />
        </MCard>
      </div>

      <button onClick={handleSave} disabled={saved} style={{ width: "100%", marginTop: 16, background: saved ? "rgba(0,0,0,0.15)" : `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: TNR, cursor: saved ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="save" size={16} color={M.white} /> {saved ? "Saving…" : "Save Activity Log"}
      </button>
    </div>
  );
};

// ── Save Confirmation ──────────────────────────────────────────────────────
const MobileSaveConfirmation: React.FC<{ student: Student; onProceed: () => void }> = ({ student, onProceed }) => (
  <div style={{ padding: "32px 16px 20px" }}>
    <div style={{ textAlign: "center" as const, marginBottom: 28 }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 8px 28px ${M.maroon}50` }}>
        <Icon name="check" size={36} color={M.white} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: M.maroon, fontFamily: TNR, fontStyle: "italic" }}>Log Saved!</div>
      <div style={{ color: M.g700, fontSize: 12.5, fontFamily: TNR, fontWeight: 700, marginTop: 4 }}>Recorded and synced successfully.</div>
    </div>
    <MCard style={{ marginBottom: 18 }}>
      {[["Student", student.name], ["Subject", "Mathematics"], ["Session", "May 24, 2025 — 3rd Period"], ["Saved At", "10:42 AM"], ["Status", "✓ Synced"]].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: 12.5, fontFamily: TNR }}>
          <span style={{ color: M.g700, fontWeight: 700 }}>{k}</span>
          <span style={{ fontWeight: 800, color: k === "Status" ? M.green : M.g800 }}>{v}</span>
        </div>
      ))}
    </MCard>
    <button onClick={onProceed} style={{ width: "100%", background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      AI Analysis <Icon name="sparkle" size={15} color={M.white} />
    </button>
  </div>
);

// ── AI Analysis ────────────────────────────────────────────────────────────
const MobileAIAnalysis: React.FC<{ student: Student; onNext: () => void }> = ({ student, onNext }) => {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(iv); setDone(true); return 100; } return p + 3; }), 70);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ padding: "14px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Step 4 of 8</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>AI Analysis</div>
        <div style={{ fontSize: 11.5, color: M.g700, fontFamily: TNR, fontWeight: 600 }}>Analyzing behavioral patterns across sessions.</div>
      </div>
      {!done ? (
        <MCard style={{ textAlign: "center" as const, padding: "42px 20px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `rgba(123,28,42,0.08)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Icon name="brain" size={30} color={M.maroon} /></div>
          <div style={{ fontWeight: 900, fontSize: 14.5, color: M.g800, marginBottom: 6, fontFamily: TNR }}>Analyzing…</div>
          <div style={{ color: M.g700, fontSize: 12, marginBottom: 22, fontFamily: TNR, fontWeight: 600, lineHeight: 1.6 }}>Cross-referencing 18 logs across Mathematics, English, and Science.</div>
          <PBar val={progress} color={M.maroon} h={7} />
          <div style={{ fontSize: 11.5, color: M.g700, marginTop: 7, fontFamily: TNR, fontWeight: 700 }}>{progress}%</div>
        </MCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <MCard>
            <div style={{ fontSize: 11, fontWeight: 800, color: M.maroon, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 10, fontFamily: TNR, display: "flex", alignItems: "center", gap: 6 }}><Icon name="sparkle" size={13} color={M.maroon} /> AI Result</div>
            <ul style={{ margin: "0 0 12px", padding: "0 0 0 16px", fontSize: 13, color: M.g800, lineHeight: 2.1, fontFamily: TNR, fontWeight: 700 }}>
              <li>Repeated inattentiveness in Math.</li>
              <li>Consistent participation in English.</li>
              <li>Signs of hyperactivity in Science.</li>
            </ul>
            <div style={{ background: "rgba(123,28,42,0.05)", borderRadius: 10, padding: "10px 12px", border: `1px solid ${M.maroon}18` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: M.maroon, marginBottom: 4, fontFamily: TNR }}>AI Insight</div>
              <p style={{ fontSize: 12, color: M.g800, margin: 0, lineHeight: 1.7, fontFamily: TNR, fontWeight: 700 }}>Inconsistent attention across subjects. Structured interventions in Math recommended.</p>
            </div>
          </MCard>
          <MCard>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: M.g800, marginBottom: 12, fontFamily: TNR }}>Subject-wise Behavioral Score</div>
            {[{ label: "Math — Inattentiveness", val: 78, color: M.red }, { label: "English — Participation", val: 82, color: M.maroon }, { label: "Science — Hyperactivity", val: 54, color: M.amber }, { label: "Overall Concern", val: 65, color: M.sky }].map(b => (
              <div key={b.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 5, fontFamily: TNR }}>
                  <span style={{ color: M.g700, fontWeight: 700 }}>{b.label}</span>
                  <span style={{ fontWeight: 900, color: b.color }}>{b.val}%</span>
                </div>
                <PBar val={b.val} color={b.color} h={6} />
              </div>
            ))}
          </MCard>
          <button onClick={onNext} style={{ width: "100%", background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Risk Classification <Icon name="arrow" size={15} color={M.white} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Risk Classification ────────────────────────────────────────────────────
const MobileRiskClassification: React.FC<{ student: Student; onNext: () => void }> = ({ student, onNext }) => (
  <div style={{ padding: "14px" }}>
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Step 5 of 8</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>Risk Classification</div>
      <div style={{ fontSize: 11.5, color: M.g700, fontFamily: TNR, fontWeight: 600 }}>AI-powered risk assessment with XAI transparency.</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <MCard style={{ background: "rgba(184,134,11,0.06)", borderLeft: `3px solid ${M.amber}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: M.amber + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="alert" size={26} color={M.amber} /></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: M.amber, fontFamily: TNR, fontStyle: "italic" }}>MODERATE RISK</div>
            <div style={{ fontSize: 11.5, color: M.g700, fontFamily: TNR, fontWeight: 700 }}>Confidence: 68% · May 24, 2025</div>
          </div>
        </div>
      </MCard>
      <MCard>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: M.g800, marginBottom: 12, fontFamily: TNR, display: "flex", alignItems: "center", gap: 7 }}><Icon name="eye" size={15} color={M.maroon} /> XAI Explanation</div>
        {[{ label: "Math Inattentiveness", val: 80, color: M.red }, { label: "English Engagement", val: 75, color: M.maroon }, { label: "Science Hyperactivity", val: 55, color: M.amber }, { label: "Risk Confidence", val: 68, color: M.sky }].map(b => (
          <div key={b.label} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4, fontFamily: TNR }}>
              <span style={{ color: M.g700, fontWeight: 700 }}>{b.label}</span>
              <span style={{ fontWeight: 900, color: b.color }}>{b.val}%</span>
            </div>
            <PBar val={b.val} color={b.color} h={5} />
          </div>
        ))}
      </MCard>
      <MCard>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: M.g800, marginBottom: 12, fontFamily: TNR, display: "flex", alignItems: "center", gap: 7 }}><Icon name="target" size={15} color={M.maroon} /> AI Recommendations</div>
        {["Structured attention support in Math.", "Encourage active participation.", "Continue behavioral monitoring.", "Parent communication recommended.", "Counselor check-in within 1 week."].map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 9, marginBottom: 9, fontSize: 12.5, fontFamily: TNR }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: M.maroon + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><Icon name="check" size={10} color={M.maroon} /></div>
            <span style={{ color: M.g800, fontWeight: 700, lineHeight: 1.5 }}>{r}</span>
          </div>
        ))}
      </MCard>
      <button onClick={onNext} style={{ width: "100%", background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Notifications <Icon name="arrow" size={15} color={M.white} />
      </button>
    </div>
  </div>
);

// ── Notifications ──────────────────────────────────────────────────────────
const MobileNotifications: React.FC<{ student: Student; onNext: () => void }> = ({ student, onNext }) => {
  const nots = [
    { icon: "users" as IName, title: "Parent Notification", to: `${student.name}'s Guardian`, reason: "Repeated inattentive behavior. Moderate risk assigned.", time: "10:45 AM" },
    { icon: "home" as IName, title: "Admin / Principal", to: "School Administrator", reason: "Moderate behavioral risk detected in Grade 7 3-F.", time: "10:45 AM" },
    { icon: "shield" as IName, title: "Guidance Counselor", to: "School Guidance Office", reason: "Flagged for monitoring. Session recommended within 7 days.", time: "10:46 AM" },
  ];
  return (
    <div style={{ padding: "14px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Step 6 of 8</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>Notifications</div>
        <div style={{ fontSize: 11.5, color: M.g700, fontFamily: TNR, fontWeight: 600 }}>Automated alerts sent based on risk assessment.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {nots.map((n, i) => (
          <MCard key={i} style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${M.maroon}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={n.icon} size={18} color={M.maroon} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <div style={{ fontWeight: 800, fontSize: 12.5, color: M.g800, fontFamily: TNR }}>{n.title}</div>
                <Tag color={M.green}>✓ Sent</Tag>
              </div>
              <div style={{ fontSize: 10.5, color: M.g700, fontFamily: TNR, fontWeight: 600, marginBottom: 5 }}>To: {n.to}</div>
              <div style={{ fontSize: 11.5, color: M.g700, fontFamily: TNR, fontWeight: 600, lineHeight: 1.6 }}>{n.reason}</div>
              <div style={{ fontSize: 10.5, color: M.g500, fontFamily: TNR, fontWeight: 600, marginTop: 4 }}>{n.time}</div>
            </div>
          </MCard>
        ))}
      </div>
      <button onClick={onNext} style={{ width: "100%", background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Analytics <Icon name="arrow" size={15} color={M.white} />
      </button>
    </div>
  );
};

// ── Analytics ──────────────────────────────────────────────────────────────
const MobileAnalytics: React.FC<{ student: Student; onNext: () => void }> = ({ student, onNext }) => {
  const [tab, setTab] = useState("trends");
  return (
    <div style={{ padding: "14px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Step 7 of 8</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>Analytics</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {["trends", "subjects", "interventions", "progress"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 13px", borderRadius: 9, border: "1.5px solid", borderColor: tab === t ? M.maroon : "rgba(0,0,0,0.1)", background: tab === t ? "rgba(123,28,42,0.09)" : "rgba(255,255,255,0.65)", color: tab === t ? M.maroon : M.g700, fontSize: 12, fontFamily: TNR, fontWeight: tab === t ? 800 : 700, cursor: "pointer", flexShrink: 0, textTransform: "capitalize" as const }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "trends" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <MCard>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: M.g800, marginBottom: 12, fontFamily: TNR }}>Key Insights</div>
            {[{ icon: "trending" as IName, text: "Inattentiveness in Math increasing over 4 weeks." }, { icon: "check" as IName, text: "Good engagement consistently in English." }, { icon: "zap" as IName, text: "Hyperactivity in Science moderate but stable." }, { icon: "target" as IName, text: "Verbal Reminder applied 6× — partially effective." }].map((ins, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: 12, fontSize: 12.5, fontFamily: TNR }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: M.maroon + "12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={ins.icon} size={12} color={M.maroon} /></div>
                <span style={{ color: M.g800, lineHeight: 1.55, fontWeight: 700 }}>{ins.text}</span>
              </div>
            ))}
          </MCard>
          <MCard>
            <div style={{ fontSize: 12, fontWeight: 800, color: M.g800, marginBottom: 10, fontFamily: TNR }}>Behavior Scores</div>
            {[{ label: "Inattentiveness", val: 78, color: M.red }, { label: "Cooperation", val: 82, color: M.maroon }, { label: "Hyperactivity", val: 54, color: M.amber }].map(b => (
              <div key={b.label} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: TNR, marginBottom: 5 }}>
                  <span style={{ color: M.g700, fontWeight: 700 }}>{b.label}</span>
                  <span style={{ fontWeight: 900, color: b.color }}>{b.val}%</span>
                </div>
                <PBar val={b.val} color={b.color} h={6} />
              </div>
            ))}
          </MCard>
        </div>
      )}
      {tab === "subjects" && (
        <MCard>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: M.g800, marginBottom: 12, fontFamily: TNR }}>Subject Comparison</div>
          {[{ subject: "Mathematics", positive: 32, concern: 68, incidents: 7 }, { subject: "English", positive: 78, concern: 22, incidents: 1 }, { subject: "Science", positive: 55, concern: 45, incidents: 4 }, { subject: "MAPEH", positive: 80, concern: 20, incidents: 0 }].map(s => (
            <div key={s.subject} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6, fontFamily: TNR }}>
                <span style={{ fontWeight: 800, color: M.g800 }}>{s.subject}</span>
                <span style={{ fontSize: 11, color: M.g700, fontWeight: 700 }}>{s.incidents} incident{s.incidents !== 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${s.positive}%`, background: `linear-gradient(90deg,${M.maroonDark},${M.maroon})` }} />
                <div style={{ width: `${s.concern}%`, background: M.red + "55" }} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 5, fontSize: 10.5, fontFamily: TNR }}>
                <span style={{ color: M.maroon, fontWeight: 800 }}>✓ {s.positive}% positive</span>
                <span style={{ color: M.red, fontWeight: 800 }}>! {s.concern}% concern</span>
              </div>
            </div>
          ))}
        </MCard>
      )}
      {tab === "interventions" && (
        <MCard>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: M.g800, marginBottom: 12, fontFamily: TNR }}>Intervention History</div>
          {[{ date: "May 24", type: "Seat Adjustment", result: "Partially Effective", c: M.amber }, { date: "May 17", type: "Verbal Reminder + Task Modification", result: "Effective", c: M.maroon }, { date: "May 10", type: "Verbal Reminder", result: "Effective", c: M.maroon }, { date: "Apr 26", type: "Referral to Guidance", result: "Pending", c: M.sky }].map((h, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: M.g700, fontWeight: 800, fontFamily: TNR }}>{h.date}</span>
                <Tag color={h.c}>{h.result}</Tag>
              </div>
              <div style={{ fontSize: 12.5, color: M.g800, fontFamily: TNR, fontWeight: 700 }}>{h.type}</div>
            </div>
          ))}
        </MCard>
      )}
      {tab === "progress" && (
        <MCard>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: M.g800, marginBottom: 12, fontFamily: TNR }}>Progress Tracking</div>
          {[{ label: "Reduction in Inattentive Episodes", current: 42, target: 80, color: M.maroon }, { label: "Cooperative Behavior", current: 68, target: 90, color: M.maroonDark }, { label: "Participation Rate", current: 55, target: 85, color: M.sky }].map(p => (
            <div key={p.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: TNR, marginBottom: 5 }}>
                <span style={{ color: M.g800, fontWeight: 700, flex: 1, marginRight: 8 }}>{p.label}</span>
                <span style={{ fontWeight: 900, color: p.color, flexShrink: 0 }}>{p.current}%</span>
              </div>
              <PBar val={p.current} color={p.color} h={6} />
              <div style={{ fontSize: 10, color: M.g500, fontFamily: TNR, marginTop: 3 }}>Target: {p.target}%</div>
            </div>
          ))}
        </MCard>
      )}

      <button onClick={onNext} style={{ width: "100%", marginTop: 14, background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Generate Reports <Icon name="arrow" size={15} color={M.white} />
      </button>
    </div>
  );
};

// ── Reports ────────────────────────────────────────────────────────────────
interface GenState { status: "idle" | "generating" | "done"; progress: number; }

const MobileReports: React.FC<{ student: Student; logData: LogState | null; onFinish: () => void }> = ({ student, logData, onFinish }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [genStates, setGenStates] = useState<Record<string, GenState>>({});

  const defaultLog: LogState = { obs: "Student shows consistent inattentiveness.", category: "Inattention", mood: "Anxious", participation: 2, incident: "Minor Disruption", interventions: { "Verbal Reminder": true, "Seat Adjustment": true, "Task Modification": false, "Counseling / Check-in": false, "Referral to Guidance": false, "Positive Reinforcement": false }, remarks: "Requires close monitoring." };
  const data: ReportData = { student, ...(logData || defaultLog) };

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const generateReport = (id: string) => {
    if (genStates[id]?.status === "generating" || genStates[id]?.status === "done") return;
    setGenStates(p => ({ ...p, [id]: { status: "generating", progress: 0 } }));
    let prog = 0;
    const iv = setInterval(() => {
      prog += Math.random() * 12 + 5;
      if (prog >= 100) { clearInterval(iv); setGenStates(p => ({ ...p, [id]: { status: "done", progress: 100 } })); }
      else { setGenStates(p => ({ ...p, [id]: { status: "generating", progress: Math.min(prog, 95) } })); }
    }, 120);
  };

  const openReport = (report: ReportType) => {
    const html = buildReportHTML(report, data);
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };
  const downloadReport = (report: ReportType) => {
    const html = buildReportHTML(report, data);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${report.id}_${student.name.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const doneCount = Object.values(genStates).filter(s => s.status === "done").length;
  const genCount = Object.values(genStates).filter(s => s.status === "generating").length;

  return (
    <div style={{ padding: "14px", paddingBottom: 24 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Step 8 of 8</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>Generate Reports</div>
        <div style={{ fontSize: 11.5, color: M.g700, fontFamily: TNR, fontWeight: 600 }}>{student.name} · {selected.length} selected · {doneCount} ready</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {REPORT_TYPES.map(report => {
          const isSel = selected.includes(report.id);
          const gs = genStates[report.id];
          const isDone = gs?.status === "done";
          const isGen = gs?.status === "generating";
          return (
            <div key={report.id} onClick={() => toggle(report.id)} style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: isSel ? `2px solid ${report.color}55` : "1px solid rgba(255,255,255,0.55)", borderRadius: 14, padding: 14, boxShadow: isSel ? `0 4px 18px ${report.color}20` : "0 3px 12px rgba(61,12,24,0.07)", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 7 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: report.color + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${report.color}22` }}><Icon name={report.icon} size={18} color={report.color} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: isSel ? report.color : M.g800, fontFamily: TNR, lineHeight: 1.3 }}>{report.title}</div>
                  <div style={{ fontSize: 11, color: M.g700, fontFamily: TNR, fontWeight: 600, lineHeight: 1.5, marginTop: 2 }}>{report.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSel ? report.color : "rgba(0,0,0,0.15)"}`, background: isSel ? report.color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSel && <Icon name="check" size={10} color={M.white} />}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: isSel ? 10 : 0 }}>
                {report.tags.map(tag => <Tag key={tag} color={report.color}>{tag}</Tag>)}
                {isDone && <Tag color={M.green}>✓ Ready</Tag>}
              </div>
              {isSel && (
                <div onClick={e => e.stopPropagation()}>
                  {isGen && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontFamily: TNR, fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ color: M.g700 }}>Generating…</span>
                        <span style={{ color: report.color }}>{Math.round(gs.progress)}%</span>
                      </div>
                      <PBar val={gs.progress} color={report.color} h={5} />
                    </div>
                  )}
                  {!isDone ? (
                    <button onClick={() => generateReport(report.id)} disabled={isGen} style={{ width: "100%", background: isGen ? "rgba(0,0,0,0.1)" : report.color, color: M.white, border: "none", borderRadius: 9, padding: "9px", fontSize: 12.5, fontFamily: TNR, fontWeight: 800, cursor: isGen ? "not-allowed" : "pointer", opacity: isGen ? 0.7 : 1 }}>
                      {isGen ? "Processing…" : "⚡ Generate"}
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openReport(report)} style={{ flex: 1, background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 8, padding: "9px 4px", fontSize: 11, fontFamily: TNR, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <Icon name="eye" size={12} color={M.white} /> View
                      </button>
                      <button onClick={() => downloadReport(report)} style={{ flex: 1, background: "rgba(26,122,74,0.09)", color: M.green, border: "1px solid rgba(26,122,74,0.2)", borderRadius: 8, padding: "9px 4px", fontSize: 11, fontFamily: TNR, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <Icon name="download" size={12} color={M.green} /> Save
                      </button>
                      <button onClick={() => alert(`📧 Email sent for ${report.title}`)} style={{ flex: 1, background: "rgba(184,134,11,0.08)", color: M.amber, border: "1px solid rgba(184,134,11,0.18)", borderRadius: 8, padding: "9px 4px", fontSize: 11, fontFamily: TNR, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <Icon name="mail" size={12} color={M.amber} /> Email
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ background: `linear-gradient(135deg,${M.maroonDeep},${M.maroon})`, borderRadius: 14, padding: "14px 16px", marginBottom: 14, boxShadow: `0 6px 22px ${M.maroon}40` }}>
          <div style={{ fontWeight: 900, fontSize: 13, fontFamily: TNR, color: M.white, marginBottom: 4 }}>
            {selected.length} selected · {genCount > 0 ? `${genCount} generating…` : doneCount > 0 ? `${doneCount} ready` : "Ready to generate"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => selected.filter(id => !genStates[id] || genStates[id].status === "idle").forEach((id, i) => setTimeout(() => generateReport(id), i * 400))} disabled={genCount > 0} style={{ flex: 1, background: "rgba(255,255,255,0.15)", color: M.white, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 9, padding: "9px", fontSize: 12.5, fontFamily: TNR, fontWeight: 800, cursor: genCount > 0 ? "not-allowed" : "pointer", opacity: genCount > 0 ? 0.6 : 1 }}>
              {genCount > 0 ? `Generating…` : "⚡ Generate All"}
            </button>
            {doneCount > 0 && (
              <button onClick={() => selected.filter(id => genStates[id]?.status === "done").forEach(id => { const r = REPORT_TYPES.find(rt => rt.id === id); if (r) downloadReport(r); })} style={{ flex: 1, background: `linear-gradient(135deg,${M.gold},#8C6A1E)`, color: M.white, border: "none", borderRadius: 9, padding: "9px", fontSize: 12, fontFamily: TNR, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icon name="download" size={13} color={M.white} /> All ({doneCount})
              </button>
            )}
          </div>
        </div>
      )}

      <button onClick={onFinish} style={{ width: "100%", background: "rgba(123,28,42,0.08)", color: M.maroon, border: `1.5px solid rgba(123,28,42,0.2)`, borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="check" size={14} color={M.maroon} /> Complete Process
      </button>
    </div>
  );
};

// ── Teacher Register ───────────────────────────────────────────────────────
const MobileRegister: React.FC<{ onRegister: (data: any) => void }> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adviser: "",
    adviserId: "",
    subject: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ padding: "14px 14px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: M.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, fontFamily: TNR, marginBottom: 3 }}>Account Creation</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: M.maroonDeep, fontFamily: TNR, fontStyle: "italic" }}>Teacher Registration</div>
        <div style={{ fontSize: 11.5, color: M.g700, fontFamily: TNR, fontWeight: 600 }}>Create your account to access the behavior tracking system.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {[
          { label: "Email Address", name: "email", type: "email", placeholder: "email@school.edu" },
          { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
          { label: "Adviser Name", name: "adviser", type: "text", placeholder: "Full Name" },
          { label: "Adviser ID", name: "adviserId", type: "text", placeholder: "ID-12345" },
          { label: "Primary Subject", name: "subject", type: "text", placeholder: "e.g. Mathematics" },
        ].map(({ label, name, type, placeholder }) => (
          <div key={name}>
            <label style={{ fontSize: 10.5, fontWeight: 800, color: M.g800, display: "block", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: 0.7, fontFamily: TNR }}>{label}</label>
            <input type={type} name={name} value={(formData as any)[name]} onChange={handleChange} placeholder={placeholder} style={inputSt} />
          </div>
        ))}
      </div>
      <button onClick={() => onRegister(formData)} style={{ width: "100%", marginTop: 24, background: `linear-gradient(135deg,${M.maroon},${M.maroonDeep})`, color: M.white, border: "none", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 800, fontFamily: TNR, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Register Account <Icon name="checkCircle" size={15} color={M.white} />
      </button>
    </div>
  );
};

// ── App Root ───────────────────────────────────────────────────────────────
const TeacherMobile: React.FC = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState("dashboard");
  const [step, setStep] = useState(1);
  const [student, setStudent] = useState<Student | null>(null);
  const [logData, setLogData] = useState<LogState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const go = (v: string, s = 1) => { setView(v); setStep(s); };
  const handleLogout = () => { setUser(null); navigate("/"); };

  const headerTitle = () => {
    const map: Record<string, string> = {
      dashboard: "SNED-LINK+", register: "Teacher Registration", "select-student": "Select Student", session: "Select Session",
      "activity-log": "Activity Log", "save-confirm": "Log Saved", "ai-analysis": "AI Analysis",
      risk: "Risk Classification", notifications: "Notifications", analytics: "Analytics", reports: "Reports",
    };
    return map[view] || "SNED-LINK+";
  };

  const showBack = view !== "dashboard";
  const handleBack = () => {
    const prev: Record<string, string> = {
      register: "dashboard",
      "select-student": "dashboard", session: "select-student",
      "activity-log": "session", "save-confirm": "activity-log",
      "ai-analysis": "save-confirm", risk: "ai-analysis",
      notifications: "risk", analytics: "notifications", reports: "analytics",
    };
    const prevStep: Record<string, number> = { session: 1, "activity-log": 2, "save-confirm": 3, "ai-analysis": 4, risk: 5, notifications: 6, analytics: 7, reports: 8 };
    const dest = prev[view] || "dashboard";
    go(dest, prevStep[dest] || 1);
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#register") setView("register");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigation = (v: string) => {
    if (v === "activity-log" || v === "students") { go("select-student", 1); }
    else { go(v, 1); }
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:0;height:0;}
        input[type=range]{accent-color:${M.maroon};}
        input:focus,textarea:focus,select:focus{border-color:${M.maroon}!important;box-shadow:0 0 0 3px ${M.maroon}18!important;outline:none;}
        textarea{font-family:${TNR};}
        select{font-family:${TNR};}
      `}</style>
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: `radial-gradient(ellipse at 15% 10%,rgba(123,28,42,0.10) 0%,transparent 55%),linear-gradient(160deg,#F5EDE8 0%,#FBF7F2 40%,#F7EFE8 100%)`, overflow: "hidden" }}>

        <MobileHeader
          title={headerTitle()}
          subtitle={view === "dashboard" ? `${user?.name} · ${user?.subject}` : student ? student.name : undefined}
          showBack={showBack}
          onBack={handleBack}
          onMenu={() => setDrawerOpen(true)}
        />

        {view !== "dashboard" && <MobileStepBar current={step} />}

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}>
          {view === "dashboard" && <MobileDashboard onStart={() => go("select-student", 1)} />}
          {view === "register" && <MobileRegister onRegister={(data) => { console.log("Registered:", data); go("dashboard"); }} />}
          {view === "select-student" && <MobileSelectStudent onSelect={s => { setStudent(s); go("session", 1); }} />}
          {view === "session" && student && <MobileSelectSession student={student} onContinue={() => go("activity-log", 2)} />}
          {view === "activity-log" && student && <MobileActivityLog student={student} onSave={state => { setLogData(state); go("save-confirm", 3); }} />}
          {view === "save-confirm" && student && <MobileSaveConfirmation student={student} onProceed={() => go("ai-analysis", 4)} />}
          {view === "ai-analysis" && student && <MobileAIAnalysis student={student} onNext={() => go("risk", 5)} />}
          {view === "risk" && student && <MobileRiskClassification student={student} onNext={() => go("notifications", 6)} />}
          {view === "notifications" && student && <MobileNotifications student={student} onNext={() => go("analytics", 7)} />}
          {view === "analytics" && student && <MobileAnalytics student={student} onNext={() => go("reports", 8)} />}
          {view === "reports" && student && <MobileReports student={student} logData={logData} onFinish={() => { setView("dashboard"); setStudent(null); setLogData(null); }} />}
        </div>

        <BottomNav active={view} onNavigate={handleNavigation} />
      </div>

      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} onLogout={handleLogout} />
    </>
  );
};

export default TeacherMobile;