// Migration script to populate Supabase database
// Run this with: node database/migrate-to-supabase.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data to migrate
const sampleData = {
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      approval_level: 3,
      role: 'admin',
      permissions: ['create_projects', 'edit_projects', 'delete_projects', 'approve_projects', 'manage_users', 'manage_settings'],
      is_archived: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Manager User',
      email: 'manager@company.com',
      approval_level: 2,
      role: 'manager',
      permissions: ['create_projects', 'edit_projects', 'approve_projects', 'create_tasks', 'edit_tasks'],
      is_archived: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Regular User',
      email: 'user@company.com',
      approval_level: 1,
      role: 'user',
      permissions: ['create_tasks', 'edit_tasks'],
      is_archived: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  properties: [
    {
      id: '1',
      name: 'Corporate Headquarters',
      address: '123 Main St, Downtown',
      description: 'Commercial office building with 10 floors',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Regional Distribution Center',
      address: '456 Oak Ave, Suburbs',
      description: '50-unit residential apartment complex',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ],
  project_categories: [
    { name: 'Security Systems', description: 'Security and surveillance projects', is_default: true },
    { name: 'Renovation & Upgrades', description: 'Building renovation and upgrade projects', is_default: true },
    { name: 'Maintenance', description: 'Regular maintenance and repair projects', is_default: true },
    { name: 'New Construction', description: 'New building and construction projects', is_default: true },
    { name: 'Technology', description: 'IT and technology infrastructure projects', is_default: true }
  ],
  priorities: [
    { name: 'Low', level: 1, color: '#10B981', is_default: true },
    { name: 'Medium', level: 2, color: '#F59E0B', is_default: true },
    { name: 'High', level: 3, color: '#EF4444', is_default: true }
  ],
  statuses: [
    // Project statuses
    { name: 'Draft', type: 'project', color: '#6B7280', is_default: true },
    { name: 'Pending', type: 'project', color: '#6B7280', is_default: true },
    { name: 'Pending Approval', type: 'project', color: '#F59E0B', is_default: true },
    { name: 'Approved', type: 'project', color: '#10B981', is_default: true },
    { name: 'Planning', type: 'project', color: '#F59E0B', is_default: true },
    { name: 'In Progress', type: 'project', color: '#3B82F6', is_default: true },
    { name: 'Completed', type: 'project', color: '#10B981', is_default: true },
    { name: 'On Hold', type: 'project', color: '#F97316', is_default: true },
    { name: 'Rejected', type: 'project', color: '#EF4444', is_default: true },
    // Task statuses
    { name: 'Pending', type: 'task', color: '#6B7280', is_default: true },
    { name: 'In Progress', type: 'task', color: '#3B82F6', is_default: true },
    { name: 'Completed', type: 'task', color: '#10B981', is_default: true },
    { name: 'Cancelled', type: 'task', color: '#EF4444', is_default: true }
  ],
  attachment_types: [
    { name: 'Project Plan', category: 'project', is_default: true },
    { name: 'Budget Estimate', category: 'project', is_default: true },
    { name: 'Contract', category: 'project', is_default: true },
    { name: 'Invoice', category: 'project', is_default: true },
    { name: 'Photo', category: 'project', is_default: true },
    { name: 'Document', category: 'project', is_default: true },
    { name: 'Task Description', category: 'task', is_default: true },
    { name: 'Progress Report', category: 'task', is_default: true },
    { name: 'Completion Photo', category: 'task', is_default: true }
  ],
  approval_groups: [
    {
      id: '1',
      name: 'Level 1 Approvers',
      level: 1,
      user_ids: ['3'],
      description: 'Basic level approval group',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Level 2 Approvers',
      level: 2,
      user_ids: ['2'],
      description: 'Management level approval group',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Level 3 Approvers',
      level: 3,
      user_ids: ['1'],
      description: 'Executive level approval group',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'HVAC System Upgrade',
      description: 'Complete HVAC system replacement and upgrade',
      property_id: '1',
      budget: 86000,
      category: 'Security Systems',
      start_date: '2024-10-01',
      end_date: '2024-12-15',
      status: 'in-progress',
      priority: 'high',
      approval_type: 'single',
      approval_level: 1,
      assigned_approver_id: '1',
      created_by: '1',
      created_at: '2024-09-29T00:00:00Z',
      updated_at: '2024-09-29T00:00:00Z'
    },
    {
      id: '2',
      name: 'Parking Lot Resurfacing',
      description: 'Complete parking lot resurfacing and line painting',
      property_id: '2',
      budget: 33000,
      category: 'Renovation & Upgrades',
      start_date: '2024-10-15',
      end_date: '2024-11-30',
      status: 'planning',
      priority: 'low',
      approval_type: 'single',
      approval_level: 1,
      assigned_approver_id: '1',
      created_by: '1',
      created_at: '2024-09-29T00:00:00Z',
      updated_at: '2024-09-29T00:00:00Z'
    }
  ],
  funding_details: [
    {
      id: '1',
      type: 'deposit',
      amount: 15000,
      date: '2024-10-01',
      project_id: '1',
      payment_status: 'unpaid',
      paid_date: null,
      paid_by: null
    },
    {
      id: '2',
      type: 'final',
      amount: 28000,
      date: '2024-10-24',
      project_id: '2',
      payment_status: 'unpaid',
      paid_date: null,
      paid_by: null
    },
    {
      id: '3',
      type: 'deposit',
      amount: 5000,
      date: '2024-10-03',
      project_id: '2',
      payment_status: 'paid',
      paid_date: '2024-10-02',
      paid_by: '1'
    }
  ],
  tasks: [
    {
      id: '1',
      name: 'Install new HVAC units',
      description: 'Install and configure new HVAC units on floors 1-5',
      start_date: '2024-10-01',
      end_date: '2024-10-15',
      assignee_id: '2',
      property_id: '1',
      project_id: '1',
      status: 'in-progress',
      priority: 'high',
      created_at: '2024-09-29T00:00:00Z',
      updated_at: '2024-09-29T00:00:00Z'
    },
    {
      id: '2',
      name: 'Test HVAC systems',
      description: 'Test and calibrate all HVAC systems',
      start_date: '2024-10-16',
      end_date: '2024-10-20',
      assignee_id: '3',
      property_id: '1',
      project_id: '1',
      status: 'pending',
      priority: 'medium',
      created_at: '2024-09-29T00:00:00Z',
      updated_at: '2024-09-29T00:00:00Z'
    },
    {
      id: '3',
      name: 'Prepare parking lot surface',
      description: 'Clean and prepare parking lot for resurfacing',
      start_date: '2024-10-15',
      end_date: '2024-10-18',
      assignee_id: '2',
      property_id: '2',
      project_id: '2',
      status: 'pending',
      priority: 'low',
      created_at: '2024-09-29T00:00:00Z',
      updated_at: '2024-09-29T00:00:00Z'
    },
    {
      id: '4',
      name: 'Apply new surface coating',
      description: 'Apply new asphalt surface coating',
      start_date: '2024-10-19',
      end_date: '2024-10-25',
      assignee_id: '3',
      property_id: '2',
      project_id: '2',
      status: 'pending',
      priority: 'low',
      created_at: '2024-09-29T00:00:00Z',
      updated_at: '2024-09-29T00:00:00Z'
    },
    {
      id: '5',
      name: 'Paint parking lines',
      description: 'Paint new parking lines and markings',
      start_date: '2024-10-26',
      end_date: '2024-10-30',
      assignee_id: '2',
      property_id: '2',
      project_id: '2',
      status: 'pending',
      priority: 'low',
      created_at: '2024-09-29T00:00:00Z',
      updated_at: '2024-09-29T00:00:00Z'
    }
  ],
  approval_history: [
    {
      project_id: '1',
      approver_id: '1',
      action: 'approved',
      comments: 'Project approved for implementation',
      created_at: '2024-09-29T00:00:00Z'
    },
    {
      project_id: '2',
      approver_id: '1',
      action: 'approved',
      comments: 'Project approved for planning phase',
      created_at: '2024-09-29T00:00:00Z'
    }
  ]
};

async function migrateData() {
  console.log('Starting database migration...');
  
  try {
    // Migrate users
    console.log('Migrating users...');
    const { error: usersError } = await supabase
      .from('users')
      .insert(sampleData.users);
    
    if (usersError) {
      console.error('Error inserting users:', usersError);
    } else {
      console.log('✅ Users migrated successfully');
    }

    // Migrate properties
    console.log('Migrating properties...');
    const { error: propertiesError } = await supabase
      .from('properties')
      .insert(sampleData.properties);
    
    if (propertiesError) {
      console.error('Error inserting properties:', propertiesError);
    } else {
      console.log('✅ Properties migrated successfully');
    }

    // Migrate project categories
    console.log('Migrating project categories...');
    const { error: categoriesError } = await supabase
      .from('project_categories')
      .insert(sampleData.project_categories);
    
    if (categoriesError) {
      console.error('Error inserting project categories:', categoriesError);
    } else {
      console.log('✅ Project categories migrated successfully');
    }

    // Migrate priorities
    console.log('Migrating priorities...');
    const { error: prioritiesError } = await supabase
      .from('priorities')
      .insert(sampleData.priorities);
    
    if (prioritiesError) {
      console.error('Error inserting priorities:', prioritiesError);
    } else {
      console.log('✅ Priorities migrated successfully');
    }

    // Migrate statuses
    console.log('Migrating statuses...');
    const { error: statusesError } = await supabase
      .from('statuses')
      .insert(sampleData.statuses);
    
    if (statusesError) {
      console.error('Error inserting statuses:', statusesError);
    } else {
      console.log('✅ Statuses migrated successfully');
    }

    // Migrate attachment types
    console.log('Migrating attachment types...');
    const { error: attachmentTypesError } = await supabase
      .from('attachment_types')
      .insert(sampleData.attachment_types);
    
    if (attachmentTypesError) {
      console.error('Error inserting attachment types:', attachmentTypesError);
    } else {
      console.log('✅ Attachment types migrated successfully');
    }

    // Migrate approval groups
    console.log('Migrating approval groups...');
    const { error: approvalGroupsError } = await supabase
      .from('approval_groups')
      .insert(sampleData.approval_groups);
    
    if (approvalGroupsError) {
      console.error('Error inserting approval groups:', approvalGroupsError);
    } else {
      console.log('✅ Approval groups migrated successfully');
    }

    // Migrate projects
    console.log('Migrating projects...');
    const { error: projectsError } = await supabase
      .from('projects')
      .insert(sampleData.projects);
    
    if (projectsError) {
      console.error('Error inserting projects:', projectsError);
    } else {
      console.log('✅ Projects migrated successfully');
    }

    // Migrate funding details
    console.log('Migrating funding details...');
    const { error: fundingError } = await supabase
      .from('funding_details')
      .insert(sampleData.funding_details);
    
    if (fundingError) {
      console.error('Error inserting funding details:', fundingError);
    } else {
      console.log('✅ Funding details migrated successfully');
    }

    // Migrate tasks
    console.log('Migrating tasks...');
    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(sampleData.tasks);
    
    if (tasksError) {
      console.error('Error inserting tasks:', tasksError);
    } else {
      console.log('✅ Tasks migrated successfully');
    }

    // Migrate approval history
    console.log('Migrating approval history...');
    const { error: approvalHistoryError } = await supabase
      .from('approval_history')
      .insert(sampleData.approval_history);
    
    if (approvalHistoryError) {
      console.error('Error inserting approval history:', approvalHistoryError);
    } else {
      console.log('✅ Approval history migrated successfully');
    }

    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateData();

