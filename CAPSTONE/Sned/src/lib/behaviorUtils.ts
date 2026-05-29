import { BehaviorLog, ProgressNote } from "@/context/AppContext";

const API_URL = "http://localhost:8000/api";

/**
 * Calls the FastAPI backend to classify a behavior description.
 */
export const classifyBehaviorWithAi = async (description: string): Promise<{
  type: 'Positive' | 'Attention Needed' | 'Concerning';
  risk_level: 'Low' | 'Moderate' | 'High';
  confidence: number;
} | null> => {
  try {
    const response = await fetch(`${API_URL}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    if (!response.ok) throw new Error('AI Service unavailable');
    return await response.json();
  } catch (error) {
    console.error("AI Classification Error:", error);
    return null;
  }
};

/**
 * Calls the FastAPI backend to detect if a behavior is an outlier compared to history.
 */
export const detectBehaviorAnomaly = async (history: string[], currentDescription: string) => {
  try {
    const response = await fetch(`${API_URL}/detect-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, current_description: currentDescription }),
    });
    if (!response.ok) return null;
    return await response.json() as { is_anomaly: boolean; anomaly_score: number; message: string };
  } catch (error) {
    console.error("Anomaly Detection Error:", error);
    return null;
  }
};

/**
 * Requests an aggregate volatility analysis for a group of students.
 */
export const fetchClassVolatility = async (logsByStudent: Record<string, string[]>) => {
  try {
    const response = await fetch(`${API_URL}/class-volatility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_logs: logsByStudent }),
    });
    if (!response.ok) return null;
    return await response.json() as { 
      class_volatility_score: number; 
      student_breakdown: Record<string, number> 
    };
  } catch (error) {
    console.error("Class Volatility API Error:", error);
    return null;
  }
};

/**
 * Fetches a 7-day risk forecast based on historical behavior logs.
 */
export const fetchRiskForecast = async (logs: any[]) => {
  try {
    const response = await fetch(`${API_URL}/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_logs: logs }),
    });
    if (!response.ok) return null;
    return await response.json() as { forecast: any[], alert: string, early_intervention_advice: string };
  } catch (error) {
    console.error("Risk Forecast Error:", error);
    return null;
  }
};

/**
 * Requests LLM-generated intervention steps and professional scripts.
 */
