import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { AppState, User, Property, Project, Task, AttachmentType, ApprovalHistory, ProjectCategory, Priority, Status, ApprovalGroup } from '../types';
import * as supabaseService from '../services/supabaseService';

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
  createUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  createProperty: (property: Property) => Promise<void>;
  updateProperty: (property: Property) => Promise<void>;
  createProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  createTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  createAttachmentType: (type: AttachmentType) => Promise<void>;
  updateAttachmentType: (type: AttachmentType) => Promise<void>;
  deleteAttachmentType: (id: string) => Promise<void>;
  createProjectCategory: (category: ProjectCategory) => Promise<void>;
  updateProjectCategory: (category: ProjectCategory) => Promise<void>;
  deleteProjectCategory: (id: string) => Promise<void>;
  createPriority: (priority: Priority) => Promise<void>;
  updatePriority: (priority: Priority) => Promise<void>;
  deletePriority: (id: string) => Promise<void>;
  createStatus: (status: Status) => Promise<void>;
  updateStatus: (status: Status) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
  createApprovalGroup: (group: ApprovalGroup) => Promise<void>;
  updateApprovalGroup: (group: ApprovalGroup) => Promise<void>;
  deleteApprovalGroup: (id: string) => Promise<void>;
  updatePaymentStatus: (projectId: string, fundingId: string, paymentStatus: 'paid' | 'unpaid', paidBy?: string) => Promise<void>;
}

const initialState: AppState = {
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
  currentUser: null
};

