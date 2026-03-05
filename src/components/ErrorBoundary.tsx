'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error:', error, errorInfo);
    // Here you would typically log to Sentry
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm">
              {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
