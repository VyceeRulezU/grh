import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'
import NotFoundPage from './modules/home/NotFoundPage'
import App from './App.jsx'
import { TourProvider } from './context/TourContext'
import './styles/tokens.css'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

// Global listener for Vite chunk preload errors (triggered when a new deployment renders old cached asset paths obsolete)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const lastReload = sessionStorage.getItem('last_chunk_error_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('last_chunk_error_reload', now.toString());
      window.location.reload();
    }
  });
}

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const isChunkError = 
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Unable to preload CSS') ||
    error?.message?.includes('preload');

  if (isChunkError) {
    const lastReload = sessionStorage.getItem('last_chunk_error_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('last_chunk_error_reload', now.toString());
      window.location.reload();
      return null; // Return null while the page reloads
    }
  }

  return (
    <NotFoundPage
      onNavigate={() => { resetErrorBoundary(); window.location.replace('/'); }}
      errorCode="ERR"
      title={<>Something went <span className="green-text">wrong</span></>}
      summary={`An unexpected error occurred. Our team has been notified. ${error?.message ? `(${error.message})` : ''}`}
    />
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TourProvider>
            <App />
          </TourProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

