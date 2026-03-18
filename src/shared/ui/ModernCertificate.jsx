import React from 'react';
import './ModernCertificate.css';

const ModernCertificate = ({ recipientName, courseTitle, date, certificateId }) => {
  return (
    <div className="modern-certificate-container">
      {/* Decorative Corners */}
      <div className="corner-decoration top-left">
        <div className="shape-gold-1"></div>
        <div className="shape-green-1"></div>
        <div className="shape-gold-2"></div>
        <div className="shape-green-2"></div>
      </div>
      
      <div className="corner-decoration bottom-right">
        <div className="shape-gold-1"></div>
        <div className="shape-green-1"></div>
        <div className="shape-gold-2"></div>
        <div className="shape-green-2"></div>
      </div>

      {/* Ribbon Ornaments */}
      <div className="ribbon-ornament top-right"></div>
      <div className="ribbon-ornament bottom-left"></div>

      {/* Main Content */}
      <div className="certificate-inner-border">
        <div className="certificate-content">
          <h1 className="cert-main-title">CERTIFICATE</h1>
          <h2 className="cert-sub-title">OF ACHIEVEMENT</h2>
          
          <p className="cert-presentation-text">THIS CERTIFICATE IS PRESENTED TO :</p>
          
          <h3 className="cert-recipient-name">{recipientName || "Benjamin Shah"}</h3>
          
          <div className="cert-divider"></div>
          
          <p className="cert-description">
            A certificate is awarded to an individual who has attained a specific 
            accomplishment or achievement, whether in professional 
            endeavors, projects, or training.
          </p>
          
          <div className="cert-footer">
            <div className="signature-block">
              <div className="signature-line"></div>
              <span>Advisor</span>
            </div>
            
            <div className="cert-seal">
              <div className="seal-circle">
                <div className="seal-inner">
                  <i className="ri-award-fill"></i>
                </div>
              </div>
              <div className="seal-ribbons">
                <div className="ribbon-left"></div>
                <div className="ribbon-right"></div>
              </div>
            </div>
            
            <div className="signature-block">
              <div className="signature-line"></div>
              <span>Organizer</span>
            </div>
          </div>
          
          <div className="cert-meta">
            <span>Date: {date || new Date().toLocaleDateString()}</span>
            <span>ID: {certificateId || "GRH-XXXX-XXXX"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernCertificate;
