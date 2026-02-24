import React from 'react';
import './ResourceViewer.css';

const ResourceViewer = ({ isOpen, onClose, resource }) => {
  if (!isOpen || !resource) return null;

  return (
    <div className="viewer-overlay glass" onClick={onClose}>
      <div className="viewer-modal animate-up" onClick={e => e.stopPropagation()}>
        <header className="viewer-header">
          <div className="viewer-info">
            <i className={`${resource.icon} viewer-icon`}></i>
            <div>
              <h3>{resource.title}</h3>
              <p>{resource.author} · {resource.year} · {resource.pages} Pages</p>
            </div>
          </div>
          <div className="viewer-controls">
            <button className="control-btn"><i className="ri-zoom-in-line"></i></button>
            <button className="control-btn"><i className="ri-zoom-out-line"></i></button>
            <button className="control-btn"><i className="ri-download-line"></i></button>
            <button className="viewer-close" onClick={onClose}><i className="ri-close-line"></i></button>
          </div>
        </header>
        
        <div className="viewer-content">
          <div className="viewer-page-mock">
            <div className="mock-text-line headline"></div>
            <div className="mock-text-line"></div>
            <div className="mock-text-line"></div>
            <div className="mock-text-line short"></div>
            <div className="mock-image-box"></div>
            <div className="mock-text-line"></div>
            <div className="mock-text-line"></div>
            <div className="mock-text-line short"></div>
            
            <div className="mock-text-line headline" style={{ marginTop: '40px' }}></div>
            <div className="mock-text-line"></div>
            <div className="mock-text-line"></div>
            <div className="mock-text-line short"></div>
          </div>
        </div>

        <footer className="viewer-footer">
          <div className="page-nav">
            <button disabled><i className="ri-arrow-left-s-line"></i> Prev</button>
            <span>Page 1 of {resource.pages}</span>
            <button>Next <i className="ri-arrow-right-s-line"></i></button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ResourceViewer;
