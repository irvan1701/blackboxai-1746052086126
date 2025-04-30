const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: 'Validation error',
      details: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: true,
      message: 'Unauthorized access'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: true,
      message: 'Resource not found'
    });
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: true,
      message: 'Database constraint violation',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: true,
      message: 'File size exceeds limit'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: true,
      message: 'Unexpected file upload'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  return res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    })
  });
};

// Custom error classes
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

module.exports = {
  errorHandler,
  ValidationError,
  UnauthorizedError,
  NotFoundError
};
