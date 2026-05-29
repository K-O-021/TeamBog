import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import TeacherMobile from "./TeacherMobile";

// ── Design Tokens ─────────────────────────────────────────────────────────
const M = {
  maroon:"#7B1C2A", maroonDark:"#5A1220", maroonDeep:"#3D0C18",
  maroonMid:"#9B2335", gold:"#C49A3C", cream:"#FBF7F2", white:"#FFFFFF",
  g100:"#F0EAEA", g200:"#D9CECE", g400:"#A89090", g500:"#7A6060",
  g600:"#5A4040", g700:"#3A2828", g800:"#1E1010",
  red:"#C0392B", amber:"#B8860B", sky:"#1A6B8A", purple:"#6C3483",
  green:"#1A7A4A",
};
const TNR = `'Georgia','Times New Roman',serif`;

const glass = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background:"rgba(255,255,255,0.76)",
  backdropFilter:"blur(20px) saturate(1.8)",
  WebkitBackdropFilter:"blur(20px) saturate(1.8)",
  border:"1px solid rgba(255,255,255,0.6)",
  borderRadius:16,
  boxShadow:"0 8px 32px rgba(61,12,24,0.10),0 1.5px 4px rgba(123,28,42,0.06)",
  ...extra,
});

// ── Icons ─────────────────────────────────────────────────────────────────
type IName='home'|'users'|'bell'|'plus'|'search'|'check'|'alert'|'chart'|'brain'|'shield'|'file'|'logout'|'arrow'|'clock'|'star'|'target'|'eye'|'send'|'activity'|'download'|'x'|'menu'|'info'|'grid'|'save'|'zap'|'sparkle'|'layers'|'trending'|'printer'|'mail'|'refresh'|'checkCircle'|'xCircle'|'chevronDown'|'chevronUp'|'smile'|'thumbsUp';
const Icon:React.FC<{name:IName;size?:number;color?:string}>=({name,size=16,color="currentColor"})=>{
  const p={width:size,height:size,display:"inline-block",verticalAlign:"middle",flexShrink:0 as const};
  const ic:Record<IName,React.ReactNode>={
    home:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z"/><path d="M9 21V12h6v9"/></svg>,
    users:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/><path d="M19 8a3 3 0 110 6M22 21v-2a3 3 0 00-2-2.83"/></svg>,
    bell:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    plus:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
    check:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    chart:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>,
    brain:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5a2.5 2.5 0 00-4.96-.46 2.5 2.5 0 00-1.98 3 2.5 2.5 0 00-1.32 4.24 3 3 0 00.34 5.58 2.5 2.5 0 002.96 3.08A2.5 2.5 0 0012 21.5"/><path d="M12 4.5a2.5 2.5 0 014.96-.46 2.5 2.5 0 011.98 3 2.5 2.5 0 011.32 4.24 3 3 0 01-.34 5.58 2.5 2.5 0 01-2.96 3.08A2.5 2.5 0 0112 21.5"/><path d="M15 5a3 3 0 010 6M9 5a3 3 0 000 6M12 12v9"/></svg>,
    shield:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,
    file:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    logout:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    arrow:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    clock:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    star:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    target:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    eye:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    send:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    activity:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    download:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    x:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    menu:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    info:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    grid:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
    save:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    zap:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    sparkle:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/><path d="M5 3l.75 2.5L8 6.5 5.75 7.25 5 9.75l-.75-2.5L2 6.5l2.25-.75z"/></svg>,
    layers:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    trending:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    printer:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>,
    mail:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    refresh:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
    checkCircle:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    xCircle:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    chevronDown:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    chevronUp:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
    smile:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    thumbsUp:<svg style={p} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
  };
  return <>{ic[name]||null}</>;
};

// ── Data ───────────────────────────────────────────────────────────────────
interface BehaviorCategory{label:string;desc:string;type:'positive'|'negative';}
const BEHAVIOR_CATEGORIES:BehaviorCategory[]=[
  {label:"Self-Regulation",desc:"Manage emotions and behavior.",type:"positive"},
  {label:"Sensory Management",desc:"Handling sensory inputs effectively.",type:"positive"},
  {label:"Safe Behavior",desc:"Protecting oneself and others.",type:"positive"},
  {label:"Social Engagement",desc:"Positive social participation.",type:"positive"},
  {label:"Flexible Thinking",desc:"Changing perspectives.",type:"positive"},
  {label:"Functional Communication",desc:"Using language effectively.",type:"positive"},
  {label:"Smooth Transitions",desc:"Moving between activities.",type:"positive"},
  {label:"Sustained Attention",desc:"Staying focused on tasks.",type:"positive"},
  {label:"Task Completion",desc:"Finishing assigned activities.",type:"positive"},
  {label:"Emotional Regulation",desc:"Managing feelings appropriately.",type:"positive"},
  {label:"Task Independence",desc:"Completing activities independently.",type:"positive"},
  {label:"Good Decision-Making",desc:"Choosing safe and helpful actions.",type:"positive"},
  {label:"Clear Communication",desc:"Expressing ideas clearly.",type:"positive"},
  {label:"Stimming",desc:"Repetitive self-stimulation movements.",type:"negative"},
  {label:"Sensory Overload",desc:"Overwhelmed by environment.",type:"negative"},
  {label:"Self-Harm",desc:"Intentional physical injury.",type:"negative"},
  {label:"Social Difficulty",desc:"Challenges in social interaction.",type:"negative"},
  {label:"Echolalia",desc:"Repeating others' words.",type:"negative"},
  {label:"Inattention",desc:"Difficulty staying focused.",type:"negative"},
  {label:"Hyperactivity",desc:"Excessive physical movement.",type:"negative"},
  {label:"Impulsivity",desc:"Acting without thinking.",type:"negative"},
  {label:"Emotional Outbursts",desc:"Sudden intense reactions.",type:"negative"},
  {label:"Aggression",desc:"Hostile actions toward others.",type:"negative"},
  {label:"Wandering",desc:"Leaving safe area without permission.",type:"negative"},
  {label:"Forgetfulness",desc:"Forgetting steps in routines.",type:"negative"},
  {label:"Destructive Behavior",desc:"Intentionally damaging property.",type:"negative"},
];
const POSITIVE_CATS=BEHAVIOR_CATEGORIES.filter(c=>c.type==="positive");
const NEGATIVE_CATS=BEHAVIOR_CATEGORIES.filter(c=>c.type==="negative");

interface Student{id:number;name:string;section:string;initials:string;risk:'low'|'moderate'|'critical';}

interface ReportType{id:string;icon:IName;title:string;desc:string;color:string;tags:string[];}
const REPORT_TYPES:ReportType[]=[
  {id:"behavioral_progress",icon:"chart",title:"Behavioral Progress Report",desc:"Behavior summary, mood patterns, incident trends.",color:M.maroon,tags:["Primary"]},
  {id:"intervention_recommendation",icon:"target",title:"Intervention Recommendation",desc:"AI-detected concerns with suggested interventions.",color:M.sky,tags:["AI-Generated"]},
  {id:"risk_classification",icon:"shield",title:"Risk Classification Report",desc:"Risk level, classification basis, and XAI explanation.",color:M.amber,tags:["XAI"]},
  {id:"anomaly_detection",icon:"eye",title:"Anomaly Detection Report",desc:"Unusual behavior changes and identified triggers.",color:M.purple,tags:["Anomaly"]},
  {id:"predictive_alert",icon:"zap",title:"Predictive Alert Report",desc:"Predicted behavioral concerns and preventive actions.",color:M.red,tags:["Early Warning"]},
  {id:"parent_teacher",icon:"send",title:"Parent-Teacher Communication",desc:"Teacher updates and meeting summaries.",color:M.maroon,tags:["Collaboration"]},
  {id:"behavioral_summary",icon:"layers",title:"Student Behavioral Summary",desc:"Overall behavioral status and improvement indicators.",color:M.maroonDark,tags:["Admin"]},
  {id:"competency_analytics",icon:"trending",title:"Competency Analytics Report",desc:"Social, emotional, and adaptive behavior analytics.",color:M.g700,tags:["Analytics"]},
];

const STEPS=[{num:1,label:"Student"},{num:2,label:"Log"},{num:3,label:"Save"},{num:4,label:"AI"},{num:5,label:"Risk"},{num:6,label:"Alerts"},{num:7,label:"Analytics"},{num:8,label:"Reports"}];

// ── Report Content Generator ───────────────────────────────────────────────
interface ReportData{student:Student;obs:string;category:string;mood:string;participation:number;incident:string;interventions:Record<string,boolean>;remarks:string;}

