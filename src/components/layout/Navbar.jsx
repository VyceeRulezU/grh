import React, { useState } from 'react';
import './Navbar.css';
import SpecialButton from '../ui/SpecialButton';

const Navbar = ({ onNavigate, currentPage, onAuthClick }) => {
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
          <img src="assets/grh-logo-v2.svg" alt="Logo" />
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
          <button className="login-link" onClick={() => onAuthClick('login')}>Log in</button>

          <SpecialButton onClick={() => onAuthClick('signup')}>
            Sign up
            <span className="material-symbols-outlined">arrow_outward</span>
          </SpecialButton>

          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <i className="ri-close-line"></i> : <i className="ri-menu-line"></i>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
