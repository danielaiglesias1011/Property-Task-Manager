import React, { useState, useEffect } from 'react';
import { testSupabaseConnection, loadTasksFromSupabase } from '../../utils/supabaseTest';

const SupabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    
    if (result.success) {
      const supabaseTasks = await loadTasksFromSupabase();
      setTasks(supabaseTasks);
    }
    setLoading(false);
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {testResult && (
        <div className="mb-4">
          <div className={`p-3 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <strong>Connection Status:</strong> {testResult.success ? 'SUCCESS' : 'FAILED'}
            {testResult.error && <div className="mt-1">Error: {testResult.error}</div>}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Tasks from Supabase:</h3>
        <div className="text-sm text-gray-600 mb-2">
          Found {tasks.length} tasks
        </div>
        
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 bg-gray-50 rounded border">
                <div className="font-medium">{task.name}</div>
                <div className="text-sm text-gray-600">{task.description}</div>
                <div className="text-xs text-gray-500">
                  Status: {task.status} | Priority: {task.priority}
                </div>
                <div className="text-xs text-gray-500">
                  Start: {task.startDate.toLocaleDateString()} | End: {task.endDate.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No tasks found</div>
        )}
      </div>
    </div>
  );
};

export default SupabaseTest;

