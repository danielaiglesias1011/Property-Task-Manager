import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, Property, Project, Task, AttachmentType, ApprovalHistory, ProjectCategory, Priority, Status, ApprovalGroup } from '../types';
import { supabase } from '../supabaseClient';

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_ATTACHMENT_TYPES'; payload: AttachmentType[] }
  | { type: 'ADD_ATTACHMENT_TYPE'; payload: AttachmentType }
  | { type: 'UPDATE_ATTACHMENT_TYPE'; payload: AttachmentType }
  | { type: 'DELETE_ATTACHMENT_TYPE'; payload: string }
  | { type: 'SET_APPROVAL_HISTORY'; payload: ApprovalHistory[] }
  | { type: 'ADD_APPROVAL_HISTORY'; payload: ApprovalHistory }
  | { type: 'SET_PROJECT_CATEGORIES'; payload: ProjectCategory[] }
  | { type: 'ADD_PROJECT_CATEGORY'; payload: ProjectCategory }
  | { type: 'UPDATE_PROJECT_CATEGORY'; payload: ProjectCategory }
  | { type: 'DELETE_PROJECT_CATEGORY'; payload: string }
  | { type: 'SET_PRIORITIES'; payload: Priority[] }
  | { type: 'ADD_PRIORITY'; payload: Priority }
  | { type: 'UPDATE_PRIORITY'; payload: Priority }
  | { type: 'DELETE_PRIORITY'; payload: string }
  | { type: 'SET_STATUSES'; payload: Status[] }
  | { type: 'ADD_STATUS'; payload: Status }
  | { type: 'UPDATE_STATUS'; payload: Status }
  | { type: 'DELETE_STATUS'; payload: string }
  | { type: 'SET_APPROVAL_GROUPS'; payload: ApprovalGroup[] }
  | { type: 'ADD_APPROVAL_GROUP'; payload: ApprovalGroup }
  | { type: 'UPDATE_APPROVAL_GROUP'; payload: ApprovalGroup }
  | { type: 'DELETE_APPROVAL_GROUP'; payload: string }
  | { type: 'UPDATE_PAYMENT_STATUS'; payload: { projectId: string; fundingId: string; paymentStatus: 'paid' | 'unpaid'; paidBy?: string } };