function buildReportHTML(report:ReportType,data:ReportData):string{
  const now=new Date();
  const dateStr=now.toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"});
  const timeStr=now.toLocaleTimeString("en-PH",{hour:"2-digit",minute:"2-digit"});
  const iList=Object.entries(data.interventions).filter(([,v])=>v).map(([k])=>k);

  const sections:Record<string,string>={
    behavioral_progress:`
      <h3 style="color:#7B1C2A;margin:0 0 12px;font-size:15px;">📊 Behavioral Overview</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
        ${[["Behavior Category",data.category],["Mood Observed",data.mood],["Participation Level",`${data.participation}/5`],["Incident Type",data.incident],["Observation",data.obs||"No observation recorded."]].map(([k,v])=>`<tr><td style="padding:8px 12px;background:#f9f0f1;font-weight:700;width:38%;border-bottom:1px solid #e8d8da;">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #f0e8ea;">${v}</td></tr>`).join("")}
      </table>
      <h3 style="color:#7B1C2A;margin:0 0 10px;font-size:15px;">🔧 Interventions Applied</h3>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:13px;line-height:2;">${iList.length?iList.map(i=>`<li>${i}</li>`).join(""):"<li>None applied this session.</li>"}</ul>
      ${data.remarks?`<h3 style="color:#7B1C2A;margin:0 0 8px;font-size:15px;">📝 Remarks</h3><p style="font-size:13px;line-height:1.7;margin:0;">${data.remarks}</p>`:""}`,

    intervention_recommendation:`
      <h3 style="color:#1A6B8A;margin:0 0 12px;font-size:15px;">🎯 AI-Detected Concerns</h3>
      <div style="background:#e8f4f8;border-left:4px solid #1A6B8A;padding:12px 16px;border-radius:8px;margin-bottom:18px;">
        <p style="margin:0;font-size:13px;line-height:1.7;">Based on behavioral log analysis, <strong>${data.student.name}</strong> exhibits <strong>${data.category}</strong> with <strong>${data.mood}</strong> mood. Participation is at <strong>${data.participation}/5</strong>.</p>
      </div>
      <h3 style="color:#1A6B8A;margin:0 0 10px;font-size:15px;">✅ Recommended Interventions</h3>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:13px;line-height:2.1;">
        <li>Provide structured, step-by-step task instructions.</li>
        <li>Implement a visual schedule to support transitions.</li>
        <li>Use positive reinforcement strategies consistently.</li>
        <li>Schedule weekly check-ins with the guidance counselor.</li>
        <li>Communicate behavioral patterns to parents/guardians.</li>
        ${iList.map(i=>`<li><strong>Continue:</strong> ${i}</li>`).join("")}
      </ul>`,

    risk_classification:`
      <div style="background:#fef9e7;border:2px solid #B8860B;border-radius:10px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:14px;">
        <div style="font-size:36px;">⚠️</div>
        <div><div style="font-size:18px;font-weight:900;color:#B8860B;">MODERATE RISK</div><div style="font-size:13px;color:#5A4040;margin-top:3px;">Confidence: 68% · Logged: ${dateStr}</div></div>
      </div>
      <h3 style="color:#B8860B;margin:0 0 10px;font-size:15px;">📐 XAI Classification Basis</h3>
      ${[["Math Inattentiveness","80%","#C0392B"],["English Engagement","75%","#7B1C2A"],["Science Hyperactivity","55%","#B8860B"],["Risk Confidence","68%","#1A6B8A"]].map(([l,v,c])=>`
        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:4px;"><span>${l}</span><span style="color:${c};">${v}</span></div>
          <div style="height:6px;background:#f0e8ea;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${v};background:${c};border-radius:3px;"></div></div>
        </div>`).join("")}
      <h3 style="color:#B8860B;margin:16px 0 10px;font-size:15px;">🛡️ Escalation History</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        ${[["May 10","Low","#7B1C2A"],["May 17","Moderate","#B8860B"],["May 24","Moderate","#B8860B"]].map(([d,l,c])=>`<tr><td style="padding:7px 10px;border-bottom:1px solid #f0e8ea;font-weight:700;">${d}</td><td style="padding:7px 10px;border-bottom:1px solid #f0e8ea;"><span style="color:${c};font-weight:800;">${l}</span></td></tr>`).join("")}
      </table>`,

    anomaly_detection:`
      <div style="background:#f4ecf7;border-left:4px solid #6C3483;padding:12px 16px;border-radius:8px;margin-bottom:18px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#6C3483;">⚡ Anomaly Detected: Behavioral Deviation in Mathematics</p>
        <p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#3A2828;">Unusual spike in <strong>${data.category}</strong> pattern identified compared to 4-week baseline.</p>
      </div>
      <h3 style="color:#6C3483;margin:0 0 10px;font-size:15px;">🔍 Identified Triggers</h3>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:13px;line-height:2.1;">
        <li>Transition from unstructured to structured activity.</li>
        <li>Sensory stimulus during 3rd period (noise/lighting).</li>
        <li>Mood state recorded as <strong>${data.mood}</strong> — potential stressor.</li>
        <li>Incident logged: <strong>${data.incident}</strong></li>
      </ul>
      <h3 style="color:#6C3483;margin:0 0 10px;font-size:15px;">📈 Deviation Summary</h3>
      <p style="font-size:13px;line-height:1.7;margin:0;">Baseline participation: 4.1/5 → Logged: ${data.participation}/5. Deviation: ${(4.1-data.participation).toFixed(1)} points below baseline.</p>`,

    predictive_alert:`
      <div style="background:#fdecea;border:2px solid #C0392B;border-radius:10px;padding:14px 18px;margin-bottom:18px;">
        <p style="margin:0;font-size:14px;font-weight:800;color:#C0392B;">🚨 Early Warning: Escalation Probability — 72%</p>
        <p style="margin:6px 0 0;font-size:12px;color:#5A4040;line-height:1.6;">Based on current trajectory, behavioral escalation may occur within 5–7 school days without intervention.</p>
      </div>
      <h3 style="color:#C0392B;margin:0 0 10px;font-size:15px;">⚡ Predicted Concerns (Next 2 Weeks)</h3>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:13px;line-height:2.1;">
        <li>Continued inattentiveness during Math periods.</li>
        <li>Possible increase in emotional dysregulation episodes.</li>
        <li>Reduced participation if current mood pattern persists.</li>
      </ul>
      <h3 style="color:#C0392B;margin:0 0 10px;font-size:15px;">🛡️ Preventive Actions</h3>
      <ul style="margin:0;padding-left:20px;font-size:13px;line-height:2.1;">
        <li>Implement daily behavior check-in sheet.</li>
        <li>Reduce task complexity in Math for 2 weeks.</li>
        <li>Increase frequency of positive reinforcement.</li>
        <li>Schedule parent meeting within 3 school days.</li>
      </ul>`,

    parent_teacher:`
      <div style="background:#f9f0f1;border-radius:10px;padding:14px 18px;margin-bottom:18px;">
        <p style="margin:0;font-size:13px;font-weight:700;">Dear Parent/Guardian of <strong>${data.student.name}</strong>,</p>
        <p style="margin:10px 0 0;font-size:13px;line-height:1.7;">We would like to share an update from your child's recent activity log dated <strong>${dateStr}</strong> during Mathematics class (3rd Period).</p>
      </div>
      <h3 style="color:#7B1C2A;margin:0 0 10px;font-size:15px;">📋 Session Summary</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
        ${[["Behavior Observed",data.category],["Mood",data.mood],["Participation",`${data.participation}/5`],["Incident",data.incident]].map(([k,v])=>`<tr><td style="padding:7px 10px;background:#f9f0f1;font-weight:700;width:40%;border-bottom:1px solid #e8d8da;">${k}</td><td style="padding:7px 10px;border-bottom:1px solid #f0e8ea;">${v}</td></tr>`).join("")}
      </table>
      <h3 style="color:#7B1C2A;margin:0 0 8px;font-size:15px;">🤝 How You Can Help at Home</h3>
      <ul style="margin:0 0 16px;padding-left:20px;font-size:13px;line-height:2.1;">
        <li>Maintain a consistent daily routine.</li>
        <li>Practice calm-down strategies together.</li>
        <li>Review and discuss homework in a quiet space.</li>
        <li>Reach out if you notice similar behaviors at home.</li>
      </ul>
      <p style="font-size:13px;line-height:1.7;margin:0;">We remain committed to supporting ${data.student.name}'s growth. Please feel free to schedule a conference at your convenience.</p>`,

    behavioral_summary:`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        ${[["Overall Risk","Moderate","#B8860B"],["Behavior Category",data.category,"#7B1C2A"],["Mood",""+data.mood,"#1A6B8A"],["Participation",""+data.participation+"/5","#1A7A4A"]].map(([l,v,c])=>`<div style="background:#f9f0f1;border-radius:10px;padding:12px 14px;border-left:3px solid ${c};"><div style="font-size:10px;text-transform:uppercase;letter-spacing:0.8px;color:#7A6060;font-weight:700;">${l}</div><div style="font-size:17px;font-weight:900;color:${c};margin-top:3px;">${v}</div></div>`).join("")}
      </div>
      <h3 style="color:#7B1C2A;margin:0 0 10px;font-size:15px;">📊 Behavioral Status Indicators</h3>
      ${[["Self-Regulation",62],["Social Engagement",70],["Task Completion",55],["Communication",68]].map(([l,v])=>`
        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:4px;"><span>${l}</span><span>${v}%</span></div>
          <div style="height:6px;background:#f0e8ea;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${v}%;background:linear-gradient(90deg,#5A1220,#7B1C2A);border-radius:3px;"></div></div>
        </div>`).join("")}
      <h3 style="color:#7B1C2A;margin:16px 0 10px;font-size:15px;">📝 Observations & Remarks</h3>
      <p style="font-size:13px;line-height:1.7;margin:0;">${data.obs||"No observation recorded this session."} ${data.remarks?`<br/><br/>${data.remarks}`:""}</p>`,

    competency_analytics:`
      <h3 style="color:#3A2828;margin:0 0 12px;font-size:15px;">📈 Competency Breakdown</h3>
      <div style="margin-bottom:20px;">
        ${[["Social & Emotional",["Social Engagement: 70%","Emotional Regulation: 62%","Peer Interaction: 58%"]],["Adaptive Behavior",["Task Completion: 55%","Task Independence: 61%","Transition Management: 67%"]],["Communication",["Functional Communication: 72%","Clear Expression: 65%","Response Clarity: 70%"]]].map(([cat,items])=>`
          <div style="margin-bottom:14px;">
            <div style="font-size:12px;font-weight:800;color:#7B1C2A;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:6px;">${cat}</div>
            <div style="background:#f9f0f1;border-radius:8px;padding:10px 14px;">${(items as string[]).map(i=>`<div style="font-size:12px;padding:3px 0;color:#3A2828;font-weight:600;">· ${i}</div>`).join("")}</div>
          </div>`).join("")}
      </div>
      <h3 style="color:#3A2828;margin:0 0 10px;font-size:15px;">🎯 Growth Targets</h3>
      <ul style="margin:0;padding-left:20px;font-size:13px;line-height:2.1;">
        <li>Increase task completion rate to 80% by end of quarter.</li>
        <li>Improve emotional regulation score by 15 points.</li>
        <li>Maintain social engagement above 75%.</li>
      </ul>`,
  };

  return`<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<title>${report.title} — ${data.student.name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Georgia','Times New Roman',serif;background:#fff;color:#1E1010;padding:0;}
  .page{max-width:760px;margin:0 auto;padding:40px 48px;}
  @media print{.no-print{display:none!important;}body{padding:0;}.page{padding:28px 36px;}}
  @page{margin:1.5cm;}
</style>
</head><body>
<div class="page">
  <!-- Header -->
  <div style="border-bottom:3px solid #7B1C2A;padding-bottom:18px;margin-bottom:24px;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
      <div>
        <div style="font-size:10px;font-weight:800;color:#C49A3C;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">SNED-LINK+ · Special Needs Education</div>
        <h1 style="font-size:22px;font-weight:900;color:#3D0C18;font-style:italic;margin:0 0 4px;">${report.title}</h1>
        <div style="font-size:12px;color:#7A6060;font-weight:700;">Generated: ${dateStr} at ${timeStr}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:11px;font-weight:700;color:#7A6060;">Student</div>
        <div style="font-size:15px;font-weight:900;color:#3D0C18;">${data.student.name}</div>
        <div style="font-size:11px;color:#7A6060;font-weight:700;">Section ${data.student.section} · Mathematics</div>
        <div style="margin-top:6px;display:inline-block;background:${report.color}15;color:${report.color};font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;border:1px solid ${report.color}30;text-transform:uppercase;letter-spacing:0.8px;">${report.tags[0]}</div>
      </div>
    </div>
  </div>
  <!-- Body -->
  <div style="font-size:13px;line-height:1.7;color:#1E1010;">
    ${sections[report.id]||"<p>Report content unavailable.</p>"}
  </div>
  <!-- Footer -->
  <div style="border-top:1.5px solid #e8d8da;margin-top:32px;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end;">
    <div style="font-size:11px;color:#7A6060;font-weight:700;line-height:1.7;">
      <div>Prepared by: ${data.student.teacher || 'Assigned Faculty'} · ${report.tags[0]} · Grade 7</div>
      <div>Report ID: RPT-${Date.now().toString(36).toUpperCase().slice(-8)}</div>
    </div>
    <div style="font-size:10px;color:#A89090;text-align:right;">
      <div>SNED-LINK+ System</div>
      <div>Confidential — For School Use Only</div>
    </div>
  </div>
</div>
<div class="no-print" style="background:#f9f0f1;border-top:2px solid #e8d8da;padding:14px 20px;display:flex;gap:10px;justify-content:center;position:sticky;bottom:0;">
  <button onclick="window.print()" style="background:linear-gradient(135deg,#7B1C2A,#3D0C18);color:#fff;border:none;border-radius:8px;padding:10px 22px;font-size:13px;font-weight:800;cursor:pointer;font-family:Georgia,serif;display:flex;align-items:center;gap:7px;">🖨️ Print / Save as PDF</button>
  <button onclick="window.close()" style="background:rgba(0,0,0,0.07);color:#3A2828;border:1px solid rgba(0,0,0,0.12);border-radius:8px;padding:10px 22px;font-size:13px;font-weight:800;cursor:pointer;font-family:Georgia,serif;">✕ Close</button>
</div>
</body></html>`;
}

