import TSNE from "tsne-js";

const getFeatures = (log, student) => {
  const features = [];

  // Existing behavior features (retained for consistency)
  features.push(log.behavior === "aggressive" ? 3 : 0);
  features.push(log.behavior === "withdrawn" ? 2 : 0);
  features.push(log.behavior === "inactive" ? 1 : 0);

  // More granular time of day (0-23 hour)
  let hour = 0;
  if (log.time) {
    const [timePart, ampm] = log.time.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0; // Midnight
    hour = h;
  }
  features.push(hour / 23); // Normalize hour to a 0-1 range

  // Behavior type intensity (from log.type)
  if (log.type === "Concerning") features.push(3);
  else if (log.type === "Attention Needed") features.push(2);
  else if (log.type === "Positive") features.push(1);
  else features.push(0); // Default for unknown type

  // Location (numerical encoding, can be expanded)
  if (log.location === "Classroom") features.push(1);
  else if (log.location === "Playground") features.push(2);
  else if (log.location === "Cafeteria") features.push(1.5);
  else if (log.location === "Library") features.push(0.5);
  else features.push(0); // Default for unknown locations

  // Student-specific features (if student object is available)
  if (student) {
    // Diagnosis (numerical encoding for simplicity, one-hot encoding is generally better for categorical data)
    if (student.diagnosis?.includes("ASD")) features.push(1);
    else if (student.diagnosis?.includes("ADHD")) features.push(2);
    else if (student.diagnosis?.includes("Cerebral Palsy")) features.push(3);
    else if (student.diagnosis?.includes("Intellectual Disability")) features.push(4);
    else features.push(0); // Default for unknown diagnosis

    // Support Level (numerical encoding)
    if (student.supportLevel === "Full Assistance") features.push(3);
    else if (student.supportLevel === "Moderate Support") features.push(2);
    else if (student.supportLevel === "Minimal Supervision") features.push(1);
    else features.push(0);

    // Risk Level from student object (if available)
    if (student.riskLevel === "Critical") features.push(4);
    else if (student.riskLevel === "High") features.push(3);
    else if (student.riskLevel === "Moderate") features.push(2);
    else if (student.riskLevel === "Low") features.push(1);
    else features.push(0);
  }

  // Anomaly Score and Confidence (if available in log)
  features.push(log.anomalyScore || 0); // Assuming 0 if not present
  features.push(log.confidence || 0); // Assuming 0 if not present

  return features;
};

export const runSAIEClustering = (logs, studentsMap) => {
  // Guard: t-SNE requires at least a small dataset to calculate probabilities
  if (!logs || logs.length < 2) {
    return logs.map(() => [Math.random(), Math.random()]);
  }

  const model = new TSNE({
    dim: 2,
    perplexity: 10,
    learningRate: 100,
    nIter: 400,
  });

  const data = logs.map(log => getFeatures(log, studentsMap[log.studentId]));

  model.init({
    data,
    type: "dense"
  });

  for (let i = 0; i < 400; i++) {
    model.step();
  }

  return model.getOutputScaled();
};