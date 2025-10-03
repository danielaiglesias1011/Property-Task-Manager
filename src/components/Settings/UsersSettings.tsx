import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { Plus, Edit, Trash2, Archive, UserCheck, UserX, Mail, Shield } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useModal } from '../../hooks/useModal';
import ConfirmModal from '../Common/ConfirmModal';

const UsersSettings: React.FC = () => {
  const { state, dispatch } = useApp();
  const { 
    confirmModal, 
    showConfirm, 
    closeConfirm, 
    handleConfirm 
  } = useModal();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    approvalLevel: '1',
    permissions: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availablePermissions = [
    'create_projects',
    'edit_projects', 
    'delete_projects',
    'approve_projects',
    'create_tasks',
    'edit_tasks',
    'delete_tasks',
    'manage_users',
    'manage_settings',
    'view_reports'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Check for duplicate email (excluding current editing user)
    const existingUser = state.users.find(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUser?.id
    );
    if (existingUser) {
      newErrors.email = 'This email is already in use';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingUser) {
      // Update existing user
      const updatedUser: User = {
        ...editingUser,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        approvalLevel: parseInt(formData.approvalLevel) as 1 | 2 | 3,
        permissions: formData.permissions,
        updatedAt: new Date()
      };
      
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      });
    } else {
      // Create new user
      const newUser: User = {
        id: uuidv4(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        approvalLevel: parseInt(formData.approvalLevel) as 1 | 2 | 3,
        permissions: formData.permissions,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({
        type: 'ADD_USER',
        payload: newUser
      });
    }

    // Reset form
    setFormData({ name: '', email: '', role: 'user', approvalLevel: '1', permissions: [] });
    setShowCreateModal(false);
    setEditingUser(null);
    setErrors({});
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      approvalLevel: user.approvalLevel.toString(),
      permissions: [...user.permissions]
    });
    setShowCreateModal(true);
  };

  const handleDelete = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    showConfirm(
      'Delete User',
      `Are you sure you want to permanently delete ${user?.name || 'this user'}? This action cannot be undone.`,
      () => {
        dispatch({
          type: 'DELETE_USER',
          payload: userId
        });
      },
      {
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    );
  };

  const handleArchive = (userId: string, archive: boolean) => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    const updatedUser: User = {
      ...user,
      isArchived: archive,
      updatedAt: new Date()
    };

    dispatch({
      type: 'UPDATE_USER',
      payload: updatedUser
    });
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', role: 'user', approvalLevel: '1', permissions: [] });
    setShowCreateModal(false);
    setEditingUser(null);
    setErrors({});
  };

  const togglePermission = (permission: string) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={14} />;
      case 'manager': return <UserCheck size={14} />;
      case 'user': return <UserX size={14} />;
      default: return <UserX size={14} />;
    }
  };

  // Filter users based on archived status
  const filteredUsers = state.users.filter(user => showArchived ? user.isArchived : !user.isArchived);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              showArchived 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Archive size={16} />
            <span>{showArchived ? 'Show Active' : 'Show Archived'}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Approval Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.isArchived ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail size={12} className="mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300 rounded">
                      Level {user.approvalLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded"
                        >
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                      {user.permissions.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded">
                          +{user.permissions.length - 3} more
                        </span>
                      )}
                      {user.permissions.length === 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">No permissions</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isArchived 
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' 
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                    }`}>
                      {user.isArchived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleArchive(user.id, !user.isArchived)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isArchived
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                        title={user.isArchived ? "Unarchive user" : "Archive user"}
                      >
                        <Archive size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showArchived ? 'No archived users' : 'No active users'}
            </h3>
            <p className="text-gray-600 mb-4">
              {showArchived 
                ? 'All users are currently active'
                : 'Add your first user to get started'
              }
            </p>
            {!showArchived && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add User
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter user name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'user' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Level *
                  </label>
                  <select
                    value={formData.approvalLevel}
                    onChange={(e) => setFormData({ ...formData, approvalLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </label>
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
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
      />
    </div>
  );
};

export default UsersSettings;
