// example server/middleware/auth.js
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const header = req.header('Authorization')?.split(' ')[1];
  if (!header) return res.status(401).json({ message: 'No token' });
  try {
    const payload = jwt.verify(header, process.env.JWT_SECRET);
    req.user = { id: payload.userId, isAdmin: payload.isAdmin };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
