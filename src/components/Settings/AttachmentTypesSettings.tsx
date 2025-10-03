import React, { useState } from 'react';
import { useApp } from '../../context/HybridAppContext';
import { AttachmentType } from '../../types';
import { Plus, Edit, Trash2, Paperclip, FolderOpen } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AttachmentTypesSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingType, setEditingType] = useState<AttachmentType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'project' as 'project' | 'task'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Type name is required';
    
    // Check for duplicate names within the same category (excluding current editing type)
    const existingType = state.attachmentTypes.find(t => 
      t.name.toLowerCase() === formData.name.toLowerCase() && 
      t.category === formData.category && 
      t.id !== editingType?.id
    );
    if (existingType) {
      newErrors.name = `This ${formData.category} attachment type already exists`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingType) {
      // Update existing type
      const updatedType: AttachmentType = {
        ...editingType,
        name: formData.name,
        category: formData.category
      };
      
      dispatch({
        type: 'UPDATE_ATTACHMENT_TYPE',
        payload: updatedType
      });
    } else {
      // Create new type
      const newType: AttachmentType = {
        id: uuidv4(),
        name: formData.name,
        category: formData.category,
        isDefault: false
      };

      dispatch({
        type: 'ADD_ATTACHMENT_TYPE',
        payload: newType
      });
    }

    // Reset form
    setFormData({ name: '', category: 'project' });
    setShowCreateModal(false);
    setEditingType(null);
    setErrors({});
  };

  const handleEdit = (type: AttachmentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      category: type.category
    });
    setShowCreateModal(true);
  };

  const handleDelete = (typeId: string) => {
    if (window.confirm('Are you sure you want to delete this attachment type?')) {
      dispatch({
        type: 'DELETE_ATTACHMENT_TYPE',
        payload: typeId
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', category: 'project' });
    setShowCreateModal(false);
    setEditingType(null);
    setErrors({});
  };

  // Group attachment types by category
  const projectTypes = state.attachmentTypes.filter(t => t.category === 'project');
  const taskTypes = state.attachmentTypes.filter(t => t.category === 'task');

  const AttachmentTypeGroup = ({ 
    title, 
    types, 
    category 
  }: { 
    title: string; 
    types: AttachmentType[]; 
    category: 'project' | 'task' 
  }) => (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">{title}</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {types.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center shadow-sm">
                  <Paperclip className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white">{type.name}</h4>
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium capitalize">
                      {category} Attachment
                    </span>
                    {type.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(type)}
                  className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                  title="Edit attachment type"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(type.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    type.isDefault 
                      ? 'bg-gray-300 text-gray-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={type.isDefault ? "Delete attachment type (default)" : "Delete attachment type"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {types.length === 0 && (
            <div className="text-center py-12">
              <Paperclip size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {category} attachment types yet</h3>
              <p className="text-gray-600 mb-4">Add your first {category} attachment type to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add {category.charAt(0).toUpperCase() + category.slice(1)} Type
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
          <h2 className="text-xl font-semibold text-gray-800">Attachment Types</h2>
          <p className="text-gray-600">Manage attachment types for projects and tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Type</span>
        </button>
      </div>

      {/* Attachment Types Groups */}
      <AttachmentTypeGroup title="Project Attachment Types" types={projectTypes} category="project" />
      <AttachmentTypeGroup title="Task Attachment Types" types={taskTypes} category="task" />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingType ? 'Edit Attachment Type' : 'Add New Attachment Type'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter attachment type name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'project' | 'task' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="project">Project Attachment</option>
                  <option value="task">Task Attachment</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Paperclip size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Attachment Type Guidelines:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Use clear, descriptive names (e.g., "Contract", "Invoice", "Photo")</li>
                      <li>• Project types are used when creating projects</li>
                      <li>• Task types are used when creating tasks</li>
                      <li>• Default types cannot be deleted</li>
                    </ul>
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
                  {editingType ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentTypesSettings;