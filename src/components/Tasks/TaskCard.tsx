import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/HybridAppContext';
import { 
  CheckSquare, 
  Calendar, 
  User, 
  MessageCircle,
  Paperclip,
  Edit2,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { state, dispatch } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const assignee = state.users.find(u => u.id === task.assigneeId);
  const project = state.projects.find(p => p.id === task.projectId);
  const property = state.properties.find(p => p.id === task.propertyId);
  
  const now = new Date();
  const isOverdue = isBefore(task.endDate, now) && task.status !== 'completed';
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isDueSoon = isAfter(task.endDate, now) && 
    isBefore(task.endDate, sevenDaysFromNow) &&
    task.status !== 'completed';

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    const updatedTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date()
    };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    setShowStatusDropdown(false);
  };

  const getStatusOptions = (): Task['status'][] => {
    return ['pending', 'in-progress', 'completed', 'cancelled'];
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showStatusDropdown]);

  return (
    <>
      <div className={`rounded-md border-l-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group ${
        isOverdue ? 'border-l-red-500' : 
        isDueSoon ? 'border-l-orange-500' : 
        task.status === 'completed' ? 'border-l-green-500' : 
        task.status === 'in-progress' ? 'border-l-blue-500' : 
        'border-l-gray-300 dark:border-l-gray-600'
      }`}>
        {/* Main Task Header - Always Visible */}
        <div 
          className="px-4 py-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            {/* Left side - Task info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Expand/Collapse Button */}
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronRight size={14} className="text-gray-500 dark:text-gray-400" />
                )}
              </button>

              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                task.status === 'completed' ? 'bg-green-500 text-white' : 
                task.status === 'in-progress' ? 'bg-blue-500 text-white' : 
                'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                <CheckSquare size={12} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">{task.name}</h4>
                  {project && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      {project.name}
                    </span>
                  )}
                </div>
                
                {/* Description preview */}
                {task.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <User size={10} className="mr-1" />
                      {assignee?.name || 'Unassigned'}
                    </span>
                    <span className="flex items-center">
                      <Calendar size={10} className="mr-1" />
                      {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                    </span>
                    {task.comments.length > 0 && (
                      <span className="flex items-center">
                        <MessageCircle size={10} className="mr-1" />
                        {task.comments.length}
                      </span>
                    )}
                    {task.attachments.length > 0 && (
                      <span className="flex items-center">
                        <Paperclip size={10} className="mr-1" />
                        {task.attachments.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Additional task information in the middle space */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    {/* Property name */}
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                      {property?.name || 'No Property'}
                    </span>
                    
                    {/* Days remaining/overdue */}
                    {(isOverdue || isDueSoon) && (
                      <span className={`flex items-center font-medium ${
                        isOverdue ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        <span className="w-2 h-2 bg-current rounded-full mr-1"></span>
                        {isOverdue ? 'Overdue' : `${Math.ceil((task.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}d left`}
                      </span>
                    )}
                    
                    {/* Created date */}
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                      Created {format(task.createdAt, 'MMM d')}
                    </span>
                  </div>
                  
                  {/* Status and Priority moved to the right side of the info area */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase()}
                    </span>
                    
                    {/* Clickable Status Badge with Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowStatusDropdown(!showStatusDropdown);
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity ${getStatusColor(task.status)}`}
                        title="Click to change status"
                      >
                        {getStatusLabel(task.status)}
                      </button>
                      
                      {showStatusDropdown && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[120px]">
                          {getStatusOptions().map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(status);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                                status === task.status ? 'bg-gray-100 dark:bg-gray-600 font-medium' : ''
                              }`}
                            >
                              {getStatusLabel(status)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Edit button */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Edit task"
              >
                <Edit2 size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Details Section - Only Comments and Attachments */}
        {isExpanded && (task.comments.length > 0 || task.attachments.length > 0) && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-600">
            <div className="pt-3 space-y-3">
              {/* Comments */}
              {task.comments.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comments ({task.comments.length})</h5>
                  <div className="space-y-2">
                    {task.comments.map((comment) => {
                      const author = state.users.find(u => u.id === comment.authorId);
                      return (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {author?.name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(comment.createdAt, 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{comment.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments ({task.attachments.length})</h5>
                  <div className="space-y-2">
                    {task.attachments.map((attachment) => (
                      <div key={attachment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Paperclip size={14} className="text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{attachment.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({attachment.type})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="View file"
                          >
                            <Eye size={14} />
                          </a>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            by {attachment.uploadedBy} • {format(attachment.uploadedAt, 'MMM d')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default TaskCard;

