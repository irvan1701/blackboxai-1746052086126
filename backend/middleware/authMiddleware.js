const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Authorization token is required'
      });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token has expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token'
      });
    }

    return res.status(401).json({
      error: true,
      message: 'Authentication failed'
    });
  }
};

module.exports = authMiddleware;
