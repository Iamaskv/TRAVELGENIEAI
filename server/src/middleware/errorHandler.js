import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'SERVER_ERROR',
  });
}
