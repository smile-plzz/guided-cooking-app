import { Component } from 'react';

/**
 * Last line of defence. A render error anywhere below shows a recoverable
 * screen instead of a blank page — which, on a phone propped against a pan, is
 * the difference between a hiccup and a ruined dinner.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // No telemetry service here; the console is what a developer will check.
    console.error('Unhandled error in the app:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Something broke</h1>
        <p className="text-sm text-muted">
          The page hit an error it could not recover from. Reloading usually
          clears it; your saved recipes and lists are untouched.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          <a href="/" className="btn-secondary">
            Go home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