// ── Primitives ─────────────────────────────────────────────────────────────
const Av:React.FC<{initials:string;size?:number}>=({initials,size=36})=>(
  <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${M.maroon},${M.maroonDeep})`,color:M.white,fontWeight:800,fontSize:size*0.33,fontFamily:TNR,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 12px ${M.maroon}50,inset 0 1px 0 rgba(255,255,255,0.2)`,letterSpacing:0.5}}>{initials}</div>
);
const Tag:React.FC<{children:React.ReactNode;color?:string}>=({children,color=M.maroon})=>(
  <span style={{background:color+"18",color,fontSize:9.5,fontWeight:800,padding:"3px 9px",borderRadius:20,fontFamily:TNR,letterSpacing:0.8,border:`1px solid ${color}30`,textTransform:"uppercase" as const}}>{children}</span>
);
const Card:React.FC<{children:React.ReactNode;style?:React.CSSProperties}>=({children,style={}})=>(
  <div style={{...glass({padding:18}),...style}}>{children}</div>
);
const Btn:React.FC<{children:React.ReactNode;onClick?:()=>void;variant?:"primary"|"secondary"|"ghost"|"gold"|"danger";style?:React.CSSProperties;disabled?:boolean}>=({children,onClick,variant="primary",style={},disabled=false})=>{
  const [hov,setHov]=useState(false);
  const v={
    primary:{background:`linear-gradient(135deg,${M.maroon},${M.maroonDeep})`,color:M.white,border:"1px solid rgba(255,255,255,0.15)",boxShadow:hov?`0 6px 20px ${M.maroon}55,inset 0 1px 0 rgba(255,255,255,0.15)`:`0 4px 16px ${M.maroon}45,inset 0 1px 0 rgba(255,255,255,0.15)`},
    secondary:{background:hov?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.75)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",color:M.g800,border:`1px solid rgba(0,0,0,0.12)`,boxShadow:hov?"0 4px 14px rgba(0,0,0,0.12)":"0 2px 8px rgba(0,0,0,0.07)"},
    ghost:{background:hov?"rgba(123,28,42,0.12)":"rgba(123,28,42,0.07)",color:M.maroon,border:`1px solid rgba(123,28,42,${hov?0.28:0.18})`,boxShadow:"none"},
    gold:{background:`linear-gradient(135deg,${M.gold},#8C6A1E)`,color:M.white,border:"1px solid rgba(255,255,255,0.15)",boxShadow:hov?`0 6px 20px ${M.gold}55`:`0 4px 16px ${M.gold}45`},
    danger:{background:hov?"rgba(192,57,43,0.12)":"rgba(192,57,43,0.07)",color:M.red,border:`1px solid rgba(192,57,43,0.25)`,boxShadow:"none"},
  };
  return <button onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick} disabled={disabled} style={{...v[variant],borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:700,fontFamily:TNR,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:8,opacity:disabled?0.5:1,transition:"all 0.18s",letterSpacing:0.2,transform:hov&&!disabled?"translateY(-1px)":"none",...style}}>{children}</button>;
};
const PBar:React.FC<{val:number;max?:number;color?:string;h?:number}>=({val,max=100,color=M.maroon,h=5})=>(
  <div style={{height:h,borderRadius:h,background:"rgba(0,0,0,0.07)",overflow:"hidden"}}>
    <div style={{height:"100%",width:`${(val/max)*100}%`,background:`linear-gradient(90deg,${color}cc,${color})`,borderRadius:h,transition:"width 0.7s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 0 6px ${color}60`}}/>
  </div>
);
const STitle:React.FC<{step?:number;total?:number;title:string;sub?:string}>=({step,total,title,sub})=>(
  <div style={{marginBottom:24}}>
    {step&&<div style={{fontSize:10,fontWeight:800,color:M.gold,letterSpacing:2,marginBottom:5,textTransform:"uppercase",fontFamily:TNR,display:"flex",alignItems:"center",gap:6}}><span style={{display:"inline-block",width:18,height:18,borderRadius:"50%",background:`linear-gradient(135deg,${M.gold},#8C6A1E)`,fontSize:9,fontWeight:900,color:M.white,textAlign:"center",lineHeight:"18px"}}>{step}</span> Step {step} of {total}</div>}
    <h2 style={{fontSize:22,fontWeight:800,color:M.maroonDeep,margin:"0 0 5px",fontFamily:TNR,fontStyle:"italic",letterSpacing:-0.3}}>{title}</h2>
    {sub&&<p style={{fontSize:12.5,color:M.g700,margin:0,fontFamily:TNR,fontWeight:600}}>{sub}</p>}
  </div>
);
const inputStyle:React.CSSProperties={width:"100%",padding:"10px 14px",border:"1.5px solid rgba(0,0,0,0.12)",borderRadius:10,fontSize:13,fontFamily:TNR,outline:"none",boxSizing:"border-box",color:M.g800,fontWeight:600,background:"rgba(255,255,255,0.75)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",transition:"border-color 0.15s,box-shadow 0.15s"};
const riskColor:Record<string,string>={low:M.green,moderate:M.amber,critical:M.red};

// ── Top Bar ────────────────────────────────────────────────────────────────
const TopBar:React.FC<{onLogout:()=>void;onHome:()=>void}>=({onLogout,onHome})=>{
  const { user } = useApp();
  return (
  <header style={{height:58,background:`linear-gradient(135deg,${M.maroonDeep} 0%,${M.maroon} 60%,${M.maroonMid} 100%)`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",flexShrink:0,boxShadow:`0 4px 24px ${M.maroonDeep}70`,position:"relative",zIndex:10,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)"}}/>
    <button onClick={onHome} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.2)"}}>
        <Icon name="sparkle" size={17} color={M.gold}/>
      </div>
      <div>
        <div style={{fontWeight:900,fontSize:15,color:M.white,fontFamily:TNR,fontStyle:"italic",letterSpacing:0.8}}>SNED-<span style={{color:M.gold}}>LINK+</span></div>
        <div style={{fontSize:9.5,color:"rgba(255,255,255,0.5)",letterSpacing:1.5,textTransform:"uppercase",fontFamily:TNR,fontWeight:600}}>Special Needs Education</div>
      </div>
    </button>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{position:"relative"}}>
        <button style={{width:36,height:36,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon name="bell" size={16} color="rgba(255,255,255,0.8)"/>
        </button>
        <span style={{position:"absolute",top:-4,right:-4,width:16,height:16,background:`linear-gradient(135deg,${M.gold},#9B7520)`,borderRadius:"50%",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",color:M.white,border:"1.5px solid rgba(255,255,255,0.9)"}}>3</span>
      </div>
      <div style={{width:1,height:26,background:"rgba(255,255,255,0.18)"}}/>
      <div style={{display:"flex",alignItems:"center",gap:9,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"5px 10px"}}>
        <Av initials={user?.name ? user.name.split(' ').map((n:any)=>n[0]).join('').slice(0,2) : 'T'} size={28}/>
        <div>
          <div style={{fontSize:12,fontWeight:800,color:M.white,fontFamily:TNR,lineHeight:1.2}}>{user?.name}</div>
          <div style={{fontSize:9.5,color:"rgba(255,255,255,0.8)",fontFamily:TNR,fontWeight:600}}>{user?.subject || 'Faculty'} · {user?.teacherId || 'Node'}</div>
        </div>
      </div>
      <button onClick={onLogout} style={{width:36,height:36,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Icon name="logout" size={15} color="rgba(255,255,255,0.65)"/>
      </button>
    </div>
  </header>
  );
};

// ── Step Bar ───────────────────────────────────────────────────────────────
const StepBar:React.FC<{current:number}>=({current})=>(
  <div style={{background:"rgba(255,255,255,0.7)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(123,28,42,0.1)",padding:"11px 28px",display:"flex",alignItems:"center",flexShrink:0,overflowX:"auto",boxShadow:"0 2px 12px rgba(61,12,24,0.06)"}}>
    {STEPS.map((s,i)=>(
      <div key={s.num} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:s.num<=current?`linear-gradient(135deg,${M.maroon},${M.maroonDeep})`:"rgba(0,0,0,0.07)",color:s.num<=current?M.white:M.g500,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:10,fontFamily:TNR,boxShadow:s.num===current?`0 4px 14px ${M.maroon}55`:s.num<current?`0 2px 8px ${M.maroon}35`:"none",border:s.num===current?"2px solid rgba(255,255,255,0.4)":"none",transition:"all 0.3s"}}>
            {s.num<current?<Icon name="check" size={12} color={M.white}/>:s.num}
          </div>
          <div style={{fontSize:8.5,fontWeight:s.num===current?800:600,color:s.num===current?M.maroon:s.num<current?M.maroonDark:M.g500,whiteSpace:"nowrap",textTransform:"uppercase",letterSpacing:0.7,fontFamily:TNR}}>{s.label}</div>
        </div>
        {i<STEPS.length-1&&<div style={{flex:1,height:2,marginBottom:14,background:s.num<current?`linear-gradient(90deg,${M.maroon},${M.maroonMid})`:"rgba(0,0,0,0.08)",borderRadius:2,transition:"background 0.3s"}}/>}
      </div>
    ))}
  </div>
);

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard:React.FC<{onStart:()=>void}>=({onStart})=>{
  const {user,students=[],iepRequests=[],updateIEPRequest}=useApp();
  const allWhitelistedStudents = useMemo(() => 
    students.filter((s: any) => s.status !== 'archived' && s.teacher === user?.name), 
    [students, user?.name]
  );

  const navigate=useNavigate();
  const stats=[
    {label:"Total Students",val:allWhitelistedStudents.length.toString(),icon:"users" as IName,color:M.maroon,sub:"From Whitelist"},
    {label:"Logs Today",val:"0",icon:"check" as IName,color:M.green,sub:"Section 3-F"},
    {label:"Pending Review",val:iepRequests.filter(r=>r.status==="pending").length.toString(),icon:"clock" as IName,color:M.amber,sub:"Needs action"},
    {label:"Active Alerts",val:"0",icon:"alert" as IName,color:M.red,sub:"Critical flags"},
  ];

  return(
    <div style={{padding:"22px 28px",maxWidth:960,margin:"0 auto"}}>
      {/* 📡 REAL-TIME TELEMETRY BAR */}
      {/*
      <div style={{...glass({padding:"10px 20px",marginBottom:20}),display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:isConnected?M.green:M.red,boxShadow:isConnected?`0 0 8px ${M.green}`:`0 0 8px ${M.red}`,animation:"pulse 2s infinite"}}/>
          <div style={{fontSize:10,fontWeight:800,color:M.g800,textTransform:"uppercase",letterSpacing:1,fontFamily:TNR}}>
            Node Status: {isConnected?'Linked to Mainframe':'Neural Link Severed'}
          </div>
        </div>
        {isConnected && (
          <div style={{fontSize:9,fontFamily:"monospace",color:M.g600,fontWeight:700}}>
            RTT: {latency}ms | Stream: v2.4 Active
          </div>
        )}
      </div>
      */}

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontSize:10,fontWeight:800,color:M.gold,letterSpacing:2,marginBottom:4,textTransform:"uppercase",fontFamily:TNR}}>Dashboard · May 24, 2025</div>
          <h1 style={{fontSize:22,fontWeight:900,color:M.maroonDeep,margin:"0 0 3px",fontFamily:TNR,fontStyle:"italic",letterSpacing:-0.3}}>Welcome back, {user?.name}</h1>
          <p style={{fontSize:12,color:M.g700,margin:0,fontFamily:TNR,fontWeight:600}}>{user?.subject || 'Faculty'} · {user?.teacherId || 'Node'}</p>
        </div>
        <Btn onClick={onStart}><Icon name="file" size={15} color={M.white}/> Start Activity Log</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {stats.map(s=>(
          <div key={s.label} style={{...glass({padding:"14px 16px"}),display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:s.color+"15",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${s.color}25`,flexShrink:0}}>
              <Icon name={s.icon} size={18} color={s.color}/>
            </div>
            <div>
              <div style={{fontSize:22,fontWeight:900,color:M.g800,fontFamily:TNR,lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:10,color:M.g800,fontWeight:800,textTransform:"uppercase",letterSpacing:0.5,fontFamily:TNR,marginTop:2}}>{s.label}</div>
              <div style={{fontSize:9.5,color:s.color,fontWeight:700,fontFamily:TNR}}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:14}}>
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:28,height:28,borderRadius:8,background:M.red+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon name="alert" size={14} color={M.red}/>
            </div>
            <span style={{fontSize:11,fontWeight:800,color:M.g800,textTransform:"uppercase",letterSpacing:1,fontFamily:TNR}}>Needs Attention</span>
          </div>
          {allWhitelistedStudents.filter((s: any) => s.riskLevel !== 'Low').slice(0, 3).map((s: any) => (
            <div key={s.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Av initials={s.initials || s.name.split(" ").map((w: any)=>w[0]).join("").slice(0,2)} size={32}/>
                <div>
                  <div style={{fontSize:12.5,fontWeight:800,color:M.g800,fontFamily:TNR}}>{s.name}</div>
                  <div style={{fontSize:10.5,color:M.g700,fontFamily:TNR,fontWeight:600}}>{s.grade}</div>
                </div>
              </div>
              <Tag color={riskColor[s.riskLevel?.toLowerCase()] || M.amber}>{s.riskLevel}</Tag>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:28,height:28,borderRadius:8,background:M.maroon+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon name="file" size={14} color={M.maroon}/>
            </div>
            <span style={{fontSize:11,fontWeight:800,color:M.g800,textTransform:"uppercase",letterSpacing:1,fontFamily:TNR}}>IEP Access Requests</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:TNR}}>
            <thead>
              <tr style={{borderBottom:"1.5px solid rgba(0,0,0,0.08)"}}>
                {["Student","Parent","Action"].map((h,i)=><th key={h} style={{padding:"7px 4px",color:M.g800,fontWeight:800,textAlign:i===2?"right":"left" as any,fontSize:10,textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {iepRequests.filter(r=>r.status==="pending").length>0?iepRequests.filter(r=>r.status==="pending").map(req=>(
                <tr key={req.id} style={{borderBottom:"1px solid rgba(0,0,0,0.04)"}}>
                  <td style={{padding:"10px 4px",fontWeight:800,color:M.g800}}>{req.studentName}</td>
                  <td style={{padding:"10px 4px",color:M.g700,fontWeight:600}}>{req.parentName}</td>
                  <td style={{padding:"10px 4px",textAlign:"right"}}>
                    <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
                      <button onClick={()=>updateIEPRequest(req.id,"approved")} style={{background:`linear-gradient(135deg,${M.maroon},${M.maroonDeep})`,color:M.white,border:"none",borderRadius:6,padding:"4px 9px",fontSize:9.5,cursor:"pointer",fontWeight:800}}>Approve</button>
                      <button onClick={()=>updateIEPRequest(req.id,"rejected")} style={{background:"rgba(0,0,0,0.07)",color:M.g700,border:"1px solid rgba(0,0,0,0.1)",borderRadius:6,padding:"4px 9px",fontSize:9.5,cursor:"pointer",fontWeight:800}}>Reject</button>
                    </div>
                  </td>
                </tr>
              )):<tr><td colSpan={3} style={{padding:"20px 0",textAlign:"center",color:M.g600,fontStyle:"italic",fontWeight:700}}>No pending requests</td></tr>}
            </tbody>
          </table>
          <div style={{marginTop:14,textAlign:"right"}}>
            <Btn variant="ghost" onClick={()=>navigate("/teacher/iep-requests")} style={{fontSize:11,padding:"7px 13px"}}>
              View All <Icon name="arrow" size={12} color={M.maroon}/>
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Select Student ─────────────────────────────────────────────────────────
const SelectStudent:React.FC<{onSelect:(s:any)=>void}>=({onSelect})=>{
  const { user, students = [] } = useApp();
  const [search,setSearch]=useState("");
  const allWhitelistedStudents = useMemo(() => 
    students.filter((s: any) => s.status !== 'archived' && s.teacher === user?.name), 
    [students, user?.name]
  );
  const filtered=allWhitelistedStudents.filter((s: any)=>s.name.toLowerCase().includes(search.toLowerCase()));
  return(
    <div style={{padding:"24px 28px",maxWidth:740,margin:"0 auto"}}>
      <STitle step={1} total={8} title="Select Student" sub="Choose a student to record an activity log for Mathematics."/>
      <div style={{position:"relative",marginBottom:18}}>
        <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon name="search" size={15} color={M.g500}/></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…" style={{...inputStyle,paddingLeft:36}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
        {filtered.map((s: any)=>(
          <div key={s.id} style={{...glass({padding:16}),display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Av initials={s.initials || "?"} size={40}/>
              <div>
                <div style={{fontWeight:800,fontSize:13,color:M.g800,fontFamily:TNR}}>{s.name}</div>
                <div style={{fontSize:10.5,color:M.g700,fontFamily:TNR,fontWeight:600,marginBottom:3}}>{s.grade}</div>
                <Tag color={riskColor[s.riskLevel?.toLowerCase()] || M.amber}>{s.riskLevel || 'N/A'}</Tag>
              </div>
            </div>
            <Btn onClick={()=>onSelect(s)} style={{justifyContent:"center",fontSize:12,padding:"8px"}}>
              Select <Icon name="arrow" size={13} color={M.white}/>
            </Btn>
          </div>
        ))}
      </div>
      <div style={{fontSize:11,color:M.g700,marginTop:14,fontFamily:TNR,fontWeight:700}}>Showing {filtered.length} of {allWhitelistedStudents.length} students</div>
    </div>
  );
};

// ── Select Session ─────────────────────────────────────────────────────────
const SelectSession:React.FC<{student:Student;onContinue:()=>void}>=({student,onContinue})=>{
  const { user } = useApp();
  const [date,setDate]=useState("2025-05-24");
  const [session,setSession]=useState("3rd Period - 10:30 AM - 11:30 AM");
  return(
    <div style={{padding:"24px 28px",maxWidth:460,margin:"0 auto"}}>
      <STitle step={1} total={8} title="Select Session" sub="Confirm date and period for this activity log."/>
      <div style={{...glass({padding:"14px 16px",marginBottom:20}),display:"flex",alignItems:"center",gap:12,borderLeft:`3px solid ${M.maroon}`}}>
        <Av initials={student.initials} size={42}/><div>
          <div style={{fontWeight:800,fontSize:14,color:M.maroonDeep,fontFamily:TNR}}>{student.name}</div>
          <div style={{fontSize:11.5,color:M.g700,fontFamily:TNR,fontWeight:700}}>{student.section}</div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {[
          {label:"Date",el:<input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inputStyle}/>},
          {label:"Period",el:<select value={session} onChange={e=>setSession(e.target.value)} style={inputStyle}>{["1st Period - 7:30 AM - 8:30 AM","2nd Period - 8:30 AM - 9:30 AM","3rd Period - 10:30 AM - 11:30 AM","4th Period - 1:00 PM - 2:00 PM","5th Period - 2:00 PM - 3:00 PM"].map(s=><option key={s}>{s}</option>)}</select>},
          {label:"Subject",el:<input value={user?.subject || "Mathematics"} readOnly style={{...inputStyle,background:"rgba(0,0,0,0.04)",color:M.g700}}/>},
        ].map(({label,el})=>(
          <div key={label}>
            <label style={{fontSize:10.5,fontWeight:800,color:M.g800,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.7,fontFamily:TNR}}>{label}</label>
            {el}
          </div>
        ))}
      </div>
      <Btn onClick={onContinue} style={{marginTop:22}}>Continue <Icon name="arrow" size={14} color={M.white}/></Btn>
    </div>
  );
};

// ── Activity Log ───────────────────────────────────────────────────────────
// Shared state type so parent can pass it along
export interface LogState{obs:string;category:string;mood:string;participation:number;incident:string;interventions:Record<string,boolean>;remarks:string;}

const ActivityLog:React.FC<{student:Student;onSave:(state:LogState)=>void}>=({student,onSave})=>{
  const [obs,setObs]=useState("");
  const [category,setCategory]=useState(BEHAVIOR_CATEGORIES[0].label);
  const [mood,setMood]=useState("Happy");
  const [participation,setParticipation]=useState(3);
  const [incident,setIncident]=useState("No Incident");
  const [interventions,setInterventions]=useState<Record<string,boolean>>({"Verbal Reminder":true,"Seat Adjustment":false,"Task Modification":false,"Counseling / Check-in":false,"Referral to Guidance":false,"Positive Reinforcement":false});
  const [remarks,setRemarks]=useState("");
  const [saved,setSaved]=useState(false);

  const moods=[{label:"Happy",icon:"😊"},{label:"Anxious",icon:"😰"},{label:"Frustrated",icon:"😤"},{label:"Fatigued",icon:"😴"},{label:"Sad",icon:"😢"}];
  const incidents=["No Incident","Minor Disruption","Behavioral Incident","Physical Aggression"];
  const incidentColor=(i:string)=>i==="No Incident"?M.green:i==="Minor Disruption"?M.amber:M.red;

  const sLabel=(icon:IName,label:string)=>(
    <div style={{fontSize:10.5,fontWeight:800,color:M.g800,display:"flex",alignItems:"center",gap:7,marginBottom:10,textTransform:"uppercase" as const,letterSpacing:0.7,fontFamily:TNR}}>
      <div style={{width:22,height:22,borderRadius:7,background:M.maroon+"14",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={icon} size={12} color={M.maroon}/></div>{label}
    </div>
  );

  const handleSave=()=>{
    setSaved(true);
    setTimeout(()=>onSave({obs,category,mood,participation,incident,interventions,remarks}),600);
  };

  return(
    <div style={{padding:"24px 28px",maxWidth:680,margin:"0 auto"}}>
      <STitle step={2} total={8} title="Activity Log" sub={`${student.name} · Math · May 24, 2025`}/>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Card>
          {sLabel("file","Observation")}
          <textarea value={obs} onChange={e=>setObs(e.target.value)} placeholder="Describe observed behavior in detail…" style={{...inputStyle,minHeight:80,resize:"vertical",lineHeight:1.7}}/>
          <div style={{fontSize:10.5,color:obs.length>450?M.red:M.g700,textAlign:"right",marginTop:4,fontFamily:TNR,fontWeight:700}}>{obs.length}/500</div>
        </Card>

        {/* ── Behavior Category — split positive / negative ── */}
        <Card>
          {sLabel("brain","Behavior Category")}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {/* Positive */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"6px 10px",background:"rgba(26,122,74,0.07)",borderRadius:8,border:"1px solid rgba(26,122,74,0.15)"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:M.green,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="thumbsUp" size={9} color="#fff"/></div>
                <span style={{fontSize:10.5,fontWeight:800,color:M.green,textTransform:"uppercase" as const,letterSpacing:0.8,fontFamily:TNR}}>Positive Behaviors</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {POSITIVE_CATS.map(c=>(
                  <button key={c.label} title={c.desc} onClick={()=>setCategory(c.label)} style={{padding:"6px 11px",borderRadius:8,border:"1.5px solid",borderColor:category===c.label?M.green:"rgba(0,0,0,0.08)",background:category===c.label?"rgba(26,122,74,0.1)":"rgba(255,255,255,0.5)",color:category===c.label?M.green:M.g700,fontSize:11.5,fontFamily:TNR,fontWeight:category===c.label?800:600,cursor:"pointer",textAlign:"left",transition:"all 0.13s",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:category===c.label?M.green:"rgba(0,0,0,0.15)",flexShrink:0,display:"inline-block"}}/>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Negative */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"6px 10px",background:"rgba(192,57,43,0.07)",borderRadius:8,border:"1px solid rgba(192,57,43,0.15)"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:M.red,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="alert" size={9} color="#fff"/></div>
                <span style={{fontSize:10.5,fontWeight:800,color:M.red,textTransform:"uppercase" as const,letterSpacing:0.8,fontFamily:TNR}}>Concerning Behaviors</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {NEGATIVE_CATS.map(c=>(
                  <button key={c.label} title={c.desc} onClick={()=>setCategory(c.label)} style={{padding:"6px 11px",borderRadius:8,border:"1.5px solid",borderColor:category===c.label?M.red:"rgba(0,0,0,0.08)",background:category===c.label?"rgba(192,57,43,0.09)":"rgba(255,255,255,0.5)",color:category===c.label?M.red:M.g700,fontSize:11.5,fontFamily:TNR,fontWeight:category===c.label?800:600,cursor:"pointer",textAlign:"left",transition:"all 0.13s",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:category===c.label?M.red:"rgba(0,0,0,0.15)",flexShrink:0,display:"inline-block"}}/>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {category&&(
            <div style={{marginTop:10,padding:"8px 12px",background:BEHAVIOR_CATEGORIES.find(c=>c.label===category)?.type==="positive"?"rgba(26,122,74,0.07)":"rgba(192,57,43,0.07)",borderRadius:8,fontSize:11.5,color:M.g800,fontFamily:TNR,fontWeight:700,borderLeft:`3px solid ${BEHAVIOR_CATEGORIES.find(c=>c.label===category)?.type==="positive"?M.green:M.red}`}}>
              Selected: <strong>{category}</strong> — {BEHAVIOR_CATEGORIES.find(c=>c.label===category)?.desc}
            </div>
          )}
        </Card>

        <Card>
          {sLabel("star","Mood")}
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {moods.map(m=>(
              <button key={m.label} onClick={()=>setMood(m.label)} style={{padding:"7px 15px",borderRadius:10,border:"1.5px solid",borderColor:mood===m.label?M.maroon:"rgba(0,0,0,0.1)",background:mood===m.label?"rgba(123,28,42,0.09)":"rgba(255,255,255,0.6)",color:mood===m.label?M.maroon:M.g700,fontSize:12,fontFamily:TNR,fontWeight:mood===m.label?800:600,cursor:"pointer",transition:"all 0.15s"}}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          {sLabel("activity",`Participation Level — ${participation}/5`)}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <span style={{fontSize:10.5,color:M.g700,fontFamily:TNR,fontWeight:700}}>Low</span>
            <input type="range" min="1" max="5" step="1" value={participation} onChange={e=>setParticipation(+e.target.value)} style={{flex:1,accentColor:M.maroon}}/>
            <span style={{fontSize:10.5,color:M.g700,fontFamily:TNR,fontWeight:700}}>High</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            {[1,2,3,4,5].map(n=>(
              <div key={n} style={{width:20,height:20,borderRadius:"50%",background:n<=participation?M.maroon:"rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:n<=participation?M.white:"transparent"}}/>
              </div>
            ))}
          </div>
        </Card>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            {sLabel("alert","Incident")}
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {incidents.map(inc=>(
                <button key={inc} onClick={()=>setIncident(inc)} style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid",borderColor:incident===inc?incidentColor(inc):"rgba(0,0,0,0.09)",background:incident===inc?incidentColor(inc)+"12":"rgba(255,255,255,0.55)",color:incident===inc?incidentColor(inc):M.g700,fontSize:11.5,fontFamily:TNR,fontWeight:incident===inc?800:600,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>{inc}</button>
              ))}
            </div>
          </Card>
          <Card>
            {sLabel("target","Interventions")}
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {Object.keys(interventions).map(k=>(
                <label key={k} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,cursor:"pointer",color:interventions[k]?M.maroon:M.g800,fontFamily:TNR,fontWeight:700,padding:"4px 8px",borderRadius:7,background:interventions[k]?"rgba(123,28,42,0.06)":"transparent",border:`1px solid ${interventions[k]?"rgba(123,28,42,0.15)":"transparent"}`,transition:"all 0.15s"}}>
                  <input type="checkbox" checked={interventions[k]} onChange={()=>setInterventions(p=>({...p,[k]:!p[k]}))} style={{accentColor:M.maroon,width:14,height:14}}/> {k}
                </label>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          {sLabel("file","Remarks")}
          <textarea value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Additional notes…" style={{...inputStyle,minHeight:60,resize:"vertical",lineHeight:1.7}}/>
        </Card>
      </div>
      <div style={{display:"flex",gap:10,marginTop:20}}>
        <Btn onClick={handleSave} disabled={saved}><Icon name="save" size={15} color={M.white}/> {saved?"Saving…":"Save Activity Log"}</Btn>
        <Btn variant="secondary">Save Draft</Btn>
      </div>
    </div>
  );
};

// ── Save Confirmation ──────────────────────────────────────────────────────
const SaveConfirmation:React.FC<{student:Student;onProceed:()=>void}>=({student,onProceed})=>(
  <div style={{padding:"24px 28px",maxWidth:460,margin:"0 auto"}}>
    <div style={{textAlign:"center",marginBottom:26}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${M.maroon},${M.maroonDeep})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 8px 28px ${M.maroon}50`,border:"3px solid rgba(255,255,255,0.6)"}}>
        <Icon name="check" size={36} color={M.white}/>
      </div>
      <h2 style={{fontSize:20,fontWeight:900,color:M.maroon,margin:"0 0 6px",fontFamily:TNR,fontStyle:"italic"}}>Activity Log Saved</h2>
      <p style={{color:M.g700,margin:0,fontSize:12.5,fontFamily:TNR,fontWeight:700}}>Recorded and synced successfully.</p>
    </div>
    <Card style={{marginBottom:20}}>
      {[["Student",student.name],["Subject","Mathematics"],["Session","May 24, 2025 — 3rd Period"],["Saved At","10:42 AM"],["Status","✓ Synced"]].map(([k,v])=>(
        <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(0,0,0,0.05)",fontSize:12.5,fontFamily:TNR}}>
          <span style={{color:M.g700,fontWeight:700}}>{k}</span>
          <span style={{fontWeight:800,color:k==="Status"?M.maroon:M.g800}}>{v}</span>
        </div>
      ))}
    </Card>
    <Btn onClick={onProceed} style={{width:"100%",justifyContent:"center"}}>
      Proceed to AI Analysis <Icon name="sparkle" size={15} color={M.white}/>
    </Btn>
  </div>
);

// This is where the ML Integration happens
interface MLResult {
  category: string;
  confidence: number;
  recommendation: string;
  top3: { category: string; confidence: number }[];
}

const MODEL_POS_SET = new Set(["Self-Regulation","Social Engagement","Functional Communication","Sustained Attention","Emotional Regulation","Task Completion","Learning Progress","Organized Work Habits"]);
const MODEL_NEG_SET = new Set(["Sensory Overload","Self-Harm","Social Difficulty","Inattention","Hyperactivity","Emotional Outbursts","Aggression","Communication Difficulty"]);

async function fetchMLRecommendation(logData: LogState, student: Student): Promise<MLResult | null> {
  const activeInterventions = Object.entries(logData.interventions).filter(([,v])=>v).map(([k])=>k);
  const posInds = MODEL_POS_SET.has(logData.category) ? [logData.category] : [];
  const negInds = MODEL_NEG_SET.has(logData.category) ? [logData.category] : [];
  try {
    const res = await fetch("http://127.0.0.1:8000/api/ml-recommend", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        student_name: student.name,
        subject: "Mathematics",
        observation_text: logData.obs,
        mood: logData.mood,
        participation_level: logData.participation,
        incident_report: logData.incident,
        interventions_applied: activeInterventions,
        positive_indicators: posInds,
        negative_indicators: negInds,
        teacher_remarks: logData.remarks,
      }),
    });
    if (!res.ok) return null;
    return await res.json() as MLResult;
  } catch { return null; }
}

const CATEGORY_LABELS: Record<string,string> = {
  ANXIETY_SUPPORT:               "Anxiety Support",
  BEHAVIORAL_ANXIOUS:            "Behavioral (Anxious)",
  BEHAVIORAL_FATIGUED:           "Behavioral (Fatigued)",
  BEHAVIORAL_FRUSTRATED:         "Behavioral (Frustrated)",
  BEHAVIORAL_SAD:                "Behavioral (Sad)",
  EMOTIONAL_SUPPORT_SAD:         "Emotional Support",
  ENTHUSIASM_MANAGEMENT:         "Enthusiasm Management",
  EXCELLENT_PERFORMANCE:         "Excellent Performance",
  FATIGUE_SUPPORT:               "Fatigue Support",
  FRUSTRATION_HIGH_PARTICIPATION:"Frustration – High Participation",
  FRUSTRATION_LOW_PARTICIPATION: "Frustration – Low Participation",
  GENERAL_MIXED:                 "General Mixed Profile",
  PHYSICAL_AGGRESSION:           "Physical Aggression",
  URGENT_SELF_HARM:              "Urgent: Self-Harm",
};

const CATEGORY_RISK: Record<string,{level:string;color:string}> = {
  URGENT_SELF_HARM:               {level:"CRITICAL RISK", color:M.red},
  PHYSICAL_AGGRESSION:            {level:"CRITICAL RISK", color:M.red},
  BEHAVIORAL_FRUSTRATED:          {level:"HIGH RISK",     color:M.red},
  BEHAVIORAL_ANXIOUS:             {level:"HIGH RISK",     color:M.red},
  BEHAVIORAL_SAD:                 {level:"HIGH RISK",     color:M.red},
  BEHAVIORAL_FATIGUED:            {level:"MODERATE RISK", color:M.amber},
  FRUSTRATION_LOW_PARTICIPATION:  {level:"MODERATE RISK", color:M.amber},
  ANXIETY_SUPPORT:                {level:"MODERATE RISK", color:M.amber},
  FRUSTRATION_HIGH_PARTICIPATION: {level:"MODERATE RISK", color:M.amber},
  FATIGUE_SUPPORT:                {level:"MODERATE RISK", color:M.amber},
  EMOTIONAL_SUPPORT_SAD:          {level:"MODERATE RISK", color:M.amber},
  ENTHUSIASM_MANAGEMENT:          {level:"LOW RISK",      color:M.green},
  GENERAL_MIXED:                  {level:"LOW RISK",      color:M.green},
  EXCELLENT_PERFORMANCE:          {level:"LOW RISK",      color:M.green},
};

// ── AI Analysis ────────────────────────────────────────────────────────────
const AIAnalysis:React.FC<{student:Student;logData:LogState|null;onNext:(r:MLResult|null)=>void}>=({student,logData,onNext})=>{

  const [progress,setProgress]=useState(0);
  const [mlResult,setMlResult]=useState<MLResult|null>(null);
  const [apiDone,setApiDone]=useState(false);
  const done=progress>=95&&apiDone;

  useEffect(()=>{
    const iv=setInterval(()=>setProgress(p=>p>=95?95:p+3),70);
    (async()=>{
      if(logData){const r=await fetchMLRecommendation(logData,student);setMlResult(r);}
      setApiDone(true);
    })();
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{if(apiDone&&progress>=95)setProgress(100);},[apiDone]);

  const riskInfo=mlResult?(CATEGORY_RISK[mlResult.category]||{level:"MODERATE RISK",color:M.amber}):null;
  const catLabel=mlResult?(CATEGORY_LABELS[mlResult.category]||mlResult.category):"—";

  return(
    <div style={{padding:"24px 28px",maxWidth:700,margin:"0 auto"}}>
      <STitle step={4} total={8} title="AI Behavioral Analysis" sub="Running SVM model on session inputs for behavioral classification."/>
      {!done?(
        <Card style={{textAlign:"center",padding:"48px 28px"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:`rgba(123,28,42,0.08)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}><Icon name="brain" size={34} color={M.maroon}/></div>
          <div style={{fontWeight:900,fontSize:15,color:M.g800,marginBottom:7,fontFamily:TNR}}>Running Behavioral Analysis…</div>
          <p style={{color:M.g700,fontSize:12.5,marginBottom:24,fontFamily:TNR,fontWeight:600}}>
            {apiDone?"Processing complete. Finalizing results…":"Classifying observation, mood, incident, and intervention data."}
          </p>
          <div style={{maxWidth:340,margin:"0 auto"}}>
            <PBar val={progress} color={M.maroon} h={8}/>
            <div style={{fontSize:11.5,color:M.g700,marginTop:8,fontFamily:TNR,fontWeight:700}}>{progress}% complete</div>
          </div>
        </Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* Session Input Summary */}
            <Card>
              <div style={{fontSize:10,fontWeight:800,color:M.g800,textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontFamily:TNR}}>Session Input</div>
              {([["Student",student.name],["Mood",logData?.mood||"—"],["Participation",`${logData?.participation||0}/5`],["Incident",logData?.incident||"—"],["Category",logData?.category||"—"]] as [string,string][]).map(([k,v])=>(
                <div key={k} style={{marginBottom:9}}>
                  <div style={{fontSize:9.5,color:M.g700,fontWeight:800,textTransform:"uppercase",fontFamily:TNR,letterSpacing:0.5}}>{k}</div>
                  <div style={{fontSize:12.5,fontWeight:800,color:M.g800,fontFamily:TNR,wordBreak:"break-word"}}>{v}</div>
                </div>
              ))}
            </Card>
            {/* ML Prediction Result */}
            <Card style={{borderLeft:`3px solid ${mlResult?riskInfo!.color:M.maroon}`}}>
              <div style={{fontSize:10,fontWeight:800,color:mlResult?riskInfo!.color:M.maroon,textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontFamily:TNR,display:"flex",alignItems:"center",gap:6}}>
                <Icon name="sparkle" size={13} color={mlResult?riskInfo!.color:M.maroon}/> ML Prediction




              </div>
              {mlResult?(
                <>
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9.5,color:M.g700,fontWeight:800,textTransform:"uppercase",fontFamily:TNR,letterSpacing:0.5,marginBottom:4}}>Predicted Category</div>
                    <div style={{fontSize:13.5,fontWeight:900,color:riskInfo!.color,fontFamily:TNR,fontStyle:"italic",marginBottom:5}}>{catLabel}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <Tag color={riskInfo!.color}>{riskInfo!.level}</Tag>
                      <span style={{fontSize:11,color:M.g700,fontFamily:TNR,fontWeight:700}}>Confidence: {mlResult.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                  {mlResult.top3.length>0&&(
                    <div style={{background:"rgba(0,0,0,0.03)",borderRadius:9,padding:"9px 11px",border:"1px solid rgba(0,0,0,0.06)"}}>
                      <div style={{fontSize:9.5,fontWeight:800,color:M.g800,textTransform:"uppercase",letterSpacing:0.5,marginBottom:7,fontFamily:TNR}}>Top Predictions</div>
                      {mlResult.top3.map(t=>{
                        const ti=CATEGORY_RISK[t.category];
                        return(
                          <div key={t.category} style={{marginBottom:6}}>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,marginBottom:3,fontFamily:TNR}}>
                              <span style={{color:M.g800,fontWeight:700}}>{CATEGORY_LABELS[t.category]||t.category}</span>
                              <span style={{fontWeight:900,color:ti?.color||M.g600}}>{t.confidence.toFixed(1)}%</span>
                            </div>
                            <PBar val={t.confidence} color={ti?.color||M.g600} h={4}/>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ):(
                <div style={{padding:"14px 0",fontSize:12.5,color:M.amber,fontFamily:TNR,fontWeight:700,display:"flex",flexDirection:"column",gap:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}><Icon name="alert" size={14} color={M.amber}/> API Unreachable</div>
                  <div style={{fontSize:11,color:M.g700,fontWeight:600,lineHeight:1.6}}>Ensure the FastAPI backend is running on <strong>localhost:8000</strong>.</div>
                </div>
              )}
            </Card>
          </div>
          {/* Personalized Recommendation */}
          {mlResult&&(
            <Card style={{borderLeft:`3px solid ${riskInfo!.color}`}}>
              <div style={{fontSize:10,fontWeight:800,color:riskInfo!.color,textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontFamily:TNR,display:"flex",alignItems:"center",gap:6}}>
                <Icon name="target" size={13} color={riskInfo!.color}/> Personalized Recommendation




              </div>
              <p style={{fontSize:13,color:M.g800,margin:0,lineHeight:1.8,fontFamily:TNR,fontWeight:700}}>{mlResult.recommendation}</p>
            </Card>
          )}
          <Btn onClick={()=>onNext(mlResult)}>Next: Risk Classification <Icon name="arrow" size={14} color={M.white}/></Btn>
        </div>
      )}
    </div>
  );
};

// ── Risk Classification ────────────────────────────────────────────────────
const RiskClassification:React.FC<{student:Student;mlResult:MLResult|null;onNext:()=>void}>=({student,mlResult,onNext})=>{
  const riskInfo=mlResult?(CATEGORY_RISK[mlResult.category]||{level:"MODERATE RISK",color:M.amber}):{level:"MODERATE RISK",color:M.amber};
  const catLabel=mlResult?(CATEGORY_LABELS[mlResult.category]||mlResult.category):"Awaiting analysis";
  // Split recommendation into sentences for bullet-point display
  const recBullets:string[]=mlResult?.recommendation
    ? mlResult.recommendation.match(/[^.!?]+[.!?]+/g)?.map(s=>s.trim()).filter(s=>s.length>2)||[mlResult.recommendation]
    : ["Structured attention support recommended.","Encourage active participation.","Continue behavioral monitoring.","Parent communication recommended.","Counselor check-in within 1 week."];

  return(
    <div style={{padding:"24px 28px",maxWidth:700,margin:"0 auto"}}>
      <STitle step={5} total={8} title="Risk Classification & XAI" sub="AI-powered risk assessment with explainable AI transparency."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Risk Level Card */}
          <Card style={{background:`${riskInfo.color}08`,borderLeft:`3px solid ${riskInfo.color}`}}>
            <div style={{fontSize:10,color:riskInfo.color,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontFamily:TNR}}>Risk Level</div>
            <div style={{display:"flex",alignItems:"center",gap:13}}>
              <div style={{width:48,height:48,borderRadius:14,background:riskInfo.color+"18",display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${riskInfo.color}30`,flexShrink:0}}>
                <Icon name="alert" size={26} color={riskInfo.color}/>
              </div>
              <div>
                <div style={{fontSize:16,fontWeight:900,color:riskInfo.color,fontFamily:TNR,fontStyle:"italic"}}>{riskInfo.level}</div>
                <div style={{fontSize:11,color:M.g700,marginTop:3,fontFamily:TNR,fontWeight:700,fontStyle:"italic"}}>{catLabel}</div>
                {mlResult&&<div style={{fontSize:10.5,color:M.g700,marginTop:2,fontFamily:TNR,fontWeight:600}}>Model confidence: {mlResult.confidence.toFixed(1)}%</div>}
              </div>
            </div>
          </Card>
          {/* Recommendations */}
          <Card>
            <div style={{fontSize:12,fontWeight:800,color:M.g800,marginBottom:12,fontFamily:TNR,display:"flex",alignItems:"center",gap:7}}>
              <Icon name="target" size={15} color={M.maroon}/> {mlResult?"AI Recommendations":"Default Recommendations"}



            </div>
            {recBullets.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:9,marginBottom:9,fontSize:12.5,fontFamily:TNR}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:M.maroon+"14",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  <Icon name="check" size={10} color={M.maroon}/>
                </div>
                <span style={{color:M.g800,fontWeight:700,lineHeight:1.5}}>{r}</span>






              </div>
            ))}
          </Card>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* XAI Explanation */}
          <Card>
            <div style={{fontSize:12,fontWeight:800,color:M.g800,marginBottom:12,fontFamily:TNR,display:"flex",alignItems:"center",gap:7}}>
              <Icon name="eye" size={15} color={M.maroon}/> XAI Explanation


            </div>
            <p style={{fontSize:12.5,color:M.g800,lineHeight:1.7,margin:"0 0 14px",fontFamily:TNR,fontWeight:700}}>
              <strong>{riskInfo.level}</strong> assigned based on ML prediction of <strong>{catLabel}</strong> for {student.name}.
            </p>
            {mlResult?.top3?.length?(
              mlResult.top3.map(t=>{
                const ti=CATEGORY_RISK[t.category];
                return(
                  <div key={t.category} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,marginBottom:4,fontFamily:TNR}}>
                      <span style={{color:M.g700,fontWeight:700}}>{CATEGORY_LABELS[t.category]||t.category}</span>
                      <span style={{fontWeight:900,color:ti?.color||M.g600}}>{t.confidence.toFixed(1)}%</span>
                    </div>
                    <PBar val={t.confidence} color={ti?.color||M.g600} h={5}/>
                  </div>
                );
              })
            ):(
              [{label:"Behavior Confidence",val:mlResult?.confidence||68,color:riskInfo.color},{label:"Session Participation",val:(mlResult?mlResult.confidence*0.9:60),color:M.maroon}].map(b=>(
                <div key={b.label} style={{marginBottom:9}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,marginBottom:4,fontFamily:TNR}}>
                    <span style={{color:M.g700,fontWeight:700}}>{b.label}</span>
                    <span style={{fontWeight:900,color:b.color}}>{b.val.toFixed(1)}%</span>
                  </div>
                  <PBar val={b.val} color={b.color} h={5}/>
                </div>
              ))
            )}
          </Card>
          {/* Escalation History */}
          <Card>
            <div style={{fontSize:12,fontWeight:800,color:M.g800,marginBottom:10,fontFamily:TNR}}>Session Summary</div>
            {[
              {label:"Risk Classification",val:riskInfo.level,dot:riskInfo.color},
              {label:"Category",val:catLabel,dot:M.maroon},
              {label:"Confidence",val:mlResult?`${mlResult.confidence.toFixed(1)}%`:"—",dot:M.sky},
            ].map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"7px 0",borderBottom:i<2?"1px solid rgba(0,0,0,0.05)":"none",fontFamily:TNR}}>
                <span style={{color:M.g700,fontWeight:700}}>{h.label}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:h.dot,boxShadow:`0 0 6px ${h.dot}60`}}/>
                  <span style={{color:M.g800,fontWeight:800,fontSize:11}}>{h.val}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <Btn onClick={onNext}>Next: Notifications <Icon name="arrow" size={14} color={M.white}/></Btn>
    </div>
  );
};

