import React from 'react';
import { useApp } from '../../context/HybridAppContext';
import { Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  const { state } = useApp();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Welcome back!</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your properties and projects efficiently</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {state.currentUser?.name || 'Guest User'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Level {state.currentUser?.approvalLevel || 1} Approval
              </p>
            </div>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

