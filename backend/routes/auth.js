import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator'; // Input validation
import rateLimit from 'express-rate-limit'; // Import rate limiter
import { Roles } from '../utils/roles.js'; // Import roles for RBAC

dotenv.config();

const router = express.Router(); // Create a new router instance

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: 'Too many login attempts. Please try again in 15 minutes.', // Message returned when limit is exceeded
});

// Register new user with validation and sanitization
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = Roles.USER } = req.body;

    try {
      // Check if the user already exists
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await pool.query(
        `INSERT INTO users (username, email, password, role, created_by_username, updated_by_username)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [username, email, hashedPassword, role, username, username]
      );

      const token = jwt.sign(
        { userId: newUser.rows[0].id, username: newUser.rows[0].username, role: newUser.rows[0].role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Set token as HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// Apply login rate limiter to the login route
router.post(
  '/login',
  loginLimiter, // Apply the rate limiter
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
      }

      const isMatch = await bcrypt.compare(password, user.rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
      }

      const token = jwt.sign(
        { userId: user.rows[0].id, username: user.rows[0].username, role: user.rows[0].role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.status(200).json({ message: 'Login successful', username: user.rows[0].username });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;
