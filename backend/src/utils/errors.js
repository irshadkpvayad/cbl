export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const payload = {
    message: status === 500 ? "Internal server error" : error.message,
    details: error.details
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = error.stack;
  }

  res.status(status).json(payload);
}
