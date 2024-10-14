import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import pool from '../db/index.js';

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const items = await pool.query(`
      SELECT i.id, i.name, i.description, i.quantity, i.created_at, i.updated_at, 
             u1.username AS created_by, u2.username AS updated_by
      FROM inventory i
      LEFT JOIN users u1 ON i.created_by = u1.id
      LEFT JOIN users u2 ON i.updated_by = u2.id
      ORDER BY i.created_at DESC
    `);
    res.json(items.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error.message);
    res.status(500).json({ message: 'Failed to fetch inventory items' });
  }
});

// Add a new item
router.post('/', auth, authorize(['admin']), async (req, res) => {
  const { name, description, quantity } = req.body;
  const userId = req.user.id;  // Extract the user ID from the auth middleware

  try {
    const newItem = await pool.query(
      `INSERT INTO inventory (name, description, quantity, user_id, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $5) RETURNING *`,
      [name, description, quantity, userId, userId]
    );
    res.status(201).json(newItem.rows[0]);
  } catch (error) {
    console.error('Error adding new item:', error.message);
    res.status(500).json({ message: 'Failed to add new item' });
  }
});

// Update an item
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { name, description, quantity } = req.body;
  const userId = req.user.id;  // Extract the user ID from the auth middleware

  try {
    const updatedItem = await pool.query(
      `UPDATE inventory
       SET name = $1, description = $2, quantity = $3, updated_at = CURRENT_TIMESTAMP, updated_by = $4
       WHERE id = $5 RETURNING *`,
      [name, description, quantity, userId, id]
    );

    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item updated successfully', item: updatedItem.rows[0] });
  } catch (error) {
    console.error('Error updating item:', error.message);
    res.status(500).json({ message: 'Failed to update item' });
  }
});

// Delete an item
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted', item: result.rows[0] });
  } catch (error) {
    console.error('Error deleting item:', error.message);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

export default router;
