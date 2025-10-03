import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  FolderOpen, 
  CheckSquare, 
  TrendingUp, 
  Settings, 
  Users,
  FileText,
  ChevronDown,
  ChevronRight,
  Building,
  Tag,
  Flag,
  ListChecks,
  Paperclip
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(location.pathname.startsWith('/settings'));

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/properties', icon: Building2, label: 'Properties' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/forecast', icon: TrendingUp, label: 'Forecast' },
    { to: '/approvals', icon: FileText, label: 'Approvals' },
    { to: '/users', icon: Users, label: 'Users' }
  ];

  const settingsItems = [
    { to: '/settings/general', icon: Settings, label: 'General' },
    { to: '/settings/categories', icon: Tag, label: 'Categories' },
    { to: '/settings/priorities', icon: Flag, label: 'Priorities' },
    { to: '/settings/statuses', icon: ListChecks, label: 'Statuses' },
    { to: '/settings/approval-groups', icon: Users, label: 'Approval Groups' },
    { to: '/settings/attachment-types', icon: Paperclip, label: 'Attachment Types' },
    { to: '/settings/users', icon: Users, label: 'Users' }
  ];

  const isSettingsActive = location.pathname.startsWith('/settings');

  // Automatically open dropdown when on settings pages
  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setShowSettingsDropdown(true);
    }
  }, [location.pathname]);

  return (
    <div className="bg-gray-900 dark:bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Property Manager</h1>
        <p className="text-gray-400 text-sm">Task Management System</p>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Settings with Dropdown */}
        <div>
          <button
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              isSettingsActive
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Settings size={20} />
              <span>Settings</span>
            </div>
            {showSettingsDropdown ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          {showSettingsDropdown && (
            <div className="ml-4 mt-2 space-y-1">
              {settingsItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;

