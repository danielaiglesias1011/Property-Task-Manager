// Simple test to verify Supabase connection and data
import { supabase } from '../supabaseClient';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('tasks').select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase tasks data:', data);
    console.log(`Found ${data?.length || 0} tasks in Supabase`);
    
    return { success: true, data: data };
  } catch (err) {
    console.error('Connection test failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const loadTasksFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        properties(name, address),
        projects(name)
      `);
    
    if (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
    
    // Convert to app format
    const tasks = data?.map((row: any) => ({
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
      comments: [], // Will load separately if needed
      attachments: [], // Will load separately if needed
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
    })) || [];
    
    console.log('Converted tasks:', tasks);
    return tasks;
  } catch (err) {
    console.error('Error in loadTasksFromSupabase:', err);
    return [];
  }
};
