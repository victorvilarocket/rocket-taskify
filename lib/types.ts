// ClickUp Types
export interface ClickUpWorkspace {
  id: string;
  name: string;
}

export interface ClickUpSpace {
  id: string;
  name: string;
}

export interface ClickUpFolder {
  id: string;
  name: string;
}

export interface ClickUpList {
  id: string;
  name: string;
  folder?: {
    id: string;
    name: string;
  };
}

export interface ClickUpSprint {
  id: string;
  name: string;
}

export interface ClickUpMember {
  id: number;
  username: string;
  email: string;
  color?: string;
  profilePicture?: string;
}

export interface ClickUpEpic {
  id: string;
  name: string;
  color?: string;
}

export interface ClickUpStatus {
  id: string;
  status: string;
  color?: string;
  orderindex: number;
  type: string;
}

// Task Types
export type TaskType = 'task' | 'bug' | 'meet';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface TaskData {
  name: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  timeEstimate: number; // in minutes
  assignees?: number[];
  sprintId?: string;
  tags?: string[];
  epicId?: string;
  status?: string;
  dueDate?: number; // timestamp in milliseconds
}

export interface TaskSuggestion {
  name: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  timeEstimate: number;
  tags: string[];
  suggestedSpaceId?: string;
  suggestedAssigneeIds?: number[];
  suggestedSprintId?: string;
  suggestedEpicId?: string;
  suggestedStatus?: string;
  suggestedDueDate?: number;
}

export interface TaskFormData {
  description: string;
  attachments?: File[];
  availableSpaces?: { id: string; name: string }[];
  availableMembers?: { id: number; username: string; email: string }[];
  availableSprints?: { id: string; name: string }[];
  availableEpics?: { id: string; name: string }[];
  availableStatuses?: { id: string; status: string }[];
}

