-- Restore Settings Data for Property Task Manager
-- This script will clear and restore all settings tables with proper UUIDs

-- Clear existing settings data (in case there are duplicates or corrupted data)
DELETE FROM attachment_types WHERE is_default = true;
DELETE FROM statuses WHERE is_default = true;
DELETE FROM priorities WHERE is_default = true;
DELETE FROM project_categories WHERE is_default = true;
DELETE FROM approval_groups WHERE level IN (1, 2, 3);

-- Insert project categories with proper UUIDs
INSERT INTO project_categories (id, name, description, is_default, created_at) VALUES
('550e8400-e29b-41d4-a716-446655445001', 'Security Systems', 'Security and surveillance projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445002', 'Renovation & Upgrades', 'Building renovation and upgrade projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445003', 'Maintenance', 'Regular maintenance and repair projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445004', 'New Construction', 'New building and construction projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445005', 'Technology', 'IT and technology infrastructure projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445006', 'HVAC', 'Heating, ventilation, and air conditioning projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445007', 'Electrical', 'Electrical system projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445008', 'Plumbing', 'Plumbing and water system projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445009', 'Landscaping', 'Landscaping and outdoor projects', true, NOW()),
('550e8400-e29b-41d4-a716-446655445010', 'Emergency Repairs', 'Emergency and urgent repair projects', true, NOW());

-- Insert priorities with proper UUIDs
INSERT INTO priorities (id, name, level, color, is_default, created_at) VALUES
('550e8400-e29b-41d4-a716-446655446001', 'Low', 1, '#10B981', true, NOW()),
('550e8400-e29b-41d4-a716-446655446002', 'Medium', 2, '#F59E0B', true, NOW()),
('550e8400-e29b-41d4-a716-446655446003', 'High', 3, '#EF4444', true, NOW()),
('550e8400-e29b-41d4-a716-446655446004', 'Critical', 4, '#DC2626', true, NOW());

-- Insert statuses with proper UUIDs
INSERT INTO statuses (id, name, type, color, is_default, created_at) VALUES
-- Project statuses
('550e8400-e29b-41d4-a716-446655447001', 'Draft', 'project', '#6B7280', true, NOW()),
('550e8400-e29b-41d4-a716-446655447002', 'Pending', 'project', '#6B7280', true, NOW()),
('550e8400-e29b-41d4-a716-446655447003', 'Pending Approval', 'project', '#F59E0B', true, NOW()),
('550e8400-e29b-41d4-a716-446655447004', 'Approved', 'project', '#10B981', true, NOW()),
('550e8400-e29b-41d4-a716-446655447005', 'Planning', 'project', '#F59E0B', true, NOW()),
('550e8400-e29b-41d4-a716-446655447006', 'In Progress', 'project', '#3B82F6', true, NOW()),
('550e8400-e29b-41d4-a716-446655447007', 'Completed', 'project', '#10B981', true, NOW()),
('550e8400-e29b-41d4-a716-446655447008', 'On Hold', 'project', '#F97316', true, NOW()),
('550e8400-e29b-41d4-a716-446655447009', 'Rejected', 'project', '#EF4444', true, NOW()),
-- Task statuses
('550e8400-e29b-41d4-a716-446655447010', 'Pending', 'task', '#6B7280', true, NOW()),
('550e8400-e29b-41d4-a716-446655447011', 'In Progress', 'task', '#3B82F6', true, NOW()),
('550e8400-e29b-41d4-a716-446655447012', 'Completed', 'task', '#10B981', true, NOW()),
('550e8400-e29b-41d4-a716-446655447013', 'Cancelled', 'task', '#EF4444', true, NOW());

-- Insert attachment types with proper UUIDs
INSERT INTO attachment_types (id, name, category, is_default, created_at) VALUES
('550e8400-e29b-41d4-a716-446655448001', 'Project Plan', 'project', true, NOW()),
('550e8400-e29b-41d4-a716-446655448002', 'Budget Estimate', 'project', true, NOW()),
('550e8400-e29b-41d4-a716-446655448003', 'Contract', 'project', true, NOW()),
('550e8400-e29b-41d4-a716-446655448004', 'Invoice', 'project', true, NOW()),
('550e8400-e29b-41d4-a716-446655448005', 'Photo', 'project', true, NOW()),
('550e8400-e29b-41d4-a716-446655448006', 'Document', 'project', true, NOW()),
('550e8400-e29b-41d4-a716-446655448007', 'Specification', 'project', true, NOW()),
('550e8400-e29b-41d4-a716-446655448008', 'Permit', 'project', true, NOW()),
('550e8400-e29b-41d4-a716-446655448009', 'Task Description', 'task', true, NOW()),
('550e8400-e29b-41d4-a716-446655448010', 'Progress Report', 'task', true, NOW()),
('550e8400-e29b-41d4-a716-446655448011', 'Completion Photo', 'task', true, NOW()),
('550e8400-e29b-41d4-a716-446655448012', 'Work Order', 'task', true, NOW());

-- Insert approval groups with proper UUIDs
INSERT INTO approval_groups (id, name, level, user_ids, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655449001', 'Level 1 Approvers', 1, ARRAY['550e8400-e29b-41d4-a716-446655440003'::UUID], 'Basic level approval group', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655449002', 'Level 2 Approvers', 2, ARRAY['550e8400-e29b-41d4-a716-446655440002'::UUID], 'Management level approval group', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655449003', 'Level 3 Approvers', 3, ARRAY['550e8400-e29b-41d4-a716-446655440001'::UUID], 'Executive level approval group', NOW(), NOW());

-- Verify the data was inserted
SELECT 'Project Categories' as table_name, COUNT(*) as count FROM project_categories WHERE is_default = true
UNION ALL
SELECT 'Priorities', COUNT(*) FROM priorities WHERE is_default = true
UNION ALL
SELECT 'Statuses', COUNT(*) FROM statuses WHERE is_default = true
UNION ALL
SELECT 'Attachment Types', COUNT(*) FROM attachment_types WHERE is_default = true
UNION ALL
SELECT 'Approval Groups', COUNT(*) FROM approval_groups WHERE level IN (1, 2, 3);

