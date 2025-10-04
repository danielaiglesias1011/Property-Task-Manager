-- Fix the approval assignment constraint to be more flexible
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS check_approval_assignment;

-- Add a more flexible constraint that allows for draft projects without assignment
ALTER TABLE projects 
ADD CONSTRAINT check_approval_assignment 
CHECK (
  -- Single approver: assigned_approver_id must be set, assigned_approval_group_id must be NULL
  (approval_type = 'single' AND assigned_approver_id IS NOT NULL AND assigned_approval_group_id IS NULL) OR
  -- Group approver: assigned_approval_group_id must be set, assigned_approver_id must be NULL  
  (approval_type = 'group' AND assigned_approval_group_id IS NOT NULL AND assigned_approver_id IS NULL) OR
  -- Draft projects: both can be NULL (for initial creation)
  (assigned_approver_id IS NULL AND assigned_approval_group_id IS NULL)
);

