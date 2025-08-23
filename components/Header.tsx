import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useStudyData } from '../context/StudyDataContext';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { studyMaterials, clearData } = useStudyData();
  const { currentUser, logout } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    clearData();
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-200 hover:text-text-primary'
    }`;
  
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-200'
    }`;

  const authLinkClass = "px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-gray-200 hover:text-text-primary transition-colors";
  const authPrimaryLinkClass = "ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors";
  
  const renderNavLinks = (isMobile = false) => {
    const linkClass = isMobile ? mobileNavLinkClass : navLinkClass;
    const commonProps = { onClick: () => setIsMenuOpen(false) };

    return (
      <>
        <ReactRouterDOM.NavLink to="/" className={linkClass} {...commonProps}>Home</ReactRouterDOM.NavLink>
        {studyMaterials && (
          <>
            <ReactRouterDOM.NavLink to="/study-hub" className={linkClass} {...commonProps}>Study Hub</ReactRouterDOM.NavLink>
            <ReactRouterDOM.NavLink to="/flashcards" className={linkClass} {...commonProps}>Flashcards</ReactRouterDOM.NavLink>
            <ReactRouterDOM.NavLink to="/quiz" className={linkClass} {...commonProps}>Quiz</ReactRouterDOM.NavLink>
          </>
        )}
        <ReactRouterDOM.NavLink to="/dashboard" className={linkClass} {...commonProps}>Dashboard</ReactRouterDOM.NavLink>
      </>
    )
  }

  return (
    <header className="bg-card-bg shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <ReactRouterDOM.NavLink to={currentUser ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.838l7 3.5a1 1 0 00.732 0l7-3.5a1 1 0 00.028-1.838l-7-3.5zM2 9.423l8 4 8-4-8-4-8 4z" />
                <path d="M2 10.423v3.535l8 4 8-4v-3.535l-8 4-8-4z" />
              </svg>
              <span className="text-xl font-bold text-text-primary">StudyGenie</span>
            </ReactRouterDOM.NavLink>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {currentUser ? (
                <>
                  {renderNavLinks()}
                  <span className="text-sm text-text-secondary" aria-label="Current User">Welcome, {currentUser.email}</span>
                  <button onClick={handleLogout} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-secondary hover:bg-green-600 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <ReactRouterDOM.NavLink to="/login" className={authLinkClass}>Log In</ReactRouterDOM.NavLink>
                  <ReactRouterDOM.NavLink to="/register" className={authPrimaryLinkClass}>Sign Up</ReactRouterDOM.NavLink>
                </>
              )}
            </div>
          </div>
          {/* Hamburger Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {currentUser ? (
            <>
              {renderNavLinks(true)}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-3">
                  <div className="ml-0">
                    <div className="text-base font-medium leading-none text-text-primary">{currentUser.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <ReactRouterDOM.NavLink to="/login" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Log In</ReactRouterDOM.NavLink>
              <ReactRouterDOM.NavLink to="/register" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Sign Up</ReactRouterDOM.NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
