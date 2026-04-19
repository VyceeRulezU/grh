import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { ErrorBoundary } from 'react-error-boundary'
import NotFoundPage from './modules/home/NotFoundPage'
import App from './App.jsx'
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

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <NotFoundPage
    onNavigate={() => { resetErrorBoundary(); window.location.replace('/'); }}
    errorCode="ERR"
    title={<>Something went <span className="green-text">wrong</span></>}
    summary={`An unexpected error occurred. Our team has been notified. ${error?.message ? `(${error.message})` : ''}`}
  />
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
