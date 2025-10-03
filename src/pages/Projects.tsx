import React, { useState } from 'react';
import { useApp } from '../context/HybridAppContext';
import { FolderOpen, Plus, Filter } from 'lucide-react';
import ProjectCard from '../components/Projects/ProjectCard';
import CreateProjectModal from '../components/Projects/CreateProjectModal';

const Projects: React.FC = () => {
  const { state } = useApp();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [filterProperty, setFilterProperty] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Filter projects based on selected filters
  const filteredProjects = state.projects.filter(project => {
    if (filterProperty && project.propertyId !== filterProperty) return false;
    if (filterStatus && project.status !== filterStatus) return false;
    return true;
  });

  // Project statistics
  const stats = {
    total: state.projects.length,
    draft: state.projects.filter(p => p.status === 'draft').length,
    pendingApproval: state.projects.filter(p => p.status === 'pending-approval').length,
    approved: state.projects.filter(p => p.status === 'approved').length,
    inProgress: state.projects.filter(p => p.status === 'in-progress').length,
    completed: state.projects.filter(p => p.status === 'completed').length,
    rejected: state.projects.filter(p => p.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">All Projects</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage projects across all properties</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateProject(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FolderOpen className="text-blue-600 dark:text-blue-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <FolderOpen className="text-gray-600 dark:text-gray-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.draft}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Draft</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <FolderOpen className="text-yellow-600 dark:text-yellow-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.pendingApproval}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <FolderOpen className="text-green-600 dark:text-green-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.approved}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <FolderOpen className="text-purple-600 dark:text-purple-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.inProgress}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
              <FolderOpen className="text-emerald-600 dark:text-emerald-400" size={16} />
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
              <FolderOpen className="text-red-600 dark:text-red-400" size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.rejected}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Rejected</p>
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
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending-approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {(filterProperty || filterStatus) && (
            <button
              onClick={() => {
                setFilterProperty('');
                setFilterStatus('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}

          <div className="text-sm text-gray-600 ml-auto">
            Showing {filteredProjects.length} of {state.projects.length} projects
          </div>
        </div>
      </div>

      {/* Projects Content */}
      <div>
        {filteredProjects.length > 0 ? (
          <div>
            {/* Group by property */}
            {state.properties
              .filter(property => filteredProjects.some(project => project.propertyId === property.id))
              .map(property => {
                const propertyProjects = filteredProjects.filter(project => project.propertyId === property.id);
                
                return (
                  <div key={property.id} className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      {property.name}
                      <span className="text-sm text-gray-500 ml-2">
                        ({propertyProjects.length} projects)
                      </span>
                    </h2>
                    <div className="grid gap-4">
                      {propertyProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {state.projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {state.projects.length === 0 
                ? 'Create your first project to get started'
                : 'Try adjusting your filters or create a new project'
              }
            </p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
        />
      )}
    </div>
  );
};

export default Projects;
