import { BehaviorLog } from "@/context/AppContext";

export type GradeLevel = 'Grade 1' | 'Grade 2' | 'Grade 3';

const STRATEGIES: Record<string, Record<GradeLevel, string[]>> = {
  Concerning: {
    'Grade 1': [
      "Sensory Reset: Direct to a 'Calm Down' corner with tactile tools (fidgets, weighted lap pad).",
      "Visual Directive: Use a 'First/Then' board to visualize the transition to a preferred activity.",
      "Low-Verbal De-escalation: Use 1-3 word directives to minimize cognitive load."
    ],
    'Grade 2': [
      "Movement Break: Request 'Heavy Work' (e.g., carrying books to the office) to regulate the nervous system.",
      "Safe Space Choice: Offer a choice between staying at their desk or moving to a designated quiet area.",
      "Planned Ignoring: Ignore attention-seeking behaviors while providing heavy praise to on-task peers."
    ],
    'Grade 3': [
      "Reflective Journaling: Provide 2 minutes to write or draw feelings before discussing the incident.",
      "Logical Consequences: Transition to a neutral activity and discuss how to restore the classroom environment.",
      "Self-Regulation Check: Prompt the student to identify their current 'Zone of Regulation' (Blue, Green, Yellow, Red)."
    ]
  },
  'Attention Needed': {
    'Grade 1': [
      "Proximity Control: Move within arm's length of the student without stopping the lesson.",
      "Touch Prompt: A light tap on the desk or shoulder to redirect focus.",
      "Visual Timer: Show a sand or digital timer to define the remaining work duration."
    ],
    'Grade 2': [
      "Peer Modeling: Publicly praise a nearby student's specific behavior to cue the target student.",
      "Secret Signal: Use a pre-arranged non-verbal signal (e.g., touching your ear) to prompt focus.",
      "Task Chunking: Fold the worksheet to show only two problems at a time."
    ],
    'Grade 3': [
      "Self-Monitoring Checklist: Give a small post-it with 3 checkboxes for the current task.",
      "Choice of Tools: Ask if they prefer using a pencil, pen, or typing to complete the response.",
      "Goal Setting: Ask 'What is your plan for the next 10 minutes?' to encourage autonomy."
    ]
  }
};

/**
 * Returns evidence-based intervention strategies based on behavior type and grade level.
 */
export const getInterventionSuggestions = (
  type: BehaviorLog['type'],
  grade?: string
): string[] => {
  if (type === 'Positive') return [];
  
  // Fallback to Grade 1 if grade is unknown or not mapped
  const gradeKey = (grade && STRATEGIES[type][grade as GradeLevel]) 
    ? (grade as GradeLevel) 
    : 'Grade 1';

  return STRATEGIES[type][gradeKey] || [];
};

/**
 * Returns the behavior type associated with a specific intervention suggestion.
 * Used to automatically categorize logs when an intervention is selected.
 */
export const getBehaviorTypeForSuggestion = (suggestion: string): BehaviorLog['type'] => {
  for (const [type, gradeMap] of Object.entries(STRATEGIES)) {
    if (Object.values(gradeMap).some(list => list.includes(suggestion))) {
      return type as BehaviorLog['type'];
    }
  }
  return 'Positive';
};