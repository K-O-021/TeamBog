import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: StatVariant;
}

type StatVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

const variantStyles: Record<StatVariant, string> = {
  default: 'border-slate-200 hover:border-slate-300',
  primary: 'border-blue-100 hover:border-blue-200 bg-blue-50/30', 
  success: 'border-emerald-100 hover:border-emerald-200 bg-emerald-50/30',
  warning: 'border-amber-100 hover:border-amber-200 bg-amber-50/30',
  danger: 'border-rose-100 hover:border-rose-200 bg-rose-50/30',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, variant }) => {
  let calculatedVariant: StatVariant = variant || 'default'; // Use provided variant or start with a safe default

  // Attempt to parse value as a number, handling percentages
  let numericValue: number | null = null;
  if (typeof value === 'number') {
    numericValue = value;
  } else if (typeof value === 'string') {
    const percentageMatch = value.match(/(\d+(\.\d+)?)%/);
    if (percentageMatch) {
      numericValue = parseFloat(percentageMatch[1]);
    } else {
      numericValue = parseFloat(value);
    }
  }

  const lowerCaseLabel = label.toLowerCase();

  // --- Automatic variant calculation logic ---
  // Only calculate automatically if a manual variant wasn't provided
  if (!variant && numericValue !== null) {
    // Case 1: Metrics where higher value is generally good (e.g., Accuracy, Positive logs, Present, Avg. Mood)
    if (lowerCaseLabel.includes('accuracy') || lowerCaseLabel.includes('positive') || lowerCaseLabel.includes('good') || lowerCaseLabel.includes('present') || lowerCaseLabel.includes('avg. mood')) {
      if (numericValue >= 90 || (lowerCaseLabel.includes('avg. mood') && numericValue >= 4)) { // High score/percentage
        calculatedVariant = 'success';
      } else if (numericValue >= 70 || (lowerCaseLabel.includes('avg. mood') && numericValue >= 3)) { // Moderate score/percentage
        calculatedVariant = 'primary';
      } else if (numericValue >= 50 || (lowerCaseLabel.includes('avg. mood') && numericValue >= 2)) { // Low-ish score/percentage
        calculatedVariant = 'warning';
      } else { // Very low score/percentage
        calculatedVariant = 'danger';
      }
    } 
    // Case 2: Metrics where higher value is generally bad (e.g., Alerts, Risk, Critical, Danger, Absent, Late)
    else if (lowerCaseLabel.includes('alerts') || lowerCaseLabel.includes('risk') || lowerCaseLabel.includes('critical') || lowerCaseLabel.includes('danger') || lowerCaseLabel.includes('absent') || lowerCaseLabel.includes('late') || lowerCaseLabel.includes('new alerts') || lowerCaseLabel.includes('high priority')) {
      if (numericValue > 5) { // High number of bad things
        calculatedVariant = 'danger';
      } else if (numericValue > 0) { // Some bad things
        calculatedVariant = 'warning';
      } else { // Zero bad things
        calculatedVariant = 'success';
      }
    }
    // Case 3: Neutral metrics (e.g., Total Logs, Students, Interventions, Predictions Made, Today's Logs)
    else if (lowerCaseLabel.includes('total logs') || lowerCaseLabel.includes('students') || lowerCaseLabel.includes('interventions') || lowerCaseLabel.includes('predictions made') || lowerCaseLabel.includes('today\'s logs') || lowerCaseLabel.includes('behavior logs')) {
      calculatedVariant = 'primary';
    }
  }

  // If after all logic, it's still 'default', and there's a numeric value,
  // it implies a general count or metric not explicitly categorized, so 'primary' is a good fallback.
  if (!variant && calculatedVariant === 'default' && numericValue !== null) {
    calculatedVariant = 'primary';
  }

  return (
    <div className={`rounded-2xl border ${variantStyles[calculatedVariant]} p-7 bg-white text-left transition-all hover:shadow-md shadow-sm`}>
      <p className="text-4xl font-bold text-slate-900 leading-none tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">{label}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
