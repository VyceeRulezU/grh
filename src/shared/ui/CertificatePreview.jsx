import React from 'react';
import './CertificatePreview.css';
import ModernCertificate from './ModernCertificate';

const CertificatePreview = ({ 
  isOpen, 
  onClose, 
  recipientName, 
  courseTitle, 
  date, 
  certificateId, 
  downloadAction 
}) => {
  if (!isOpen) return null;

  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="viewer-modal animate-up" onClick={e => e.stopPropagation()}>
        <header className="viewer-header">
          <div className="viewer-header-left">
            <button className="viewer-mobile-back" onClick={onClose}>
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back</span>
            </button>
            <div className="viewer-info">
              <span className="material-symbols-outlined viewer-icon">workspace_premium</span>
              <div>
                <h3>Certificate of Completion</h3>
                <p>{courseTitle}</p>
              </div>
            </div>
          </div>
          <div className="viewer-controls">
            <button className="special-button" style={{padding: '0.5rem 1rem', fontSize: '0.8rem'}} onClick={downloadAction}>
              Download PDF
            </button>
            <button className="viewer-close" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <main className="viewer-content" style={{ padding: '20px', background: '#f0f2f5', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          <div className="certificate-snapshot-wrapper" style={{ width: '100%', maxWidth: '1000px' }}>
            <ModernCertificate 
              recipientName={recipientName}
              courseTitle={courseTitle}
              date={date}
              certificateId={certificateId}
            />
          </div>
        </main>

        <footer className="viewer-footer">
          <p className="preview-hint">This is a preview of your official Governance Resource Hub certificate.</p>
        </footer>
      </div>
    </div>
  );
};

export default CertificatePreview;
