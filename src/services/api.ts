// src/services/api.ts
import { auth } from './firebase';

const API_URL = 'http://localhost:3000/api';

// Get current user's Firebase UID
const getCurrentUserId = () => {
  return auth.currentUser?.uid || null;
};

// Get any user's public profile by username
export const getUserByUsername = async (username: string, viewer_id?: string) => {
  try {
    const url = viewer_id 
      ? `${API_URL}/users/u/${username}?viewer_id=${viewer_id}`
      : `${API_URL}/users/u/${username}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Follow or unfollow a user
export const toggleFollow = async (follower_id: string, following_id: string) => {
  try {
    const response = await fetch(`${API_URL}/users/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower_id, following_id })
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
};

// Create or sync user profile
export const syncUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebase_uid: user.uid,
        email: user.email,
        username: user.email?.split('@')[0],
        display_name: user.displayName || user.email?.split('@')[0]
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
};

// Get user's feed
export const getFeed = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  try {
    const response = await fetch(`${API_URL}/posts/feed/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching feed:', error);
    return [];
  }
};

// Create a new post
export const createPost = async (caption: string, muscleGroupIds: number[], liftRating?: number) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        caption,
        muscle_group_ids: muscleGroupIds,
        lift_rating: liftRating
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Like/unlike a post
export const toggleLike = async (postId: number) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');
  
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    return await response.json();
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Get muscle groups for form
export const getMuscleGroups = async () => {
  try {
    const response = await fetch(`${API_URL}/posts/muscle-groups`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    return [];
  }
};

// Get user profile
export const getUserProfile = async (firebaseUid?: string) => {
  const userId = firebaseUid || getCurrentUserId();
  if (!userId) return null;
  
  try {
    const response = await fetch(`${API_URL}/users/profile/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};