function appReducer(state: AppState & { loading: boolean; error: string | null }, action: AppAction): AppState & { loading: boolean; error: string | null } {
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
          task.id === action.payload.id ? task : task
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

const AppContext = createContext<AppContextType | null>(null);

export const SupabaseAppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, { ...initialState, loading: false, error: null });

  // Load all data from Supabase on mount
  const loadAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const [
        users,
        properties,
        projects,
        tasks,
        attachmentTypes,
        projectCategories,
        priorities,
        statuses,
        approvalGroups
      ] = await Promise.all([
        supabaseService.userService.getAll(),
        supabaseService.propertyService.getAll(),
        supabaseService.projectService.getAll(),
        supabaseService.taskService.getAll(),
        supabaseService.attachmentTypeService.getAll(),
        supabaseService.projectCategoryService.getAll(),
        supabaseService.priorityService.getAll(),
        supabaseService.statusService.getAll(),
        supabaseService.approvalGroupService.getAll()
      ]);

      dispatch({ type: 'SET_USERS', payload: users });
      dispatch({ type: 'SET_PROPERTIES', payload: properties });
      dispatch({ type: 'SET_PROJECTS', payload: projects });
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_ATTACHMENT_TYPES', payload: attachmentTypes });
      dispatch({ type: 'SET_PROJECT_CATEGORIES', payload: projectCategories });
      dispatch({ type: 'SET_PRIORITIES', payload: priorities });
      dispatch({ type: 'SET_STATUSES', payload: statuses });
      dispatch({ type: 'SET_APPROVAL_GROUPS', payload: approvalGroups });

      // Set first user as current user if none is set
      if (!state.currentUser && users.length > 0) {
        dispatch({ type: 'SET_CURRENT_USER', payload: users[0] });
      }

    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Async action creators
  const createUser = async (user: User) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newUser = await supabaseService.userService.create(user);
      dispatch({ type: 'ADD_USER', payload: newUser });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create user' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUser = async (user: User) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedUser = await supabaseService.userService.update(user);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update user' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteUser = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.userService.delete(id);
      dispatch({ type: 'DELETE_USER', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete user' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createProperty = async (property: Property) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newProperty = await supabaseService.propertyService.create(property);
      dispatch({ type: 'ADD_PROPERTY', payload: newProperty });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create property' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProperty = async (property: Property) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedProperty = await supabaseService.propertyService.update(property);
      dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update property' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createProject = async (project: Project) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newProject = await supabaseService.projectService.create(project);
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create project' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProject = async (project: Project) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedProject = await supabaseService.projectService.update(project);
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update project' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createTask = async (task: Task) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newTask = await supabaseService.taskService.create(task);
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create task' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTask = async (task: Task) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedTask = await supabaseService.taskService.update(task);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update task' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createAttachmentType = async (type: AttachmentType) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newType = await supabaseService.attachmentTypeService.create(type);
      dispatch({ type: 'ADD_ATTACHMENT_TYPE', payload: newType });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create attachment type' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAttachmentType = async (type: AttachmentType) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedType = await supabaseService.attachmentTypeService.update(type);
      dispatch({ type: 'UPDATE_ATTACHMENT_TYPE', payload: updatedType });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update attachment type' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteAttachmentType = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.attachmentTypeService.delete(id);
      dispatch({ type: 'DELETE_ATTACHMENT_TYPE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete attachment type' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createProjectCategory = async (category: ProjectCategory) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newCategory = await supabaseService.projectCategoryService.create(category);
      dispatch({ type: 'ADD_PROJECT_CATEGORY', payload: newCategory });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create project category' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProjectCategory = async (category: ProjectCategory) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedCategory = await supabaseService.projectCategoryService.update(category);
      dispatch({ type: 'UPDATE_PROJECT_CATEGORY', payload: updatedCategory });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update project category' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProjectCategory = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.projectCategoryService.delete(id);
      dispatch({ type: 'DELETE_PROJECT_CATEGORY', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete project category' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createPriority = async (priority: Priority) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newPriority = await supabaseService.priorityService.create(priority);
      dispatch({ type: 'ADD_PRIORITY', payload: newPriority });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create priority' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePriority = async (priority: Priority) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedPriority = await supabaseService.priorityService.update(priority);
      dispatch({ type: 'UPDATE_PRIORITY', payload: updatedPriority });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update priority' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deletePriority = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.priorityService.delete(id);
      dispatch({ type: 'DELETE_PRIORITY', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete priority' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createStatus = async (status: Status) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newStatus = await supabaseService.statusService.create(status);
      dispatch({ type: 'ADD_STATUS', payload: newStatus });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create status' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateStatus = async (status: Status) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedStatus = await supabaseService.statusService.update(status);
      dispatch({ type: 'UPDATE_STATUS', payload: updatedStatus });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update status' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteStatus = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.statusService.delete(id);
      dispatch({ type: 'DELETE_STATUS', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete status' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createApprovalGroup = async (group: ApprovalGroup) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newGroup = await supabaseService.approvalGroupService.create(group);
      dispatch({ type: 'ADD_APPROVAL_GROUP', payload: newGroup });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create approval group' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateApprovalGroup = async (group: ApprovalGroup) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedGroup = await supabaseService.approvalGroupService.update(group);
      dispatch({ type: 'UPDATE_APPROVAL_GROUP', payload: updatedGroup });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update approval group' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteApprovalGroup = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.approvalGroupService.delete(id);
      dispatch({ type: 'DELETE_APPROVAL_GROUP', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete approval group' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePaymentStatus = async (projectId: string, fundingId: string, paymentStatus: 'paid' | 'unpaid', paidBy?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await supabaseService.updatePaymentStatus(projectId, fundingId, paymentStatus, paidBy);
      dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { projectId, fundingId, paymentStatus, paidBy } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update payment status' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadAllData,
    createUser,
    updateUser,
    deleteUser,
    createProperty,
    updateProperty,
    createProject,
    updateProject,
    createTask,
    updateTask,
    createAttachmentType,
    updateAttachmentType,
    deleteAttachmentType,
    createProjectCategory,
    updateProjectCategory,
    deleteProjectCategory,
    createPriority,
    updatePriority,
    deletePriority,
    createStatus,
    updateStatus,
    deleteStatus,
    createApprovalGroup,
    updateApprovalGroup,
    deleteApprovalGroup,
    updatePaymentStatus
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    console.error('useApp must be used within a SupabaseAppProvider');
    throw new Error('useApp must be used within a SupabaseAppProvider');
  }
  return context;
};
