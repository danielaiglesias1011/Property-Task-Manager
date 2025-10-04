import React from 'react';
import { Project } from '../../types';
import { useApp } from '../../context/HybridAppContext';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  FileText,
  Building2,
  FolderOpen,
  CheckSquare,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  onBack, 
  onEdit, 
  onDelete 
}) => {
  const { state } = useApp();

  // Get related data
  const property = state.properties.find(p => p.id === project.propertyId);
  const createdByUser = state.users.find(u => u.id === project.createdBy);
  const assignedUser = state.users.find(u => u.id === project.assignedApproverId);
  const assignedGroup = state.approvalGroups.find(g => g.id === project.assignedApprovalGroupId);

  // Status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
          icon: FileText,
          label: 'Draft'
        };
      case 'pending-approval':
        return { 
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          icon: Clock,
          label: 'Pending Approval'
        };
      case 'approved':
        return { 
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: CheckCircle,
          label: 'Approved'
        };
      case 'in-progress':
        return { 
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          icon: Clock,
          label: 'In Progress'
        };
      case 'completed':
        return { 
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'rejected':
        return { 
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: XCircle,
          label: 'Rejected'
        };
      case 'on-hold':
        return { 
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          icon: Pause,
          label: 'On Hold'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
          icon: AlertCircle,
          label: status
        };
    }
  };

  // Priority configuration
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return { 
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          label: 'High'
        };
      case 'medium':
        return { 
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          label: 'Medium'
        };
      case 'low':
        return { 
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          label: 'Low'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
          label: priority
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);
  const priorityConfig = getPriorityConfig(project.priority);
  const StatusIcon = statusConfig.icon;

  // Calculate progress
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format functions
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate total funding
  const totalFunding = project.fundingDetails.reduce((sum, detail) => sum + detail.amount, 0);
  const remainingBudget = project.budget - totalFunding;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{project.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">Project Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Edit Project"
            >
              <Edit size={20} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete Project"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center space-x-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${statusConfig.color}`}>
          <StatusIcon size={16} />
          <span>{statusConfig.label}</span>
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color}`}>
          {priorityConfig.label} Priority
        </span>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Description</h3>
        <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Property */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Property</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">{property?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{property?.address}</p>
        </div>

        {/* Budget */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Budget</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">{formatBudget(project.budget)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatBudget(totalFunding)} allocated
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Timeline</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(project.startDate)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">to {formatDate(project.endDate)}</p>
        </div>

        {/* Approval */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <User className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Approval</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {project.approvalType === 'single' 
              ? assignedUser?.name || 'Unassigned'
              : assignedGroup?.name || 'Unassigned Group'
            }
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {project.approvalType === 'single' ? 'Single Approver' : 'Approval Group'}
          </p>
        </div>
      </div>

      {/* Progress */}
      {totalTasks > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Project Progress</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tasks Completed
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedTasks} of {totalTasks}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-right mt-2">
            <span className="text-lg font-bold text-blue-600">{progressPercentage}%</span>
          </div>
        </div>
      )}

      {/* Funding Details */}
      {project.fundingDetails.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Funding Schedule</h3>
          <div className="space-y-3">
            {project.fundingDetails.map((detail, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{formatBudget(detail.amount)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Due: {formatDate(detail.date)} • Paid by: {detail.paidBy}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  detail.status === 'paid' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {detail.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Total Allocated:</span>
              <span className="font-semibold text-gray-800 dark:text-white">{formatBudget(totalFunding)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Remaining Budget:</span>
              <span className={`font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatBudget(remainingBudget)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      {project.tasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Project Tasks</h3>
          <div className="space-y-2">
            {project.tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckSquare size={16} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{task.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {formatDate(task.endDate)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : task.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {project.attachments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Attachments</h3>
          <div className="space-y-2">
            {project.attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FileText size={16} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{attachment.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{attachment.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Created Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Created by {createdByUser?.name || 'Unknown User'}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(project.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
