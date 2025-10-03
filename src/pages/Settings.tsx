import React from 'react';
import { useLocation } from 'react-router-dom';
import GeneralSettings from '../components/Settings/GeneralSettings';
import CategoriesSettings from '../components/Settings/CategoriesSettings';
import PrioritiesSettings from '../components/Settings/PrioritiesSettings';
import StatusesSettings from '../components/Settings/StatusesSettings';
import ApprovalGroupsSettings from '../components/Settings/ApprovalGroupsSettings';
import UsersSettings from '../components/Settings/UsersSettings';
import AttachmentTypesSettings from '../components/Settings/AttachmentTypesSettings';


const Settings: React.FC = () => {
  const location = useLocation();

  const renderSection = () => {
    const path = location.pathname;
    
    if (path.includes('/settings/general')) {
      return <GeneralSettings />;
    } else if (path.includes('/settings/categories')) {
      return <CategoriesSettings />;
    } else if (path.includes('/settings/priorities')) {
      return <PrioritiesSettings />;
    } else if (path.includes('/settings/statuses')) {
      return <StatusesSettings />;
    } else if (path.includes('/settings/approval-groups')) {
      return <ApprovalGroupsSettings />;
    } else if (path.includes('/settings/users')) {
      return <UsersSettings />;
    } else if (path.includes('/settings/attachment-types')) {
      return <AttachmentTypesSettings />;
    } else {
      return <GeneralSettings />; // Default to general settings
    }
  };

  return (
    <div className="p-6">
      {renderSection()}
    </div>
  );
};

export default Settings;