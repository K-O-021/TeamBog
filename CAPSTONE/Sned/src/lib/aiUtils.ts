import { BehaviorLog, Student, Message } from '@/context/AppContext';

export const SE_KEYWORDS = /peer|social|friend|emotion|frustrated|angry|anxious|sad|withdrawal|crying/;

export interface RiskPrediction extends Student {
  probability: number;
  intervention: string;
}

export function calculateStudentRiskPrediction(
  student: Student,
  behaviorLogs: BehaviorLog[]
): RiskPrediction {
  const studentLogs = behaviorLogs.filter(l => l.studentId === student.id);
  const triggers = { transitions: 0, sensory: 0, socialEmotional: 0 };
  let baseRisk = 15;
  
  studentLogs.forEach(log => {
    const desc = log.description.toLowerCase();
    const isSocialEmotional = !!desc.match(SE_KEYWORDS);
    const seWeight = isSocialEmotional ? 1.5 : 1.0;

    // Calculate Triggers
    if (desc.includes('transition') || desc.includes('change')) triggers.transitions++;
    if (desc.includes('sensory') || desc.includes('noise')) triggers.sensory++;
    if (isSocialEmotional) triggers.socialEmotional++;

    // Calculate Risk in same pass
    if (log.type === 'Concerning') baseRisk += (18 * seWeight);
    else if (log.type === 'Attention Needed') baseRisk += (8 * seWeight);
    else if (log.type === 'Positive') baseRisk -= 5;
  });

  const topTrigger = Object.entries(triggers).sort((a, b) => b[1] - a[1])[0];
  let intervention = "Increase positive reinforcement frequency.";
  if (topTrigger[1] > 0) {
    if (topTrigger[0] === 'transitions') intervention = "Use visual timers and 'First-Then' boards.";
    else if (topTrigger[0] === 'sensory') intervention = "Provide scheduled sensory breaks.";
    else if (topTrigger[0] === 'socialEmotional') intervention = "Implement guided social scripts and emotional check-ins.";
  }
  
  if (student.riskLevel === 'High') baseRisk += 25;
  if (student.riskLevel === 'Moderate') baseRisk += 12;

  const probability = Math.min(Math.max(baseRisk, 4), 99);
  return { ...student, probability, intervention };
}

export function calculateStrategyEfficacy(
  userName: string | undefined,
  messages: Message[],
  behaviorLogs: BehaviorLog[],
  students: Student[]
) {
  const strategyMsgs = messages.filter(m => 
    (m.to === userName || m.from === userName) && 
    m.content.toLowerCase().includes("ai strategy suggestion")
  );
  
  const evaluations = strategyMsgs.map(msg => {
    // Regex updated to optionally capture (ID: id)
    const idMatch = msg.content.match(/\(ID:\s*(.*?)\)/i);
    const nameMatch = msg.content.match(/AI Strategy Suggestion for (.*?)(?:\s*\(ID:.*?\))?\s*:/i);

    const studentId = idMatch ? idMatch[1].trim() : '';
    const studentName = nameMatch ? nameMatch[1].trim() : '';

    const student = studentId 
      ? students.find(s => s.id === studentId)
      : students.find(s => s.name === studentName);

    if (!student) return null;

    const msgDate = new Date(msg.timestamp).getTime();
    const logsAfter = behaviorLogs.filter(l => l.studentId === student.id && new Date(`${l.date} ${l.time}`).getTime() > msgDate);

    if (logsAfter.length === 0) return { name: studentName, id: student.id, rating: 'Pending', color: 'text-muted-foreground' };
    const positiveRatio = logsAfter.filter(l => l.type === 'Positive').length / logsAfter.length;
    
    if (positiveRatio > 0.6) return { name: studentName, id: student.id, rating: 'High', color: 'text-success' };
    if (positiveRatio > 0.3) return { name: studentName, id: student.id, rating: 'Moderate', color: 'text-warning' };
    return { name: studentName, id: student.id, rating: 'Low', color: 'text-destructive' };
  }).filter(Boolean);

  const highCount = evaluations.filter(e => e?.rating === 'High').length;
  return {
    overall: evaluations.length > 0 ? Math.round((highCount / evaluations.length) * 100) : 0,
    recent: evaluations.slice(-3).reverse()
  };
}