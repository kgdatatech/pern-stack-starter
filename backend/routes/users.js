import express from 'express';
import { auth } from '../middlewares/auth.js'; // Authentication middleware
import { authorize } from '../middlewares/authorize.js'; // Role-based authorization middleware
import pool from '../db/index.js';
import bcrypt from 'bcryptjs';
import { Roles } from '../utils/roles.js';
import { body, validationResult } from 'express-validator'; // Input validation

const router = express.Router();

// Get current user details (self)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update user details (self-update)
router.put(
  '/update',
  [
    auth,
    body('username').isString().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, role, password } = req.body;

    try {
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedFields = {
        username: username || user.rows[0].username,
        email: email || user.rows[0].email,
        role: role || user.rows[0].role,
      };

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updatedFields.password = hashedPassword;
      }

      const updatedUser = await pool.query(
        `UPDATE users
         SET username = $1, email = $2, role = $3, password = COALESCE($4, password), updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, username, email, role`,
        [updatedFields.username, updatedFields.email, updatedFields.role, updatedFields.password, req.user.userId]
      );

      res.json({ message: 'Profile updated successfully', user: updatedUser.rows[0] });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// Update another user's profile (admin or authorized user)
router.put(
  '/update/:id',
  [
    auth,
    authorize([Roles.ADMIN]),
    body('username').isString().trim().escape(),
    body('email').isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username, email } = req.body;

    try {
      const updateUser = await pool.query(
        `UPDATE users
         SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP, updated_by_username = $3
         WHERE id = $4 RETURNING id, username, email, role`,
        [username, email, req.user.username, id]
      );

      if (updateUser.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully', user: updateUser.rows[0] });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// Delete a user (admin-only)
router.delete('/delete/:id', auth, authorize([Roles.ADMIN]), async (req, res) => {
  const { id } = req.params;

  try {
    const deleteUser = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username, email', [id]);
    if (deleteUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user: deleteUser.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

export default router;
