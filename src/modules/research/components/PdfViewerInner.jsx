/**
 * PdfViewerInner.jsx
 *
 * This component is INTENTIONALLY isolated so it can be lazy-loaded via React.lazy().
 * It is the only file that imports pdfjs-dist and @react-pdf-viewer.
 * Do NOT import this file directly — always use ResourceViewer which handles the Suspense boundary.
 */
import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PdfViewerInner = ({ fileUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js">
      <Viewer
        fileUrl={fileUrl}
        plugins={[defaultLayoutPluginInstance]}
      />
    </Worker>
  );
};

export default PdfViewerInner;
