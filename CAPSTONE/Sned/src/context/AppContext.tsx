import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, orderBy, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { usersRef, studentsRef, activityLogsRef, logsRef, attendanceRef, progressNotesRef, UserDoc, StudentDoc, addUser as firestoreAddUser, updateUserProfile, archiveUser as firestoreArchiveUser, addStudent as firestoreAddStudent, updateStudent as firestoreUpdateStudent, archiveStudent as firestoreArchiveStudent, addActivityLog as firestoreAddActivityLog, addBehaviorLog as firestoreAddBehaviorLog } from '@/lib/firestoreQueries';

export type UserRole = 'teacher' | 'parent' | 'admin' | 'adviser';

export interface User {
  id?: string;
  name: string;
  role: UserRole;
  email: string;
  status?: 'active' | 'archived' | 'pending'; // Added 'pending' for signup flow
  isOnline?: boolean;
}

export interface Student {
  id: string;
  initials: string;
  name: string;
  grade: string; // Make grade optional for initial student creation
  lrn: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  teacher: string;
  lastActivity: string;
  status: 'active' | 'archived';
  parentName?: string;
  parentEmail?: string;
}

export interface BehaviorLog {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Positive' | 'Attention Needed' | 'Concerning';
  description: string;
  time: string;
  location: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  date: string;
  teacherName?: string; // Added for audit trail traceability
  confidence?: number;
  anomalyScore?: number; // Added for anomaly detection support
}

export interface Alert {
  id: string;
  studentName: string;
  message: string;
  priority: 'Low' | 'Moderate' | 'High';
  isNew: boolean;
  timestamp: string;
  reviewed: boolean;
  studentLevel?: string; // Added for teacher alerts filtering
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  note?: string;
}

export interface ProgressNote {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  category: string;
  note: string;
  createdBy: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  nextSteps?: string;
  acknowledgedAt?: string;
}

export interface LearningPlan {
  id: string;
  studentId: string;
  studentName: string;
  goals: string[];
  accommodations: string[];
  updatedDate: string;
  status: 'active' | 'completed';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
  quotedMessage?: {
    id: string;
    from: string;
    content: string;
  };
  attachment?: {
    name: string;
    url: string;
    type: 'image' | 'file';
  };
}

export interface IEPRequest {
  id: string;
  parentEmail: string;
  parentName: string;
  studentName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

// Helper to load from localStorage
const getLocal = <T,>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved);
  } catch { return fallback; }
};

