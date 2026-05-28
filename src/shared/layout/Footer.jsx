import React from 'react';
import TextLink from '../ui/TextLink';
import './Footer.css';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top-container">
          <p className="footer-summary">Advancing governance through evidence-based insights, education, and artificial intelligence.</p>

          <div className="footer-link-container">
            <div className="link-container">
              
              <div className="footer-link-group">
                <TextLink onClick={() => onNavigate('learn')}>Learn</TextLink>
                <TextLink onClick={() => onNavigate('research')}>Research</TextLink>
                <TextLink onClick={() => onNavigate('explore')}>Explore</TextLink>
              </div>
            </div>

            <div className="link-container">
              
              <div className="footer-link-group">
                <TextLink onClick={() => onNavigate('evaluate')}>Evaluate</TextLink>
                <TextLink onClick={() => onNavigate('analyse')}>Analyse</TextLink>
              </div>
            </div>

            <div className="link-container">
              
              <div className="footer-link-group">
                <TextLink onClick={() => onNavigate('help-center')}>Help Center</TextLink>
                <TextLink onClick={() => onNavigate('partner')}>Partner With Us</TextLink>
                <TextLink href="mailto:info@governanceresourcehub.com">Contact Us</TextLink>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-logo">
          <img src={`${import.meta.env.BASE_URL}assets/footer-logo.svg`} alt="Footer Logo" />
        </div>

        <div className="footer-bottom-container">
          <div className="copy-right-container">
            <p className="copy-right-text">© {new Date().getFullYear()} Governance Resource Hub. All rights reserved.</p>

            <div className="terms-container">
              <TextLink onClick={() => onNavigate('privacy-policy')}>Privacy Policy</TextLink>
              <TextLink onClick={() => onNavigate('terms-of-service')}>Terms of Service</TextLink>
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
