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
import ForecastView from './components/Forecast/ForecastView';
import ApprovalsView from './components/Approvals/ApprovalsView';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// App component with Supabase integration

const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Set default user on app load if we have users loaded
    if (state.users.length > 0 && !state.currentUser) {
      dispatch({
        type: 'SET_CURRENT_USER',
        payload: state.users[0]
      });
    }
  }, [state.users, state.currentUser, dispatch]);

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
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

