import { supabase } from '../supabaseClient';
import { User, Property, Project, Task, FundingDetail, AttachmentType, ApprovalHistory, ProjectCategory, Priority, Status, ApprovalGroup } from '../types';

// Generic function to handle Supabase errors
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error);
  throw new Error(`Failed to ${operation}: ${error.message}`);
};

// Convert database rows to app types (handle date conversion)
const convertRowToUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  approvalLevel: row.approval_level,
  role: row.role,
  permissions: row.permissions || [],
  isArchived: row.is_archived || false,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const convertRowToProperty = (row: any): Property => ({
  id: row.id,
  name: row.name,
  address: row.address,
  description: row.description,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

const convertRowToProject = (row: any): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  propertyId: row.property_id,
  budget: parseFloat(row.budget),
  category: row.category,
  startDate: new Date(row.start_date),
  endDate: new Date(row.end_date),
  status: row.status,
  priority: row.priority,
  approvalType: row.approval_type,
  approvalLevel: row.approval_level,
  assignedApproverId: row.assigned_approver_id,
  createdBy: row.created_by,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  attachments: [], // Will be loaded separately
  fundingDetails: [], // Will be loaded separately
  tasks: [] // Will be loaded separately
});

const convertRowToTask = (row: any): Task => {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    assigneeId: row.assignee_id || null,
    propertyId: row.property_id || null,
    projectId: row.project_id || null,
    status: row.status,
    priority: row.priority,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
};

const convertRowToFundingDetail = (row: any): FundingDetail => ({
  id: row.id,
  type: row.type,
  amount: parseFloat(row.amount),
  date: new Date(row.date),
  projectId: row.project_id,
  paymentStatus: row.payment_status,
  paidDate: row.paid_date ? new Date(row.paid_date) : undefined,
  paidBy: row.paid_by
});

const convertRowToAttachmentType = (row: any): AttachmentType => ({
  id: row.id,
  name: row.name,
  category: row.category,
  isDefault: row.is_default
});

const convertRowToProjectCategory = (row: any): ProjectCategory => ({
  id: row.id,
  name: row.name,
  description: row.description,
  isDefault: row.is_default,
  createdAt: new Date(row.created_at)
});

const convertRowToPriority = (row: any): Priority => ({
  id: row.id,
  name: row.name,
  level: row.level,
  color: row.color,
  isDefault: row.is_default,
  createdAt: new Date(row.created_at)
});

const convertRowToStatus = (row: any): Status => ({
  id: row.id,
  name: row.name,
  type: row.type,
  color: row.color,
  isDefault: row.is_default,
  createdAt: new Date(row.created_at)
});

const convertRowToApprovalGroup = (row: any): ApprovalGroup => ({
  id: row.id,
  name: row.name,
  level: row.level,
  userIds: row.user_ids || [],
  description: row.description,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
});

// Convert app types to database format
const convertUserToRow = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  approval_level: user.approvalLevel,
  role: user.role,
  permissions: user.permissions,
  is_archived: user.isArchived,
  created_at: user.createdAt.toISOString(),
  updated_at: user.updatedAt.toISOString()
});

const convertPropertyToRow = (property: Property) => ({
  id: property.id,
  name: property.name,
  address: property.address,
  description: property.description,
  created_at: property.createdAt.toISOString(),
  updated_at: property.updatedAt.toISOString()
});

const convertProjectToRow = (project: Project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  property_id: project.propertyId,
  budget: project.budget,
  category: project.category,
  start_date: project.startDate.toISOString().split('T')[0],
  end_date: project.endDate.toISOString().split('T')[0],
  status: project.status,
  priority: project.priority,
  approval_type: project.approvalType,
  approval_level: project.approvalLevel,
  assigned_approver_id: project.assignedApproverId,
  created_by: project.createdBy,
  created_at: project.createdAt.toISOString(),
  updated_at: project.updatedAt.toISOString()
});

