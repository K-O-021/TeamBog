// Support.ts
// Handles support tickets, messaging, and announcements

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
  responses: Array<{ responderId: string; message: string; date: Date }>;
}

export class Support {
  private tickets: SupportTicket[] = [];

  submitTicket(ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'responses'>): SupportTicket {
    const newTicket: SupportTicket = {
      ...ticket,
      id: Math.random().toString(36).substr(2, 9),
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: [],
    };
    this.tickets.push(newTicket);
    return newTicket;
  }

  respondToTicket(ticketId: string, responderId: string, message: string): boolean {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return false;
    ticket.responses.push({ responderId, message, date: new Date() });
    ticket.status = 'IN_PROGRESS';
    ticket.updatedAt = new Date();
    return true;
  }

  closeTicket(ticketId: string): boolean {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return false;
    ticket.status = 'CLOSED';
    ticket.updatedAt = new Date();
    return true;
  }

  getTickets(): SupportTicket[] {
    return this.tickets;
  }
}
