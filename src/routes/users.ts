import express, { Request, Response } from 'express';
import pool from '../db';

const router = express.Router();

// Create or update user profile when they sign up
router.post('/profile', async (req: Request, res: Response) => {
  const { firebase_uid, email, username, display_name } = req.body;
  
  try {
    const [existing]: any = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = ?',
      [firebase_uid]
    );
    
    if (existing.length > 0) {
      return res.json(existing[0]);
    }
    
    await pool.query(
      'INSERT INTO users (firebase_uid, email, username, display_name) VALUES (?, ?, ?, ?)',
      [firebase_uid, email, username || email.split('@')[0], display_name || email.split('@')[0]]
    );
    
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

// Get current user profile with stats
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

// Get any user's public profile by username
router.get('/u/:username', async (req: Request, res: Response) => {
  const { username } = req.params;
  const { viewer_id } = req.query; // the logged-in user's firebase_uid

  try {
    const [users]: any = await pool.query(`
      SELECT
        u.firebase_uid,
        u.username,
        u.display_name,
        u.bio,
        u.profile_image_url,
        u.lifter_type,
        u.score,
        u.current_streak_days,
        g.name as primary_gym_name,
        (SELECT COUNT(*) FROM followers WHERE following_id = u.firebase_uid) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.firebase_uid) as following_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.firebase_uid) as posts_count
      FROM users u
      LEFT JOIN gyms g ON u.primary_gym_id = g.id
      WHERE u.username = ?
    `, [username]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileUser = users[0];

    // Check if the viewer is already following this user
    let is_following = false;
    if (viewer_id) {
      const [followCheck]: any = await pool.query(
        'SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?',
        [viewer_id, profileUser.firebase_uid]
      );
      is_following = followCheck.length > 0;
    }

    // Get their PRs
    const [prs]: any = await pool.query(`
      SELECT pr_type, weight_lbs, pr_date
      FROM personal_records
      WHERE user_id = ?
      ORDER BY pr_date DESC
    `, [profileUser.firebase_uid]);

    // Get their recent posts
    const [posts]: any = await pool.query(`
      SELECT p.id, p.caption, p.likes_count, p.comments_count, p.created_at,
             GROUP_CONCAT(DISTINCT mg.name) as muscle_groups
      FROM posts p
      LEFT JOIN post_muscle_groups pmg ON p.id = pmg.post_id
      LEFT JOIN muscle_groups mg ON pmg.muscle_group_id = mg.id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `, [profileUser.firebase_uid]);

    res.json({ ...profileUser, is_following, prs, posts });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Follow a user
router.post('/follow', async (req: Request, res: Response) => {
  const { follower_id, following_id } = req.body;

  if (!follower_id || !following_id) {
    return res.status(400).json({ error: 'follower_id and following_id are required' });
  }

  if (follower_id === following_id) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  try {
    const [existing]: any = await pool.query(
      'SELECT * FROM followers WHERE follower_id = ? AND following_id = ?',
      [follower_id, following_id]
    );

    if (existing.length > 0) {
      // Already following — unfollow
      await pool.query(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
        [follower_id, following_id]
      );
      res.json({ following: false, message: 'Unfollowed successfully' });
    } else {
      // Not following — follow
      await pool.query(
        'INSERT INTO followers (follower_id, following_id, status) VALUES (?, ?, "Accepted")',
        [follower_id, following_id]
      );
      res.json({ following: true, message: 'Followed successfully' });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

export default router;