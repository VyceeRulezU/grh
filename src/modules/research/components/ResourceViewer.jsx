import React, { Suspense, lazy } from 'react';
import './ResourceViewer.css';

// ─── Lazy-load the heavy PDF engine only when a PDF is actually opened ────────
// This keeps pdfjs-dist (~565KB) out of the initial JS bundle entirely.
// All 6 consumers of ResourceViewer benefit without any change to their code.
const PdfViewerInner = lazy(() => import('./PdfViewerInner'));

// ─── Lightweight loading placeholder shown while PDF engine downloads ─────────
const PdfLoadingFallback = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', flexDirection: 'column', gap: '1rem', color: '#aaa'
  }}>
    <i className="ri-loader-4-line" style={{ fontSize: '2rem', animation: 'spin 1s linear infinite' }} />
    <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading document viewer…</p>
  </div>
);

const ResourceViewer = ({ isOpen, onClose, resource }) => {
  if (!isOpen || !resource) return null;

  const url = resource.file_url || resource.fileUrl || resource.preview_url || resource.download_url;

  return (
    <div className="grh-res-viewer-overlay glass" onClick={onClose}>
      <div className="grh-res-viewer-modal animate-up" onClick={e => e.stopPropagation()}>
        <header className="grh-res-viewer-header">
          <div className="grh-res-viewer-header-left">
            <div className="grh-res-viewer-info">
              <i className={`${resource.icon || 'ri-file-text-line'} grh-res-viewer-icon`}></i>
              <div className="grh-res-viewer-text">
                <h3>{resource.title}</h3>
                <p>
                  {resource.author || 'GRH'} · {resource.year}
                </p>
              </div>
            </div>
          </div>
          <div className="grh-res-viewer-controls">
            <button className="grh-res-viewer-close" onClick={onClose} aria-label="Close Viewer">
              <i className="ri-close-line"></i>
            </button>
          </div>
        </header>

        <div className="grh-res-viewer-content">
          {(() => {
            if (!url) return <div className="grh-res-viewer-page-mock"><div className="placeholder-text">No document link available.</div></div>;

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

            // Detect Extension for Different File Types - IMPROVED for query params
            const cleanUrl = url.split(/[?#]/)[0];
            const extension = cleanUrl.split('.').pop().toLowerCase();
            
            // Fallback: check query params if extension not found in main path
            const searchParams = new URL(url.startsWith('http') ? url : `https://dummy.com/${url}`).searchParams;
            const urlFilename = searchParams.get('filename') || '';
            const urlExtension = urlFilename.split('.').pop().toLowerCase();
            
            const effectiveExtension = extension || urlExtension;

            const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(effectiveExtension);
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(effectiveExtension);
            const isVideo = ['mp4', 'webm', 'ogg'].includes(effectiveExtension);

            // Handle Office Documents
            if (isOfficeDoc) {
              // Microsoft Office Web Viewer REQUIRES a fully qualified, public URL
              let absoluteUrl = url;
              if (!url.startsWith('http')) {
                const origin = window.location.origin.replace(/\/$/, '');
                const pathPrefix = url.startsWith('/') ? '' : '/';
                absoluteUrl = `${origin}${pathPrefix}${url}`;
              }

              // Reverting to the exact Microsoft Viewer logic used previously
              const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`;
              
              return (
                <div className="grh-res-office-viewer">
                  <div className="grh-res-office-warning">
                    <span className="grh-res-warning-text">
                      <i className="ri-error-warning-line"></i>
                      <span>If the Microsoft document preview fails to load below, you can download it securely.</span>
                    </span>
                    <a 
                      href={absoluteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="special-button grh-res-download-btn"
                    >
                      <i className="ri-download-2-line"></i> Download
                    </a>
                  </div>
                  <iframe
                    src={officeUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="grh-res-office-iframe"
                    title={resource.title}
                  ></iframe>
                </div>
              );
            }

            // Handle Images
            if (isImage) {
              return (
                <div className="grh-res-viewer-media-container grh-res-image-container">
                  <img
                    src={url}
                    alt={resource.title}
                    className="grh-res-viewer-image"
                  />
                </div>
              );
            }

            // Handle Videos
            if (isVideo) {
              return (
                <div className="grh-res-viewer-media-container grh-res-video-container">
                  <video
                    src={url}
                    controls
                    autoPlay
                    className="grh-res-viewer-video"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }

            // 3. Fallback: Standard PDF Viewer – loaded lazily so pdfjs doesn't bloat the main bundle
            return (
              <Suspense fallback={<PdfLoadingFallback />}>
                <PdfViewerInner fileUrl={url} />
              </Suspense>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ResourceViewer;
