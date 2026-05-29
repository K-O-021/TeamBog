import { describe, it, expect } from 'vitest';
import { calculateStudentRiskPrediction, calculateStrategyEfficacy } from './aiUtils';
import { Student, BehaviorLog } from '@/context/AppContext';

describe('calculateStudentRiskPrediction', () => {
  const mockStudent: Student = {
    id: 's1',
    name: 'Alex Rivera',
    initials: 'AR',
    grade: 'Grade 2',
    teacher: 'Mrs. Anderson',
    riskLevel: 'Low',
    status: 'active',
    lastActivity: 'None',
    parentName: 'Maria Rivera',
    parentEmail: 'maria@example.com'
  };

  it('calculates baseline probability (15%) for a student with no logs', () => {
    const result = calculateStudentRiskPrediction(mockStudent, []);
    expect(result.probability).toBe(15);
    expect(result.intervention).toBe("Increase positive reinforcement frequency.");
  });

  it('applies the 1.5x Social-Emotional multiplier for prioritized keywords', () => {
    const logs: BehaviorLog[] = [{
      id: 'l1',
      studentId: 's1',
      studentName: 'Alex Rivera',
      type: 'Concerning',
      description: 'Student became very frustrated during peer work.', // "frustrated" and "peer" are SE keywords
      time: '10:00 AM',
      location: 'Classroom',
      riskLevel: 'High',
      date: '2026-03-07'
    }];

    // Math: 15 (base) + (18 * 1.5) = 15 + 27 = 42
    const result = calculateStudentRiskPrediction(mockStudent, logs);
    expect(result.probability).toBe(42);
    expect(result.intervention).toBe("Implement guided social scripts and emotional check-ins.");
  });

  it('correctly identifies transition triggers and suggests appropriate interventions', () => {
    const logs: BehaviorLog[] = [{
      id: 'l2',
      studentId: 's1',
      studentName: 'Alex Rivera',
      type: 'Attention Needed',
      description: 'Alex struggled with the transition to the cafeteria.',
      time: '11:30 AM',
      location: 'Hallway',
      riskLevel: 'Moderate',
      date: '2026-03-07'
    }];

    const result = calculateStudentRiskPrediction(mockStudent, logs);
    expect(result.intervention).toContain("visual timers");
  });

  it('clamps the risk probability to a maximum of 99%', () => {
    const logs: BehaviorLog[] = Array(10).fill({
      id: 'heavy-log',
      studentId: 's1',
      studentName: 'Alex Rivera',
      type: 'Concerning',
      description: 'Aggressive withdrawal from peers.',
      time: '09:00 AM',
      location: 'Gym',
      riskLevel: 'High',
      date: '2026-03-07'
    });

    const highRiskStudent = { ...mockStudent, riskLevel: 'High' as const };
    const result = calculateStudentRiskPrediction(highRiskStudent, logs);
    
    // Math would naturally exceed 100, so we check the clamp
    expect(result.probability).toBe(99);
  });
});

describe('calculateStrategyEfficacy', () => {
  it('returns zero efficacy and empty recent list when message history is empty', () => {
    const result = calculateStrategyEfficacy('Mrs. Anderson', [], [], []);
    expect(result.overall).toBe(0);
    expect(result.recent).toEqual([]);
  });

  it('handles message history with no AI strategy suggestions', () => {
    const messages = [{
      from: 'Mrs. Anderson',
      to: 'Maria Rivera',
      content: 'Just a standard check-in note.',
      timestamp: '2026-03-07 09:00 AM',
      read: true
    }];
    const result = calculateStrategyEfficacy('Mrs. Anderson', messages, [], []);
    expect(result.overall).toBe(0);
    expect(result.recent).toHaveLength(0);
  });

  it('handles variations in message format such as case and extra whitespace', () => {
    const students: Student[] = [{
      id: 's1',
      name: 'Alex Rivera',
      initials: 'AR',
      grade: 'Grade 2',
      teacher: 'Mrs. Anderson',
      riskLevel: 'Low',
      status: 'active',
      lastActivity: 'None',
      parentName: 'Maria Rivera',
      parentEmail: 'maria@example.com'
    }];

    const messages = [
      {
        from: 'Admin',
        to: 'Mrs. Anderson',
        content: '\n  ai strategy suggestion for Alex Rivera (ID: s1) : \nUse visual timers.',
        timestamp: '2026-03-07 09:00 AM',
        read: false
      }
    ];

    const logs: BehaviorLog[] = [{
      id: 'l1',
      studentId: 's1',
      studentName: 'Alex Rivera',
      type: 'Positive',
      description: 'Followed routine.',
      time: '10:00 AM',
      location: 'Classroom',
      riskLevel: 'Low',
      date: '2026-03-07'
    }];

    const result = calculateStrategyEfficacy('Mrs. Anderson', messages, logs, students);
    expect(result.overall).toBe(100);
    expect(result.recent[0].name).toBe('Alex Rivera');
    expect(result.recent[0].id).toBe('s1');
    expect(result.recent[0].rating).toBe('High');
  });

  it('correctly distinguishes between students with duplicate names using ID', () => {
    const students: Student[] = [
      {
        id: 's1',
        name: 'Sam Smith',
        initials: 'SS',
        grade: 'Grade 1',
        teacher: 'Mrs. Anderson',
        riskLevel: 'Low',
        status: 'active',
        lastActivity: 'None',
        parentName: 'Parent A',
        parentEmail: 'a@example.com'
      },
      {
        id: 's2',
        name: 'Sam Smith',
        initials: 'SS',
        grade: 'Grade 3',
        teacher: 'Mrs. Anderson',
        riskLevel: 'Low',
        status: 'active',
        lastActivity: 'None',
        parentName: 'Parent B',
        parentEmail: 'b@example.com'
      }
    ];

    const messages = [
      {
        from: 'Admin',
        to: 'Mrs. Anderson',
        content: 'AI Strategy Suggestion for Sam Smith (ID: s2): Use task chunking.',
        timestamp: '2026-03-07 09:00 AM',
        read: false
      }
    ];

    const logs: BehaviorLog[] = [{
      id: 'l1',
      studentId: 's2',
      studentName: 'Sam Smith',
      type: 'Positive',
      description: 'Completed task.',
      time: '10:00 AM',
      location: 'Classroom',
      riskLevel: 'Low',
      date: '2026-03-07'
    }];

    const result = calculateStrategyEfficacy('Mrs. Anderson', messages, logs, students);
    expect(result.recent[0].name).toBe('Sam Smith');
    expect(result.recent[0].id).toBe('s2');
    expect(result.recent[0].rating).toBe('High'); // Should match s2 correctly
  });
});