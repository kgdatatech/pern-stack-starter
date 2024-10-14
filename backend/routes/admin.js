import express from 'express';
import { auth } from '../middlewares/auth.js'; // Authentication middleware
import { authorize } from '../middlewares/authorize.js'; // Role-based authorization
import pool from '../db/index.js';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator'; // Input validation
import { Roles } from '../utils/roles.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/users', auth, authorize([Roles.ADMIN]), async (req, res) => {
  try {
    const users = await pool.query(`
      SELECT id, username, email, role, created_at, updated_at, created_by_username, updated_by_username
      FROM users
    `);
    res.json(users.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Add a new user (Admin only) with validation
router.post(
  '/users',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn([Roles.USER, Roles.ADMIN, Roles.MODERATOR]).withMessage('Invalid role specified'),
  ],
  auth,
  authorize([Roles.ADMIN]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = Roles.USER } = req.body;

    try {
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await pool.query(
        `INSERT INTO users (username, email, password, role, created_at, created_by_username, updated_at, updated_by_username)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, CURRENT_TIMESTAMP, $5)
         RETURNING id, username, email, role, created_at, updated_at, created_by_username, updated_by_username`,
        [username, email, hashedPassword, role, req.user.username]
      );

      res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
    } catch (error) {
      console.error('Error creating user:', error.message);
      res.status(500).json({ message: 'Server error while creating user' });
    }
  }
);

// Update user details (Admin only) with validation
router.put(
  '/users/:id',
  [
    body('username').optional().trim().notEmpty().withMessage('Username is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn([Roles.USER, Roles.ADMIN, Roles.MODERATOR]).withMessage('Invalid role specified'),
  ],
  auth,
  authorize([Roles.ADMIN]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username, email, role } = req.body;

    try {
      const updatedUser = await pool.query(
        `UPDATE users
         SET username = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP, updated_by_username = $4
         WHERE id = $5
         RETURNING id, username, email, role, created_at, updated_at, created_by_username, updated_by_username`,
        [username, email, role, req.user.username, id]
      );

      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully', user: updatedUser.rows[0] });
    } catch (error) {
      console.error('Error updating user:', error.message);
      res.status(500).json({ message: 'Server error while updating user' });
    }
  }
);

// Delete a user (Admin only)
router.delete('/users/:id', auth, authorize([Roles.ADMIN]), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username, email, created_at, updated_at, created_by_username, updated_by_username', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

export default router;
