import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  let isLoggedIn = false;
  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      isLoggedIn = true;
      isAdmin = decoded.isAdmin === true;
    } catch (error) {
      // Invalid token, clear it
      localStorage.removeItem('token');
    }
  }

  // Determine if we're on admin pages
  const isOnAdminPage = location.pathname.startsWith('/admin');
  
  // Determine the home link destination
  const homeLink = (isOnAdminPage && isAdmin) ? '/admin' : '/jobs';

  const handleLogout = () => {
    localStorage.removeItem('token');
    setMobileMenuOpen(false);
    navigate('/signin');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Link to={homeLink}>
              <span className="logo-icon">📄</span>
              Resume Checker
            </Link>
          </div>
          
          {/* Mobile menu toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          
          {/* Desktop & Mobile Navigation */}
          <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="nav-links">
              {!isAdmin && <Link to="/jobs" onClick={closeMobileMenu}>Jobs</Link>}
              {isLoggedIn && !isAdmin && <Link to="/saved-jobs" onClick={closeMobileMenu}>Saved Jobs</Link>}
              {isLoggedIn && !isAdmin && <Link to="/skill-gap" onClick={closeMobileMenu}>Skill Gap</Link>}
              {isLoggedIn && !isAdmin && <Link to="/resume-tips" onClick={closeMobileMenu}>Resume Tips</Link>}
              {isLoggedIn && !isAdmin && <Link to="/job-alerts" onClick={closeMobileMenu}>Job Alerts</Link>}
              {isLoggedIn && !isAdmin && <Link to="/notifications" onClick={closeMobileMenu}>Notifications</Link>}
              {isLoggedIn && !isAdmin && <Link to="/upload-resume" onClick={closeMobileMenu}>Upload</Link>}
              {isAdmin && <Link to="/admin" onClick={closeMobileMenu}>Admin Dashboard</Link>}
            </div>
            
            <div className="auth-links">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="logout-btn">
                  Sign Out
                </button>
              ) : (
                <>
                  <Link to="/signin" onClick={closeMobileMenu}>Sign In</Link>
                  <span className="separator">/</span>
                  <Link to="/signup" onClick={closeMobileMenu}>Sign Up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeMobileMenu}
        ></div>
      )}
    </>
  );
}
