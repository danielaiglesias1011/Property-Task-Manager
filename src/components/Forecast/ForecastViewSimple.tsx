import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp } from 'lucide-react';

const ForecastViewSimple: React.FC = () => {
  const { state } = useApp();

  console.log('ForecastViewSimple rendering...');
  console.log('State:', state);

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cash Flow Forecast</h1>
          <p className="text-gray-600 dark:text-gray-300">Track project funding and financial forecasts</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Debug Information</h2>
        
        <div className="space-y-2 text-sm">
          <p><strong>State exists:</strong> {state ? 'Yes' : 'No'}</p>
          <p><strong>Projects count:</strong> {state?.projects?.length || 'N/A'}</p>
          <p><strong>Properties count:</strong> {state?.properties?.length || 'N/A'}</p>
          <p><strong>Users count:</strong> {state?.users?.length || 'N/A'}</p>
        </div>

        {state?.projects && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Projects:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
              {state.projects.map(project => (
                <li key={project.id}>{project.name} - {project.status}</li>
              ))}
            </ul>
          </div>
        )}

        {state?.properties && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Properties:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
              {state.properties.map(property => (
                <li key={property.id}>{property.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastViewSimple;
