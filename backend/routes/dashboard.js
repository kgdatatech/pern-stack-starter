import express from 'express';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Protected Dashboard Route
router.get('/', auth, async (req, res) => {
    try {
        // Send only the necessary user data (username) to the frontend
        res.json({ username: req.user.username });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

export default router;
