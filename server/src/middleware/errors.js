const { ZodError } = require('zod');

function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
}

function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) {
    return response.status(400).json({ message: 'Invalid request data.', errors: error.flatten() });
  }

  if (error.code === '23505') {
    return response.status(409).json({ message: 'A record with that value already exists.' });
  }

  console.error(error);
  return response.status(500).json({ message: 'An unexpected server error occurred.' });
}

module.exports = { errorHandler, notFound };
