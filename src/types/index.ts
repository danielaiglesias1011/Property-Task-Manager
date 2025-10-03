export interface User {
  id: string;
  name: string;
  email: string;
  approvalLevel: 1 | 2 | 3;
  role: 'admin' | 'manager' | 'user';
  permissions: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttachmentType {
  id: string;
  name: string;
  category: 'project' | 'task';
  isDefault: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  typeId: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  assigneeId: string;
  propertyId: string;
  projectId?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  comments: Comment[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
}

export interface FundingDetail {
  id: string;
  type: 'deposit' | 'progress' | 'final' | 'budget';
  amount: number;
  date: Date;
  projectId: string;
  paymentStatus: 'paid' | 'unpaid';
  paidDate?: Date;
  paidBy?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  propertyId: string;
  budget: number;
  category: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'pending' | 'pending-approval' | 'approved' | 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  approvalType: 'single' | 'group';
  approvalLevel: 1 | 2 | 3;
  assignedApproverId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  fundingDetails: FundingDetail[];
  tasks: Task[];
}

export interface ApprovalHistory {
  id: string;
  projectId: string;
  approverId: string;
  action: 'approved' | 'rejected' | 'requested-changes';
  comments?: string;
  createdAt: Date;
}

export type AttachmentTypeCategory = 'estimate' | 'invoice' | 'quote' | 'contract' | 'other';

export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Priority {
  id: string;
  name: string;
  level: number;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Status {
  id: string;
  name: string;
  type: 'project' | 'task';
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface ApprovalGroup {
  id: string;
  name: string;
  level: number;
  userIds: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  users: User[];
  properties: Property[];
  projects: Project[];
  tasks: Task[];
  attachmentTypes: AttachmentType[];
  approvalHistory: ApprovalHistory[];
  projectCategories: ProjectCategory[];
  priorities: Priority[];
  statuses: Status[];
  approvalGroups: ApprovalGroup[];
  currentUser: User | null;
}

