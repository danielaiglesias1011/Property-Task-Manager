import React, { useState } from 'react';
import { useApp } from '../../context/HybridAppContext';
import { v4 as uuidv4 } from 'uuid';
import { X, Upload, Plus, Trash2, Eye } from 'lucide-react';
import { Project, FundingDetail, Attachment } from '../../types';
import * as supabaseService from '../../services/supabaseService';

// Form-specific interface for funding details that allows string amounts during input
interface FundingDetailForm {
  type: 'deposit' | 'progress' | 'final' | 'budget';
  amount: string;
  date: Date;
  paymentStatus: 'paid' | 'unpaid';
  paidDate?: Date;
  paidBy?: string;
}

interface CreateProjectModalProps {
  propertyId?: string;
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ propertyId, onClose }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    propertyId: propertyId,
    approvalType: 'single' as 'single' | 'group',
    approverId: '',
    category: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'rejected',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [fundingDetails, setFundingDetails] = useState<FundingDetailForm[]>([]);
  const [attachments, setAttachments] = useState<Omit<Attachment, 'id'>[]>([]);
  const [selectedAttachmentType, setSelectedAttachmentType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get project categories from state
  const projectCategories = state.projectCategories || [];

  // Available properties for selection
  const availableProperties = state.properties;
  
  // Get users for approval selection
  const availableApprovers = state.users.filter(user => user.role === 'admin' || user.role === 'manager');

  const projectAttachmentTypes = state.attachmentTypes.filter(t => t.category === 'project');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.budget || parseFloat(formData.budget) <= 0) newErrors.budget = 'Budget must be greater than 0';
    if (!formData.propertyId) newErrors.propertyId = 'Property selection is required';
    if (!formData.approverId) newErrors.approverId = 'Approver selection is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Validate funding schedule - total cannot exceed budget
    if (fundingDetails.length > 0) {
      const totalFunding = fundingDetails.reduce((sum, detail) => {
        const amount = parseFloat(detail.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      const budget = parseFloat(formData.budget);
      
      if (totalFunding > budget) {
        newErrors.fundingTotal = `Total funding ($${totalFunding.toLocaleString()}) cannot exceed project budget ($${budget.toLocaleString()})`;
      }
    }
    
    // Validate individual funding details
    fundingDetails.forEach((detail, index) => {
      const amount = parseFloat(detail.amount);
      if (detail.amount === '' || isNaN(amount) || amount <= 0) {
        newErrors[`funding_${index}_amount`] = 'Amount must be greater than 0';
      }
      if (!detail.date) {
        newErrors[`funding_${index}_date`] = 'Date is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Ensure propertyId is not empty (validation passed)
    if (!formData.propertyId) return;

    const projectId = uuidv4();
    const newProject: Project = {
      id: projectId,
      name: formData.name,
      description: formData.description,
      propertyId: formData.propertyId,
      budget: parseFloat(formData.budget),
      category: formData.category,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      status: formData.status,
      priority: formData.priority,
      approvalType: formData.approvalType,
      assignedApproverId: formData.approvalType === 'single' ? formData.approverId : undefined,
      assignedApprovalGroupId: formData.approvalType === 'group' ? formData.approverId : undefined,
      approvalLevel: formData.approvalType === 'single' ? 1 : 2, // Default level based on type
      createdBy: state.currentUser?.id || '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: attachments.map(att => ({ ...att, id: uuidv4() })),
      fundingDetails: fundingDetails.map(detail => ({
        id: uuidv4(),
        type: detail.type,
        amount: parseFloat(detail.amount),
        date: detail.date,
        projectId,
        paymentStatus: detail.paymentStatus,
        paidDate: detail.paidDate,
        paidBy: detail.paidBy
      })),
      tasks: []
    };

    try {
      console.log('Creating project with data:', {
        name: newProject.name,
        category: newProject.category,
        budget: newProject.budget,
        approvalType: newProject.approvalType,
        assignedApproverId: newProject.assignedApproverId,
        assignedApprovalGroupId: newProject.assignedApprovalGroupId,
        fundingDetails: newProject.fundingDetails,
        attachments: newProject.attachments
      });
      
      // Save to Supabase first
      const savedProject = await supabaseService.projectService.create(newProject);
      
      // Then update local state
      dispatch({ type: 'ADD_PROJECT', payload: savedProject });
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const addFundingDetail = () => {
    setFundingDetails([...fundingDetails, {
      type: 'deposit',
      amount: '',
      date: new Date(),
      paymentStatus: 'unpaid' as 'paid' | 'unpaid',
      paidDate: undefined,
      paidBy: undefined
    }]);
  };

  const updateFundingDetail = (index: number, field: keyof FundingDetailForm, value: any) => {
    const updated = [...fundingDetails];
    updated[index] = { ...updated[index], [field]: value };
    setFundingDetails(updated);
  };

  const removeFundingDetail = (index: number) => {
    setFundingDetails(fundingDetails.filter((_, i) => i !== index));
  };

  const handleFileUpload = () => {
    if (!selectedAttachmentType) return;
    
    const attachmentType = projectAttachmentTypes.find(t => t.id === selectedAttachmentType);
    if (!attachmentType) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Create a file URL for preview (in a real app, you'd upload to a server)
        const fileUrl = URL.createObjectURL(file);
        
        setAttachments([...attachments, {
          name: file.name,
          type: attachmentType.name,
          typeId: attachmentType.id,
          url: fileUrl,
          uploadedBy: state.currentUser?.name || 'Unknown User',
          uploadedAt: new Date()
        }]);
        setSelectedAttachmentType(''); // Reset selection
      }
    };
    input.click();
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Calculate funding totals
  const totalFunding = fundingDetails.reduce((sum, detail) => {
    const amount = parseFloat(detail.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  const budget = parseFloat(formData.budget) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Project Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter project name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.budget ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter project budget"
                />
                {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
              </div>
            </div>

            {/* Description */}
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
                placeholder="Enter project description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Selection */}
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
                  <option value="">Select a property...</option>
                  {availableProperties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </option>
                  ))}
                </select>
                {errors.propertyId && <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category...</option>
                  {projectCategories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Project Timeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
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

              {/* End Date */}
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
          </div>

          {/* Status and Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Project Status & Priority</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Approval Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Approval Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Approval Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Type *
                </label>
                <select
                  value={formData.approvalType}
                  onChange={(e) => setFormData({ ...formData, approvalType: e.target.value as any, approverId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="single">Single Approver</option>
                  <option value="group">Approval Group</option>
                </select>
              </div>

              {/* Approver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.approvalType === 'single' ? 'Select Approver' : 'Select Approval Group'} *
                </label>
                <select
                  value={formData.approverId}
                  onChange={(e) => setFormData({ ...formData, approverId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.approverId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">
                    {formData.approvalType === 'single' ? 'Select an approver...' : 'Select approval group...'}
                  </option>
                  {formData.approvalType === 'single' ? (
                    availableApprovers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))
                  ) : (
                    state.approvalGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.approverId && <p className="text-red-500 text-sm mt-1">{errors.approverId}</p>}
              </div>
            </div>
          </div>

          {/* Funding Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Funding Schedule</h3>
              <div className="flex items-center space-x-4">
                {budget > 0 && (
                  <div className="text-sm text-gray-600">
                    Budget: <span className="font-medium">${budget.toLocaleString()}</span>
                    {fundingDetails.length > 0 && (
                      <>
                        {' | '}Scheduled: <span className={`font-medium ${Math.abs(totalFunding - budget) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                          ${totalFunding.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={addFundingDetail}
                  className="bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Add Payment</span>
                </button>
              </div>
            </div>

            {errors.fundingTotal && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{errors.fundingTotal}</p>
              </div>
            )}

            {fundingDetails.length === 0 && (
              <p className="text-gray-600 text-sm">Add funding payments to schedule project budget disbursement.</p>
            )}

            {/* Budget Summary */}
            {fundingDetails.length > 0 && formData.budget && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Budget Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total Budget:</span>
                    <div className="font-semibold text-blue-900">
                      ${parseFloat(formData.budget || '0').toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Allocated:</span>
                    <div className="font-semibold text-blue-900">
                      ${fundingDetails.reduce((sum, detail) => {
                        const amount = parseFloat(detail.amount);
                        return sum + (isNaN(amount) ? 0 : amount);
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Remaining:</span>
                    <div className="font-semibold text-blue-900">
                      ${Math.max(0, parseFloat(formData.budget || '0') - fundingDetails.reduce((sum, detail) => {
                        const amount = parseFloat(detail.amount);
                        return sum + (isNaN(amount) ? 0 : amount);
                      }, 0)).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-blue-600 text-xs mt-2">
                  You can add more funding payments later. The total allocated cannot exceed the project budget.
                </p>
              </div>
            )}

            {fundingDetails.map((detail, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">Payment #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeFundingDetail(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={detail.type}
                      onChange={(e) => updateFundingDetail(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="deposit">Deposit</option>
                      <option value="progress">Progress</option>
                      <option value="final">Final</option>
                      <option value="budget">Budget</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detail.amount}
                      onChange={(e) => updateFundingDetail(index, 'amount', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors[`funding_${index}_amount`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter amount"
                    />
                    {errors[`funding_${index}_amount`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`funding_${index}_amount`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={detail.date.toISOString().split('T')[0]}
                      onChange={(e) => updateFundingDetail(index, 'date', new Date(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors[`funding_${index}_date`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`funding_${index}_date`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`funding_${index}_date`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Attachments</h3>
            
            {/* Add Attachment Section */}
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Attachment Type
                </label>
                <select
                  value={selectedAttachmentType}
                  onChange={(e) => setSelectedAttachmentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose attachment type...</option>
                  {projectAttachmentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={!selectedAttachmentType}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Upload</span>
              </button>
            </div>

            {/* Added Attachments List */}
            {attachments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Added Attachments ({attachments.length})</h4>
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Upload size={14} className="text-primary-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{attachment.name}</span>
                          <p className="text-xs text-gray-500">{attachment.type} • Added by {attachment.uploadedBy}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="View file"
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Remove attachment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

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
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;