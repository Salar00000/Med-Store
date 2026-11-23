import { Link } from 'react-router-dom';

/**
 * 404 Not Found page — replaces the old catch-all that
 * silently redirected unknown routes to HomePage.
 */
export function NotFoundPage() {
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
      <div style={{ fontSize: '5rem', lineHeight: 1 }}>🔍</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary, #fff)' }}>404</h1>
      <h2 style={{ color: 'var(--text-secondary, #aaa)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary, #888)', maxWidth: '400px' }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
        🏠 Back to Home
      </Link>
    </div>
  );
}
