import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot, 
  addDoc,
  setDoc,
  doc,
  updateDoc,
  getDoc, 
  DocumentData,
  FirestoreDataConverter,
  deleteDoc,
  Timestamp,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import { STORAGE_KEYS } from "./storageUtils";

/**
 * SCHEMAS (Types & Converters)
 * This acts as your "Schema" layer, ensuring data coming in/out of 
 * Firestore matches your TypeScript interfaces.
 */

export interface UserDoc {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent' | 'adviser';
  status: 'active' | 'archived' | 'pending';
  teacherId?: string;
  subject?: string;
  avatar?: string;
}

export interface StudentDoc {
  id?: string;
  name: string;
  grade: string;
  lrn: string;
  teacherEmail: string; // Changed from teacher (name) to email (FK) for 3NF
  parentEmail?: string;
  status: 'active' | 'archived';
  riskLevel: 'Low' | 'Moderate' | 'High';
  lastActivity: string;
}

export interface BehaviorLogDoc {
  id?: string;
  studentId: string;
  type: 'Positive' | 'Attention Needed' | 'Concerning';
  description: string;
  date: string;
  time: string;
  location: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
}

export interface AlertDoc {
  id?: string;
  message: string;
  isNew: boolean;
  timestamp: Timestamp;
  studentId?: string;
}

export interface AttendanceRecordDoc {
  id?: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Tardy' | 'Excused';
  remarks?: string;
}

export interface ProgressNoteDoc {
  id?: string;
  studentId: string;
  authorEmail: string;
  date: string;
  note: string; // Renamed to 'note' to match behaviorUtils.ts
  category: 'Behavioral' | 'Academic' | 'Social' | 'Monthly Narrative';
}

export interface LearningPlanDoc {
  id?: string;
  studentId: string;
  goals: string[];
  strategies: string[];
  status: 'Draft' | 'Active' | 'Completed';
  lastUpdated: string;
}

export interface MessageDoc {
  id?: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: Timestamp;
  read: boolean;
}

export interface ActivityLogDoc {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface IEPRequestDoc {
  id?: string;
  studentId: string;
  parentEmail: string;
  status: 'Pending' | 'Reviewing' | 'Approved' | 'Declined';
  requestDate: string;
  notes?: string;
}

/**
 * Generic Converter factory to enforce our Schema
 * Enforces Data Dictionary constraints during the transformation layer.
 */
function createConverter<T>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T): DocumentData {
      // Example Constraint: Ensure IDs are always present on write if necessary
      const record = data as any;
      if (record.lrn && String(record.lrn).length !== 12) {
        console.warn(`[DATA_DICTIONARY_VIOLATION]: LRN must be 12 digits.`);
      }
      return data as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return snapshot.data() as T;
    }
  };
}

// Collection References with Schemas applied
export const usersRef = collection(db, STORAGE_KEYS.USERS).withConverter(createConverter<UserDoc>());
export const studentsRef = collection(db, STORAGE_KEYS.STUDENTS).withConverter(createConverter<StudentDoc>());
export const logsRef = collection(db, STORAGE_KEYS.LOGS).withConverter(createConverter<BehaviorLogDoc>());
export const alertsRef = collection(db, STORAGE_KEYS.ALERTS).withConverter(createConverter<AlertDoc>());
export const attendanceRef = collection(db, STORAGE_KEYS.ATTENDANCE).withConverter(createConverter<AttendanceRecordDoc>());
export const progressNotesRef = collection(db, STORAGE_KEYS.NOTES).withConverter(createConverter<ProgressNoteDoc>());
export const learningPlansRef = collection(db, STORAGE_KEYS.LEARNING_PLANS).withConverter(createConverter<LearningPlanDoc>());
export const activityLogsRef = collection(db, STORAGE_KEYS.ACTIVITY_LOGS).withConverter(createConverter<ActivityLogDoc>());
export const messagesRef = collection(db, STORAGE_KEYS.MESSAGES).withConverter(createConverter<MessageDoc>());
export const iepRequestsRef = collection(db, STORAGE_KEYS.IEP).withConverter(createConverter<IEPRequestDoc>());

const generateId = () => crypto.randomUUID(); // Helper for client-side ID generation if needed


/**
 * USER QUERIES
 */

