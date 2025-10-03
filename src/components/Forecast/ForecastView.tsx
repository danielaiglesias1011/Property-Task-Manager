import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, DollarSign, CheckCircle, Calendar, Folder, User, CheckSquare, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { FundingDetail, Project } from '../../types';

const ForecastView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-10');

  // Aggregate all funding details with project and property info
  const fundingData = useMemo(() => {
    const allFunding: Array<FundingDetail & { 
      project: Project; 
      propertyName: string; 
      propertyId: string;
    }> = [];

    state.projects.forEach(project => {
      const property = state.properties.find(p => p.id === project.propertyId);
      if (property) {
        project.fundingDetails.forEach(funding => {
          allFunding.push({
            ...funding,
            project,
            propertyName: property.name,
            propertyId: property.id
          });
        });
      }
    });

    // Filter by selected month
    const filtered = allFunding.filter(funding => {
      const fundingMonth = format(funding.date, 'yyyy-MM');
      return fundingMonth === selectedMonth;
    });

    return filtered;
  }, [state.projects, state.properties, selectedMonth]);

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
      totals.totalPaymentsDue += funding.amount;
      totals.total += funding.amount;
      
      if (funding.paymentStatus === 'paid') {
        totals.paid += funding.amount;
      } else {
        totals.unpaid += funding.amount;
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
      if (!grouped[funding.propertyId]) {
        grouped[funding.propertyId] = {
          propertyName: funding.propertyName,
          items: []
        };
      }
      grouped[funding.propertyId].items.push(funding);
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
        paidBy: state.currentUser?.id || '1'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-primary-600 dark:text-primary-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cash Flow Forecast</h1>
            <p className="text-gray-600 dark:text-gray-300">Track project funding and financial forecasts</p>
          </div>
        </div>
      </div>

      {/* Monthly Budget Forecast Banner */}
      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
          <span className="text-green-800 dark:text-green-200 font-medium">
            Monthly budget forecast for approved projects
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">TOTAL PAYMENTS DUE</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                ${summary.totalPaymentsDue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <DollarSign className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">PAYMENT ITEMS</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {summary.paymentItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <CheckCircle className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">FORECAST MONTHS</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {summary.forecastMonths}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Current Month */}
      <div className="flex items-center space-x-2">
        <Calendar className="text-gray-500 dark:text-gray-400" size={16} />
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
        </span>
      </div>

      {/* Summary Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Payment Items: {summary.paymentItems}</span>
          <span className="text-red-600 dark:text-red-400 font-medium">Unpaid: ${summary.unpaid.toLocaleString()}</span>
          <span className="text-green-600 dark:text-green-400 font-medium">Paid: ${summary.paid.toLocaleString()}</span>
          <span className="text-green-600 dark:text-green-400 font-medium">Total: ${summary.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Funding Table */}
      <div className="space-y-4">
        {Object.entries(fundingByProperty).map(([propertyId, propertyData]) => (
          <div key={propertyId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-800 dark:text-white">
                {propertyData.propertyName} ({propertyData.items.length} item{propertyData.items.length !== 1 ? 's' : ''})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      PROJECT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CATEGORY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      PRIORITY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      BUDGET
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      AMOUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      DUE DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      CREATOR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      APPROVED BY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      PAYMENT
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {propertyData.items.map((funding, index) => (
                    <tr key={`${funding.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Folder className="text-blue-600 dark:text-blue-400" size={16} />
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {funding.project.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {funding.project.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(funding.project.priority)}`}>
                          {funding.project.priority.charAt(0).toUpperCase() + funding.project.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(funding.project.status)}`}>
                          {funding.project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(funding.type)}`}>
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
                        <div className="flex items-center space-x-1">
                          <User className="text-gray-400 dark:text-gray-500" size={14} />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {state.users.find(u => u.id === funding.project.createdBy)?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
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
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(funding.paymentStatus)}`}>
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
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center space-x-1"
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

      {fundingData.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No funding data for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Create projects with funding details to see forecast information
          </p>
        </div>
      )}
    </div>
  );
};

export default ForecastView;