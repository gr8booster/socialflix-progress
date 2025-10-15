import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="mb-8 flex justify-center">
              <AlertTriangle className="w-20 h-20 text-red-600 animate-pulse" />
            </div>

            {/* Error Message */}
            <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-400 text-lg mb-8">
              We're sorry, but something unexpected happened. Don't worry, your data is safe.
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 text-left bg-gray-900 p-4 rounded-lg overflow-auto max-h-60">
                <p className="text-red-500 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-gray-500 text-xs">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={this.handleReload}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reload Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 px-6 py-3"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Home
              </Button>
            </div>

            {/* Help Text */}
            <p className="mt-8 text-gray-500 text-sm">
              If this problem persists, please try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
