// AdminService.ts
// Concrete implementation of AdminBase for the platform

import { AdminBase, AdminUser, SupportTicket, AuditLog, SystemSettings } from './AdminBase';

// Example in-memory stores (replace with real DB integration)
const users: AdminUser[] = [];
const tickets: SupportTicket[] = [];
const auditLogs: AuditLog[] = [];
let systemSettings: SystemSettings = {
  notificationsEnabled: true,
  defaultRole: 'TEACHER',
  integrations: {},
};

export class AdminService extends AdminBase {
  async createUser(user: Partial<AdminUser>): Promise<AdminUser> {
    const newUser: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'TEACHER',
      status: 'ACTIVE',
    };
    users.push(newUser);
    auditLogs.push({
      id: Math.random().toString(36).substr(2, 9),
      action: 'CREATE_USER',
      performedBy: 'admin',
      targetId: newUser.id,
      timestamp: new Date(),
    });
    return newUser;
  }

  async deleteUser(userId: string): Promise<void> {
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users.splice(idx, 1);
      auditLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        action: 'DELETE_USER',
        performedBy: 'admin',
        targetId: userId,
        timestamp: new Date(),
      });
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    auditLogs.push({
      id: Math.random().toString(36).substr(2, 9),
      action: 'UPDATE_USER',
      performedBy: 'admin',
      targetId: userId,
      timestamp: new Date(),
    });
    return user;
  }

  async resetPassword(userId: string): Promise<void> {
    // Simulate password reset
    auditLogs.push({
      id: Math.random().toString(36).substr(2, 9),
      action: 'RESET_PASSWORD',
      performedBy: 'admin',
      targetId: userId,
      timestamp: new Date(),
    });
  }

  async suspendUser(userId: string): Promise<void> {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = 'SUSPENDED';
      auditLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        action: 'SUSPEND_USER',
        performedBy: 'admin',
        targetId: userId,
        timestamp: new Date(),
      });
    }
  }

  async reactivateUser(userId: string): Promise<void> {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = 'ACTIVE';
      auditLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        action: 'REACTIVATE_USER',
        performedBy: 'admin',
        targetId: userId,
        timestamp: new Date(),
      });
    }
  }

  async archiveUser(userId: string): Promise<void> {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = 'ARCHIVED';
      auditLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        action: 'ARCHIVE_USER',
        performedBy: 'admin',
        targetId: userId,
        timestamp: new Date(),
      });
    }
  }

  async assignRole(userId: string, role: AdminUser['role']): Promise<void> {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      auditLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        action: 'ASSIGN_ROLE',
        performedBy: 'admin',
        targetId: userId,
        timestamp: new Date(),
        details: `Role set to ${role}`,
      });
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return auditLogs;
  }

  async getSystemSettings(): Promise<SystemSettings> {
    return systemSettings;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    systemSettings = { ...systemSettings, ...settings };
    auditLogs.push({
      id: Math.random().toString(36).substr(2, 9),
      action: 'UPDATE_SYSTEM_SETTINGS',
      performedBy: 'admin',
      timestamp: new Date(),
    });
    return systemSettings;
  }

  async getSupportTickets(): Promise<SupportTicket[]> {
    return tickets;
  }

  async respondToSupportTicket(ticketId: string, message: string): Promise<void> {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = 'RESOLVED';
      ticket.updatedAt = new Date();
      auditLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        action: 'RESPOND_SUPPORT_TICKET',
        performedBy: 'admin',
        targetId: ticketId,
        timestamp: new Date(),
        details: message,
      });
    }
  }
}
