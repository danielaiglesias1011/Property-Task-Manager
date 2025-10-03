-- Add approval group field to projects table
-- Run this in Supabase SQL Editor

-- Add the new column for approval group ID
ALTER TABLE projects 
ADD COLUMN assigned_approval_group_id UUID REFERENCES approval_groups(id);

-- Update existing projects to handle the new field
-- This is optional but helps with data consistency
UPDATE projects 
SET assigned_approval_group_id = NULL 
WHERE assigned_approval_group_id IS NULL;

-- Add a check constraint to ensure either assigned_approver_id OR assigned_approval_group_id is set
-- (but not both)
ALTER TABLE projects 
ADD CONSTRAINT check_approval_assignment 
CHECK (
  (approval_type = 'single' AND assigned_approver_id IS NOT NULL AND assigned_approval_group_id IS NULL) OR
  (approval_type = 'group' AND assigned_approval_group_id IS NOT NULL AND assigned_approver_id IS NULL)
);
