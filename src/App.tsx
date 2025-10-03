import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import ForecastView from './components/Forecast/ForecastViewSimple';
import ApprovalsView from './components/Approvals/ApprovalsView';
import './App.css';

const AppContent: React.FC = () => {
  const { dispatch } = useApp();

  useEffect(() => {
    // Set default user on app load
    dispatch({
      type: 'SET_CURRENT_USER',
      payload: {
        id: '1',
        name: 'Admin User',
        email: 'admin@company.com',
        approvalLevel: 3,
        role: 'admin',
        permissions: ['create_projects', 'edit_projects', 'delete_projects', 'approve_projects', 'manage_users', 'manage_settings'],
        isArchived: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    });
  }, [dispatch]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/forecast" element={<ForecastView />} />
          <Route path="/approvals" element={<ApprovalsView />} />
          <Route path="/users" element={<Navigate to="/" replace />} />
          <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
          <Route path="/settings/general" element={<Settings />} />
          <Route path="/settings/categories" element={<Settings />} />
          <Route path="/settings/priorities" element={<Settings />} />
          <Route path="/settings/statuses" element={<Settings />} />
          <Route path="/settings/approval-groups" element={<Settings />} />
          <Route path="/settings/attachment-types" element={<Settings />} />
          <Route path="/settings/users" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;

