import React from 'react';
import './Footer.css';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top-container">
          <p className="footer-summary">Advancing governance through evidence-based insights, education, and artificial intelligence.</p>

          <div className="footer-link-container">
            <div className="link-container">
              <p className="footer-link-title">Product</p>
              <div className="footer-link-group">
                <button className="footer-link" onClick={() => onNavigate('learn')}>Learn</button>
                <button className="footer-link" onClick={() => onNavigate('research')}>Research</button>
                <button className="footer-link" onClick={() => onNavigate('explore')}>Explore</button>
              </div>
            </div>

            <div className="link-container">
              <p className="footer-link-title">Solutions</p>
              <div className="footer-link-group">
                <button className="footer-link" onClick={() => onNavigate('assess')}>Assess</button>
                <button className="footer-link" onClick={() => onNavigate('analyse')}>Analyse</button>
              </div>
            </div>

            <div className="link-container">
              <p className="footer-link-title">Support</p>
              <div className="footer-link-group">
                <button className="footer-link">Help Center</button>
                <button className="footer-link">Contact Us</button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-logo">
          <img src="assets/footer-logo.svg" alt="Footer Logo" />
        </div>

        <div className="footer-bottom-container">
          <div className="copy-right-container">
            <p className="copy-right-text">© 2025 Governance Resource Hub. All rights reserved.</p>

            <div className="terms-container">
              <button className="terms-link text-btn">Privacy Policy</button>
              <button className="terms-link text-btn">Terms of Service</button>
              <button className="footer-link admin-shield" onClick={() => onNavigate('admin')}>
                <span>🛡️</span> Admin Shield
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
