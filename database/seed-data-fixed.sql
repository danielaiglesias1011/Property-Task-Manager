-- Seed data for Property Task Manager (Fixed with UUIDs)
-- Run this after creating the schema

-- Insert default users
INSERT INTO users (id, name, email, approval_level, role, permissions, is_archived, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Admin User', 'admin@company.com', 3, 'admin', ARRAY['create_projects', 'edit_projects', 'delete_projects', 'approve_projects', 'manage_users', 'manage_settings'], false, '2024-01-01', '2024-01-01'),
('550e8400-e29b-41d4-a716-446655440002', 'Manager User', 'manager@company.com', 2, 'manager', ARRAY['create_projects', 'edit_projects', 'approve_projects', 'create_tasks', 'edit_tasks'], false, '2024-01-01', '2024-01-01'),
('550e8400-e29b-41d4-a716-446655440003', 'Regular User', 'user@company.com', 1, 'user', ARRAY['create_tasks', 'edit_tasks'], false, '2024-01-01', '2024-01-01');

-- Insert properties
INSERT INTO properties (id, name, address, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Corporate Headquarters', '123 Main St, Downtown', 'Commercial office building with 10 floors', '2024-01-01', '2024-01-01'),
('550e8400-e29b-41d4-a716-446655440102', 'Regional Distribution Center', '456 Oak Ave, Suburbs', '50-unit residential apartment complex', '2024-01-15', '2024-01-15');

-- Insert project categories
INSERT INTO project_categories (name, description, is_default, created_at) VALUES
('Security Systems', 'Security and surveillance projects', true, NOW()),
('Renovation & Upgrades', 'Building renovation and upgrade projects', true, NOW()),
('Maintenance', 'Regular maintenance and repair projects', true, NOW()),
('New Construction', 'New building and construction projects', true, NOW()),
('Technology', 'IT and technology infrastructure projects', true, NOW());

-- Insert priorities
INSERT INTO priorities (name, level, color, is_default, created_at) VALUES
('Low', 1, '#10B981', true, NOW()),
('Medium', 2, '#F59E0B', true, NOW()),
('High', 3, '#EF4444', true, NOW());

-- Insert statuses
INSERT INTO statuses (name, type, color, is_default, created_at) VALUES
-- Project statuses
('Draft', 'project', '#6B7280', true, NOW()),
('Pending', 'project', '#6B7280', true, NOW()),
('Pending Approval', 'project', '#F59E0B', true, NOW()),
('Approved', 'project', '#10B981', true, NOW()),
('Planning', 'project', '#F59E0B', true, NOW()),
('In Progress', 'project', '#3B82F6', true, NOW()),
('Completed', 'project', '#10B981', true, NOW()),
('On Hold', 'project', '#F97316', true, NOW()),
('Rejected', 'project', '#EF4444', true, NOW()),
-- Task statuses
('Pending', 'task', '#6B7280', true, NOW()),
('In Progress', 'task', '#3B82F6', true, NOW()),
('Completed', 'task', '#10B981', true, NOW()),
('Cancelled', 'task', '#EF4444', true, NOW());

-- Insert attachment types
INSERT INTO attachment_types (name, category, is_default) VALUES
('Project Plan', 'project', true),
('Budget Estimate', 'project', true),
('Contract', 'project', true),
('Invoice', 'project', true),
('Photo', 'project', true),
('Document', 'project', true),
('Task Description', 'task', true),
('Progress Report', 'task', true),
('Completion Photo', 'task', true);

-- Insert approval groups
INSERT INTO approval_groups (name, level, user_ids, description, created_at, updated_at) VALUES
('Level 1 Approvers', 1, ARRAY['550e8400-e29b-41d4-a716-446655440003'::UUID], 'Basic level approval group', NOW(), NOW()),
('Level 2 Approvers', 2, ARRAY['550e8400-e29b-41d4-a716-446655440002'::UUID], 'Management level approval group', NOW(), NOW()),
('Level 3 Approvers', 3, ARRAY['550e8400-e29b-41d4-a716-446655440001'::UUID], 'Executive level approval group', NOW(), NOW());

-- Insert projects
INSERT INTO projects (id, name, description, property_id, budget, category, start_date, end_date, status, priority, approval_type, approval_level, assigned_approver_id, created_by, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'HVAC System Upgrade', 'Complete HVAC system replacement and upgrade', '550e8400-e29b-41d4-a716-446655440101', 86000, 'Security Systems', '2024-10-01', '2024-12-15', 'in-progress', 'high', 'single', 1, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-09-29', '2024-09-29'),
('550e8400-e29b-41d4-a716-446655440202', 'Parking Lot Resurfacing', 'Complete parking lot resurfacing and line painting', '550e8400-e29b-41d4-a716-446655440102', 33000, 'Renovation & Upgrades', '2024-10-15', '2024-11-30', 'planning', 'low', 'single', 1, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-09-29', '2024-09-29');

-- Insert funding details
INSERT INTO funding_details (id, type, amount, date, project_id, payment_status, paid_date, paid_by) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'deposit', 15000, '2024-10-01', '550e8400-e29b-41d4-a716-446655440201', 'unpaid', NULL, NULL),
('550e8400-e29b-41d4-a716-446655440302', 'final', 28000, '2024-10-24', '550e8400-e29b-41d4-a716-446655440202', 'unpaid', NULL, NULL),
('550e8400-e29b-41d4-a716-446655440303', 'deposit', 5000, '2024-10-03', '550e8400-e29b-41d4-a716-446655440202', 'paid', '2024-10-02', '550e8400-e29b-41d4-a716-446655440001');

-- Insert tasks
INSERT INTO tasks (id, name, description, start_date, end_date, assignee_id, property_id, project_id, status, priority, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440401', 'Install new HVAC units', 'Install and configure new HVAC units on floors 1-5', '2024-10-01', '2024-10-15', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', 'in-progress', 'high', '2024-09-29', '2024-09-29'),
('550e8400-e29b-41d4-a716-446655440402', 'Test HVAC systems', 'Test and calibrate all HVAC systems', '2024-10-16', '2024-10-20', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', 'pending', 'medium', '2024-09-29', '2024-09-29'),
('550e8400-e29b-41d4-a716-446655440403', 'Prepare parking lot surface', 'Clean and prepare parking lot for resurfacing', '2024-10-15', '2024-10-18', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440202', 'pending', 'low', '2024-09-29', '2024-09-29'),
('550e8400-e29b-41d4-a716-446655440404', 'Apply new surface coating', 'Apply new asphalt surface coating', '2024-10-19', '2024-10-25', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440202', 'pending', 'low', '2024-09-29', '2024-09-29'),
('550e8400-e29b-41d4-a716-446655440405', 'Paint parking lines', 'Paint new parking lines and markings', '2024-10-26', '2024-10-30', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440202', 'pending', 'low', '2024-09-29', '2024-09-29');

-- Insert approval history
INSERT INTO approval_history (project_id, approver_id, action, comments, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'Project approved for implementation', '2024-09-29'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'approved', 'Project approved for planning phase', '2024-09-29');
