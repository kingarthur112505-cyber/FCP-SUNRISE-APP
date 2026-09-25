export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null for root folders
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  color?: string;
  icon?: string;
}

export type FileCategory = 'pdf' | 'doc' | 'spreadsheet' | 'presentation' | 'image' | 'video' | 'archive' | 'text' | 'other';

export interface FileItem {
  id: string;
  name: string;
  extension: string; // e.g. "pdf", "docx", "xlsx", "jpg", "png", "zip"
  category: FileCategory;
  folderId: string; // folder it belongs to
  size: number; // in bytes
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  ownerName: string;
  isFavorite: boolean;
  isTrash: boolean;
  deletedAt?: string;
  tags: string[];
  storageRef: string; // e.g. s3://fcp-sunrise-vault/travel-packages/japan/tokyo-itinerary.pdf
  previewUrl?: string; // image url or data url for real uploaded files
  contentPreview?: string; // text excerpt or formatted summary
  relatedTaskId?: string;
  relatedClientId?: string;
  notes?: string;
  version: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  assigneeRole: string;
  assigneeAvatar?: string;
  notes: string;
  checklist: TaskChecklistItem[];
  attachmentIds: string[]; // references FileItem.id
  relatedClientId?: string;
  createdAt: string;
}

export type ClientStatus = 'new_lead' | 'contacted' | 'follow_up' | 'confirmed' | 'completed' | 'cancelled';

export interface Client {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  destination: string;
  inquiryDate: string;
  status: ClientStatus;
  notes: string;
  paxCount: number;
  budget?: string;
  departureDate?: string;
  relatedFileIds: string[];
  relatedTaskIds: string[];
}

export type CalendarEventType = 'task_deadline' | 'client_appointment' | 'travel_date' | 'internal_event';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: CalendarEventType;
  relatedId?: string;
  description?: string;
  location?: string;
}

export type ActiveNavTab = 
  | 'dashboard' 
  | 'files' 
  | 'favorites' 
  | 'trash' 
  | 'tasks' 
  | 'calendar' 
  | 'clients' 
  | 'reports' 
  | 'settings';
