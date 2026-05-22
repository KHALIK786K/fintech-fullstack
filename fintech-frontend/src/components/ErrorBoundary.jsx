import { Component } from 'react';

// Catches render-time errors anywhere below it and shows a safe fallback
// instead of a blank white screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // In a real app this would report to Sentry/Datadog.
    console.error('Render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
          <div className="card max-w-md p-8 text-center">
            <h1 className="font-display text-xl font-semibold text-ink-800">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-500">
              An unexpected error occurred. Please reload the page.
            </p>
            <button className="btn-primary mt-5" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
