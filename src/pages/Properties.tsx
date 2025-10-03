import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Property } from '../types';
import PropertyCard from '../components/Properties/PropertyCard';
import PropertyDetail from '../components/Properties/PropertyDetail';
import CreatePropertyModal from '../components/Properties/CreatePropertyModal';
import { Building2, Plus } from 'lucide-react';

const Properties: React.FC = () => {
  const { state } = useApp();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (selectedProperty) {
    return (
      <PropertyDetail
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="text-primary-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Properties</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your property portfolio</p>
          </div>
        </div>
        
        {/* Create New Property Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <Plus size={20} />
          <span>New Property</span>
        </button>
      </div>

      {/* Properties Grid */}
      {state.properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.properties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={setSelectedProperty}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-4">Add your first property to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            <Plus size={20} />
            <span>Create Your First Property</span>
          </button>
        </div>
      )}

      {/* Create Property Modal */}
      {showCreateModal && (
        <CreatePropertyModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default Properties;

