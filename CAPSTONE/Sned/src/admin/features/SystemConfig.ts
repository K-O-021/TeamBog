// SystemConfig.ts
// Handles system settings, access control, and audit logs

import { SystemSettings, AuditLog } from '../AdminBase';

export class SystemConfig {
  private settings: SystemSettings = {
    notificationsEnabled: true,
    defaultRole: 'TEACHER',
    integrations: {},
  };
  private auditLogs: AuditLog[] = [];

  getSettings(): SystemSettings {
    return this.settings;
  }

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.settings = { ...this.settings, ...updates };
    this.auditLogs.push({
      id: Math.random().toString(36).substr(2, 9),
      action: 'UPDATE_SETTINGS',
      performedBy: 'admin',
      timestamp: new Date(),
    });
    return this.settings;
  }

  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  addAuditLog(log: AuditLog): void {
    this.auditLogs.push(log);
  }
}
