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
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// App component with Supabase integration

const AppContent: React.FC = () => {
  try {
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

    // Debug info
    console.log('App state:', {
      loading: state.loading,
      users: state.users.length,
      properties: state.properties.length,
      projects: state.projects.length,
      error: state.error
    });

    // Show error screen if there's an error
    if (state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
            <p className="text-gray-600 mb-4">Unable to connect to the database.</p>
            <p className="text-sm text-gray-500 mb-4">Error: {state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
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
  } catch (error) {
    console.error('AppContent error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">App Initialization Error</h1>
          <p className="text-gray-600 mb-4">There was an error initializing the application.</p>
          <p className="text-sm text-gray-500 mb-4">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SupabaseAppProvider>
          <AppContent />
        </SupabaseAppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

