import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApprovalGroup, User } from '../../types';
import { Plus, Edit, Trash2, Users, UserPlus, UserMinus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ApprovalGroupsSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ApprovalGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    description: '',
    userIds: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Group name is required';
    if (!formData.level || parseInt(formData.level) < 1) newErrors.level = 'Level must be a positive number';
    if (formData.userIds.length === 0) newErrors.users = 'At least one user must be selected';
    
    // Check for duplicate levels (excluding current editing group)
    const existingGroup = state.approvalGroups?.find(g => 
      g.level === parseInt(formData.level) && g.id !== editingGroup?.id
    );
    if (existingGroup) {
      newErrors.level = 'This level already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingGroup) {
      // Update existing group
      const updatedGroup: ApprovalGroup = {
        ...editingGroup,
        name: formData.name,
        level: parseInt(formData.level),
        description: formData.description,
        userIds: formData.userIds,
        updatedAt: new Date()
      };
      
      dispatch({
        type: 'UPDATE_APPROVAL_GROUP',
        payload: updatedGroup
      });
    } else {
      // Create new group
      const newGroup: ApprovalGroup = {
        id: uuidv4(),
        name: formData.name,
        level: parseInt(formData.level),
        description: formData.description,
        userIds: formData.userIds,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({
        type: 'ADD_APPROVAL_GROUP',
        payload: newGroup
      });
    }

    // Reset form
    setFormData({ name: '', level: '', description: '', userIds: [] });
    setShowCreateModal(false);
    setEditingGroup(null);
    setErrors({});
  };

  const handleEdit = (group: ApprovalGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      level: group.level.toString(),
      description: group.description || '',
      userIds: [...group.userIds]
    });
    setShowCreateModal(true);
  };

  const handleDelete = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this approval group?')) {
      dispatch({
        type: 'DELETE_APPROVAL_GROUP',
        payload: groupId
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', level: '', description: '', userIds: [] });
    setShowCreateModal(false);
    setEditingGroup(null);
    setErrors({});
  };

  const toggleUser = (userId: string) => {
    const newUserIds = formData.userIds.includes(userId)
      ? formData.userIds.filter(id => id !== userId)
      : [...formData.userIds, userId];
    setFormData({ ...formData, userIds: newUserIds });
  };

  const getUserName = (userId: string): string => {
    const user = state.users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Sort groups by level
  const sortedGroups = state.approvalGroups?.sort((a, b) => a.level - b.level) || [];

  // Filter active users only
  const activeUsers = state.users.filter(user => !user.isArchived);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Approval Groups</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage approval groups and assign users to different levels</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Group</span>
        </button>
      </div>

      {/* Groups List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Approval Groups</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {sortedGroups.map((group) => (
            <div
              key={group.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">{group.name}</h3>
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium">
                        Level {group.level}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(group)}
                    className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                    title="Edit approval group"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                    title="Delete approval group"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Group Members */}
              <div className="ml-13">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Members ({group.userIds.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {group.userIds.map((userId) => (
                    <span
                      key={userId}
                      className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300"
                    >
                      {getUserName(userId)}
                    </span>
                  ))}
                  {group.userIds.length === 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">No members assigned</span>
                  )}
                </div>
              </div>
            </div>
        ))}

          {sortedGroups.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No approval groups yet</h3>
              <p className="text-gray-600 mb-4">Create your first approval group to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingGroup ? 'Edit Approval Group' : 'Add New Approval Group'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter group name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Level *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.level ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter level (1, 2, 3...)"
                  />
                  {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
                </div>
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
                  placeholder="Enter group description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Members *
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {activeUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => toggleUser(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          formData.userIds.includes(user.id)
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {formData.userIds.includes(user.id) ? (
                          <UserMinus size={16} />
                        ) : (
                          <UserPlus size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                  
                  {activeUsers.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No active users available
                    </div>
                  )}
                </div>
                {errors.users && <p className="text-red-500 text-sm mt-1">{errors.users}</p>}
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
                  {editingGroup ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalGroupsSettings;