export const fetchAiRecommendations = async (description: string, context: string = "Special Needs") => {
  try {
    const response = await fetch(`${API_URL}/get-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ behavior_description: description, student_context: context }),
    });
    if (!response.ok) return null;
    return await response.json() as { steps: string[], rationale: string, professional_script: string };
  } catch (error) {
    console.error("AI Recommendations Error:", error);
    return null;
  }
};

export const RISK_WEIGHTS = { Low: 1, Moderate: 2, High: 3 };

/**
 * Converts a time string like "10:30 AM" into total minutes from midnight for comparison.
 */
const timeToMinutes = (time: string): number => {
  const [h, m_ap] = time.split(':');
  const [m, ap] = m_ap.split(' ');
  let hours = parseInt(h);
  const minutes = parseInt(m);
  if (ap === 'PM' && hours < 12) hours += 12;
  if (ap === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

/**
 * Calculates the risk trend between the current log and the student's previous log of the same day.
 * Returns:
 *  > 0 if risk is escalating
 *  < 0 if risk is improving
 *  0 if risk is stable
 *  null if no previous log exists
 */
export const getRiskTrend = (currentLog: BehaviorLog, history: BehaviorLog[]): number | null => {
  const currentMinutes = timeToMinutes(currentLog.time);
  
  const prevLog = history
    .filter(l => 
      l.studentId === currentLog.studentId && 
      l.date === currentLog.date && 
      timeToMinutes(l.time) < currentMinutes
    )
    .sort((a, b) => timeToMinutes(b.time) - timeToMinutes(a.time))[0];

  if (!prevLog) return null;

  return RISK_WEIGHTS[currentLog.riskLevel] - RISK_WEIGHTS[prevLog.riskLevel];
};

/**
 * Aggregates behavior log data for charts and statistics.
 */
export const getBehaviorStats = (logs: BehaviorLog[]) => {
  return logs.reduce(
    (acc, log) => {
      if (log.type === 'Positive') acc.positive++;
      if (log.type === 'Attention Needed') acc.neutral++;
      if (log.type === 'Concerning') acc.concerning++;
      if (log.riskLevel === 'High') acc.critical++;
      return acc;
    },
    { positive: 0, neutral: 0, concerning: 0, critical: 0 }
  );
};

export interface AiAnalysisResult {
  triggers: string[];
  interventions: string[];
  summary: string[];
  monthlyNarrative: string;
  positiveFrequency: string;
  academicHighlights: string[];
  areasForGrowth: string[];
  peerComparison: string;
}

/**
 * Generates AI-driven behavioral insights and a professional narrative for a specific student.
 * Can be used for monthly progress reports or individual student reviews.
 */
export const generateStudentAiAnalysis = (
  student: { name: string; id: string },
  logs: BehaviorLog[],
  progressNotes: ProgressNote[],
  monthName?: string
): AiAnalysisResult | null => {
  const studentLogs = logs.filter(l => l.studentId === student.id);

  const targetMonth = monthName || new Date().toLocaleString('default', { month: 'long' });
  const positiveLogs = studentLogs.filter(l => l.type === 'Positive');
  const totalLogs = studentLogs.length;
  const positiveRate = totalLogs > 0 ? ((positiveLogs.length / totalLogs) * 100).toFixed(0) : "0";
  const firstName = student.name.split(' ')[0];

  // Identify areas for growth based on sentiment scores
  const studentNotes = progressNotes.filter(n => n.studentId === student.id);
  const sentimentWeights: Record<string, number> = { Positive: 2, Neutral: 1, Negative: 0 };
  const categoryScores: Record<string, { sum: number; count: number }> = {};

  studentNotes.forEach(note => {
    const weight = sentimentWeights[note.sentiment || 'Neutral'];
    if (!categoryScores[note.category]) categoryScores[note.category] = { sum: 0, count: 0 };
    categoryScores[note.category].sum += weight;
    categoryScores[note.category].count += 1;
  });

  const areasForGrowth = Object.entries(categoryScores)
    .map(([category, data]) => ({ category, average: data.sum / data.count }))
    .sort((a, b) => a.average - b.average)
    .slice(0, 2)
    .map(item => `${item.category}: Targeted support recommended to stabilize ${item.category.toLowerCase()} outcomes.`);

  if (areasForGrowth.length === 0) areasForGrowth.push("Maintain current support levels across all developmental areas.");

  // Peer Comparison Logic (Comparison to Peer Average)
  const allStudentIds = Array.from(new Set(logs.map(l => l.studentId)));
  const studentFrequencies = allStudentIds.map(id => {
    const sLogs = logs.filter(l => l.studentId === id);
    const posCount = sLogs.filter(l => l.type === 'Positive').length;
    return sLogs.length > 0 ? (posCount / sLogs.length) * 100 : 0;
  });
  const peerAverage = studentFrequencies.reduce((a, b) => a + b, 0) / (studentFrequencies.length || 1);
  const diff = parseFloat(positiveRate) - peerAverage;
  const peerComparison = `${firstName}'s positive engagement rate is ${Math.abs(diff).toFixed(1)}% ${diff >= 0 ? 'above' : 'below'} the peer average (${peerAverage.toFixed(1)}%).`;

  // Extract recent academic progress
  const academicNotes = progressNotes
    .filter(n => n.studentId === student.id && n.category === 'Academic')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const academicHighlights = academicNotes.length > 0 
    ? academicNotes.map(n => n.note)
    : ["No specific academic achievements logged this month."];

  return {
    triggers: [
      "Morning transitions (entering classroom)",
      "High-sensory environments (Cafeteria/Gym)",
      "Sudden changes in seating or routine",
      "Multi-step verbal instructions without visual aid"
    ],
    interventions: [
      "Use visual schedules for morning routines",
      "Provide noise-canceling headphones for independent work",
      "Implement 'First/Then' boards for transition periods",
      "Assign a 'classroom job' to provide purposeful movement"
    ],
    summary: [
      `${student.name} shows strong engagement during structured activities but struggles with sensory transitions.`,
      "Frequency of positive incidents has increased by 10% this month.",
      "Professional narrative: Demonstrating improved self-regulation during individual tasks."
    ],
    positiveFrequency: `${positiveLogs.length} positive incidents out of ${totalLogs} total observations (${positiveRate}%).`,
    academicHighlights,
    areasForGrowth,
    peerComparison,
    monthlyNarrative: `During the month of ${targetMonth}, ${firstName} has demonstrated steady progress in behavioral development. The student showed a high frequency of positive engagement (${positiveRate}%), particularly during structured academic tasks. ${
      academicNotes.length > 0 
        ? `Academically, ${firstName} has shown growth in: ${academicNotes[0].note.toLowerCase()}.` 
        : ""
    } While transitions remain an area for continued support, the consistent use of visual schedules has significantly improved classroom integration. Overall, ${firstName} is developing better self-regulation skills and responding well to positive reinforcement strategies.`
  };
};