// ── Notifications ──────────────────────────────────────────────────────────
const Notifications:React.FC<{student:Student;mlResult:MLResult|null;onNext:()=>void}>=({student,mlResult,onNext})=>{
  const riskInfo=mlResult?(CATEGORY_RISK[mlResult.category]||{level:"MODERATE RISK",color:M.amber}):{level:"MODERATE RISK",color:M.amber};
  const catLabel=mlResult?(CATEGORY_LABELS[mlResult.category]||mlResult.category):"behavioral concern";
  const isUrgent=mlResult&&["URGENT_SELF_HARM","PHYSICAL_AGGRESSION","BEHAVIORAL_FRUSTRATED","BEHAVIORAL_ANXIOUS","BEHAVIORAL_SAD"].includes(mlResult.category);
  const firstSentence=mlResult?.recommendation?.match(/[^.!?]+[.!?]/)?.[0]||"Behavioral concern detected requiring follow-up.";
  const nots=[
    {icon:"users" as IName,title:"Parent Notification",to:`${student.name}'s Parent/Guardian`,reason:`${firstSentence} ${riskInfo.level} assigned.`,time:"10:45 AM"},
    {icon:"home" as IName,title:"Admin / Principal",to:"School Administrator",reason:`${riskInfo.level} detected for ${student.name} — Category: ${catLabel}.`,time:"10:45 AM"},
    {icon:"shield" as IName,title:"Guidance Counselor",to:"School Guidance Office",reason:`${student.name} flagged for ${catLabel}. ${isUrgent?"Immediate":"Routine"} counseling session recommended.`,time:"10:46 AM"},
  ];
  return(
    <div style={{padding:"24px 28px",maxWidth:540,margin:"0 auto"}}>
      <STitle step={6} total={8} title="Notification Triggers" sub="Automated alerts sent based on risk assessment."/>
      {nots.map((n,i)=>(
        <Card key={i} style={{marginBottom:12,display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${M.maroon}14,${M.maroon}06)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${M.maroon}18`}}><Icon name={n.icon} size={20} color={M.maroon}/></div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
              <div>
                <div style={{fontWeight:800,fontSize:13,color:M.g800,fontFamily:TNR}}>{n.title}</div>
                <div style={{fontSize:10.5,color:M.g700,fontFamily:TNR,fontWeight:700}}>To: {n.to}</div>
              </div>
              <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
                <Tag color={M.maroon}>✓ Sent</Tag>
                <span style={{fontSize:10.5,color:M.g700,fontFamily:TNR,fontWeight:700}}>{n.time}</span>
              </div>
            </div>
            <p style={{fontSize:12,color:M.g700,margin:0,lineHeight:1.6,fontFamily:TNR,fontWeight:700}}>{n.reason}</p>
          </div>
        </Card>
      ))}
      <Btn onClick={onNext} style={{marginTop:8}}>Next: Analytics <Icon name="arrow" size={14} color={M.white}/></Btn>
    </div>
  );
};

// ── Analytics ──────────────────────────────────────────────────────────────
const Analytics:React.FC<{student:Student;onNext:()=>void}>=({student,onNext})=>{
  const [tab,setTab]=useState("trends");
  const tabs=[{id:"trends",label:"Trends"},{id:"intervention",label:"Interventions"},{id:"subjects",label:"Subjects"},{id:"progress",label:"Progress"}];
  const W=460,H=120,PAD=24,maxV=8;
  const dates=["Apr 1","Apr 8","Apr 15","May 1","May 8","May 15","May 24"];
  const inatt=[3,4,5,4,6,5,7];const coop=[5,4,3,5,4,6,5];const hyper=[1,2,1,3,2,3,2];
  const xP=(i:number)=>PAD+(i/(dates.length-1))*(W-PAD*2);
  const yP=(v:number)=>H-PAD-(v/maxV)*(H-PAD*2);
  const toPath=(arr:number[])=>arr.map((v,i)=>`${i===0?"M":"L"}${xP(i)},${yP(v)}`).join(" ");
  return(
    <div style={{padding:"24px 28px",maxWidth:720,margin:"0 auto"}}>
      <STitle step={7} total={8} title="Behavioral Analytics" sub="Data-driven insights on student behavior and interventions."/>
      <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 16px",borderRadius:10,border:"1.5px solid",borderColor:tab===t.id?M.maroon:"rgba(0,0,0,0.1)",background:tab===t.id?"rgba(123,28,42,0.09)":"rgba(255,255,255,0.65)",color:tab===t.id?M.maroon:M.g700,fontSize:12.5,fontFamily:TNR,fontWeight:tab===t.id?800:700,cursor:"pointer",transition:"all 0.15s"}}>{t.label}</button>
        ))}
      </div>
      {tab==="trends"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card>
            <div style={{fontSize:12.5,fontWeight:800,color:M.g800,marginBottom:14,fontFamily:TNR}}>Behavior Trend Over Time</div>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
              {dates.map((d,i)=><text key={d} x={xP(i)} y={H-6} textAnchor="middle" fontSize="8" fill={M.g600} fontFamily={TNR} fontWeight="700">{d}</text>)}
              {[0,2,4,6,8].map(v=><line key={v} x1={PAD} y1={yP(v)} x2={W-PAD} y2={yP(v)} stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>)}
              <path d={toPath(inatt)} fill="none" stroke={M.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d={toPath(coop)} fill="none" stroke={M.maroon} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d={toPath(hyper)} fill="none" stroke={M.amber} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              {inatt.map((v,i)=><circle key={i} cx={xP(i)} cy={yP(v)} r="3.5" fill={M.red} stroke={M.white} strokeWidth="1.5"/>)}
              {coop.map((v,i)=><circle key={i} cx={xP(i)} cy={yP(v)} r="3.5" fill={M.maroon} stroke={M.white} strokeWidth="1.5"/>)}
            </svg>
            <div style={{display:"flex",gap:14,marginTop:6}}>
              {[["Inattentive",M.red],["Cooperative",M.maroon],["Hyperactive",M.amber]].map(([l,c])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10.5,fontFamily:TNR}}>
                  <div style={{width:14,height:3,borderRadius:2,background:c}}/><span style={{color:M.g700,fontWeight:700}}>{l}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{fontSize:12.5,fontWeight:800,color:M.g800,marginBottom:12,fontFamily:TNR,display:"flex",alignItems:"center",gap:7}}><Icon name="info" size={15} color={M.maroon}/> Key Insights</div>
            {[{icon:"trending" as IName,text:"Inattentiveness in Math increasing over 4 weeks."},{icon:"check" as IName,text:"Good engagement consistently in English."},{icon:"zap" as IName,text:"Hyperactivity in Science moderate but stable."},{icon:"target" as IName,text:"Verbal Reminder & Seat Adjustment applied 6×."}].map((ins,i)=>(
              <div key={i} style={{display:"flex",gap:9,marginBottom:12,fontSize:12.5,fontFamily:TNR}}>
                <div style={{width:22,height:22,borderRadius:7,background:M.maroon+"12",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={ins.icon} size={12} color={M.maroon}/></div>
                <span style={{color:M.g800,lineHeight:1.55,fontWeight:700}}>{ins.text}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab==="intervention"&&(
        <Card>
          <div style={{fontSize:12.5,fontWeight:800,color:M.g800,marginBottom:14,fontFamily:TNR}}>Intervention History</div>
          {[{date:"May 24",type:"Seat Adjustment",result:"Partially Effective",c:M.amber},{date:"May 17",type:"Verbal Reminder + Task Modification",result:"Effective",c:M.maroon},{date:"May 10",type:"Verbal Reminder",result:"Effective",c:M.maroon},{date:"May 3",type:"Counseling / Check-in",result:"Partially Effective",c:M.amber},{date:"Apr 26",type:"Referral to Guidance",result:"Pending",c:M.sky}].map((h,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"9px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
              <div style={{minWidth:50,fontSize:11,color:M.g700,fontWeight:800,fontFamily:TNR}}>{h.date}</div>
              <div style={{flex:1,fontSize:12.5,color:M.g800,fontFamily:TNR,fontWeight:700}}>{h.type}</div>
              <Tag color={h.c}>{h.result}</Tag>
            </div>
          ))}
        </Card>
      )}
      {tab==="subjects"&&(
        <Card>
          <div style={{fontSize:12.5,fontWeight:800,color:M.g800,marginBottom:14,fontFamily:TNR}}>Subject Comparison</div>
          {[{subject:"Mathematics",positive:32,concern:68,incidents:7},{subject:"English",positive:78,concern:22,incidents:1},{subject:"Science",positive:55,concern:45,incidents:4},{subject:"MAPEH",positive:80,concern:20,incidents:0}].map(s=>(
            <div key={s.subject} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:6,fontFamily:TNR}}>
                <span style={{fontWeight:800,color:M.g800}}>{s.subject}</span>
                <span style={{fontSize:11,color:M.g700,fontWeight:700}}>{s.incidents} incident{s.incidents!==1?"s":""}</span>
              </div>
              <div style={{display:"flex",height:7,borderRadius:4,overflow:"hidden",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.08)"}}>
                <div style={{width:`${s.positive}%`,background:`linear-gradient(90deg,${M.maroonDark},${M.maroon})`}}/>
                <div style={{width:`${s.concern}%`,background:M.red+"55"}}/>
              </div>
              <div style={{display:"flex",gap:14,marginTop:5,fontSize:10.5,fontFamily:TNR}}>
                <span style={{color:M.maroon,fontWeight:800}}>✓ {s.positive}% positive</span>
                <span style={{color:M.red,fontWeight:800}}>! {s.concern}% concern</span>
              </div>
            </div>
          ))}
        </Card>
      )}
      {tab==="progress"&&(
        <Card>
          <div style={{fontSize:12.5,fontWeight:800,color:M.g800,marginBottom:14,fontFamily:TNR}}>Progress Tracking — {student.name}</div>
          {[{label:"Reduction in Inattentive Episodes",current:42,target:80,color:M.maroon},{label:"Cooperative Behavior",current:68,target:90,color:M.maroonDark},{label:"Participation Rate",current:55,target:85,color:M.sky},{label:"Intervention Compliance",current:75,target:100,color:M.purple}].map(p=>(
            <div key={p.label} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6,fontFamily:TNR}}>
                <span style={{color:M.g800,fontWeight:700}}>{p.label}</span>
                <span style={{fontWeight:900,color:p.color}}>{p.current}% / {p.target}%</span>
              </div>
              <PBar val={p.current} color={p.color} h={6}/>
            </div>
          ))}
        </Card>
      )}
      <Btn onClick={onNext} style={{marginTop:20}}>Next: Reports <Icon name="arrow" size={14} color={M.white}/></Btn>
    </div>
  );
};

// ── Reports — FULLY FUNCTIONAL ─────────────────────────────────────────────
interface GenState{status:"idle"|"generating"|"done";progress:number;}

const Reports:React.FC<{student:Student;logData:LogState|null;onFinish:()=>void}>=({student,logData,onFinish})=>{
  const [selected,setSelected]=useState<string[]>([]);
  const [genStates,setGenStates]=useState<Record<string,GenState>>({});
  const [previewId,setPreviewId]=useState<string|null>(null);
  const previewRef=useRef<HTMLIFrameElement>(null);

  const defaultLog:LogState={obs:"Student shows consistent inattentiveness during structured activities.",category:"Inattention",mood:"Anxious",participation:2,incident:"Minor Disruption",interventions:{"Verbal Reminder":true,"Seat Adjustment":true,"Task Modification":false,"Counseling / Check-in":false,"Referral to Guidance":false,"Positive Reinforcement":false},remarks:"Requires close monitoring in next sessions."};
  const data:ReportData={student,...(logData||defaultLog)};

  const toggle=(id:string)=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const generateReport=(id:string)=>{
    if(genStates[id]?.status==="generating"||genStates[id]?.status==="done")return;
    setGenStates(p=>({...p,[id]:{status:"generating",progress:0}}));
    let prog=0;
    const iv=setInterval(()=>{
      prog+=Math.random()*12+5;
      if(prog>=100){
        clearInterval(iv);
        setGenStates(p=>({...p,[id]:{status:"done",progress:100}}));
      }else{
        setGenStates(p=>({...p,[id]:{status:"generating",progress:Math.min(prog,95)}}));
      }
    },120);
  };

  const generateAll=()=>selected.filter(id=>!genStates[id]||genStates[id].status==="idle").forEach((id,i)=>setTimeout(()=>generateReport(id),i*400));

  const openReport=(report:ReportType)=>{
    const html=buildReportHTML(report,data);
    const win=window.open("","_blank","width=900,height=700,scrollbars=yes");
    if(win){win.document.write(html);win.document.close();}
  };

  const downloadReport=(report:ReportType)=>{
    const html=buildReportHTML(report,data);
    const blob=new Blob([html],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`${report.id}_${student.name.replace(/\s+/g,"_")}.html`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendEmail=(report:ReportType)=>alert(`📧 Email simulation: "${report.title}" for ${student.name} would be sent to relevant stakeholders.`);
  const printReport=(report:ReportType)=>{
    const html=buildReportHTML(report,data);
    const win=window.open("","_blank");
    if(win){win.document.write(html);win.document.close();setTimeout(()=>win.print(),500);}
  };

  const doneCount=Object.values(genStates).filter(s=>s.status==="done").length;
  const genCount=Object.values(genStates).filter(s=>s.status==="generating").length;

  return(
    <div style={{padding:"24px 28px",maxWidth:900,margin:"0 auto"}}>
      <STitle step={8} total={8} title="Generate Reports" sub="AI-powered behavioral and intervention reports — all fully functional."/>
      <div style={{...glass({padding:"11px 16px",marginBottom:20}),fontSize:12.5,color:M.g800,fontFamily:TNR,display:"flex",alignItems:"center",gap:10,borderLeft:`3px solid ${M.maroon}`}}>
        <Icon name="file" size={15} color={M.maroon}/>
        <span style={{fontWeight:800}}>{student.name}</span>
        <span style={{color:M.g700,fontWeight:700}}>· 3-F · Mathematics · May 24, 2025</span>
        <span style={{marginLeft:"auto",fontSize:11,color:M.g600,fontWeight:600}}>{selected.length} selected · {doneCount} ready</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))",gap:13,marginBottom:22}}>
        {REPORT_TYPES.map(report=>{
          const isSel=selected.includes(report.id);
          const gs=genStates[report.id];
          const isDone=gs?.status==="done";
          const isGen=gs?.status==="generating";
          return(
            <div key={report.id} onClick={()=>toggle(report.id)} style={{...glass({padding:16,cursor:"pointer",transition:"all 0.18s",border:isSel?`2px solid ${report.color}55`:"1px solid rgba(255,255,255,0.6)",boxShadow:isSel?`0 8px 28px ${report.color}20,0 2px 8px rgba(0,0,0,0.06)`:"0 4px 16px rgba(61,12,24,0.07)"})}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:38,height:38,borderRadius:11,background:report.color+"14",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${report.color}22`}}><Icon name={report.icon} size={18} color={report.color}/></div>
                  <div style={{fontWeight:800,fontSize:12.5,color:isSel?report.color:M.g800,lineHeight:1.35,fontFamily:TNR}}>{report.title}</div>
                </div>
                <div style={{width:19,height:19,borderRadius:"50%",border:`2px solid ${isSel?report.color:"rgba(0,0,0,0.15)"}`,background:isSel?report.color:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                  {isSel&&<Icon name="check" size={10} color={M.white}/>}
                </div>
              </div>
              <p style={{fontSize:11.5,color:M.g700,margin:"0 0 9px",lineHeight:1.6,fontFamily:TNR,fontWeight:700}}>{report.desc}</p>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:isSel?11:0}}>
                {report.tags.map(tag=><Tag key={tag} color={report.color}>{tag}</Tag>)}
                {isDone&&<Tag color={M.green}>✓ Ready</Tag>}
              </div>

              {/* Generate button + progress */}
              {isSel&&(
                <div onClick={e=>e.stopPropagation()} style={{display:"flex",flexDirection:"column",gap:6}}>
                  {isGen&&(
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,fontFamily:TNR,fontWeight:700,marginBottom:4}}>
                        <span style={{color:M.g700}}>Generating…</span>
                        <span style={{color:report.color}}>{Math.round(gs.progress)}%</span>
                      </div>
                      <PBar val={gs.progress} color={report.color} h={5}/>
                    </div>
                  )}
                  {!isDone?(
                    <button onClick={()=>generateReport(report.id)} disabled={isGen} style={{width:"100%",background:isGen?"rgba(0,0,0,0.1)":report.color,color:M.white,border:"none",borderRadius:9,padding:"8px",fontSize:11.5,fontFamily:TNR,fontWeight:800,cursor:isGen?"not-allowed":"pointer",transition:"all 0.15s",opacity:isGen?0.7:1}}>
                      {isGen?"Processing…":"⚡ Generate Report"}
                    </button>
                  ):(
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      <div style={{background:"rgba(26,122,74,0.08)",borderRadius:8,padding:"7px 10px",fontSize:11.5,fontFamily:TNR,fontWeight:800,color:M.green,display:"flex",alignItems:"center",gap:6,border:"1px solid rgba(26,122,74,0.18)"}}>
                        <Icon name="checkCircle" size={14} color={M.green}/> Report Ready
                      </div>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>openReport(report)} style={{flex:1,background:`linear-gradient(135deg,${M.maroon},${M.maroonDeep})`,color:M.white,border:"none",borderRadius:8,padding:"7px 4px",fontSize:10.5,fontFamily:TNR,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <Icon name="eye" size={11} color={M.white}/> View
                        </button>
                        <button onClick={()=>downloadReport(report)} style={{flex:1,background:"rgba(26,122,74,0.09)",color:M.green,border:"1px solid rgba(26,122,74,0.2)",borderRadius:8,padding:"7px 4px",fontSize:10.5,fontFamily:TNR,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <Icon name="download" size={11} color={M.green}/> Save
                        </button>
                        <button onClick={()=>printReport(report)} style={{flex:1,background:"rgba(26,107,138,0.08)",color:M.sky,border:"1px solid rgba(26,107,138,0.18)",borderRadius:8,padding:"7px 4px",fontSize:10.5,fontFamily:TNR,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <Icon name="printer" size={11} color={M.sky}/> Print
                        </button>
                        <button onClick={()=>sendEmail(report)} style={{flex:1,background:"rgba(184,134,11,0.08)",color:M.amber,border:"1px solid rgba(184,134,11,0.18)",borderRadius:8,padding:"7px 4px",fontSize:10.5,fontFamily:TNR,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                          <Icon name="mail" size={11} color={M.amber}/> Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length>0&&(
        <div style={{background:`linear-gradient(135deg,${M.maroonDeep} 0%,${M.maroon} 100%)`,borderRadius:14,padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,color:M.white,boxShadow:`0 8px 28px ${M.maroon}45`,border:"1px solid rgba(255,255,255,0.12)"}}>
          <div>
            <div style={{fontWeight:900,fontSize:14,fontFamily:TNR}}>{selected.length} selected · {genCount>0?`${genCount} generating…`:doneCount>0?`${doneCount} ready to download`:"Ready to generate"}</div>
            <div style={{fontSize:11.5,opacity:0.65,marginTop:2,fontFamily:TNR,fontWeight:600}}>Generate individually or all at once below.</div>
          </div>
          <div style={{display:"flex",gap:9}}>
            <button onClick={generateAll} disabled={genCount>0} style={{background:"rgba(255,255,255,0.14)",color:M.white,border:"1px solid rgba(255,255,255,0.28)",borderRadius:9,padding:"9px 18px",fontSize:12.5,fontFamily:TNR,fontWeight:800,cursor:genCount>0?"not-allowed":"pointer",opacity:genCount>0?0.6:1}}>
              {genCount>0?`Generating ${genCount}…`:"⚡ Generate All"}
            </button>
            {doneCount>0&&(
              <button onClick={()=>selected.filter(id=>genStates[id]?.status==="done").forEach(id=>{const r=REPORT_TYPES.find(rt=>rt.id===id);if(r)downloadReport(r);})} style={{background:`linear-gradient(135deg,${M.gold},#8C6A1E)`,color:M.white,border:"none",borderRadius:9,padding:"9px 18px",fontSize:12.5,fontFamily:TNR,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:7,boxShadow:`0 4px 14px ${M.gold}50`}}>
                <Icon name="download" size={14} color={M.white}/> Download All ({doneCount})
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:10}}>
        <Btn onClick={onFinish} variant="ghost"><Icon name="check" size={14} color={M.maroon}/> Complete Process</Btn>
        <Btn variant="secondary">← Back to Analytics</Btn>
      </div>
    </div>
  );
};

// ── App Root ───────────────────────────────────────────────────────────────
const TeacherHome:React.FC=()=>{
  const {setUser}=useApp();
  const navigate=useNavigate();
  const [view,setView]=useState("dashboard");
  const [step,setStep]=useState(1);
  const [student,setStudent]=useState<Student|null>(null);
  const [logData,setLogData]=useState<LogState|null>(null);
  const [mlResult,setMlResult]=useState<MLResult|null>(null);

  // Check if the device is mobile based on screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const go=(v:string,s=1)=>{setView(v);setStep(s);};
  const handleLogout=()=>{setUser(null);navigate("/");};
  const handleReset=()=>{setView("dashboard");setStudent(null);setLogData(null);setMlResult(null);};

  // If mobile is detected, render the mobile-optimized component
  if (isMobile) return <TeacherMobile />;

  return(
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(123,28,42,0.18);border-radius:4px;}
        ::-webkit-scrollbar-thumb:hover{background:rgba(123,28,42,0.32);}
        input[type=range]{accent-color:${M.maroon};}
        input:focus,textarea:focus,select:focus{border-color:${M.maroon}!important;box-shadow:0 0 0 3px ${M.maroon}18!important;outline:none;}
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at 15% 10%,rgba(123,28,42,0.12) 0%,transparent 55%),radial-gradient(ellipse at 85% 80%,rgba(196,154,60,0.09) 0%,transparent 50%),linear-gradient(160deg,#F5EDE8 0%,#FBF7F2 40%,#F7EFE8 100%)`,display:"flex",flexDirection:"column"}}>
        <TopBar onLogout={handleLogout} onHome={()=>go("dashboard")}/>
        {view!=="dashboard"&&<StepBar current={step}/>}
        <div style={{flex:1,overflowY:"auto"}}>
          {view==="dashboard"&&<Dashboard onStart={()=>go("select-student",1)}/>}
          {view==="select-student"&&<SelectStudent onSelect={s=>{setStudent(s);go("session",1);}}/>}
          {view==="session"&&student&&<SelectSession student={student} onContinue={()=>go("activity-log",2)}/>}
          {view==="activity-log"&&student&&<ActivityLog student={student} onSave={state=>{setLogData(state);go("save-confirm",3);}}/>}
          {view==="save-confirm"&&student&&<SaveConfirmation student={student} onProceed={()=>go("ai-analysis",4)}/>}
          {view==="ai-analysis"&&student&&<AIAnalysis student={student} logData={logData} onNext={r=>{setMlResult(r);go("risk",5);}}/>}
          {view==="risk"&&student&&<RiskClassification student={student} mlResult={mlResult} onNext={()=>go("notifications",6)}/>}
          {view==="notifications"&&student&&<Notifications student={student} mlResult={mlResult} onNext={()=>go("analytics",7)}/>}
          {view==="analytics"&&student&&<Analytics student={student} onNext={()=>go("reports",8)}/>}
          {view==="reports"&&student&&<Reports student={student} logData={logData} onFinish={handleReset}/>}
        </div>
      </div>
    </>
  );
};

export default TeacherHome;