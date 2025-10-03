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
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
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

      // Set default user if we have users and no current user
      if (users.length > 0 && !state.currentUser) {
        dispatch({ type: 'SET_CURRENT_USER', payload: users[0] });
      }

      console.log('Data loaded successfully:', {
        users: users.length,
        properties: properties.length,
        projects: projects.length,
        tasks: tasks.length
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
    refreshData
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
