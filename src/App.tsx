import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseAppProvider, useApp } from './context/SupabaseAppContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import ForecastView from './components/Forecast/ForecastView';
import ApprovalsView from './components/Approvals/ApprovalsView';
import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Set default user on app load if we have users loaded
    if (state.users.length > 0 && !state.currentUser) {
      dispatch({
        type: 'SET_CURRENT_USER',
        payload: state.users[0] // Use the first user from Supabase
      });
    }
  }, [state.users, state.currentUser, dispatch]);

  // Show loading screen while data is being fetched
  if (state.loading && state.users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Property Task Manager...</p>
          {state.error && (
            <p className="text-red-600 mt-2">Error: {state.error}</p>
          )}
        </div>
      </div>
    );
  }

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
      <SupabaseAppProvider>
        <AppContent />
      </SupabaseAppProvider>
    </ThemeProvider>
  );
};

export default App;