const convertTaskToRow = (task: Task) => ({
  id: task.id,
  name: task.name,
  description: task.description,
  start_date: task.startDate.toISOString().split('T')[0],
  end_date: task.endDate.toISOString().split('T')[0],
  assignee_id: task.assigneeId,
  property_id: task.propertyId,
  project_id: task.projectId,
  status: task.status,
  priority: task.priority,
  created_at: task.createdAt.toISOString(),
  updated_at: task.updatedAt.toISOString()
});

const convertFundingDetailToRow = (funding: FundingDetail) => ({
  id: funding.id,
  type: funding.type,
  amount: funding.amount,
  date: funding.date.toISOString().split('T')[0],
  project_id: funding.projectId,
  payment_status: funding.paymentStatus,
  paid_date: funding.paidDate?.toISOString().split('T')[0] || null,
  paid_by: funding.paidBy || null
});

const convertAttachmentTypeToRow = (type: AttachmentType) => ({
  id: type.id,
  name: type.name,
  category: type.category,
  is_default: type.isDefault
});

const convertProjectCategoryToRow = (category: ProjectCategory) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  is_default: category.isDefault,
  created_at: category.createdAt.toISOString()
});

const convertPriorityToRow = (priority: Priority) => ({
  id: priority.id,
  name: priority.name,
  level: priority.level,
  color: priority.color,
  is_default: priority.isDefault,
  created_at: priority.createdAt.toISOString()
});

const convertStatusToRow = (status: Status) => ({
  id: status.id,
  name: status.name,
  type: status.type,
  color: status.color,
  is_default: status.isDefault,
  created_at: status.createdAt.toISOString()
});

const convertApprovalGroupToRow = (group: ApprovalGroup) => ({
  id: group.id,
  name: group.name,
  level: group.level,
  user_ids: group.userIds,
  description: group.description,
  created_at: group.createdAt.toISOString(),
  updated_at: group.updatedAt.toISOString()
});

// User operations
export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) handleSupabaseError(error, 'fetching users');
    return data?.map(convertRowToUser) || [];
  },

  async create(user: User): Promise<User> {
    const { data, error } = await supabase.from('users').insert(convertUserToRow(user)).select().single();
    if (error) handleSupabaseError(error, 'creating user');
    return convertRowToUser(data);
  },

  async update(user: User): Promise<User> {
    const { data, error } = await supabase.from('users').update(convertUserToRow(user)).eq('id', user.id).select().single();
    if (error) handleSupabaseError(error, 'updating user');
    return convertRowToUser(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting user');
  }
};

// Property operations
export const propertyService = {
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase.from('properties').select('*');
    if (error) handleSupabaseError(error, 'fetching properties');
    return data?.map(convertRowToProperty) || [];
  },

  async create(property: Property): Promise<Property> {
    const { data, error } = await supabase.from('properties').insert(convertPropertyToRow(property)).select().single();
    if (error) handleSupabaseError(error, 'creating property');
    return convertRowToProperty(data);
  },

  async update(property: Property): Promise<Property> {
    const { data, error } = await supabase.from('properties').update(convertPropertyToRow(property)).eq('id', property.id).select().single();
    if (error) handleSupabaseError(error, 'updating property');
    return convertRowToProperty(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting property');
  }
};

// Project operations
export const projectService = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) handleSupabaseError(error, 'fetching projects');
    
    const projects = data?.map(convertRowToProject) || [];
    
    // Load funding details and tasks for each project
    for (const project of projects) {
      project.fundingDetails = await fundingService.getByProjectId(project.id);
      project.tasks = await taskService.getByProjectId(project.id);
    }
    
    return projects;
  },

  async create(project: Project): Promise<Project> {
    const { data, error } = await supabase.from('projects').insert(convertProjectToRow(project)).select().single();
    if (error) handleSupabaseError(error, 'creating project');
    
    const newProject = convertRowToProject(data);
    
    // Create funding details and tasks
    if (project.fundingDetails.length > 0) {
      for (const funding of project.fundingDetails) {
        funding.projectId = newProject.id;
        await fundingService.create(funding);
      }
    }
    
    if (project.tasks.length > 0) {
      for (const task of project.tasks) {
        task.projectId = newProject.id;
        await taskService.create(task);
      }
    }
    
    return newProject;
  },

  async update(project: Project): Promise<Project> {
    const { data, error } = await supabase.from('projects').update(convertProjectToRow(project)).eq('id', project.id).select().single();
    if (error) handleSupabaseError(error, 'updating project');
    return convertRowToProject(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting project');
  }
};

