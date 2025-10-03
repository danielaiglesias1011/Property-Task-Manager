import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { X, Upload, Trash2, Eye } from 'lucide-react';
import { Task, Attachment } from '../../types';
import { format } from 'date-fns';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description,
    startDate: format(task.startDate, 'yyyy-MM-dd'),
    endDate: format(task.endDate, 'yyyy-MM-dd'),
    assigneeId: task.assigneeId,
    propertyId: task.propertyId,
    projectId: task.projectId || '',
    priority: task.priority,
    status: task.status
  });
  const [attachments, setAttachments] = useState<Attachment[]>(task.attachments);
  const [newComment, setNewComment] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const propertyProjects = formData.propertyId ? state.projects.filter(p => p.propertyId === formData.propertyId) : [];
  const taskAttachmentTypes = state.attachmentTypes.filter(t => t.category === 'task');

  // Reset project selection when property changes
  useEffect(() => {
    if (formData.propertyId !== task.propertyId) {
      setFormData(prev => ({ ...prev, projectId: '' }));
    }
  }, [formData.propertyId, task.propertyId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Task name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.assigneeId) newErrors.assigneeId = 'Assignee is required';
    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Add new comment if provided
    const updatedComments = [...task.comments];
    if (newComment.trim()) {
      updatedComments.push({
        id: uuidv4(),
        text: newComment.trim(),
        authorId: state.currentUser?.id || '1',
        createdAt: new Date()
      });
    }

    const updatedTask: Task = {
      ...task,
      name: formData.name,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      assigneeId: formData.assigneeId,
      propertyId: formData.propertyId,
      projectId: formData.projectId || undefined,
      priority: formData.priority,
      status: formData.status,
      comments: updatedComments,
      attachments: attachments,
      updatedAt: new Date()
    };

    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    onClose();
  };

  const handleFileUpload = (typeId: string, typeName: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Create a file URL for preview (in a real app, you'd upload to a server)
        const fileUrl = URL.createObjectURL(file);
        
        setAttachments([...attachments, {
          id: uuidv4(),
          name: file.name,
          type: typeName,
          typeId,
          url: fileUrl,
          uploadedBy: state.currentUser?.id || '1',
          uploadedAt: new Date()
        }]);
      }
    };
    input.click();
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Task Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter task name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter task description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property *
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.propertyId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a property</option>
                {state.properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyId && <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee *
                </label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.assigneeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select assignee</option>
                  {state.users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                {errors.assigneeId && <p className="text-red-500 text-sm mt-1">{errors.assigneeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Project Selection - Shows when property is selected */}
            {formData.propertyId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Project (Optional)
                </label>
                {propertyProjects.length > 0 ? (
                  <>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">No project (standalone task)</option>
                      {propertyProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Link this task to a specific project within the selected property
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                    No projects available for this property. This task will be a standalone property task.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Existing Comments */}
          {task.comments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Comments History</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {task.comments.map(comment => {
                  const author = state.users.find(u => u.id === comment.authorId);
                  return (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm text-gray-800">{author?.name}</span>
                        <span className="text-xs text-gray-500">
                          {format(comment.createdAt, 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add New Comment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Add Comment</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Comment (Optional)
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Add a comment about this update..."
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Attachments</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {taskAttachmentTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleFileUpload(type.id, type.name)}
                  className="border border-gray-300 rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Upload size={16} />
                  <span className="text-sm">Upload {type.name}</span>
                </button>
              ))}
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Attachments:</h4>
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Upload size={14} className="text-primary-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{attachment.name}</span>
                        <p className="text-xs text-gray-500">{attachment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="View file"
                      >
                        <Eye size={16} />
                      </a>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove attachment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
