import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Home.css';

interface Post {
  id: number;
  username: string;
  userInitials: string;
  timeAgo: string;
  image?: string;
  caption: string;
  muscleGroups: string[];
  likes: number;
  comments: number;
  liked: boolean;
}

function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Get current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
  };

  useEffect(() => {
    // TODO: Fetch from your Express API
    // For now, mock fitness posts data:
    setTimeout(() => {
      setPosts([
        {
          id: 1,
          username: 'alex_lifts',
          userInitials: 'AL',
          timeAgo: '2h ago',
          caption: 'Crushed leg day! New PR on squats 💪',
          muscleGroups: ['Legs', 'Glutes', 'Core'],
          likes: 24,
          comments: 5,
          liked: false
        },
        {
          id: 2,
          username: 'fitness_jen',
          userInitials: 'FJ',
          timeAgo: '4h ago',
          caption: 'Morning pump session at Gold\'s Gym! Feeling unstoppable 🔥',
          muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
          likes: 42,
          comments: 8,
          liked: true
        },
        {
          id: 3,
          username: 'mike_gains',
          userInitials: 'MG',
          timeAgo: '6h ago',
          caption: 'Back and biceps done right. Time to eat!',
          muscleGroups: ['Back', 'Biceps'],
          likes: 31,
          comments: 3,
          liked: false
        },
        {
          id: 4,
          username: 'sarah_strong',
          userInitials: 'SS',
          timeAgo: '8h ago',
          caption: 'Full body circuit at my home gym. Love the new setup! 💯',
          muscleGroups: ['Full Body', 'Cardio'],
          likes: 56,
          comments: 12,
          liked: false
        },
        {
          id: 5,
          username: 'coach_rob',
          userInitials: 'CR',
          timeAgo: '10h ago',
          caption: 'Teaching proper deadlift form today. Technique > ego lifting!',
          muscleGroups: ['Back', 'Hamstrings', 'Core'],
          likes: 89,
          comments: 15,
          liked: true
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  if (loading) {
    return (
      <div className="home-screen">
        <div className="loading-container">Loading Feed...</div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      {/* Status Bar */}
      <div className="status-bar">
        <span className="status-time">{getCurrentTime()}</span>
        <div className="status-icons">
          <svg width="12" height="10" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 6.5C5.5 2 10.5 0 12 0s6.5 2 11 6.5"/>
            <path d="M5 10.5c2-2 4.5-3 7-3s5 1 7 3"/>
            <circle cx="12" cy="16" r="2" fill="currentColor" stroke="none"/>
          </svg>
          <svg width="16" height="10" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="1" width="20" height="10" rx="2"/>
            <rect x="21" y="4" width="2" height="4" rx="1"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="feed-header">
        <div className="app-logo">PUMPPAL</div>
        <div className="header-icons">
          <button className="icon-btn" title="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="icon-btn" title="Messages">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Feed Container */}
      <div className="feed-container">
        {posts.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <div className="empty-state-text">No Posts Yet</div>
            <div className="empty-state-subtext">Follow friends to see their workouts</div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              {/* Post Header */}
              <div className="post-header">
                <div className="post-avatar">
                  <span className="post-avatar-initials">{post.userInitials}</span>
                </div>
                <div className="post-user-info">
                  <span className="post-username">{post.username}</span>
                  <span className="post-time">{post.timeAgo}</span>
                </div>
                <button className="post-menu-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
              </div>

              {/* Post Image */}
              <div className="post-image">
                <div className="post-image-placeholder">
                  WORKOUT PHOTO
                </div>
              </div>

              {/* Post Actions */}
              <div className="post-actions">
                <button 
                  className={`action-btn ${post.liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <svg viewBox="0 0 24 24" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {post.likes}
                </button>
                <button className="action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {post.comments}
                </button>
                <button className="action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
              </div>

              {/* Post Content */}
              <div className="post-content">
                {/* Muscle Groups */}
                <div className="post-muscles">
                  {post.muscleGroups.map((muscle, index) => (
                    <span key={index} className="muscle-tag">{muscle}</span>
                  ))}
                </div>

                {/* Caption */}
                <div className="post-caption">
                  <span className="username">{post.username}</span>
                  {post.caption}
                </div>

                {/* View Comments */}
                {post.comments > 0 && (
                  <div className="view-comments">
                    View all {post.comments} comments
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active">
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="nav-label">Home</span>
          <div className="nav-dot"></div>
        </div>

        <div className="nav-item">
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <span className="nav-label">Search</span>
        </div>

        <div className="nav-item">
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <span className="nav-label">Post</span>
        </div>

        <div className="nav-item" onClick={() => navigate('/profile')}>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span className="nav-label">Profile</span>
        </div>
      </div>
    </div>
  );
}

export default Home;