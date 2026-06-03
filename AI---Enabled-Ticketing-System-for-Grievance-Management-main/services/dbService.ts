
import { Ticket, User, UserRole } from "../types";

const STORAGE_KEYS = {
  TICKETS: 'grievance_pro_tickets',
  USERS: 'grievance_pro_users',
  SESSION: 'grievance_pro_session'
};

export class DBService {
  public static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      // Create initial admin
      const initialAdmin: User = {
        id: 'admin-001',
        email: 'admin@grievance.pro',
        name: 'System Admin',
        role: UserRole.ADMIN,
        password: 'password123'
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([initialAdmin]));
      return [initialAdmin];
    }
    return JSON.parse(data);
  }

  public static saveUser(user: User) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public static getTickets(): Ticket[] {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
  }

  public static saveTicket(ticket: Ticket) {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets[index] = ticket;
    } else {
      tickets.push(ticket);
    }
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }

  public static deleteTicket(id: string) {
    const tickets = this.getTickets();
    const filtered = tickets.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(filtered));
  }

  public static getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  }

  public static setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }
}
