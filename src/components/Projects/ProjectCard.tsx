import React, { useState } from 'react';
import { Project } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  FileText, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onView?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const { state } = useApp();
  const [showActions, setShowActions] = useState(false);

  // Get property name
  const property = state.properties.find(p => p.id === project.propertyId);
  const propertyName = property?.name || 'Unknown Property';

  // Get created by user name
  const createdByUser = state.users.find(u => u.id === project.createdBy);
  const createdByName = createdByUser?.name || 'Unknown User';

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

  // Calculate progress based on tasks
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format budget
  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon size={12} className="inline mr-1" />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {propertyName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Actions Menu */}
        <div className="relative ml-4">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <MoreVertical size={16} />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                {onView && (
                  <button
                    onClick={() => {
                      onView(project);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye size={16} className="mr-3" />
                    View Details
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(project);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit size={16} className="mr-3" />
                    Edit Project
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(project);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 size={16} className="mr-3" />
                    Delete Project
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {progressPercentage}%
            </span>
          </div>
        </div>
      )}

      {/* Project Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatBudget(project.budget)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
            {priorityConfig.label}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Priority
            </p>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(project.startDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(project.endDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
          </div>
        </div>
      </div>

      {/* Created by */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <User size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Created by {createdByName}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(project.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
