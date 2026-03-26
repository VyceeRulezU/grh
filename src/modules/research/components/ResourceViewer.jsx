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
          {resource.file_url || resource.fileUrl ? (
            <iframe 
              src={(() => {
                const url = resource.file_url || resource.fileUrl;
                if (url.includes('drive.google.com')) {
                  // Convert to preview link if needed
                  if (url.includes('/view')) return url.replace('/view', '/preview');
                  if (url.includes('id=')) {
                    const id = new URLSearchParams(new URL(url).search).get('id');
                    return `https://drive.google.com/file/d/${id}/preview`;
                  }
                }
                return url;
              })()} 
              title={resource.title}
              className="viewer-iframe"
              frameBorder="0"
              allow="autoplay"
            ></iframe>
          ) : (
            <div className="viewer-page-mock">
              <div className="mock-text-line headline"></div>
              <div className="mock-text-line"></div>
              <div className="mock-text-line"></div>
              <div className="mock-text-line short"></div>
              <div className="mock-image-box"></div>
              <div className="placeholder-text">No preview available for this document.</div>
            </div>
          )}
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
