import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initCapacitor } from './lib/capacitor';
import './index.css';

// Unregister service worker to prevent caching stale or broken JS modules in dev
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().catch(() => {});
    }
  }).catch(() => {});
  if (window.caches) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    }).catch(() => {});
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 dir-rtl text-right">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-stone-200 text-stone-800 space-y-4">
            <h2 className="text-lg font-bold text-rose-600">خطایی رخ داده است</h2>
            <p className="text-xs text-stone-600">
              برنامه با خطای غیرمنتظره‌ای مواجه شد. لطفاً صفحه را بازنشانی کنید.
            </p>
            <pre className="text-[10px] bg-stone-50 p-3 rounded-lg overflow-x-auto text-rose-800 border border-stone-200">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              بازنشانی صفحه
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

initCapacitor().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
  );
});

