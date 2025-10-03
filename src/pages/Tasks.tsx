import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, Plus, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import TaskCard from '../components/Tasks/TaskCard';
import CreateTaskModal from '../components/Tasks/CreateTaskModal';

const Tasks: React.FC = () => {
  const { state } = useApp();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [filterProperty, setFilterProperty] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Filter tasks based on selected filters
  const filteredTasks = state.tasks.filter(task => {
    if (filterProperty && task.propertyId !== filterProperty) return false;
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterAssignee && task.assigneeId !== filterAssignee) return false;
    return true;
  });

  // Group tasks
  const linkedTasks = filteredTasks.filter(task => task.projectId);
  const standaloneTasks = filteredTasks.filter(task => !task.projectId);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Task statistics
  const stats = {
    total: state.tasks.length,
    pending: state.tasks.filter(t => t.status === 'pending').length,
    inProgress: state.tasks.filter(t => t.status === 'in-progress').length,
    completed: state.tasks.filter(t => t.status === 'completed').length,
    overdue: state.tasks.filter(t => 
      new Date(t.endDate) < new Date() && t.status !== 'completed'
    ).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckSquare className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">All Tasks</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage all tasks across properties and projects</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateTask(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <CheckSquare className="text-blue-600 dark:text-blue-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="text-gray-600 dark:text-gray-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pending}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <CheckSquare className="text-yellow-600 dark:text-yellow-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.inProgress}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckSquare className="text-green-600 dark:text-green-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.completed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <CheckSquare className="text-red-600 dark:text-red-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.overdue}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Properties</option>
            {state.properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Assignees</option>
            {state.users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {(filterProperty || filterStatus || filterAssignee) && (
            <button
              onClick={() => {
                setFilterProperty('');
                setFilterStatus('');
                setFilterAssignee('');
              }}
              className="text-sm text-green-600 hover:text-green-800"
            >
              Clear Filters
            </button>
          )}

          <div className="text-sm text-gray-600 ml-auto">
            Showing {filteredTasks.length} of {state.tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Tasks Content */}
      <div className="space-y-6">
        {/* Property Tasks (linked to property but not project) */}
        {standaloneTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Property Tasks ({standaloneTasks.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Tasks linked to properties but not specific projects</p>
            
            {/* Group by property */}
            {state.properties
              .filter(property => standaloneTasks.some(task => task.propertyId === property.id))
              .map(property => {
                const tasks = standaloneTasks.filter(task => task.propertyId === property.id);
                const sectionId = `property-${property.id}`;
                const isCollapsed = collapsedSections[sectionId];
                
                return (
                  <div key={property.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => toggleSection(sectionId)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <CheckSquare className="text-blue-600 dark:text-blue-400" size={16} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800 dark:text-white">{property.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{tasks.length} tasks</p>
                        </div>
                      </div>
                      {isCollapsed ? <ChevronRight size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
                    </button>
                    
                    {!isCollapsed && (
                      <div className="px-6 pb-6 space-y-1">
                        {tasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Project-Linked Tasks */}
        {linkedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Project Tasks ({linkedTasks.length})
            </h2>
            
            {/* Group by project */}
            {state.projects
              .filter(project => linkedTasks.some(task => task.projectId === project.id))
              .map(project => {
                const projectTasks = linkedTasks.filter(task => task.projectId === project.id);
                const property = state.properties.find(p => p.id === project.propertyId);
                const sectionId = `project-${project.id}`;
                const isCollapsed = collapsedSections[sectionId];
                
                return (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <button
                      onClick={() => toggleSection(sectionId)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <CheckSquare className="text-purple-600" size={16} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800">{project.name}</h3>
                          <p className="text-sm text-gray-600">
                            {property?.name} • {projectTasks.length} tasks
                          </p>
                        </div>
                      </div>
                      {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {!isCollapsed && (
                      <div className="px-6 pb-6 space-y-1">
                        {projectTasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {state.tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {state.tasks.length === 0 
                ? 'Create your first task to get started'
                : 'Try adjusting your filters or create a new task'
              }
            </p>
            <button
              onClick={() => setShowCreateTask(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
};

export default Tasks;
