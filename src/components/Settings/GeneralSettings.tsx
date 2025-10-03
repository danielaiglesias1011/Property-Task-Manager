import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Bell, 
  Globe, 
  Clock, 
  Shield, 
  Database,
  Save,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AppSettings {
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    taskAssignments: boolean;
    approvals: boolean;
    reminders: boolean;
  };
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  autoSave: boolean;
  sessionTimeout: number;
  dataRetention: number;
  security: {
    twoFactor: boolean;
    passwordExpiry: number;
    sessionTimeout: number;
  };
}

const GeneralSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  // Load settings from localStorage or use defaults
  const getInitialSettings = (): AppSettings => {
    const defaultSettings: AppSettings = {
      theme: 'light',
      notifications: {
        email: true,
        push: false,
        projectUpdates: true,
        taskAssignments: true,
        approvals: true,
        reminders: true
      },
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      autoSave: true,
      sessionTimeout: 30,
      dataRetention: 365,
      security: {
        twoFactor: false,
        passwordExpiry: 90,
        sessionTimeout: 30
      }
    };

    try {
      const stored = localStorage.getItem('propertyManager_generalSettings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return {
          ...defaultSettings,
          ...parsedSettings,
          notifications: {
            ...defaultSettings.notifications,
            ...parsedSettings.notifications
          },
          security: {
            ...defaultSettings.security,
            ...parsedSettings.security
          }
        };
      }
      return defaultSettings;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return defaultSettings;
    }
  };

  const [settings, setSettings] = useState<AppSettings>(getInitialSettings());

  // Sync theme with context on mount
  useEffect(() => {
    // Initialize theme context with the loaded theme
    setTheme(settings.theme as 'light' | 'dark' | 'auto');
  }, []); // Only run once on mount

  const handleSettingChange = (category: keyof AppSettings, key: string, value: any) => {
    setSettings((prev: AppSettings) => ({
      ...prev,
      [category]: {
        ...(prev[category] as Record<string, any>),
        [key]: value
      }
    }));
  };

  const handleDirectSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings((prev: AppSettings) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('propertyManager_generalSettings', JSON.stringify(settings));
      
      // Apply theme change when saving
      if (settings.theme !== theme) {
        setTheme(settings.theme as 'light' | 'dark' | 'auto');
      }
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      const defaultSettings: AppSettings = {
        theme: 'light',
        notifications: {
          email: true,
          push: false,
          projectUpdates: true,
          taskAssignments: true,
          approvals: true,
          reminders: true
        },
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        autoSave: true,
        sessionTimeout: 30,
        dataRetention: 365,
        security: {
          twoFactor: false,
          passwordExpiry: 90,
          sessionTimeout: 30
        }
      };
      
      setSettings(defaultSettings);
      
      // Apply theme change when resetting
      if (defaultSettings.theme !== theme) {
        setTheme(defaultSettings.theme as 'light' | 'dark' | 'auto');
      }
      
      // Save reset settings to localStorage
      try {
        localStorage.setItem('propertyManager_generalSettings', JSON.stringify(defaultSettings));
        alert('Settings reset to defaults successfully!');
      } catch (error) {
        console.error('Error saving reset settings:', error);
        alert('Settings reset but failed to save. Please try saving manually.');
      }
    }
  };

  // Safety check to ensure settings are properly initialized
  if (!settings || !settings.notifications || !settings.security) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">General Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Configure your application preferences and behavior</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <Palette className="text-blue-600" size={20} />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Appearance</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleDirectSettingChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <Bell className="text-blue-600" size={20} />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Notifications</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Updates</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.projectUpdates}
                  onChange={(e) => handleSettingChange('notifications', 'projectUpdates', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Assignments</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.taskAssignments}
                  onChange={(e) => handleSettingChange('notifications', 'taskAssignments', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Approval Requests</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.approvals}
                  onChange={(e) => handleSettingChange('notifications', 'approvals', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminders</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.reminders}
                  onChange={(e) => handleSettingChange('notifications', 'reminders', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <Globe className="text-blue-600" size={20} />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Localization</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleDirectSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleDirectSettingChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleDirectSettingChange('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Format</label>
                <select
                  value={settings.timeFormat}
                  onChange={(e) => handleDirectSettingChange('timeFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12h">12 Hour (AM/PM)</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Application Behavior */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <Settings className="text-blue-600" size={20} />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Application Behavior</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-save Changes</span>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleDirectSettingChange('autoSave', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleDirectSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="480"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Retention Period (days)</label>
                <input
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => handleDirectSettingChange('dataRetention', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30"
                  max="3650"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <Shield className="text-blue-600" size={20} />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Security</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</span>
                <input
                  type="checkbox"
                  checked={settings.security.twoFactor}
                  onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Expiry (days)</label>
                <input
                  type="number"
                  value={settings.security.passwordExpiry}
                  onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30"
                  max="365"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Security Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
