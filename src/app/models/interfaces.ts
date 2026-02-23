export interface User {
  id: number;
  userName: string;
  email: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  isPublic: boolean;
  ownerId: string;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  start: string;
  end: string;
  color?: string;
  type?: string;
  isPrivate: boolean;
  maskDetails: boolean;
  groupId?: number | null;
  userId: number;
  extendedProps?: any; 
}

export interface Expense {
  id: number;
  title: string;
  amountTotal: number;
  paidBy: number;
  calendarEventId: number;
}