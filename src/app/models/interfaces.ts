export interface EventTaskDto {
  id: number;
  title: string;
  isCompleted: boolean;
  assignedUserNames?: string[];
}

export interface CreateTaskDto {
  title: string;
  assignedUserIds: string[]; 
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
  tasks?: EventTaskDto[];
}