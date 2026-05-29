// AdminBase.ts
// Central admin feature entry point and shared logic

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ROOT_ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetId?: string;
  timestamp: Date;
  details?: string;
}

export interface SystemSettings {
  notificationsEnabled: boolean;
  defaultRole: 'TEACHER' | 'PARENT';
  integrations: Record<string, any>;
}

export abstract class AdminBase {
  abstract createUser(user: Partial<AdminUser>): Promise<AdminUser>;
  abstract deleteUser(userId: string): Promise<void>;
  abstract updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser>;
  abstract resetPassword(userId: string): Promise<void>;
  abstract suspendUser(userId: string): Promise<void>;
  abstract reactivateUser(userId: string): Promise<void>;
  abstract archiveUser(userId: string): Promise<void>;

  abstract assignRole(userId: string, role: AdminUser['role']): Promise<void>;
  abstract getAuditLogs(): Promise<AuditLog[]>;
  abstract getSystemSettings(): Promise<SystemSettings>;
  abstract updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;

  abstract getSupportTickets(): Promise<SupportTicket[]>;
  abstract respondToSupportTicket(ticketId: string, message: string): Promise<void>;

  // Add more abstract methods as needed for admin features
}
