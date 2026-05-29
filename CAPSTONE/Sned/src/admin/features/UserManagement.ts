// UserManagement.ts
// Handles user creation, deletion, role assignment, profile management, password reset, and account status

import { AdminUser } from '../AdminBase';

export class UserManagement {
  private users: AdminUser[] = [];

  createUser(user: Partial<AdminUser>): AdminUser {
    const newUser: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'TEACHER',
      status: 'ACTIVE',
    };
    this.users.push(newUser);
    return newUser;
  }

  deleteUser(userId: string): boolean {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      return true;
    }
    return false;
  }

  updateUser(userId: string, updates: Partial<AdminUser>): AdminUser | null {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  }

  resetPassword(userId: string): boolean {
    // Simulate password reset
    return this.users.some(u => u.id === userId);
  }

  suspendUser(userId: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = 'SUSPENDED';
      return true;
    }
    return false;
  }

  reactivateUser(userId: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = 'ACTIVE';
      return true;
    }
    return false;
  }

  archiveUser(userId: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.status = 'ARCHIVED';
      return true;
    }
    return false;
  }

  assignRole(userId: string, role: AdminUser['role']): boolean {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      return true;
    }
    return false;
  }

  getUser(userId: string): AdminUser | undefined {
    return this.users.find(u => u.id === userId);
  }

  getAllUsers(): AdminUser[] {
    return this.users;
  }
}
