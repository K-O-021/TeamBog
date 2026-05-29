// ReportingAnalytics.ts
// Handles reporting and analytics for admin dashboard

export interface UserActivity {
  userId: string;
  action: string;
  timestamp: Date;
}

export class ReportingAnalytics {
  private activities: UserActivity[] = [];
  private reports: string[] = [];

  logActivity(activity: Omit<UserActivity, 'timestamp'>): UserActivity {
    const newActivity: UserActivity = {
      ...activity,
      timestamp: new Date(),
    };
    this.activities.push(newActivity);
    return newActivity;
  }

  getActivities(): UserActivity[] {
    return this.activities;
  }

  generateReport(): string {
    const report = `Analytics Report - ${new Date().toISOString()}\nTotal Activities: ${this.activities.length}`;
    this.reports.push(report);
    return report;
  }

  getReports(): string[] {
    return this.reports;
  }
}
