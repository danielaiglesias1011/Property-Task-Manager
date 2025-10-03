import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, Property, Project, Task, AttachmentType, ApprovalHistory, ProjectCategory, Priority, Status, ApprovalGroup } from '../types';

// Helper functions for localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Convert date strings back to Date objects
const parseDates = (data: any[]): any[] => {
  return data.map(item => ({
    ...item,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    startDate: item.startDate ? new Date(item.startDate) : undefined,
    endDate: item.endDate ? new Date(item.endDate) : undefined,
    dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
    timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
  }));
};

type AppAction = 
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'ADD_ATTACHMENT_TYPE'; payload: AttachmentType }
  | { type: 'UPDATE_ATTACHMENT_TYPE'; payload: AttachmentType }
  | { type: 'DELETE_ATTACHMENT_TYPE'; payload: string }
  | { type: 'ADD_APPROVAL_HISTORY'; payload: ApprovalHistory }
  | { type: 'ADD_PROJECT_CATEGORY'; payload: ProjectCategory }
  | { type: 'UPDATE_PROJECT_CATEGORY'; payload: ProjectCategory }
  | { type: 'DELETE_PROJECT_CATEGORY'; payload: string }
  | { type: 'ADD_PRIORITY'; payload: Priority }
  | { type: 'UPDATE_PRIORITY'; payload: Priority }
  | { type: 'DELETE_PRIORITY'; payload: string }
  | { type: 'ADD_STATUS'; payload: Status }
  | { type: 'UPDATE_STATUS'; payload: Status }
  | { type: 'DELETE_STATUS'; payload: string }
  | { type: 'ADD_APPROVAL_GROUP'; payload: ApprovalGroup }
  | { type: 'UPDATE_APPROVAL_GROUP'; payload: ApprovalGroup }
  | { type: 'DELETE_APPROVAL_GROUP'; payload: string }
  | { type: 'UPDATE_PAYMENT_STATUS'; payload: { projectId: string; fundingId: string; paymentStatus: 'paid' | 'unpaid'; paidBy?: string } };

