import React from 'react';
import './OAuthConsentPage.css';
import logoMain from '../../assets/auth/logo-main.svg';

const OAuthConsentPage = ({ onNavigate }) => {
  const handleAllow = () => {
    // Logic for allowing (e.g., redirecting back to the app with auth token)
    console.log("Consent Allowed");
    onNavigate('welcome');
  };

  const handleDeny = () => {
    // Logic for denying
    console.log("Consent Denied");
    onNavigate('login');
  };

  return (
    <div className="consent-page-wrapper">
      <div className="consent-card">
        <div className="consent-logo-box">
          <img src={logoMain} alt="GRH Logo" />
        </div>
        
        <h2 className="consent-title">Connect with your account</h2>
        <p className="consent-subtitle">
          <strong>GRH (Governance Resource Hub)</strong> would like to access certain information from your account to personalize your experience and track your learning progress.
        </p>

        <div className="consent-scope-list">
          <div className="scope-item">
            <span className="material-symbols-outlined scope-icon">account_circle</span>
            <div className="scope-info">
              <span className="scope-label">Personal Information</span>
              <span className="scope-description">View your name, profile picture, and email address.</span>
            </div>
          </div>
          <div className="scope-item">
            <span className="material-symbols-outlined scope-icon">analytics</span>
            <div className="scope-info">
              <span className="scope-label">Activity & Progress</span>
              <span className="scope-description">Track your course progress, workshop registrations, and certifications.</span>
            </div>
          </div>
        </div>

        <div className="consent-divider"></div>

        <p className="consent-disclaimer">
          By clicking Allow, you agree to our <span className="link-text">Terms of Service</span> and <span className="link-text">Privacy Policy</span>. You can revoke this access at any time in your account settings.
        </p>

        <div className="consent-button-group">
          <button className="btn-outline deny-btn" onClick={handleDeny}>Deny</button>
          <button className="special-button allow-btn" onClick={handleAllow}>Allow Access</button>
        </div>
      </div>
    </div>
  );
};

export default OAuthConsentPage;
