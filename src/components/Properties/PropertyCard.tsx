import React from 'react';
import { Property } from '../../types';
import { Building2, FolderOpen, CheckSquare, Calendar } from 'lucide-react';
import { useApp } from '../../context/HybridAppContext';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const { state } = useApp();
  
  const propertyProjects = state.projects.filter(p => p.propertyId === property.id);
  const propertyTasks = state.tasks.filter(t => t.propertyId === property.id);
  
  const activeTasks = propertyTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const completedTasks = propertyTasks.filter(t => t.status === 'completed').length;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(property)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="text-primary-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{property.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{property.address}</p>
          </div>
        </div>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">{property.description}</p>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <FolderOpen size={16} className="text-blue-500" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{propertyProjects.length}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Projects</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <CheckSquare size={16} className="text-green-500" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{activeTasks}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Active Tasks</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Calendar size={16} className="text-purple-500" />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{completedTasks}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

