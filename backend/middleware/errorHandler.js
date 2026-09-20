/** Central error-handling middleware. Attach an error to next(err) from anywhere. */
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[cafe-pos-api]', err);
  }
  res.status(status).json({
    success: false,
    message: err.publicMessage || 'Internal server error.',
    errors: err.errors || undefined,
  });
}

/** Wrap an async route handler so rejections reach errorHandler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** 404 handler for unknown API routes. */
export function notFound(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
}
