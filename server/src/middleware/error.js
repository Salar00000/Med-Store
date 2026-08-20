export function notFound(req, res, next) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
}
