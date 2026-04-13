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
        
        <div className="viewer-content" style={{ height: 'calc(100% - 60px)', width: '100%', overflow: 'hidden', padding: 0, background: '#525659' }}>
          {(() => {
            const url = resource.file_url || resource.fileUrl || resource.preview_url || resource.download_url;
            if (!url) return <div className="viewer-page-mock" style={{ padding: '2rem' }}><div className="placeholder-text">No document link available.</div></div>;

            // 1. Handle Google Drive Links
            if (url.includes('drive.google.com')) {
              let embedUrl = url;
              if (url.includes('/view')) embedUrl = url.replace('/view', '/preview');
              else if (url.includes('id=')) {
                const id = new URL(url).searchParams.get('id');
                embedUrl = `https://drive.google.com/file/d/${id}/preview`;
              }
              return (
                <iframe 
                  src={embedUrl} 
                  width="100%" 
                  height="100%" 
                  allow="autoplay" 
                  style={{ border: 'none' }}
                  title={resource.title}
                ></iframe>
              );
            }

            // 2. Detect Extension for Different File Types
            const extension = url.split('.').pop().toLowerCase().split(/[?#]/)[0];
            
            const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
            const isVideo = ['mp4', 'webm', 'ogg'].includes(extension);

            // Handle Office Documents
            if (isOfficeDoc) {
              const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
              return (
                <iframe 
                  src={officeUrl} 
                  width="100%" 
                  height="100%" 
                  frameBorder="0"
                  style={{ border: 'none' }}
                  title={resource.title}
                ></iframe>
              );
            }

            // Handle Images
            if (isImage) {
              return (
                <div className="viewer-media-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
                  <img 
                    src={url} 
                    alt={resource.title} 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', borderRadius: '8px' }}
                  />
                </div>
              );
            }

            // Handle Videos
            if (isVideo) {
              return (
                <div className="viewer-media-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem', background: '#000' }}>
                  <video 
                    src={url} 
                    controls 
                    autoPlay 
                    style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }

            // 3. Fallback to Standard PDF Viewer (Default)
            return (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={url}
                  plugins={[defaultLayoutPluginInstance]}
                />
              </Worker>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ResourceViewer;
