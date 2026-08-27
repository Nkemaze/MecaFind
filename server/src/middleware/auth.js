const jwt = require('jsonwebtoken');

function requireAuth(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return response.status(401).json({ message: 'Authentication is required.' });

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (_error) {
    return response.status(401).json({ message: 'Your session is invalid or expired.' });
  }
}

function allowRoles(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission for this action.' });
    }
    return next();
  };
}

module.exports = { allowRoles, requireAuth };
