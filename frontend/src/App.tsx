import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import Layout from '@/components/Layout/AppLayout';
import HomePage from '@/pages/HomePage';
import ProjectPage from '@/pages/ProjectPage';
import AuthPage from '@/pages/AuthPage';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

function App() {
  const { isAuthenticated, user, token } = useAuthStore();

  // Check authentication on app start
  useEffect(() => {
    if (token && !user) {
      // Token exists but no user data, might need to refresh
      // This would be handled by the auth store interceptor
    }
  }, [token, user]);

  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/project/:projectId" element={<ProjectPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
