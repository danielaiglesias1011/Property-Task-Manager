import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, DollarSign, CheckCircle, Calendar, Folder, User, CheckSquare, RotateCcw, Building } from 'lucide-react';
import { format } from 'date-fns';
import { FundingDetail, Project } from '../../types';

const ForecastView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-10');

  // Aggregate all funding details with project and property info
  const fundingData = useMemo(() => {
    if (!state?.projects || !state?.properties) {
      return [];
    }

    const allFunding: Array<FundingDetail & { 
      project: Project; 
      propertyName: string; 
      propertyId: string;
    }> = [];

    state.projects.forEach(project => {
      if (project?.fundingDetails) {
        const property = state.properties.find(p => p.id === project.propertyId);
        if (property) {
          project.fundingDetails.forEach(funding => {
            if (funding?.date) {
              allFunding.push({
                ...funding,
                project,
                propertyName: property.name,
                propertyId: property.id
              });
            }
          });
        }
      }
    });

    // Filter by selected month
    return allFunding.filter(funding => {
      try {
        const fundingMonth = format(funding.date, 'yyyy-MM');
        return fundingMonth === selectedMonth;
      } catch {
        return false;
      }
    });
  }, [state?.projects, state?.properties, selectedMonth]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totals = {
      totalPaymentsDue: 0,
      paymentItems: fundingData.length,
      forecastMonths: 3,
      unpaid: 0,
      paid: 0,
      total: 0
    };

    fundingData.forEach(funding => {
      if (funding?.amount) {
        totals.totalPaymentsDue += funding.amount;
        totals.total += funding.amount;
        
        if (funding.paymentStatus === 'paid') {
          totals.paid += funding.amount;
        } else {
          totals.unpaid += funding.amount;
        }
      }
    });

    return totals;
  }, [fundingData]);

  // Group funding by property
  const fundingByProperty = useMemo(() => {
    const grouped: { [propertyId: string]: { 
      propertyName: string; 
      items: Array<FundingDetail & { project: Project; propertyName: string; propertyId: string }> 
    } } = {};

    fundingData.forEach(funding => {
      if (funding?.propertyId && funding?.propertyName) {
        if (!grouped[funding.propertyId]) {
          grouped[funding.propertyId] = {
            propertyName: funding.propertyName,
            items: []
          };
        }
        grouped[funding.propertyId].items.push(funding);
      }
    });

    return grouped;
  }, [fundingData]);

  const handleMarkPaid = (projectId: string, fundingId: string) => {
    dispatch({
      type: 'UPDATE_PAYMENT_STATUS',
      payload: {
        projectId,
        fundingId,
        paymentStatus: 'paid',
        paidBy: state?.currentUser?.id || '1'
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'final':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'budget':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'unpaid':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cash Flow Forecast</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Track project funding and financial forecasts</p>
            </div>
          </div>
        </div>

        {/* Monthly Budget Forecast Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border border-green-200 dark:border-green-700 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Monthly budget forecast for approved projects
              </h3>
              <p className="text-green-600 dark:text-green-300 text-sm">
                Monitor upcoming payments and cash flow requirements
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">TOTAL PAYMENTS DUE</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${summary.totalPaymentsDue.toLocaleString()}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <DollarSign className="text-green-600 dark:text-green-400" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">PAYMENT ITEMS</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {summary.paymentItems}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">FORECAST MONTHS</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {summary.forecastMonths}
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <Calendar className="text-purple-600 dark:text-purple-400" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Current Month Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="text-gray-500 dark:text-gray-400" size={20} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')} Forecast
            </h2>
          </div>

          {/* Monthly Payment Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Payment Items: {summary.paymentItems}</span>
              <span className="text-orange-600 dark:text-orange-400 font-semibold">Unpaid: ${summary.unpaid.toLocaleString()}</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">Paid: ${summary.paid.toLocaleString()}</span>
              <span className="text-gray-900 dark:text-white font-semibold">Total: ${summary.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Funding Tables */}
        <div className="space-y-6">
          {Object.entries(fundingByProperty).map(([propertyId, propertyData]) => (
            <div key={propertyId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Property Header */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <Building className="text-gray-500 dark:text-gray-400" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {propertyData.propertyName}
                  </h3>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm font-medium">
                    {propertyData.items.length} item{propertyData.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Approved By
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {propertyData.items.map((funding, index) => (
                      <tr key={`${funding.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Folder className="text-blue-600 dark:text-blue-400" size={16} />
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
                              {funding.project.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {funding.project.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getPriorityColor(funding.project.priority)}`}>
                            {funding.project.priority.charAt(0).toUpperCase() + funding.project.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(funding.project.status)}`}>
                            {funding.project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getTypeColor(funding.type)}`}>
                            {funding.type.charAt(0).toUpperCase() + funding.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${funding.project.budget.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                          ${funding.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {format(funding.date, 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <User className="text-gray-400 dark:text-gray-500" size={14} />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {state.users.find(u => u.id === funding.project.createdBy)?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <User className="text-gray-400 dark:text-gray-500" size={14} />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {state.users.find(u => u.id === funding.project.assignedApproverId)?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(funding.project.createdAt, 'MMM d, yyyy')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getPaymentStatusColor(funding.paymentStatus)}`}>
                              {funding.paymentStatus.charAt(0).toUpperCase() + funding.paymentStatus.slice(1)}
                            </span>
                            {funding.paymentStatus === 'paid' && funding.paidDate && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {format(funding.paidDate, 'MMM d')}
                              </span>
                            )}
                            {funding.paymentStatus === 'unpaid' ? (
                              <button
                                onClick={() => handleMarkPaid(funding.projectId, funding.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                              >
                                <CheckSquare size={12} />
                                <span>Mark Paid</span>
                              </button>
                            ) : (
                              <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                <RotateCcw size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {fundingData.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={40} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No funding data for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create projects with funding details to see forecast information
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Create Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastView;