import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './ResourceViewer.css';

const ResourceViewer = ({ isOpen, onClose, resource }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (!isOpen || !resource) return null;

  return (
    <div className="viewer-overlay glass" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="viewer-modal animate-up" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
        <header className="viewer-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div className="viewer-info">
            <i className={`${resource.icon || 'ri-file-text-line'} viewer-icon`}></i>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{resource.title}</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-soft)' }}>
                {resource.author || 'GRH'} · {resource.year}
              </p>
            </div>
          </div>
          <div className="viewer-controls">
            <button className="viewer-close" onClick={onClose}><i className="ri-close-line"></i></button>
          </div>
        </header>
        
        <div className="viewer-content" style={{ height: 'calc(100% - 60px)', width: '100%', overflow: 'hidden' }}>
          {resource.file_url || resource.fileUrl ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                fileUrl={resource.file_url || resource.fileUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          ) : (
             <div className="viewer-page-mock" style={{ padding: '2rem' }}>
              <div className="placeholder-text">No PDF available for this document.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceViewer;
