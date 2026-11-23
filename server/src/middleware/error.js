export function notFound(req, res, next) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  // Log server errors for debugging (don't leak stack traces to client)
  if (status >= 500) {
    console.error('[server error]', err.stack || err.message);
  }

  res.status(status).json({
    message: status >= 500 ? 'Internal server error' : err.message || 'Internal server error',
  });
}
