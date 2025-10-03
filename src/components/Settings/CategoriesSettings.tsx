import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectCategory } from '../../types';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CategoriesSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCategory) {
      // Update existing category
      const updatedCategory: ProjectCategory = {
        ...editingCategory,
        name: formData.name,
        description: formData.description
      };
      
      dispatch({
        type: 'UPDATE_PROJECT_CATEGORY',
        payload: updatedCategory
      });
    } else {
      // Create new category
      const newCategory: ProjectCategory = {
        id: uuidv4(),
        name: formData.name,
        description: formData.description,
        isDefault: false,
        createdAt: new Date()
      };

      dispatch({
        type: 'ADD_PROJECT_CATEGORY',
        payload: newCategory
      });
    }

    // Reset form
    setFormData({ name: '', description: '' });
    setShowCreateModal(false);
    setEditingCategory(null);
    setErrors({});
  };

  const handleEdit = (category: ProjectCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = (categoryId: string) => {
    const category = state.projectCategories?.find(c => c.id === categoryId);
    const isDefault = category?.isDefault;
    
    const confirmMessage = isDefault 
      ? 'Are you sure you want to delete this default category? This action cannot be undone.'
      : 'Are you sure you want to delete this category?';
    
    if (window.confirm(confirmMessage)) {
      dispatch({
        type: 'DELETE_PROJECT_CATEGORY',
        payload: categoryId
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setShowCreateModal(false);
    setEditingCategory(null);
    setErrors({});
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Project Categories</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage categories for organizing projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Project Categories</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {state.projectCategories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Tag className="text-blue-600" size={16} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-semibold text-gray-800 dark:text-white">{category.name}</span>
                    {category.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{category.description}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                  title="Edit category"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    category.isDefault 
                      ? 'bg-gray-300 text-gray-500 hover:bg-red-500 hover:text-white' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={category.isDefault ? "Delete category (default)" : "Delete category"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {(!state.projectCategories || state.projectCategories.length === 0) && (
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-4">Add your first category to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category description (optional)"
                />
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
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesSettings;
