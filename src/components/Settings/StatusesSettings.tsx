import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Status } from '../../types';
import { Plus, Edit, Trash2, Circle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const StatusesSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'project' as 'project' | 'task',
    color: '#3B82F6'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const predefinedColors = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#DC2626', // Dark Red
    '#059669'  // Dark Green
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Status name is required';
    
    // Check for duplicate names within the same type (excluding current editing status)
    const existingStatus = state.statuses?.find(s => 
      s.name.toLowerCase() === formData.name.toLowerCase() && 
      s.type === formData.type && 
      s.id !== editingStatus?.id
    );
    if (existingStatus) {
      newErrors.name = `This ${formData.type} status already exists`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingStatus) {
      // Update existing status
      const updatedStatus: Status = {
        ...editingStatus,
        name: formData.name,
        type: formData.type,
        color: formData.color
      };
      
      dispatch({
        type: 'UPDATE_STATUS',
        payload: updatedStatus
      });
    } else {
      // Create new status
      const newStatus: Status = {
        id: uuidv4(),
        name: formData.name,
        type: formData.type,
        color: formData.color,
        isDefault: false,
        createdAt: new Date()
      };

      dispatch({
        type: 'ADD_STATUS',
        payload: newStatus
      });
    }

    // Reset form
    setFormData({ name: '', type: 'project', color: '#3B82F6' });
    setShowCreateModal(false);
    setEditingStatus(null);
    setErrors({});
  };

  const handleEdit = (status: Status) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      type: status.type,
      color: status.color
    });
    setShowCreateModal(true);
  };

  const handleDelete = (statusId: string) => {
    const status = state.statuses?.find(s => s.id === statusId);
    const isDefault = status?.isDefault;
    
    const confirmMessage = isDefault 
      ? 'Are you sure you want to delete this default status? This action cannot be undone.'
      : 'Are you sure you want to delete this status?';
    
    if (window.confirm(confirmMessage)) {
      dispatch({
        type: 'DELETE_STATUS',
        payload: statusId
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', type: 'project', color: '#3B82F6' });
    setShowCreateModal(false);
    setEditingStatus(null);
    setErrors({});
  };

  // Group statuses by type
  const projectStatuses = state.statuses?.filter(s => s.type === 'project') || [];
  const taskStatuses = state.statuses?.filter(s => s.type === 'task') || [];

  const StatusGroup = ({ title, statuses, type }: { title: string; statuses: Status[]; type: 'project' | 'task' }) => (
    <div className="mb-8">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {statuses.map((status) => (
            <div
              key={status.id}
              className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: status.color + '15' }}
                >
                  <Circle 
                    size={20}
                    style={{ color: status.color }}
                    fill={status.color}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white">{status.name}</h4>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium capitalize">
                      {type} Status
                    </span>
                    {status.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(status)}
                  className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                  title="Edit status"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(status.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    status.isDefault 
                      ? 'bg-gray-300 text-gray-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={status.isDefault ? "Delete status (default)" : "Delete status"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {statuses.length === 0 && (
            <div className="text-center py-12">
              <Circle size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No {type} statuses yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Add your first {type} status to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add {type.charAt(0).toUpperCase() + type.slice(1)} Status
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Status Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage status options with custom colors for projects and tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Status</span>
        </button>
      </div>

      {/* Statuses Groups */}
      <StatusGroup title="Project Statuses" statuses={projectStatuses} type="project" />
      <StatusGroup title="Task Statuses" statuses={taskStatuses} type="task" />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {editingStatus ? 'Edit Status' : 'Add New Status'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter status name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'project' | 'task' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="project">Project Status</option>
                  <option value="task">Task Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="space-y-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  
                  <div className="grid grid-cols-5 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStatus ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusesSettings;
