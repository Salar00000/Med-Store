import { Component } from 'react';

/**
 * Catches unhandled React render errors anywhere in the tree
 * and shows a friendly fallback UI instead of a blank screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '4rem' }}>⚠️</div>
          <h2 style={{ color: 'var(--text-primary, #fff)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', maxWidth: '400px' }}>
            An unexpected error occurred while rendering this page. Try refreshing or go back home.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={this.handleReset}>Try Again</button>
            <a className="btn btn-outline" href="/">Go Home</a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
