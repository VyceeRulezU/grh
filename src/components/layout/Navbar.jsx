import React, { useState } from 'react';
import './Navbar.css';
import LogoV2 from '../../assets/images/Logo/GRH-v2.png';
import Button from '../ui/Button';

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
    <nav className="navbar-container">
      <div className="navbar-floating">
        <div className="navbar-logo" onClick={() => handleNavigate('welcome')}>
          <img src={LogoV2} alt="GRH Logo" />
        </div>

        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              className={`nav-link-btn ${currentPage === link.id ? 'active' : ''}`}
              onClick={() => handleNavigate(link.id)}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="navbar-auth">
          <button className="nav-auth-btn btn-login" onClick={() => onAuthClick('login')}>Login</button>
          <Button variant="primary" size="sm" className="btn-signup" onClick={() => onAuthClick('signup')}>Sign Up</Button>
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
