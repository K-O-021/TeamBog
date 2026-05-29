/**
 * Neural Storage Engine v1.0
 * Handles institutional data persistence and real-time synchronization.
 */

export const STORAGE_KEYS = {
  USERS: 'sned_link_users',
  STUDENTS: 'sned_link_students',
  LOGS: 'sned_link_behavior_logs',
  NOTES: 'sned_link_progress_notes',
  ATTENDANCE: 'sned_link_attendance',
  LEARNING_PLANS: 'sned_link_learning_plans',
  ACTIVITY_LOGS: 'sned_link_activity_logs',
  MESSAGES: 'sned_link_messages',
  IEP: 'sned_link_iep_requests',
  ALERTS: 'sned_link_alerts',
  AUTH: 'sned_link_auth_session',
};

/**
 * Persists data to the local matrix.
 */
export const persistData = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`[STORAGE_FAULT]: Failed to commit vector ${key} to disk.`, error);
  }
};

/**
 * Retrieves data from the local matrix.
 */
export const retrieveData = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const serialized = localStorage.getItem(key);
    return serialized ? JSON.parse(serialized) : null;
  } catch (error) {
    console.error(`[STORAGE_FAULT]: Failed to extract vector ${key} from disk.`, error);
    return null;
  }
};