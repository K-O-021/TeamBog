// SecurityCompliance.ts
// Handles security monitoring and compliance reporting

export interface SecurityEvent {
  id: string;
  type: 'LOGIN' | 'FAILED_LOGIN' | 'DATA_EXPORT' | 'DATA_DELETE' | 'SUSPICIOUS_ACTIVITY';
  userId: string;
  timestamp: Date;
  details?: string;
}

export class SecurityCompliance {
  private events: SecurityEvent[] = [];
  private complianceReports: string[] = [];

  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
    const newEvent: SecurityEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  getEvents(): SecurityEvent[] {
    return this.events;
  }

  generateComplianceReport(): string {
    const report = `Compliance Report - ${new Date().toISOString()}\nTotal Events: ${this.events.length}`;
    this.complianceReports.push(report);
    return report;
  }

  getComplianceReports(): string[] {
    return this.complianceReports;
  }
}
