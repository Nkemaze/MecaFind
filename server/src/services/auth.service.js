const jwt = require('jsonwebtoken');

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, status: user.status };
}

module.exports = { createToken, publicUser };
