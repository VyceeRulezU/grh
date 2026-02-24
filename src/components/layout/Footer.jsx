import React from 'react';
import './Footer.css';
import LogoV2 from '../../assets/images/Logo/GRH-v2.png';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer-v2">
      <div className="container footer-v2-grid">
        <div className="footer-brand">
          <img src={LogoV2} alt="Logo" className="footer-logo-img" />
          <p>Advancing governance through evidence-based insights, education, and artificial intelligence.</p>
        </div>
        
        <div className="footer-links-v2">
          <div className="link-col">
            <h4>Platform</h4>
            <button onClick={() => onNavigate('learn')}>Learn</button>
            <button onClick={() => onNavigate('research')}>Research</button>
            <button onClick={() => onNavigate('explore')}>Explore</button>
          </div>
          <div className="link-col">
            <h4>Solutions</h4>
            <button onClick={() => onNavigate('assess')}>Assess</button>
            <button onClick={() => onNavigate('analyse')}>Analyse</button>
          </div>
          <div className="link-col">
            <h4>Support</h4>
            <button>Help Center</button>
            <button>Contact Us</button>
            <a href="#" className="admin-footer-link" onClick={(e) => { e.preventDefault(); onNavigate('admin'); }}>Admin Shield</a>
          </div>
        </div>
      </div>
      
      <div className="container footer-bottom-v2">
        <p>© 2025 Governance Resource Hub. All rights reserved.</p>
        <div className="legal-links">
          <button>Privacy Policy</button>
          <button>Terms of Service</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
