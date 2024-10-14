// backend/middlewares/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Log the decoded token to check its content

    // Ensure decoded token contains userId, username, and role
    if (!decoded.userId || !decoded.username || !decoded.role) {
      return res.status(403).json({ message: 'Invalid token structure' });
    }

    req.user = decoded; // Attach decoded data (userId, username, role) to req.user
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}
