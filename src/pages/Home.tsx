import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFeed, toggleLike, syncUserProfile } from '../services/api';
import './Home.css';

interface Post {
  id: number;
  username: string;
  display_name: string;
  caption: string;
  muscle_groups: string;
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  created_at: string;
}

function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const loadFeed = async () => {
      try {
        await syncUserProfile();
        const feedData = await getFeed();
        setPosts(feedData);
      } catch (error) {
        console.error('Error loading feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  const handleLike = async (postId: number) => {
    try {
      const result = await toggleLike(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              user_liked: result.liked,
              likes_count: result.liked ? post.likes_count + 1 : post.likes_count - 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
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
          {/* Temporary logout button for testing */}
          <button 
            onClick={handleLogout}
            style={{
              color: 'white',
              background: 'none',
              border: '1px solid white',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
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
                  <span className="post-avatar-initials">
                    {post.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="post-user-info">
                  <span className="post-username">{post.username}</span>
                  <span className="post-time">{getTimeAgo(post.created_at)}</span>
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
                <div className="post-image-placeholder">WORKOUT PHOTO</div>
              </div>

              {/* Post Actions */}
              <div className="post-actions">
                <button 
                  className={`action-btn ${post.user_liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <svg viewBox="0 0 24 24" fill={post.user_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {post.likes_count}
                </button>
                <button className="action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {post.comments_count}
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
                {post.muscle_groups && (
                  <div className="post-muscles">
                    {post.muscle_groups.split(',').map((muscle, index) => (
                      <span key={index} className="muscle-tag">{muscle}</span>
                    ))}
                  </div>
                )}
                <div className="post-caption">
                  <span className="username">{post.username}</span>
                  {post.caption}
                </div>
                {post.comments_count > 0 && (
                  <div className="view-comments">
                    View all {post.comments_count} comments
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active" onClick={() => navigate('/')}>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="nav-label">Home</span>
          <div className="nav-dot"></div>
        </div>

        <div className="nav-item" onClick={() => navigate('/log-workout')}>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <span className="nav-label">Log</span>
        </div>

        <div className="nav-item" onClick={() => navigate('/gym-profile')}>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <path d="M6 12h3M15 12h3M9 12v6M15 12v6"/>
            </svg>
          </div>
          <span className="nav-label">Gym</span>
        </div>

        <div className="nav-item" onClick={() => navigate('/user-profile')}>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <span className="nav-label">Search</span>
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