interface AppContextType {
  state: AppState & { loading: boolean; error: string | null };
  dispatch: React.Dispatch<AppAction>;
  // Async action creators
  loadAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
  // Supabase sync actions
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (property: Property) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addCategory: (category: Omit<ProjectCategory, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (category: ProjectCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addPriority: (priority: Omit<Priority, 'id' | 'createdAt'>) => Promise<void>;
  updatePriority: (priority: Priority) => Promise<void>;
  deletePriority: (id: string) => Promise<void>;
  addStatus: (status: Omit<Status, 'id' | 'createdAt'>) => Promise<void>;
  updateStatus: (status: Status) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
  addAttachmentType: (attachmentType: Omit<AttachmentType, 'id'>) => Promise<void>;
  updateAttachmentType: (attachmentType: AttachmentType) => Promise<void>;
  deleteAttachmentType: (id: string) => Promise<void>;
}

const initialState: AppState & { loading: boolean; error: string | null } = {
  users: [],
  properties: [],
  projects: [],
  tasks: [],
  attachmentTypes: [],
  approvalHistory: [],
  projectCategories: [],
  priorities: [],
  statuses: [],
  approvalGroups: [],
  currentUser: null,
  loading: false,
  error: null
};

// Convert database rows to app types
const convertRowToUser = (row: any): User => ({
  id: row.id || '',
  name: row.name || '',
  email: row.email || '',
  approvalLevel: row.approval_level || 1,
  role: row.role || 'user',
  permissions: row.permissions || [],
  isArchived: row.is_archived || false,
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
});

const convertRowToProperty = (row: any): Property => ({
  id: row.id || '',
  name: row.name || '',
  address: row.address || '',
  description: row.description || '',
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
});

const convertRowToTask = (row: any): Task => ({
  id: row.id || '',
  name: row.name || '',
  description: row.description || '',
  startDate: row.start_date ? new Date(row.start_date) : new Date(),
  endDate: row.end_date ? new Date(row.end_date) : new Date(),
  assigneeId: row.assignee_id || '',
  propertyId: row.property_id || '',
  projectId: row.project_id || undefined,
  status: row.status || 'pending',
  priority: row.priority || 'medium',
  comments: [], // Load separately if needed
  attachments: [], // Load separately if needed
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
});

const convertRowToProject = (row: any): Project => ({
  id: row.id || '',
  name: row.name || '',
  description: row.description || '',
  propertyId: row.property_id || '',
  budget: parseFloat(row.budget) || 0,
  category: row.category || '',
  startDate: row.start_date ? new Date(row.start_date) : new Date(),
  endDate: row.end_date ? new Date(row.end_date) : new Date(),
  status: row.status || 'draft',
  priority: row.priority || 'medium',
  approvalType: row.approval_type || 'single',
  approvalLevel: row.approval_level || 1,
  assignedApproverId: row.assigned_approver_id || undefined,
  createdBy: row.created_by || '',
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  attachments: [], // Load separately if needed
  fundingDetails: [], // Load separately if needed
  tasks: [] // Load separately if needed
});

const appReducer = (state: AppState & { loading: boolean; error: string | null }, action: AppAction): AppState & { loading: boolean; error: string | null } => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return { 
        ...state, 
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return { 
        ...state, 
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    case 'ADD_PROPERTY':
      return { ...state, properties: [...state.properties, action.payload] };
    case 'UPDATE_PROPERTY':
      return { 
        ...state, 
        properties: state.properties.map(property => 
          property.id === action.payload.id ? action.payload : property
        )
      };
    case 'DELETE_PROPERTY':
      return { 
        ...state, 
        properties: state.properties.filter(property => property.id !== action.payload)
      };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return { 
        ...state, 
        projects: state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        )
      };
    case 'DELETE_PROJECT':
      return { 
        ...state, 
        projects: state.projects.filter(project => project.id !== action.payload)
      };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'SET_ATTACHMENT_TYPES':
      return { ...state, attachmentTypes: action.payload };
    case 'ADD_ATTACHMENT_TYPE':
      return { ...state, attachmentTypes: [...state.attachmentTypes, action.payload] };
    case 'UPDATE_ATTACHMENT_TYPE':
      return { 
        ...state, 
        attachmentTypes: state.attachmentTypes.map(type => 
          type.id === action.payload.id ? action.payload : type
        )
      };
    case 'DELETE_ATTACHMENT_TYPE':
      return { 
        ...state, 
        attachmentTypes: state.attachmentTypes.filter(type => type.id !== action.payload)
      };
    case 'SET_APPROVAL_HISTORY':
      return { ...state, approvalHistory: action.payload };
    case 'ADD_APPROVAL_HISTORY':
      return { ...state, approvalHistory: [...state.approvalHistory, action.payload] };
    case 'SET_PROJECT_CATEGORIES':
      return { ...state, projectCategories: action.payload };
    case 'ADD_PROJECT_CATEGORY':
      return { ...state, projectCategories: [...state.projectCategories, action.payload] };
    case 'UPDATE_PROJECT_CATEGORY':
      return { 
        ...state, 
        projectCategories: state.projectCategories.map(category => 
          category.id === action.payload.id ? action.payload : category
        )
      };
    case 'DELETE_PROJECT_CATEGORY':
      return { 
        ...state, 
        projectCategories: state.projectCategories.filter(category => category.id !== action.payload)
      };
    case 'SET_PRIORITIES':
      return { ...state, priorities: action.payload };
    case 'ADD_PRIORITY':
      return { ...state, priorities: [...state.priorities, action.payload] };
    case 'UPDATE_PRIORITY':
      return { 
        ...state, 
        priorities: state.priorities.map(priority => 
          priority.id === action.payload.id ? action.payload : priority
        )
      };
    case 'DELETE_PRIORITY':
      return { 
        ...state, 
        priorities: state.priorities.filter(priority => priority.id !== action.payload)
      };
    case 'SET_STATUSES':
      return { ...state, statuses: action.payload };
    case 'ADD_STATUS':
      return { ...state, statuses: [...state.statuses, action.payload] };
    case 'UPDATE_STATUS':
      return { 
        ...state, 
        statuses: state.statuses.map(status => 
          status.id === action.payload.id ? action.payload : status
        )
      };
    case 'DELETE_STATUS':
      return { 
        ...state, 
        statuses: state.statuses.filter(status => status.id !== action.payload)
      };
    case 'SET_APPROVAL_GROUPS':
      return { ...state, approvalGroups: action.payload };
    case 'ADD_APPROVAL_GROUP':
      return { ...state, approvalGroups: [...state.approvalGroups, action.payload] };
    case 'UPDATE_APPROVAL_GROUP':
      return { 
        ...state, 
        approvalGroups: state.approvalGroups.map(group => 
          group.id === action.payload.id ? action.payload : group
        )
      };
    case 'DELETE_APPROVAL_GROUP':
      return { 
        ...state, 
        approvalGroups: state.approvalGroups.filter(group => group.id !== action.payload)
      };
    case 'UPDATE_PAYMENT_STATUS':
      return {
        ...state,
        projects: state.projects.map(project => {
          if (project.id === action.payload.projectId) {
            return {
              ...project,
              fundingDetails: project.fundingDetails.map(funding => {
                if (funding.id === action.payload.fundingId) {
                  return {
                    ...funding,
                    paymentStatus: action.payload.paymentStatus,
                    paidDate: action.payload.paymentStatus === 'paid' ? new Date() : undefined,
                    paidBy: action.payload.paidBy
                  };
                }
                return funding;
              })
            };
          }
          return project;
        })
      };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const HybridAppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Supabase sync actions
  const addProperty = async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          name: property.name,
          address: property.address,
          description: property.description
        }])
        .select()
        .single();

      if (error) throw error;
      const newProperty = convertRowToProperty(data);
      dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const updateProperty = async (property: Property) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          name: property.name,
          address: property.address,
          description: property.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_PROPERTY', payload: property });
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_PROPERTY', payload: id });
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
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
          created_by: project.createdBy
        }])
        .select()
        .single();

      if (error) throw error;
      const newProject = convertRowToProject(data);
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
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
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_PROJECT', payload: project });
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          name: task.name,
          description: task.description,
          start_date: task.startDate.toISOString().split('T')[0],
          end_date: task.endDate.toISOString().split('T')[0],
          assignee_id: task.assigneeId,
          property_id: task.propertyId,
          project_id: task.projectId,
          status: task.status,
          priority: task.priority
        }])
        .select()
        .single();

      if (error) throw error;
      const newTask = convertRowToTask(data);
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          name: task.name,
          description: task.description,
          start_date: task.startDate.toISOString().split('T')[0],
          end_date: task.endDate.toISOString().split('T')[0],
          assignee_id: task.assigneeId,
          property_id: task.propertyId,
          project_id: task.projectId,
          status: task.status,
          priority: task.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_TASK', payload: task });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Settings sync actions
  const addCategory = async (category: Omit<ProjectCategory, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('project_categories')
        .insert([{
          name: category.name,
          description: category.description,
          is_default: category.isDefault
        }])
        .select()
        .single();

      if (error) throw error;
      const newCategory = {
        id: data.id,
        name: data.name,
        description: data.description,
        isDefault: data.is_default,
        createdAt: new Date(data.created_at)
      };
      dispatch({ type: 'ADD_PROJECT_CATEGORY', payload: newCategory });
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (category: ProjectCategory) => {
    try {
      const { error } = await supabase
        .from('project_categories')
        .update({
          name: category.name,
          description: category.description,
          is_default: category.isDefault
        })
        .eq('id', category.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_PROJECT_CATEGORY', payload: category });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_PROJECT_CATEGORY', payload: id });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const addPriority = async (priority: Omit<Priority, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('priorities')
        .insert([{
          name: priority.name,
          level: priority.level,
          color: priority.color,
          is_default: priority.isDefault
        }])
        .select()
        .single();

      if (error) throw error;
      const newPriority = {
        id: data.id,
        name: data.name,
        level: data.level,
        color: data.color,
        isDefault: data.is_default,
        createdAt: new Date(data.created_at)
      };
      dispatch({ type: 'ADD_PRIORITY', payload: newPriority });
    } catch (error) {
      console.error('Error adding priority:', error);
      throw error;
    }
  };

  const updatePriority = async (priority: Priority) => {
    try {
      const { error } = await supabase
        .from('priorities')
        .update({
          name: priority.name,
          level: priority.level,
          color: priority.color,
          is_default: priority.isDefault
        })
        .eq('id', priority.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_PRIORITY', payload: priority });
    } catch (error) {
      console.error('Error updating priority:', error);
      throw error;
    }
  };

  const deletePriority = async (id: string) => {
    try {
      const { error } = await supabase
        .from('priorities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_PRIORITY', payload: id });
    } catch (error) {
      console.error('Error deleting priority:', error);
      throw error;
    }
  };

  const addStatus = async (status: Omit<Status, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .insert([{
          name: status.name,
          type: status.type,
          color: status.color,
          is_default: status.isDefault
        }])
        .select()
        .single();

      if (error) throw error;
      const newStatus = {
        id: data.id,
        name: data.name,
        type: data.type,
        color: data.color,
        isDefault: data.is_default,
        createdAt: new Date(data.created_at)
      };
      dispatch({ type: 'ADD_STATUS', payload: newStatus });
    } catch (error) {
      console.error('Error adding status:', error);
      throw error;
    }
  };

  const updateStatus = async (status: Status) => {
    try {
      const { error } = await supabase
        .from('statuses')
        .update({
          name: status.name,
          type: status.type,
          color: status.color,
          is_default: status.isDefault
        })
        .eq('id', status.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_STATUS', payload: status });
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  const deleteStatus = async (id: string) => {
    try {
      const { error } = await supabase
        .from('statuses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_STATUS', payload: id });
    } catch (error) {
      console.error('Error deleting status:', error);
      throw error;
    }
  };

  const addAttachmentType = async (attachmentType: Omit<AttachmentType, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('attachment_types')
        .insert([{
          name: attachmentType.name,
          category: attachmentType.category,
          is_default: attachmentType.isDefault
        }])
        .select()
        .single();

      if (error) throw error;
      const newAttachmentType = {
        id: data.id,
        name: data.name,
        category: data.category,
        isDefault: data.is_default
      };
      dispatch({ type: 'ADD_ATTACHMENT_TYPE', payload: newAttachmentType });
    } catch (error) {
      console.error('Error adding attachment type:', error);
      throw error;
    }
  };

  const updateAttachmentType = async (attachmentType: AttachmentType) => {
    try {
      const { error } = await supabase
        .from('attachment_types')
        .update({
          name: attachmentType.name,
          category: attachmentType.category,
          is_default: attachmentType.isDefault
        })
        .eq('id', attachmentType.id);

      if (error) throw error;
      dispatch({ type: 'UPDATE_ATTACHMENT_TYPE', payload: attachmentType });
    } catch (error) {
      console.error('Error updating attachment type:', error);
      throw error;
    }
  };

  const deleteAttachmentType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('attachment_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch({ type: 'DELETE_ATTACHMENT_TYPE', payload: id });
    } catch (error) {
      console.error('Error deleting attachment type:', error);
      throw error;
    }
  };

  // Load data from Supabase
  const loadAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('Loading data from Supabase...');

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;
      const users = usersData?.map(convertRowToUser) || [];
      dispatch({ type: 'SET_USERS', payload: users });

      // Load properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*');
      
      if (propertiesError) throw propertiesError;
      const properties = propertiesData?.map(convertRowToProperty) || [];
      dispatch({ type: 'SET_PROPERTIES', payload: properties });

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
      
      if (projectsError) throw projectsError;
      const projects = projectsData?.map(convertRowToProject) || [];
      dispatch({ type: 'SET_PROJECTS', payload: projects });

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*');
      
      if (tasksError) throw tasksError;
      const tasks = tasksData?.map(convertRowToTask) || [];
      dispatch({ type: 'SET_TASKS', payload: tasks });

      // Load project categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('project_categories')
        .select('*');
      
      if (categoriesError) {
        console.warn('Could not load project categories:', categoriesError);
        // Set default categories if database doesn't have them
        const defaultCategories = [
          { id: '1', name: 'Security Systems', description: 'Security and surveillance projects', isDefault: true, createdAt: new Date() },
          { id: '2', name: 'Renovation & Upgrades', description: 'Building renovation and upgrade projects', isDefault: true, createdAt: new Date() },
          { id: '3', name: 'Maintenance', description: 'Regular maintenance and repair projects', isDefault: true, createdAt: new Date() },
          { id: '4', name: 'New Construction', description: 'New building and construction projects', isDefault: true, createdAt: new Date() },
          { id: '5', name: 'Technology', description: 'IT and technology infrastructure projects', isDefault: true, createdAt: new Date() }
        ];
        dispatch({ type: 'SET_PROJECT_CATEGORIES', payload: defaultCategories });
      } else {
        const categories = categoriesData?.map((row: any) => ({
          id: row.id || '',
          name: row.name || '',
          description: row.description || '',
          isDefault: row.is_default || false,
          createdAt: row.created_at ? new Date(row.created_at) : new Date()
        })) || [];
        dispatch({ type: 'SET_PROJECT_CATEGORIES', payload: categories });
      }

      // Load attachment types
      const { data: attachmentTypesData, error: attachmentTypesError } = await supabase
        .from('attachment_types')
        .select('*');
      
      if (attachmentTypesError) {
        console.warn('Could not load attachment types:', attachmentTypesError);
        // Set default attachment types if database doesn't have them
        const defaultAttachmentTypes = [
          { id: '1', name: 'Project Plan', category: 'project' as 'project' | 'task', isDefault: true },
          { id: '2', name: 'Budget Estimate', category: 'project' as 'project' | 'task', isDefault: true },
          { id: '3', name: 'Contract', category: 'project' as 'project' | 'task', isDefault: true },
          { id: '4', name: 'Invoice', category: 'project' as 'project' | 'task', isDefault: true },
          { id: '5', name: 'Photo', category: 'project' as 'project' | 'task', isDefault: true },
          { id: '6', name: 'Document', category: 'project' as 'project' | 'task', isDefault: true },
          { id: '7', name: 'Task Description', category: 'task' as 'project' | 'task', isDefault: true },
          { id: '8', name: 'Progress Report', category: 'task' as 'project' | 'task', isDefault: true },
          { id: '9', name: 'Completion Photo', category: 'task' as 'project' | 'task', isDefault: true }
        ];
        dispatch({ type: 'SET_ATTACHMENT_TYPES', payload: defaultAttachmentTypes });
      } else {
        const attachmentTypes = attachmentTypesData?.map((row: any) => ({
          id: row.id || '',
          name: row.name || '',
          category: (row.category || 'project') as 'project' | 'task',
          isDefault: row.is_default || false
        })) || [];
        dispatch({ type: 'SET_ATTACHMENT_TYPES', payload: attachmentTypes });
      }

      // Load priorities
      const { data: prioritiesData, error: prioritiesError } = await supabase
        .from('priorities')
        .select('*');
      
      if (prioritiesError) {
        console.warn('Could not load priorities:', prioritiesError);
        // Set default priorities if database doesn't have them
        const defaultPriorities = [
          { id: '1', name: 'Low', level: 1, color: '#10B981', isDefault: true, createdAt: new Date() },
          { id: '2', name: 'Medium', level: 2, color: '#F59E0B', isDefault: true, createdAt: new Date() },
          { id: '3', name: 'High', level: 3, color: '#EF4444', isDefault: true, createdAt: new Date() }
        ];
        dispatch({ type: 'SET_PRIORITIES', payload: defaultPriorities });
      } else {
        const priorities = prioritiesData?.map((row: any) => ({
          id: row.id || '',
          name: row.name || '',
          level: row.level || 1,
          color: row.color || '#6B7280',
          isDefault: row.is_default || false,
          createdAt: row.created_at ? new Date(row.created_at) : new Date()
        })) || [];
        dispatch({ type: 'SET_PRIORITIES', payload: priorities });
      }

      // Load statuses
      const { data: statusesData, error: statusesError } = await supabase
        .from('statuses')
        .select('*');
      
      if (statusesError) {
        console.warn('Could not load statuses:', statusesError);
        // Set default statuses if database doesn't have them
        const defaultStatuses = [
          // Project statuses
          { id: '1', name: 'Draft', type: 'project' as 'project' | 'task', color: '#6B7280', isDefault: true, createdAt: new Date() },
          { id: '2', name: 'Pending', type: 'project' as 'project' | 'task', color: '#6B7280', isDefault: true, createdAt: new Date() },
          { id: '3', name: 'Pending Approval', type: 'project' as 'project' | 'task', color: '#F59E0B', isDefault: true, createdAt: new Date() },
          { id: '4', name: 'Approved', type: 'project' as 'project' | 'task', color: '#10B981', isDefault: true, createdAt: new Date() },
          { id: '5', name: 'Planning', type: 'project' as 'project' | 'task', color: '#F59E0B', isDefault: true, createdAt: new Date() },
          { id: '6', name: 'In Progress', type: 'project' as 'project' | 'task', color: '#3B82F6', isDefault: true, createdAt: new Date() },
          { id: '7', name: 'Completed', type: 'project' as 'project' | 'task', color: '#10B981', isDefault: true, createdAt: new Date() },
          { id: '8', name: 'On Hold', type: 'project' as 'project' | 'task', color: '#F97316', isDefault: true, createdAt: new Date() },
          { id: '9', name: 'Rejected', type: 'project' as 'project' | 'task', color: '#EF4444', isDefault: true, createdAt: new Date() },
          // Task statuses
          { id: '10', name: 'Pending', type: 'task' as 'project' | 'task', color: '#6B7280', isDefault: true, createdAt: new Date() },
          { id: '11', name: 'In Progress', type: 'task' as 'project' | 'task', color: '#3B82F6', isDefault: true, createdAt: new Date() },
          { id: '12', name: 'Completed', type: 'task' as 'project' | 'task', color: '#10B981', isDefault: true, createdAt: new Date() },
          { id: '13', name: 'Cancelled', type: 'task' as 'project' | 'task', color: '#EF4444', isDefault: true, createdAt: new Date() }
        ];
        dispatch({ type: 'SET_STATUSES', payload: defaultStatuses });
      } else {
        const statuses = statusesData?.map((row: any) => ({
          id: row.id || '',
          name: row.name || '',
          type: (row.type || 'project') as 'project' | 'task',
          color: row.color || '#6B7280',
          isDefault: row.is_default || false,
          createdAt: row.created_at ? new Date(row.created_at) : new Date()
        })) || [];
        dispatch({ type: 'SET_STATUSES', payload: statuses });
      }

      // Load approval groups
      const { data: approvalGroupsData, error: approvalGroupsError } = await supabase
        .from('approval_groups')
        .select('*');
      
      if (approvalGroupsError) {
        console.warn('Could not load approval groups:', approvalGroupsError);
        // Set default approval groups if database doesn't have them
        const defaultApprovalGroups = [
          { id: '1', name: 'Level 1 Approvers', level: 1, userIds: [], description: 'Basic level approval group', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', name: 'Level 2 Approvers', level: 2, userIds: [], description: 'Management level approval group', createdAt: new Date(), updatedAt: new Date() },
          { id: '3', name: 'Level 3 Approvers', level: 3, userIds: [], description: 'Executive level approval group', createdAt: new Date(), updatedAt: new Date() }
        ];
        dispatch({ type: 'SET_APPROVAL_GROUPS', payload: defaultApprovalGroups });
      } else {
        const approvalGroups = approvalGroupsData?.map((row: any) => ({
          id: row.id || '',
          name: row.name || '',
          level: row.level || 1,
          userIds: row.user_ids || [],
          description: row.description || '',
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
        })) || [];
        dispatch({ type: 'SET_APPROVAL_GROUPS', payload: approvalGroups });
      }

      // Set default user if we have users and no current user
      if (users.length > 0 && !state.currentUser) {
        dispatch({ type: 'SET_CURRENT_USER', payload: users[0] });
      }

      console.log('Data loaded successfully:', {
        users: users.length,
        properties: properties.length,
        projects: projects.length,
        tasks: tasks.length,
        categories: state.projectCategories?.length || 0,
        priorities: state.priorities?.length || 0,
        statuses: state.statuses?.length || 0,
        attachmentTypes: state.attachmentTypes?.length || 0,
        approvalGroups: state.approvalGroups?.length || 0
      });

    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load data'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    loadAllData,
    refreshData,
    addProperty,
    updateProperty,
    deleteProperty,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addCategory,
    updateCategory,
    deleteCategory,
    addPriority,
    updatePriority,
    deletePriority,
    addStatus,
    updateStatus,
    deleteStatus,
    addAttachmentType,
    updateAttachmentType,
    deleteAttachmentType
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within a HybridAppProvider');
  }
  return context;
};
