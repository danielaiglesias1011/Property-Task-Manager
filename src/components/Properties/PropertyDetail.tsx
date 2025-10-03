import React, { useState } from 'react';
import { Property } from '../../types';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Plus, FolderOpen, CheckSquare, DollarSign, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import ProjectCard from '../Projects/ProjectCard';
import TaskCard from '../Tasks/TaskCard';
import CreateProjectModal from '../Projects/CreateProjectModal';
import CreateTaskModal from '../Tasks/CreateTaskModal';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack }) => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'funding'>('projects');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  
  const propertyProjects = state.projects.filter(p => p.propertyId === property.id);
  const propertyTasks = state.tasks.filter(t => t.propertyId === property.id);
  const unassignedTasks = propertyTasks.filter(t => !t.projectId);
  
  // Get all funding details for projects in this property
  const allProjectFundingDetails = propertyProjects.flatMap(project => 
    project.fundingDetails?.map(funding => ({
      ...funding,
      projectName: project.name
    })) || []
  );

  const toggleProjectCollapse = (projectId: string) => {
    const newCollapsed = new Set(collapsedProjects);
    if (newCollapsed.has(projectId)) {
      newCollapsed.delete(projectId);
    } else {
      newCollapsed.add(projectId);
    }
    setCollapsedProjects(newCollapsed);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{property.name}</h1>
            <p className="text-gray-600">{property.address}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateProject(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FolderOpen size={16} />
              <span>Projects ({propertyProjects.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckSquare size={16} />
              <span>Tasks ({propertyTasks.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('funding')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'funding'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign size={16} />
              <span>Funding ({allProjectFundingDetails.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {propertyProjects.length > 0 ? (
              <div className="space-y-4">
                {propertyProjects.map(project => {
                  const isCollapsed = collapsedProjects.has(project.id);
                  const projectTasks = propertyTasks.filter(t => t.projectId === project.id);
                  
                  return (
                    <div key={project.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {/* Project Header - Always Visible */}
                      <div 
                        className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleProjectCollapse(project.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProjectCollapse(project.id);
                              }}
                              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isCollapsed ? (
                                <ChevronRight size={16} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={16} className="text-gray-500" />
                              )}
                            </button>
                            
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="text-primary-600" size={20} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                                <p className="text-sm text-gray-600">{project.description}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'approved' ? 'bg-green-100 text-green-800' :
                              project.status === 'pending-approval' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {projectTasks.length > 0 && (
                              <span className="flex items-center">
                                <CheckSquare size={14} className="mr-1" />
                                {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {project.fundingDetails && project.fundingDetails.length > 0 && (
                              <span className="flex items-center">
                                <DollarSign size={14} className="mr-1" />
                                ${project.fundingDetails.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Project Details - Collapsible */}
                      {!isCollapsed && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          <ProjectCard project={project} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first project to get started</p>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {unassignedTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Unassigned Tasks</h3>
                <div className="grid gap-4">
                  {unassignedTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
            
            {propertyProjects.map(project => {
              const projectTasks = propertyTasks.filter(t => t.projectId === project.id);
              if (projectTasks.length === 0) return null;
              
              return (
                <div key={project.id}>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    {project.name} Tasks
                  </h3>
                  <div className="grid gap-4">
                    {projectTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              );
            })}

            {propertyTasks.length === 0 && (
              <div className="text-center py-12">
                <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600 mb-4">Create your first task to get started</p>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Task
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'funding' && (
          <div className="space-y-4">
            {allProjectFundingDetails.length > 0 ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {['deposit', 'progress', 'final', 'budget'].map(type => {
                    const typeFunding = allProjectFundingDetails.filter(f => f.type === type);
                    const total = typeFunding.reduce((sum, f) => sum + f.amount, 0);
                    return (
                      <div key={type} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700 capitalize">{type}</h4>
                          <DollarSign size={16} className="text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          ${total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {typeFunding.length} payment{typeFunding.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Funding by Project */}
                {propertyProjects.map(project => {
                  const projectFunding = project.fundingDetails || [];
                  if (projectFunding.length === 0) return null;
                  
                  return (
                    <div key={project.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Total: ${projectFunding.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {projectFunding
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                              .map((detail) => (
                              <tr key={detail.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    detail.type === 'deposit' ? 'bg-blue-100 text-blue-800' :
                                    detail.type === 'progress' ? 'bg-yellow-100 text-yellow-800' :
                                    detail.type === 'final' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {detail.type.charAt(0).toUpperCase() + detail.type.slice(1)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ${detail.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                  <Calendar size={14} className="mr-2" />
                                  {format(detail.date, 'MMM d, yyyy')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No funding details</h3>
                <p className="text-gray-600">Create projects with funding details to see them here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          propertyId={property.id}
          onClose={() => setShowCreateProject(false)}
        />
      )}
      
      {showCreateTask && (
        <CreateTaskModal
          propertyId={property.id}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetail;

