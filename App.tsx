import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudyDataProvider } from './context/StudyDataContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import StudyHubPage from './pages/StudyHubPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => {
  return (
    <ReactRouterDOM.HashRouter>
      <AuthProvider>
        <StudyDataProvider>
          <div className="min-h-screen bg-background font-sans text-text-primary">
            <Header />
            <main className="p-4 sm:p-6 md:p-8">
              <ReactRouterDOM.Routes>
                <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
                <ReactRouterDOM.Route path="/register" element={<RegisterPage />} />
                <ReactRouterDOM.Route path="/" element={<HomePage />} />
                <ReactRouterDOM.Route
                  path="/study-hub"
                  element={<ProtectedRoute><StudyHubPage /></ProtectedRoute>}
                />
                <ReactRouterDOM.Route
                  path="/flashcards"
                  element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>}
                />
                <ReactRouterDOM.Route
                  path="/quiz"
                  element={<ProtectedRoute><QuizPage /></ProtectedRoute>}
                />
                <ReactRouterDOM.Route
                  path="/dashboard"
                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                />
              </ReactRouterDOM.Routes>
            </main>
          </div>
        </StudyDataProvider>
      </AuthProvider>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
