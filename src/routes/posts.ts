// src/routes/posts.ts
import express, { Request, Response } from 'express';
import pool from '../db';

const router = express.Router();

// Get feed (all posts from followed users)
router.get('/feed/:user_id', async (req: Request, res: Response) => {
  const { user_id } = req.params;
  
  try {
    const [posts] = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        p.caption,
        p.image_url,
        p.workout_date,
        p.likes_count,
        p.comments_count,
        p.created_at,
        u.username,
        u.display_name,
        u.profile_image_url,
        GROUP_CONCAT(DISTINCT mg.name) as muscle_groups,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.firebase_uid
      LEFT JOIN post_muscle_groups pmg ON p.id = pmg.post_id
      LEFT JOIN muscle_groups mg ON pmg.muscle_group_id = mg.id
      WHERE p.user_id IN (
        SELECT following_id FROM followers WHERE follower_id = ?
      ) OR p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [user_id, user_id, user_id]);
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Create new post
router.post('/', async (req: Request, res: Response) => {
  const { user_id, caption, muscle_group_ids, lift_rating, gym_id } = req.body;
  
  if (!user_id || !caption) {
    return res.status(400).json({ error: 'user_id and caption are required' });
  }
  
  try {
    // Insert post
    const [result]: any = await pool.query(
      `INSERT INTO posts (user_id, caption, workout_date, lift_rating, gym_id) 
       VALUES (?, ?, CURDATE(), ?, ?)`,
      [user_id, caption, lift_rating || null, gym_id || null]
    );
    
    const postId = result.insertId;
    
    // Add muscle groups if provided
    if (muscle_group_ids && muscle_group_ids.length > 0) {
      const values = muscle_group_ids.map((mgId: number) => [postId, mgId]);
      await pool.query(
        'INSERT INTO post_muscle_groups (post_id, muscle_group_id) VALUES ?',
        [values]
      );
    }
    
    // Award points for posting
    await pool.query(
      `INSERT INTO points_history (user_id, points_change, reason, reference_type, reference_id)
       VALUES (?, 30, 'Posted workout photo', 'Post', ?)`,
      [user_id, postId]
    );
    
    // Update user score
    await pool.query(
      'UPDATE users SET score = score + 30 WHERE firebase_uid = ?',
      [user_id]
    );
    
    res.status(201).json({ id: postId, message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like/unlike a post
router.post('/:post_id/like', async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const { user_id } = req.body;
  
  try {
    // Check if already liked
    const [existing]: any = await pool.query(
      'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
      [user_id, post_id]
    );
    
    if (existing.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [user_id, post_id]
      );
      await pool.query(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?',
        [post_id]
      );
      res.json({ liked: false });
    } else {
      // Like
      await pool.query(
        'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        [user_id, post_id]
      );
      await pool.query(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [post_id]
      );
      
      // Award points
      const [post]: any = await pool.query('SELECT user_id FROM posts WHERE id = ?', [post_id]);
      if (post.length > 0) {
        await pool.query(
          'UPDATE users SET score = score + 5 WHERE firebase_uid = ?',
          [user_id]
        );
      }
      
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Get muscle groups (for post creation form)
router.get('/muscle-groups', async (req: Request, res: Response) => {
  try {
    const [groups] = await pool.query('SELECT * FROM muscle_groups ORDER BY name');
    res.json(groups);
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    res.status(500).json({ error: 'Failed to fetch muscle groups' });
  }
});

export default router;