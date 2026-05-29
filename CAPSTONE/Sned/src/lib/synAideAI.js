// SYN-AIDE AI ENGINE (HYBRID AI)

export const runSynAideAI = (student, behaviorLogs = [], progressNotes = []) => {
  
  // =========================
  // 1. RULE-BASED ANALYSIS (IEP AWARE)
  // =========================
  const condition = student?.diagnosis || "General";

  let limitationFactor = 1;

  if (condition.includes("Cerebral Palsy")) limitationFactor = 0.6;
  if (condition.includes("Autism")) limitationFactor = 0.7;
  if (condition.includes("Down Syndrome")) limitationFactor = 0.75;

  // =========================
  // 2. PATTERN DETECTION
  // =========================
  const attentionIssues = behaviorLogs.filter(b => b.type === "inattention").length;
  const incompleteTasks = behaviorLogs.filter(b => b.type === "incomplete").length;

  const riskScore = (attentionIssues * 2 + incompleteTasks * 3) * limitationFactor;

  // =========================
  // 3. RISK CLASSIFICATION
  // =========================
  let riskLevel = "Stable";

  if (riskScore > 20) riskLevel = "Critical";
  else if (riskScore > 10) riskLevel = "Monitoring";

  // =========================
  // 4. AI DECISION (RECOMMENDATION)
  // =========================
  let recommendation = [];

  if (riskLevel === "Critical") {
    recommendation.push("Shortened tasks");
    recommendation.push("One-on-one assistance");
    recommendation.push("Use assistive tools");
  }

  if (riskLevel === "Monitoring") {
    recommendation.push("Frequent breaks");
    recommendation.push("Guided instruction");
  }

  if (riskLevel === "Stable") {
    recommendation.push("Maintain current strategy");
    recommendation.push("Encourage participation");
  }

  // =========================
  // 5. AUTO PLAAFP GENERATION
  // =========================
  const plaafp = `
  The learner shows ${riskLevel.toLowerCase()} performance based on recent behavioral and academic data. 
  Observations indicate ${attentionIssues} attention issues and ${incompleteTasks} incomplete tasks. 
  Based on the learner’s condition (${condition}), adaptive strategies are required to support progress.
  `;

  return {
    riskLevel,
    recommendation,
    plaafp,
    confidence: `${Math.min(95, 70 + riskScore)}%`
  };
};