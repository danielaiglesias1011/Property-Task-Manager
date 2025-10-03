import React, { useState } from 'react';
import { useApp } from '../../context/HybridAppContext';
import { FileText, CheckCircle, XCircle, Clock, MessageCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../../types';

const ApprovalsView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approved' | 'rejected' | 'requested-changes'>('approved');

  // Filter projects that need approval or have approval history
  const pendingProjects = state.projects.filter(p => p.status === 'pending-approval');
  const approvedProjects = state.projects.filter(p => p.status === 'approved');
  const rejectedProjects = state.projects.filter(p => p.status === 'rejected');

  // Check if current user can approve at the required level
  const canApprove = (project: Project) => {
    return state.currentUser && state.currentUser.approvalLevel >= project.approvalLevel;
  };

  const handleApprovalAction = (project: Project, action: 'approved' | 'rejected' | 'requested-changes') => {
    setSelectedProject(project);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const submitApproval = () => {
    if (!selectedProject || !state.currentUser) return;

    // Update project status
    const updatedProject = {
      ...selectedProject,
      status: approvalAction as Project['status'],
      assignedApproverId: state.currentUser.id,
      updatedAt: new Date()
    };

    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });

    // Add approval history
    const approvalHistory = {
      id: uuidv4(),
      projectId: selectedProject.id,
      approverId: state.currentUser.id,
      action: approvalAction,
      comments: approvalComment,
      createdAt: new Date()
    };

    dispatch({ type: 'ADD_APPROVAL_HISTORY', payload: approvalHistory });

    // Reset form
    setSelectedProject(null);
    setApprovalComment('');
    setShowApprovalModal(false);
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'pending-approval':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending-approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ProjectCard: React.FC<{ project: Project; showActions?: boolean }> = ({ 
    project, 
    showActions = false 
  }) => {
    const property = state.properties.find(p => p.id === project.propertyId);
    const creator = state.users.find(u => u.id === project.createdBy);
    const approver = state.users.find(u => u.id === project.assignedApproverId);
    const projectHistory = state.approvalHistory.filter(h => h.projectId === project.id);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
            <p className="text-gray-600 text-sm">{property?.name}</p>
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(project.status)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <User size={14} className="text-gray-400" />
            <span className="text-gray-600">Created by: {creator?.name}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              Level {project.approvalLevel} Required
            </span>
          </div>
          
          <div className="text-gray-600">
            Created: {format(project.createdAt, 'MMM d, yyyy')}
          </div>
          
          {approver && (
            <div className="text-gray-600">
              Approver: {approver.name}
            </div>
          )}
        </div>

        {/* Funding Summary */}
        {project.fundingDetails.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Funding Details:</div>
            <div className="text-sm text-gray-600">
              Total: ${project.fundingDetails.reduce((sum, detail) => sum + detail.amount, 0).toLocaleString()}
              {' '}({project.fundingDetails.length} items)
            </div>
          </div>
        )}

        {/* Approval History */}
        {projectHistory.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="text-sm font-medium text-gray-700">Approval History:</div>
            {projectHistory.map(history => {
              const historyApprover = state.users.find(u => u.id === history.approverId);
              return (
                <div key={history.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{historyApprover?.name}</span>
                    <span className="text-gray-400">•</span>
                    <span>{history.action}</span>
                    <span className="text-gray-400">•</span>
                    <span>{format(history.createdAt, 'MMM d, yyyy')}</span>
                  </div>
                  {history.comments && (
                    <div className="mt-1 text-gray-500">{history.comments}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && canApprove(project) && (
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleApprovalAction(project, 'approved')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleApprovalAction(project, 'rejected')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
            <button
              onClick={() => handleApprovalAction(project, 'requested-changes')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
            >
              <MessageCircle size={16} />
              <span>Request Changes</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <FileText className="text-primary-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Project Approvals</h1>
          <p className="text-gray-600">Review and approve project submissions</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
          <div className="flex items-center space-x-3">
            <Clock className="text-yellow-600" size={20} />
            <div>
              <p className="text-sm text-yellow-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-800">{pendingProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-600" size={20} />
            <div>
              <p className="text-sm text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-800">{approvedProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="text-red-600" size={20} />
            <div>
              <p className="text-sm text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-800">{rejectedProjects.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Approvals</h2>
        {pendingProjects.length > 0 ? (
          <div className="space-y-4">
            {pendingProjects.map(project => (
              <ProjectCard key={project.id} project={project} showActions={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending approvals</h3>
            <p className="text-gray-600">All projects have been reviewed</p>
          </div>
        )}
      </div>

      {/* Recent Approvals */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Approvals</h2>
        {[...approvedProjects, ...rejectedProjects].length > 0 ? (
          <div className="space-y-4">
            {[...approvedProjects, ...rejectedProjects]
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              .slice(0, 5)
              .map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No approval history</h3>
            <p className="text-gray-600">Approved and rejected projects will appear here</p>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {approvalAction === 'approved' ? 'Approve Project' :
                 approvalAction === 'rejected' ? 'Reject Project' :
                 'Request Changes'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Project: {selectedProject.name}</p>
                <p className="text-sm text-gray-600">
                  Property: {state.properties.find(p => p.id === selectedProject.propertyId)?.name}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments {approvalAction !== 'approved' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Add your comments..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApproval}
                  disabled={approvalAction !== 'approved' && !approvalComment.trim()}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                    approvalAction === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                    approvalAction === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {approvalAction === 'approved' ? 'Approve' :
                   approvalAction === 'rejected' ? 'Reject' :
                   'Request Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsView;