// Safe ID generator fallback for insecure contexts
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const students: Student[] = [];
const behaviorLogs: BehaviorLog[] = [];
const alerts: Alert[] = [];
const initialAttendance: AttendanceRecord[] = [];
const initialProgress: ProgressNote[] = [];
const initialLearningPlans: LearningPlan[] = [];
const initialActivityLogs: ActivityLog[] = [];
const initialMessages: Message[] = [];

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  students: Student[];
  users: User[];
  behaviorLogs: BehaviorLog[];
  alerts: Alert[];
  attendance: AttendanceRecord[];
  progressNotes: ProgressNote[];
  learningPlans: LearningPlan[];
  activityLogs: ActivityLog[];
  messages: Message[];
  iepRequests: IEPRequest[]; // This is a local state, not from Firestore
  addIEPRequest: (req: Omit<IEPRequest, 'id' | 'status' | 'timestamp'>) => Promise<void>;
  updateIEPRequest: (id: string, status: IEPRequest['status']) => Promise<void>;
  addSyncRequest: (req: any) => Promise<void>;
  addBehaviorLog: (log: Omit<BehaviorLog, 'id'>) => Promise<void>;
  markAlertReviewed: (id: string) => void;
  archiveStudent: (id: string) => Promise<void>;
  restoreStudent: (id: string) => Promise<void>;
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  addProgressNote: (note: Omit<ProgressNote, 'id'>) => Promise<void>;
  updateProgressNote: (id: string, updates: Partial<ProgressNote>) => Promise<void>;
  deleteProgressNote: (id: string) => Promise<void>;
  sendMessage: (msg: Omit<Message, 'id'>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  editMessage: (id: string, content: string) => Promise<void>;
  addActivityLog: (log: Omit<ActivityLog, 'id'>) => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'initials' | 'riskLevel' | 'teacher' | 'lastActivity' | 'status'> & { parentName?: string; parentEmail?: string; grade?: string }) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>; // This should be a soft delete (archive)
  addUser: (user: Omit<User, 'id' | 'status'>) => Promise<void>;
  isLoading: boolean;
  requestNotificationPermission: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getLocal('sned_auth_user', null));

  // States for real-time data from Firestore
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<BehaviorLog[]>(() => getLocal('sned_logs', behaviorLogs));
  const [alertList, setAlertList] = useState<Alert[]>(() => getLocal('sned_alerts', alerts));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getLocal('sned_attendance', initialAttendance));
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>(() => getLocal('sned_notes', initialProgress));
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>(() => getLocal('sned_plans', initialLearningPlans));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [messageList, setMessageList] = useState<Message[]>(() => getLocal('sned_messages', initialMessages));
  const [iepRequests, setIepRequests] = useState<IEPRequest[]>(() => getLocal('sned_iep_requests', []));
  const [isLoading, setIsLoading] = useState(true); // Initial loading for app context

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // --- REAL-TIME LISTENER for Users from Firestore ---
  useEffect(() => {
    const q = query(
      usersRef,
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersList);
    }, (error) => {
      console.error("Firestore Error fetching users in AppContext:", error);
      // Optionally, show a toast notification to the user
    });

    return () => unsubscribe();
  }, []);

  // --- REAL-TIME LISTENER for Students from Firestore ---
  useEffect(() => {
    const q = query(
      studentsRef,
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsList: Student[] = [];
      snapshot.forEach((doc) => {
        studentsList.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudentList(studentsList);
    }, (error) => { console.error("Firestore Error fetching students in AppContext:", error); });
    return () => unsubscribe();
  }, []);

  // --- REAL-TIME LISTENER for Activity Logs from Firestore ---
  useEffect(() => {
    const q = query(
      activityLogsRef,
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData: ActivityLog[] = [];
      snapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() } as ActivityLog);
      });
      setActivityLogs(logsData);
    }, (error) => { console.error("Firestore Error fetching activity logs:", error); });
    return () => unsubscribe();
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "denied" && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  };

  const triggerNativeNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/favicon.ico' });

      // Play a standard notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(e => console.warn("Browser blocked notification sound until user interaction:", e));
    }
  };

  // Save to localStorage on changes
  useEffect(() => { if (!isLoading && user) localStorage.setItem('sned_auth_user', JSON.stringify(user)); else if (!isLoading && user === null) localStorage.removeItem('sned_auth_user'); }, [user, isLoading]); // Only persist user auth
  // Removed localStorage for students and users as they are now real-time from Firestore
  // useEffect(() => { localStorage.setItem('sned_students', JSON.stringify(studentList)); }, [studentList]);
  // useEffect(() => { localStorage.setItem('sned_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('sned_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('sned_alerts', JSON.stringify(alertList)); }, [alertList]);
  useEffect(() => { localStorage.setItem('sned_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('sned_messages', JSON.stringify(messageList)); }, [messageList]);
  useEffect(() => { localStorage.setItem('sned_plans', JSON.stringify(learningPlans)); }, [learningPlans]);
  useEffect(() => { localStorage.setItem('sned_iep_requests', JSON.stringify(iepRequests)); }, [iepRequests]);

  const addIEPRequest = (req: Omit<IEPRequest, 'id' | 'status' | 'timestamp'>) => {
    const newReq: IEPRequest = {
      ...req,
      id: generateId(),
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setIepRequests(prev => [newReq, ...prev]);
    addActivityLog({
      userId: user?.id || 'parent',
      userName: user?.name || 'Parent',
      action: 'Submitted IEP Request',
      target: req.studentName,
      timestamp: new Date().toISOString()
    });
  };

  const updateIEPRequest = (id: string, status: IEPRequest['status']) => {
    setIepRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addSyncRequest = (req: any) => {
    addActivityLog({ // This should be a Firestore call as well
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Requested Data Sync',
      target: req.studentName,
      timestamp: new Date().toISOString()
    });
  };

  const addBehaviorLog = async (log: Omit<BehaviorLog, 'id'>) => {
    try {
      // 1. Save log to Firestore
      await firestoreAddBehaviorLog({
        studentId: log.studentId,
        type: log.type,
        description: log.description,
        date: log.date,
        time: log.time,
        location: log.location,
        riskLevel: log.riskLevel
      });

      // 2. Update student metadata in Firestore
      await firestoreUpdateStudent(log.studentId, {
        lastActivity: new Date().toISOString(),
        riskLevel: log.riskLevel
      });

      toast.success("Behavior log recorded.");
    } catch (error) {
      console.error("Error saving behavior log:", error);
      toast.error("Failed to save behavior log.");
    }

    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Logged Behavior',
      target: log.studentName,
      timestamp: new Date().toISOString()
    });

    // Real-time device notification for high risk events
    if (log.riskLevel === 'High') {
      triggerNativeNotification(
        `🚨 Priority Alert: ${log.studentName}`,
        `New ${log.type} log recorded. Priority level is set to HIGH.`
      );
    }

    // Generate an alert for High or Moderate risk levels
    if (log.riskLevel === 'High' || log.riskLevel === 'Moderate' || log.type === 'Concerning' || log.type === 'Attention Needed') {
      const studentGrade = studentList.find(s => s.id === log.studentId)?.grade || 'Unknown';
      const newAlert: Alert = {
        id: generateId(),
        studentName: log.studentName,
        message: log.description,
        priority: log.riskLevel,
        isNew: true,
        timestamp: new Date().toISOString(),
        reviewed: false,
        studentLevel: studentGrade,
      };
      setAlertList(prev => [newAlert, ...prev]);
    }
  };

  const addStudent = async (student: Omit<Student, 'id' | 'initials' | 'riskLevel' | 'teacher' | 'lastActivity' | 'status'> & { parentName?: string; parentEmail?: string; grade?: string }) => {
    const newId = generateId();
    const initials = student.name.trim().split(/\s+/).map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);
    
    const newStudentData: Student = {
      id: newId,
      initials,
      name: student.name,
      grade: student.grade || 'Grade 1',
      riskLevel: 'Low',
      teacher: user?.role === 'teacher' ? user.name : '',
      lastActivity: new Date().toLocaleString(),
      status: 'active',
      parentName: student.parentName,
      parentEmail: student.parentEmail,
    };

    try {
      await firestoreAddStudent(newStudentData);
      // The onSnapshot listener will update studentList
      toast.success(`Student ${student.name} added to registry.`);
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student.");
    }
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Added Student',
      target: student.name,
      timestamp: new Date().toISOString()
    });
  };

  const addUser = async (newUser: Omit<User, 'id' | 'status'>) => {
    // Firestore addUser uses email as ID
    const userData: UserDoc = {
      ...newUser as UserDoc, // Cast to UserDoc, assuming Omit<User, 'id' | 'status'> matches UserDoc structure
      status: 'active',
      id: newUser.email // Use email as ID for consistency with firestoreQueries.ts
    };
    try {
      await firestoreAddUser(userData);
      // The onSnapshot listener will update users state
      toast.success(`User ${newUser.name} added to registry.`);
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user.");
    }
    addActivityLog({ // This should be a Firestore call as well
      userId: user?.id || 'system', // TODO: This should be a Firestore call
      userName: user?.name || 'System',
      action: 'Created User Account',
      target: `${newUser.name} (${newUser.role})`,
      timestamp: new Date().toISOString()
    });
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const student = studentList.find(s => s.id === id);
    try {
      await firestoreUpdateStudent(id, updates as Partial<StudentDoc>);
      toast.success(`Student ${student?.name} updated.`);
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student.");
    }
    addActivityLog({ // This should be a Firestore call as well
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Updated Student Info',
      target: student?.name || id,
      timestamp: new Date().toISOString()
    });
  };

  const deleteStudent = async (id: string) => {
    // Assuming deleteStudent means archive in this context, as per previous discussions
    // If it's a hard delete, you'd need a firestore function for that.
    const student = studentList.find(s => s.id === id);
    try {
      await firestoreArchiveStudent(id); // Soft delete by archiving
      toast.success(`Student ${student?.name} archived.`);
    } catch (error) {
      console.error("Error archiving student:", error);
      toast.error("Failed to archive student.");
    }
    addActivityLog({ // This should be a Firestore call as well
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Permanently Deleted Student',
      target: student?.name || id,
      timestamp: new Date().toISOString()
    });
  };

  const updateUser = async (email: string, updates: Partial<User>) => {
    const targetUser = users.find(u => u.email === email);
    try {
      await updateUserProfile(email, updates as Partial<UserDoc>);
      toast.success(`User ${targetUser?.name} updated.`);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    }
    addActivityLog({ // This should be a Firestore call as well
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Updated User Account',
      target: targetUser?.name || id,
      timestamp: new Date().toISOString()
    });
  };

  const deleteUser = async (email: string) => {
    // Assuming deleteUser means archive in this context
    const targetUser = users.find(u => u.email === email);
    try {
      await firestoreArchiveUser(email); // Soft delete by archiving
      toast.success(`User ${targetUser?.name} archived.`);
    } catch (error) {
      console.error("Error archiving user:", error);
      toast.error("Failed to archive user.");
    }
    addActivityLog({ // This should be a Firestore call as well
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Permanently Deleted User',
      target: targetUser?.name || id,
      timestamp: new Date().toISOString()
    });
  };

  const archiveUser = async (email: string) => {
    const targetUser = users.find(u => u.email === email);
    try {
      await firestoreArchiveUser(email);
      toast.success(`User ${targetUser?.name} archived.`);
    } catch (error) {
      console.error("Error archiving user:", error);
      toast.error("Failed to archive user.");
    }
    addActivityLog({ // This should be a Firestore call as well
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Archived User',
      target: targetUser?.name || id,
      timestamp: new Date().toISOString()
    });
  };

  const markAlertReviewed = (id: string) => {
    const alert = alertList.find(a => a.id === id);
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, reviewed: true, isNew: false } : a)); // Local update
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Reviewed Alert',
      target: alert?.studentName || id,
      timestamp: new Date().toISOString()
    });
  };

  const restoreStudent = async (id: string) => {
    const student = studentList.find(s => s.id === id);
    try {
      await firestoreUpdateStudent(id, { status: 'active' });
      toast.success(`Student ${student?.name} restored.`);
    } catch (error) {
      console.error("Error restoring student:", error);
      toast.error("Failed to restore student.");
    }
    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Restored Student',
      target: student?.name || id,
      timestamp: new Date().toISOString()
    });
  };

  const addAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      await addDoc(attendanceRef, {
        studentId: record.studentId,
        date: record.date,
        status: record.status as any,
        remarks: record.note
      });
      toast.success(`Attendance updated for ${record.studentName}`);
    } catch (error) {
      console.error("Attendance Error:", error);
    }

    addActivityLog({
      userId: user?.id || 'system',
      userName: user?.name || 'System',
      action: 'Updated Attendance',
      target: record.studentName,
      timestamp: new Date().toISOString()
    });
  };

  const addProgressNote = async (note: Omit<ProgressNote, 'id'>) => {
    try {
      await addDoc(progressNotesRef, {
        studentId: note.studentId,
        authorEmail: user?.email || '',
        date: note.date,
        note: note.note,
        category: note.category as any
      });
    } catch (error) {
      console.error("Progress Note Error:", error);
    }

    triggerNativeNotification(
      `New Progress Note`,
      `Teacher ${note.createdBy} added a ${note.sentiment} update for ${note.studentName}.`
    );
    addActivityLog({
      userId: user?.id || 'teacher',
      userName: user?.name || 'Teacher',
      action: 'Added Progress Note',
      target: note.studentName,
      timestamp: new Date().toISOString()
    });
  };

  const updateProgressNote = async (id: string, updates: Partial<ProgressNote>) => {
    // This should be a Firestore call
    setProgressNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n)); // TODO: Convert to Firestore
  };

  const deleteProgressNote = async (id: string) => {
    // This should be a Firestore call
    setProgressNotes(prev => prev.filter(n => n.id !== id)); // TODO: Convert to Firestore
  };

  const sendMessage = async (msg: Omit<Message, 'id'>) => {
    // This should be a Firestore call
    setMessageList(prev => [...prev, { ...msg, id: generateId() }]); // TODO: Convert to Firestore
    triggerNativeNotification(
      `New Message from ${msg.from}`,
      msg.content.length > 50 ? `${msg.content.substring(0, 47)}...` : msg.content
    );
    addActivityLog({
      userId: user?.id || 'user',
      userName: msg.from,
      action: 'Sent Message',
      target: msg.to,
      timestamp: new Date().toISOString()
    });
  };

  const deleteMessage = async (id: string) => {
    // This should be a Firestore call
    setMessageList(prev => prev.filter(m => m.id !== id)); // TODO: Convert to Firestore
  };

  const editMessage = async (id: string, content: string) => {
    // This should be a Firestore call
    setMessageList(prev => prev.map(m => m.id === id ? { ...m, content } : m)); // TODO: Convert to Firestore
  };

  const markMessagesAsRead = async (fromName: string, toName: string) => {
    // This should be a Firestore call
    setMessageList(prev => prev.map(m => (m.from === fromName && m.to === toName) ? { ...m, read: true } : m)); // TODO: Convert to Firestore
  };

  const addActivityLog = async (log: Omit<ActivityLog, 'id'>) => {
    try {
      await firestoreAddActivityLog(log as any);
      // Real-time listener will update the state
    } catch (error) {
      console.error("Error persisting activity log to Firestore:", error);
    }
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      students: studentList,
      users,
      behaviorLogs: logs,
      alerts: alertList,
      attendance,
      iepRequests, addIEPRequest, updateIEPRequest, addSyncRequest,
      progressNotes,
      learningPlans, updateProgressNote, deleteProgressNote,
      activityLogs,
      messages: messageList,
      isLoading,
      addBehaviorLog, addUser, updateUser, deleteUser, archiveUser, markAlertReviewed, markMessagesAsRead,
      archiveStudent, restoreStudent, deleteStudent,
      addAttendance, addProgressNote, requestNotificationPermission,
      sendMessage, addActivityLog,
      addStudent, updateStudent, deleteStudent, deleteMessage, editMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
