import React, { useState } from 'react';
import './Navbar.css';
import SpecialButton from '../ui/SpecialButton';

const Navbar = ({ onNavigate, currentPage, user, onAuthClick, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Learn', id: 'learn' },
    { name: 'Research', id: 'research' },
    { name: 'Explore', id: 'explore' },
    { name: 'Assess', id: 'assess' },
    { name: 'Analyse', id: 'analyse' },
  ];

  const handleNavigate = (id) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="web-nav">
      <div className="nav-container">
        <div className="logo" onClick={() => handleNavigate('welcome')}>
          <img src={`${import.meta.env.BASE_URL}assets/grh-logo-v2.svg`} alt="Logo" />
        </div>

        <div className={`nav-link-wrapper ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              className={`nav-link ${currentPage === link.id ? 'active' : ''}`}
              onClick={() => handleNavigate(link.id)}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="nav-button-wrapper">
          {user ? (
            /* ── Logged-in: show avatar ── */
            <div className="nav-user-area">
              <div className="nav-avatar" onClick={() => onNavigate(user.isAdmin ? 'admin' : 'student')}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || 'User'} />
                ) : (
                  <span className="nav-avatar-initial">
                    {(user.name || user.email ||'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* ── Logged-out: login / signup ── */
            <>
              <button className="login-link" onClick={() => onAuthClick('login')}>Log in</button>

              <SpecialButton onClick={() => onAuthClick('signup')}>
                Sign up
                <span className="material-symbols-outlined">arrow_outward</span>
              </SpecialButton>
            </>
          )}

          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <i className="ri-close-line"></i> : <i className="ri-menu-line"></i>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
