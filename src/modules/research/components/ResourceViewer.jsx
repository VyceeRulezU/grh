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
    <div className="viewer-overlay glass" onClick={onClose}>
      <div className="viewer-modal animate-up" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
        <header className="viewer-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div className="viewer-header-left">
            <div className="viewer-info">
              <i className={`${resource.icon || 'ri-file-text-line'} viewer-icon`}></i>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{resource.title}</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-soft)' }}>
                  {resource.author || 'GRH'} · {resource.year}
                </p>
              </div>
            </div>
          </div>
          <div className="viewer-controls">
            <button className="viewer-close" onClick={onClose}><i className="ri-close-line"></i></button>
          </div>
        </header>

        <div className="viewer-content" style={{ height: 'calc(100% - 60px)', width: '100%', overflow: 'hidden', padding: 0, background: '#525659' }}>
          {(() => {
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
              let absoluteUrl = url;
              if (!url.startsWith('http')) {
                const origin = window.location.origin.replace(/\/$/, '');
                const cleanUrl = url.startsWith('/') ? url : `/${url}`;
                absoluteUrl = `${origin}${cleanUrl}`;
              }

              // Fix for R2/S3 URLs: If the database URL already has '%20', encodeURIComponent will double-encode it to '%2520', breaking the viewer.
              // We safely decode first, then encode the entire string for the query parameter.
              const safeUrl = encodeURIComponent(decodeURIComponent(absoluteUrl));
              
              // Google Docs Viewer is significantly more reliable than Microsoft Office Viewer for Cloudflare R2 / AWS S3 buckets
              const viewerUrl = `https://docs.google.com/viewer?url=${safeUrl}&embedded=true`;
              
              return (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <iframe
                    src={viewerUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 'none' }}
                    title={resource.title}
                  ></iframe>
                </div>
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
