import React from 'react';
import { useApp } from '../context/HybridAppContext';
import { 
  Building2, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import SupabaseTest from '../components/Test/SupabaseTest';

const Dashboard: React.FC = () => {
  const { state } = useApp();

  // Calculate dashboard statistics
  const stats = {
    totalProperties: state.properties.length,
    totalProjects: state.projects.length,
    totalTasks: state.tasks.length,
    pendingApprovals: state.projects.filter(p => p.status === 'pending-approval').length,
    activeTasks: state.tasks.filter(t => t.status === 'in-progress').length,
    overdueTasks: state.tasks.filter(t => 
      isBefore(t.endDate, new Date()) && t.status !== 'completed'
    ).length,
    totalFunding: state.projects.reduce((sum, project) => 
      sum + project.fundingDetails.reduce((pSum, detail) => pSum + detail.amount, 0), 0
    )
  };

  // Get recent activities
  const recentProjects = state.projects
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const upcomingTasks = state.tasks
    .filter(t => t.status !== 'completed' && isAfter(t.endDate, new Date()))
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
    .slice(0, 5);

  const overdueTasks = state.tasks
    .filter(t => isBefore(t.endDate, new Date()) && t.status !== 'completed')
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {state.currentUser?.name || 'User'}!
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your properties and projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalProperties}</p>
              <p className="text-gray-600 dark:text-gray-300">Properties</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <FolderOpen className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalProjects}</p>
              <p className="text-gray-600 dark:text-gray-300">Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <CheckSquare className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.activeTasks}</p>
              <p className="text-gray-600 dark:text-gray-300">Active Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                ${stats.totalFunding.toLocaleString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300">Total Funding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      {(stats.pendingApprovals > 0 || stats.overdueTasks > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingApprovals > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="text-yellow-600" size={20} />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Pending Approvals
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {stats.pendingApprovals} project{stats.pendingApprovals !== 1 ? 's' : ''} waiting for approval
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.overdueTasks > 0 && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="text-red-600" size={20} />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Overdue Tasks
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {stats.overdueTasks} task{stats.overdueTasks !== 1 ? 's' : ''} past due date
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Recent Projects</h2>
          </div>
          <div className="p-6">
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map(project => {
                  const property = state.properties.find(p => p.id === project.propertyId);
                  return (
                    <div key={project.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FolderOpen className="text-blue-600 dark:text-blue-400" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{project.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{property?.name}</p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(project.createdAt, 'MMM d')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent projects</p>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Upcoming Tasks</h2>
          </div>
          <div className="p-6">
            {upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasks.map(task => {
                  const assignee = state.users.find(u => u.id === task.assigneeId);
                  return (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <CheckSquare className="text-green-600 dark:text-green-400" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{task.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{assignee?.name}</p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(task.endDate, 'MMM d')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Tasks (if any) */}
      {overdueTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-700">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-600 bg-red-50 dark:bg-red-900">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-200 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              Overdue Tasks
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {overdueTasks.map(task => {
                const assignee = state.users.find(u => u.id === task.assigneeId);
                const property = state.properties.find(p => p.id === task.propertyId);
                return (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="text-red-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{task.name}</p>
                      <p className="text-xs text-gray-600">
                        {property?.name} • {assignee?.name}
                      </p>
                    </div>
                    <div className="text-xs text-red-600 font-medium">
                      Due {format(task.endDate, 'MMM d, yyyy')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Temporary Supabase Test */}
      <div className="mt-8">
        <SupabaseTest />
      </div>
    </div>
  );
};

export default Dashboard;

