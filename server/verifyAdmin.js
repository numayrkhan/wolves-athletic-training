// in server/verifyAdmin.js

const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.sendStatus(401); // No token, unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || user.role !== 'admin') {
      return res.sendStatus(403); // Token is invalid or user is not an admin, forbidden
    }
    req.user = user;
    next(); // Token is valid, proceed to the route handler
  });
};

module.exports = verifyAdmin;