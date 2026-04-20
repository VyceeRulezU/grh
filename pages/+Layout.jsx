import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from "@sentry/react";
import NotFoundPage from '../src/modules/home/NotFoundPage';
import '../src/styles/tokens.css'
import '../src/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

if (typeof window !== 'undefined') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export default function Layout({ children }) {
  // Uncomment the line below to test Sentry error tracking
  // if (typeof window !== 'undefined') throw new Error("Sentry test error");

  return (
    <React.StrictMode>
      <Sentry.ErrorBoundary fallback={<NotFoundPage errorCode="S-ERR" title="Unexpected Error" summary="Our systems detected an issue. The engineering team has been notified." />}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </HelmetProvider>
      </Sentry.ErrorBoundary>
    </React.StrictMode>
  )
}
