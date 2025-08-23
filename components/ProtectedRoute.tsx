import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoadingSpinner text="Authenticating..." />
        </div>
    );
  }

  if (!currentUser) {
    // Redirect them to the /login page
    return <ReactRouterDOM.Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