// Task operations
export const taskService = {
  async getAll(): Promise<Task[]> {
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) {
        console.warn('Tasks table might not exist or be empty:', error.message);
        return []; // Return empty array if tasks table doesn't exist
      }
      return data?.map(convertRowToTask) || [];
    } catch (error) {
      console.warn('Error fetching tasks:', error);
      return [];
    }
  },

  async getByProjectId(projectId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId);
      if (error) {
        console.warn('Tasks table might not exist or be empty:', error.message);
        return []; // Return empty array if tasks table doesn't exist
      }
      return data?.map(convertRowToTask) || [];
    } catch (error) {
      console.warn('Error fetching tasks for project:', error);
      return [];
    }
  },

  async create(task: Task): Promise<Task> {
    const { data, error } = await supabase.from('tasks').insert(convertTaskToRow(task)).select().single();
    if (error) handleSupabaseError(error, 'creating task');
    return convertRowToTask(data);
  },

  async update(task: Task): Promise<Task> {
    const { data, error } = await supabase.from('tasks').update(convertTaskToRow(task)).eq('id', task.id).select().single();
    if (error) handleSupabaseError(error, 'updating task');
    return convertRowToTask(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting task');
  }
};

// Funding operations
export const fundingService = {
  async getAll(): Promise<FundingDetail[]> {
    const { data, error } = await supabase.from('funding_details').select('*');
    if (error) handleSupabaseError(error, 'fetching funding details');
    return data?.map(convertRowToFundingDetail) || [];
  },

  async getByProjectId(projectId: string): Promise<FundingDetail[]> {
    const { data, error } = await supabase.from('funding_details').select('*').eq('project_id', projectId);
    if (error) handleSupabaseError(error, 'fetching funding details for project');
    return data?.map(convertRowToFundingDetail) || [];
  },

  async create(funding: FundingDetail): Promise<FundingDetail> {
    const { data, error } = await supabase.from('funding_details').insert(convertFundingDetailToRow(funding)).select().single();
    if (error) handleSupabaseError(error, 'creating funding detail');
    return convertRowToFundingDetail(data);
  },

  async update(funding: FundingDetail): Promise<FundingDetail> {
    const { data, error } = await supabase.from('funding_details').update(convertFundingDetailToRow(funding)).eq('id', funding.id).select().single();
    if (error) handleSupabaseError(error, 'updating funding detail');
    return convertRowToFundingDetail(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('funding_details').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting funding detail');
  }
};

// Attachment Type operations
export const attachmentTypeService = {
  async getAll(): Promise<AttachmentType[]> {
    const { data, error } = await supabase.from('attachment_types').select('*');
    if (error) handleSupabaseError(error, 'fetching attachment types');
    return data?.map(convertRowToAttachmentType) || [];
  },

  async create(type: AttachmentType): Promise<AttachmentType> {
    const { data, error } = await supabase.from('attachment_types').insert(convertAttachmentTypeToRow(type)).select().single();
    if (error) handleSupabaseError(error, 'creating attachment type');
    return convertRowToAttachmentType(data);
  },

  async update(type: AttachmentType): Promise<AttachmentType> {
    const { data, error } = await supabase.from('attachment_types').update(convertAttachmentTypeToRow(type)).eq('id', type.id).select().single();
    if (error) handleSupabaseError(error, 'updating attachment type');
    return convertRowToAttachmentType(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('attachment_types').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting attachment type');
  }
};

// Project Category operations
export const projectCategoryService = {
  async getAll(): Promise<ProjectCategory[]> {
    const { data, error } = await supabase.from('project_categories').select('*');
    if (error) handleSupabaseError(error, 'fetching project categories');
    return data?.map(convertRowToProjectCategory) || [];
  },

  async create(category: ProjectCategory): Promise<ProjectCategory> {
    const { data, error } = await supabase.from('project_categories').insert(convertProjectCategoryToRow(category)).select().single();
    if (error) handleSupabaseError(error, 'creating project category');
    return convertRowToProjectCategory(data);
  },

  async update(category: ProjectCategory): Promise<ProjectCategory> {
    const { data, error } = await supabase.from('project_categories').update(convertProjectCategoryToRow(category)).eq('id', category.id).select().single();
    if (error) handleSupabaseError(error, 'updating project category');
    return convertRowToProjectCategory(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('project_categories').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting project category');
  }
};

// Priority operations
export const priorityService = {
  async getAll(): Promise<Priority[]> {
    const { data, error } = await supabase.from('priorities').select('*');
    if (error) handleSupabaseError(error, 'fetching priorities');
    return data?.map(convertRowToPriority) || [];
  },

  async create(priority: Priority): Promise<Priority> {
    const { data, error } = await supabase.from('priorities').insert(convertPriorityToRow(priority)).select().single();
    if (error) handleSupabaseError(error, 'creating priority');
    return convertRowToPriority(data);
  },

  async update(priority: Priority): Promise<Priority> {
    const { data, error } = await supabase.from('priorities').update(convertPriorityToRow(priority)).eq('id', priority.id).select().single();
    if (error) handleSupabaseError(error, 'updating priority');
    return convertRowToPriority(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('priorities').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting priority');
  }
};

// Status operations
export const statusService = {
  async getAll(): Promise<Status[]> {
    const { data, error } = await supabase.from('statuses').select('*');
    if (error) handleSupabaseError(error, 'fetching statuses');
    return data?.map(convertRowToStatus) || [];
  },

  async create(status: Status): Promise<Status> {
    const { data, error } = await supabase.from('statuses').insert(convertStatusToRow(status)).select().single();
    if (error) handleSupabaseError(error, 'creating status');
    return convertRowToStatus(data);
  },

  async update(status: Status): Promise<Status> {
    const { data, error } = await supabase.from('statuses').update(convertStatusToRow(status)).eq('id', status.id).select().single();
    if (error) handleSupabaseError(error, 'updating status');
    return convertRowToStatus(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('statuses').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting status');
  }
};

// Approval Group operations
export const approvalGroupService = {
  async getAll(): Promise<ApprovalGroup[]> {
    const { data, error } = await supabase.from('approval_groups').select('*');
    if (error) handleSupabaseError(error, 'fetching approval groups');
    return data?.map(convertRowToApprovalGroup) || [];
  },

  async create(group: ApprovalGroup): Promise<ApprovalGroup> {
    const { data, error } = await supabase.from('approval_groups').insert(convertApprovalGroupToRow(group)).select().single();
    if (error) handleSupabaseError(error, 'creating approval group');
    return convertRowToApprovalGroup(data);
  },

  async update(group: ApprovalGroup): Promise<ApprovalGroup> {
    const { data, error } = await supabase.from('approval_groups').update(convertApprovalGroupToRow(group)).eq('id', group.id).select().single();
    if (error) handleSupabaseError(error, 'updating approval group');
    return convertRowToApprovalGroup(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('approval_groups').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleting approval group');
  }
};

// Special operations
export const updatePaymentStatus = async (projectId: string, fundingId: string, paymentStatus: 'paid' | 'unpaid', paidBy?: string): Promise<void> => {
  const updateData: any = {
    payment_status: paymentStatus,
    paid_date: paymentStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
    paid_by: paymentStatus === 'paid' ? paidBy : null
  };

  const { error } = await supabase.from('funding_details').update(updateData).eq('id', fundingId);
  if (error) handleSupabaseError(error, 'updating payment status');
};
