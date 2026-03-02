// src/routes/users.ts
import express, { Request, Response } from 'express';
import pool from '../db';

const router = express.Router();

// Create or update user profile when they sign up
router.post('/profile', async (req: Request, res: Response) => {
  const { firebase_uid, email, username, display_name } = req.body;
  
  try {
    // Check if user exists
    const [existing]: any = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = ?',
      [firebase_uid]
    );
    
    if (existing.length > 0) {
      // User exists, return their data
      return res.json(existing[0]);
    }
    
    // Create new user
    await pool.query(
      'INSERT INTO users (firebase_uid, email, username, display_name) VALUES (?, ?, ?, ?)',
      [firebase_uid, email, username || email.split('@')[0], display_name || email.split('@')[0]]
    );
    
    // Get the created user
    const [newUser]: any = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = ?',
      [firebase_uid]
    );
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user profile' });
  }
});

// Get user profile with stats
router.get('/profile/:firebase_uid', async (req: Request, res: Response) => {
  const { firebase_uid } = req.params;
  
  try {
    const [users]: any = await pool.query(`
      SELECT 
        u.*,
        g.name as primary_gym_name,
        (SELECT COUNT(*) FROM followers WHERE following_id = u.firebase_uid) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.firebase_uid) as following_count,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = u.firebase_uid) as badges_count
      FROM users u
      LEFT JOIN gyms g ON u.primary_gym_id = g.id
      WHERE u.firebase_uid = ?
    `, [firebase_uid]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;