const initialState: AppState = {
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      approvalLevel: 3,
      role: 'admin',
      permissions: ['create_projects', 'edit_projects', 'delete_projects', 'approve_projects', 'manage_users', 'manage_settings'],
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Manager User',
      email: 'manager@company.com',
      approvalLevel: 2,
      role: 'manager',
      permissions: ['create_projects', 'edit_projects', 'approve_projects', 'create_tasks', 'edit_tasks'],
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'Regular User',
      email: 'user@company.com',
      approvalLevel: 1,
      role: 'user',
      permissions: ['create_tasks', 'edit_tasks'],
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],
  properties: [
    {
      id: '1',
      name: 'Corporate Headquarters',
      address: '123 Main St, Downtown',
      description: 'Commercial office building with 10 floors',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Regional Distribution Center',
      address: '456 Oak Ave, Suburbs',
      description: '50-unit residential apartment complex',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ],
  projects: [
    {
      id: '1',
      name: 'HVAC System Upgrade',
      description: 'Complete HVAC system replacement and upgrade',
      propertyId: '1',
      budget: 86000,
      category: 'Security Systems',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-15'),
      status: 'in-progress',
      priority: 'high',
      approvalType: 'single',
      approvalLevel: 1,
      assignedApproverId: '1',
      createdBy: '1',
      createdAt: new Date('2024-09-29'),
      updatedAt: new Date('2024-09-29'),
      attachments: [],
      fundingDetails: [
        {
          id: '1',
          type: 'deposit',
          amount: 15000,
          date: new Date('2024-10-01'),
          projectId: '1',
          paymentStatus: 'unpaid',
          paidDate: undefined,
          paidBy: undefined
        }
      ],
      tasks: []
    },
    {
      id: '2',
      name: 'Parking Lot Resurfacing',
      description: 'Complete parking lot resurfacing and line painting',
      propertyId: '2',
      budget: 33000,
      category: 'Renovation & Upgrades',
      startDate: new Date('2024-10-15'),
      endDate: new Date('2024-11-30'),
      status: 'planning',
      priority: 'low',
      approvalType: 'single',
      approvalLevel: 1,
      assignedApproverId: '1',
      createdBy: '1',
      createdAt: new Date('2024-09-29'),
      updatedAt: new Date('2024-09-29'),
      attachments: [],
      fundingDetails: [
        {
          id: '2',
          type: 'final',
          amount: 28000,
          date: new Date('2024-10-24'),
          projectId: '2',
          paymentStatus: 'unpaid',
          paidDate: undefined,
          paidBy: undefined
        },
        {
          id: '3',
          type: 'deposit',
          amount: 5000,
          date: new Date('2024-10-03'),
          projectId: '2',
          paymentStatus: 'paid',
          paidDate: new Date('2024-10-02'),
          paidBy: '1'
        }
      ],
      tasks: []
    }
  ],
  tasks: [],
  attachmentTypes: [
    { id: '1', name: 'Estimate', category: 'project', isDefault: true },
    { id: '2', name: 'Invoice', category: 'project', isDefault: true },
    { id: '3', name: 'Quote', category: 'project', isDefault: true },
    { id: '4', name: 'Contract', category: 'project', isDefault: true },
    { id: '5', name: 'Photo', category: 'task', isDefault: true },
    { id: '6', name: 'Document', category: 'task', isDefault: true }
  ],
  approvalHistory: [],
  projectCategories: [
    { id: '1', name: 'General', description: 'General maintenance and repairs', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '2', name: 'Security Systems', description: 'Security system installation and maintenance', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '3', name: 'HVAC', description: 'Heating, ventilation, and air conditioning', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '4', name: 'Plumbing', description: 'Plumbing repairs and installations', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '5', name: 'Maintenance & Repairs', description: 'General maintenance and repair work', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '6', name: 'Renovation & Upgrades', description: 'Property renovation and upgrade projects', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '7', name: 'Landscaping', description: 'Landscaping and outdoor maintenance', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '8', name: 'Electrical', description: 'Electrical work and installations', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '9', name: 'Flooring', description: 'Flooring installation and repairs', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '10', name: 'Cleaning & Janitorial', description: 'Cleaning and janitorial services', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '11', name: 'Roofing', description: 'Roofing repairs and installations', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '12', name: 'Painting', description: 'Interior and exterior painting work', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '13', name: 'Inspection & Compliance', description: 'Property inspections and compliance checks', isDefault: true, createdAt: new Date('2024-01-01') }
  ],
  priorities: [
    { id: '1', name: 'Low', level: 1, color: '#22C55E', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '2', name: 'Medium', level: 2, color: '#EAB308', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '3', name: 'High', level: 3, color: '#EF4444', isDefault: true, createdAt: new Date('2024-01-01') }
  ],
  statuses: [
    { id: '1', name: 'Draft', type: 'project', color: '#6B7280', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '2', name: 'Pending Approval', type: 'project', color: '#EAB308', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '3', name: 'Approved', type: 'project', color: '#22C55E', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '4', name: 'In Progress', type: 'project', color: '#3B82F6', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '5', name: 'Completed', type: 'project', color: '#059669', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '6', name: 'Rejected', type: 'project', color: '#DC2626', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '7', name: 'Pending', type: 'task', color: '#EAB308', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '8', name: 'In Progress', type: 'task', color: '#3B82F6', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '9', name: 'Completed', type: 'task', color: '#22C55E', isDefault: true, createdAt: new Date('2024-01-01') },
    { id: '10', name: 'Cancelled', type: 'task', color: '#EF4444', isDefault: true, createdAt: new Date('2024-01-01') }
  ],
  approvalGroups: [
    { 
      id: '1', 
      name: 'Level 1 Approvers', 
      level: 1, 
      userIds: ['2'], 
      description: 'Basic approval level for small projects',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    { 
      id: '2', 
      name: 'Level 2 Approvers', 
      level: 2, 
      userIds: ['1'], 
      description: 'Advanced approval level for major projects',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],
  currentUser: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
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
    
    case 'ADD_PROPERTY':
      return { ...state, properties: [...state.properties, action.payload] };
    
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(property =>
          property.id === action.payload.id ? action.payload : property
        )
      };
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        )
      };
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    
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
    
    case 'ADD_APPROVAL_HISTORY':
      return { ...state, approvalHistory: [...state.approvalHistory, action.payload] };
    
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
                    paidBy: action.payload.paymentStatus === 'paid' ? action.payload.paidBy : undefined
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
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or use default
  const getInitialState = (): AppState => {
    const storedUsers = loadFromStorage('propertyManager_users', initialState.users);
    const storedProperties = loadFromStorage('propertyManager_properties', initialState.properties);
    const storedProjects = loadFromStorage('propertyManager_projects', initialState.projects);
    const storedTasks = loadFromStorage('propertyManager_tasks', initialState.tasks);
    const storedAttachmentTypes = loadFromStorage('propertyManager_attachmentTypes', initialState.attachmentTypes);
    const storedProjectCategories = loadFromStorage('propertyManager_projectCategories', initialState.projectCategories);
    const storedPriorities = loadFromStorage('propertyManager_priorities', initialState.priorities);
    const storedStatuses = loadFromStorage('propertyManager_statuses', initialState.statuses);
    const storedApprovalGroups = loadFromStorage('propertyManager_approvalGroups', initialState.approvalGroups);

    return {
      ...initialState,
      users: parseDates(storedUsers),
      properties: parseDates(storedProperties),
      projects: parseDates(storedProjects),
      tasks: parseDates(storedTasks),
      attachmentTypes: storedAttachmentTypes,
      projectCategories: storedProjectCategories,
      priorities: storedPriorities,
      statuses: storedStatuses,
      approvalGroups: storedApprovalGroups
    };
  };

  const [state, dispatch] = useReducer(appReducer, getInitialState());

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage('propertyManager_users', state.users);
    saveToStorage('propertyManager_properties', state.properties);
    saveToStorage('propertyManager_projects', state.projects);
    saveToStorage('propertyManager_tasks', state.tasks);
    saveToStorage('propertyManager_attachmentTypes', state.attachmentTypes);
    saveToStorage('propertyManager_projectCategories', state.projectCategories);
    saveToStorage('propertyManager_priorities', state.priorities);
    saveToStorage('propertyManager_statuses', state.statuses);
    saveToStorage('propertyManager_approvalGroups', state.approvalGroups);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

