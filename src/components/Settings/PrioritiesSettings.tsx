import React, { useState } from 'react';
import { useApp } from '../../context/HybridAppContext';
import { Priority } from '../../types';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PrioritiesSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
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
    if (!formData.name.trim()) newErrors.name = 'Priority name is required';
    if (!formData.level || parseInt(formData.level) < 1) newErrors.level = 'Level must be a positive number';
    
    // Check for duplicate levels (excluding current editing priority)
    const existingPriority = state.priorities?.find(p => 
      p.level === parseInt(formData.level) && p.id !== editingPriority?.id
    );
    if (existingPriority) {
      newErrors.level = 'This level already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingPriority) {
      // Update existing priority
      const updatedPriority: Priority = {
        ...editingPriority,
        name: formData.name,
        level: parseInt(formData.level),
        color: formData.color
      };
      
      dispatch({
        type: 'UPDATE_PRIORITY',
        payload: updatedPriority
      });
    } else {
      // Create new priority
      const newPriority: Priority = {
        id: uuidv4(),
        name: formData.name,
        level: parseInt(formData.level),
        color: formData.color,
        isDefault: false,
        createdAt: new Date()
      };

      dispatch({
        type: 'ADD_PRIORITY',
        payload: newPriority
      });
    }

    // Reset form
    setFormData({ name: '', level: '', color: '#3B82F6' });
    setShowCreateModal(false);
    setEditingPriority(null);
    setErrors({});
  };

  const handleEdit = (priority: Priority) => {
    setEditingPriority(priority);
    setFormData({
      name: priority.name,
      level: priority.level.toString(),
      color: priority.color
    });
    setShowCreateModal(true);
  };

  const handleDelete = (priorityId: string) => {
    const priority = state.priorities?.find(p => p.id === priorityId);
    const isDefault = priority?.isDefault;
    
    const confirmMessage = isDefault 
      ? 'Are you sure you want to delete this default priority? This action cannot be undone.'
      : 'Are you sure you want to delete this priority?';
    
    if (window.confirm(confirmMessage)) {
      dispatch({
        type: 'DELETE_PRIORITY',
        payload: priorityId
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', level: '', color: '#3B82F6' });
    setShowCreateModal(false);
    setEditingPriority(null);
    setErrors({});
  };

  // Sort priorities by level
  const sortedPriorities = state.priorities?.sort((a, b) => a.level - b.level) || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Priority Levels</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage priority levels for projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Priority</span>
        </button>
      </div>

      {/* Priorities List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Priority Levels</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {sortedPriorities.map((priority) => (
            <div
              key={priority.id}
              className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: priority.color + '15' }}
                >
                  <AlertTriangle 
                    size={20}
                    style={{ color: priority.color }}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white">{priority.name}</h4>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium">
                      Level {priority.level}
                    </span>
                    {priority.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(priority)}
                  className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                  title="Edit priority"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(priority.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    priority.isDefault 
                      ? 'bg-gray-300 text-gray-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={priority.isDefault ? "Delete priority (default)" : "Delete priority"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {sortedPriorities.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No priorities yet</h3>
              <p className="text-gray-600 mb-4">Add your first priority level to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Priority
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingPriority ? 'Edit Priority' : 'Add New Priority'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter priority name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.level ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter priority level (1, 2, 3...)"
                />
                {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
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
                  {editingPriority ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrioritiesSettings;