// Add a new teacher/user to the whitelist
export const addUser = async (userData: UserDoc) => {
  const docRef = doc(usersRef, userData.email);
  return await setDoc(docRef, userData);
};

// Fetch a specific user profile by UID
export const getUserProfile = async (uid: string) => {
  const docRef = doc(usersRef, uid);
  return await getDoc(docRef);
};

// Archive a user (Teacher Whitelist Archive)
export const archiveUser = async (email: string) => {
  return await updateUserProfile(email, { status: 'archived' });
};

// Add CRUD for User (updateUserProfile already exists)
export const deleteUser = async (email: string) => {
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return await deleteDoc(userDoc.ref);
  } else {
    throw new Error(`User with email ${email} not found for deletion.`);
  }
};

export const updateUserProfile = async (email: string, data: Partial<UserDoc>) => {
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return await updateDoc(userDoc.ref, data);
  } else {
    throw new Error(`User with email ${email} not found for update.`);
  }
};

// Get all staff members (Teachers/Admins) for the 'People' page
export const getStaffMembers = () => {
  return query(
    usersRef,
    where("role", "in", ["admin", "teacher"])
  );
};

/**
 * STUDENT QUERIES
 */

// Add a new student record
export const addStudent = async (studentData: StudentDoc) => {
  return await addDoc(studentsRef, { ...studentData, id: generateId() });
};

// Update student details (Edit functionality)
export const updateStudent = async (id: string, data: Partial<StudentDoc>) => {
  const docRef = doc(studentsRef, id);
  return await updateDoc(docRef, data);
};

// Archive a student (Archive functionality)
export const archiveStudent = async (id: string) => {
  return await updateStudent(id, { status: 'archived' });
};

 // Fetch all active students
export const getActiveStudentsQuery = () => {
  return query(
    studentsRef,
    where("status", "==", "active"),
    orderBy("name", "asc")
  );
};

// Fetch archived students for the 'Archive Vault'
export const getArchivedStudentsQuery = () => {
  return query(
    studentsRef,
    where("status", "==", "archived"),
    orderBy("name", "asc")
  );
};

// Fetch students assigned to a specific teacher
export const getTeacherStudentsQuery = (teacherEmail: string) => {
  return query(
    studentsRef,
    where("teacherEmail", "==", teacherEmail),
    where("status", "==", "active")
  );
};

// Add CRUD for BehaviorLogDoc
export const addBehaviorLog = async (logData: Omit<BehaviorLogDoc, 'id'>) => {
  return await addDoc(logsRef, { ...logData, id: generateId() });
};
export const updateBehaviorLog = async (id: string, data: Partial<BehaviorLogDoc>) => {
  const docRef = doc(logsRef, id);
  return await updateDoc(docRef, data);
};
export const deleteBehaviorLog = async (id: string) => {
  const docRef = doc(logsRef, id);
  return await deleteDoc(docRef);
};

// Add CRUD for AlertDoc
export const addAlert = async (alertData: Omit<AlertDoc, 'id'>) => {
  return await addDoc(alertsRef, { ...alertData, id: generateId() });
};

// Add a new activity log entry
export const addActivityLog = async (logData: Omit<ActivityLogDoc, 'id'>) => {
  return await addDoc(activityLogsRef, logData);
};

/**
 * BEHAVIOR LOG QUERIES
 */

// Fetch logs for a specific student (used for Risk Prediction and Analytics)
export const getStudentLogsQuery = (studentId: string) => {
  return query(
    logsRef,
    where("studentId", "==", studentId),
    orderBy("date", "desc"),
    orderBy("time", "desc")
  ).withConverter(createConverter<BehaviorLogDoc>());
};

// Fetch all "Concerning" logs for the Admin Alert badge
export const getHighRiskAlertsQuery = () => {
  return query(
    logsRef,
    where("type", "==", "Concerning"),
    orderBy("date", "desc"),
    limit(20) // This query is already defined in firestoreQueries.ts
  );
};

/**
 * PROGRESS & ANALYTICS QUERIES
 */

// Fetch progress notes for a student's Monthly Narrative
export const getMonthlyNotesQuery = (studentId: string) => {
  return query(
    progressNotesRef,
    where("studentId", "==", studentId),
    orderBy("date", "desc")
  );
};

// Get active alerts for the BottomNav badge
export const getUnreadAlertsQuery = () => {
  return query(alertsRef, where("isNew", "==", true));
};