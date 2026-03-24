import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getUserByUsername, toggleFollow } from '../services/api';
import './UserProfileView.css';

interface PR {
  pr_type: string;
  weight_lbs: number;
  pr_date: string;
}

interface Post {
  id: number;
  caption: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  muscle_groups: string;
}

interface UserProfile {
  firebase_uid: string;
  username: string;
  display_name: string;
  bio: string;
  lifter_type: string;
  score: number;
  current_streak_days: number;
  primary_gym_name: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
  prs: PR[];
  posts: Post[];
}

function formatFollowers(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n?.toString() || '0';
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function UserProfileView() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      try {
        const data = await getUserByUsername(username, currentUser?.uid);
        if (data && !data.error) {
          setProfile(data);
          setIsFollowing(data.is_following);
          setFollowerCount(data.followers_count);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!currentUser || !profile || followLoading) return;
    setFollowLoading(true);
    try {
      const result = await toggleFollow(currentUser.uid, profile.firebase_uid);
      setIsFollowing(result.following);
      setFollowerCount(c => result.following ? c + 1 : c - 1);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const getBestPR = (type: string) => {
    if (!profile?.prs) return 0;
    const filtered = profile.prs.filter(p => p.pr_type === type);
    if (filtered.length === 0) return 0;
    return Math.max(...filtered.map(p => p.weight_lbs));
  };

  if (loading) {
    return <div className="user-profile-loading">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="user-profile-loading" style={{ flexDirection: 'column', gap: '16px' }}>
        <p>User not found</p>
        <button onClick={() => navigate('/')} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile-screen">

      {/* Back Button */}
      <button className="user-profile-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Header */}
      <div className="user-profile-header">

        {/* Avatar */}
        <div className="user-profile-avatar">
          {profile.username?.substring(0, 2).toUpperCase()}
        </div>

        {/* Name + Username */}
        <h1 className="user-profile-name">
          {profile.display_name || profile.username}
        </h1>
        <p className="user-profile-username">@{profile.username}</p>

        {profile.lifter_type && (
          <p className="user-profile-lifter-type">{profile.lifter_type} Lifter</p>
        )}

        {profile.bio && (
          <p className="user-profile-bio">{profile.bio}</p>
        )}

        {/* Follow Button — only if not own profile */}
        {currentUser?.uid !== profile.firebase_uid && (
          <button
            className={`follow-btn ${isFollowing ? 'following' : 'not-following'}`}
            onClick={handleFollow}
            disabled={followLoading}
          >
            {followLoading ? '...' : isFollowing ? 'Following ✓' : 'Follow'}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="user-profile-stats">
        <div className="user-stat-item">
          <span className="user-stat-value">{formatFollowers(followerCount)}</span>
          <span className="user-stat-label">Followers</span>
        </div>
        <div className="user-stat-divider" />
        <div className="user-stat-item">
          <span className="user-stat-value">{formatFollowers(profile.following_count)}</span>
          <span className="user-stat-label">Following</span>
        </div>
        <div className="user-stat-divider" />
        <div className="user-stat-item">
          <span className="user-stat-value">{profile.score?.toLocaleString() || 0}</span>
          <span className="user-stat-label">Score</span>
        </div>
        {profile.primary_gym_name && (
          <>
            <div className="user-stat-divider" />
            <div className="user-stat-item">
              <span className="user-stat-value" style={{ fontSize: '13px' }}>
                {profile.primary_gym_name}
              </span>
              <span className="user-stat-label">Gym</span>
            </div>
          </>
        )}
      </div>

      {/* PR Section */}
      <div className="user-profile-section">
        <h2 className="user-profile-section-title">Top Lifts</h2>
        <div className="pr-cards-row">
          {['Bench', 'Squat', 'Deadlift'].map(lift => (
            <div key={lift} className="pr-card">
              <span className="pr-card-value">{getBestPR(lift)}</span>
              <span className="pr-card-unit">lbs</span>
              <span className="pr-card-label">{lift}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="user-profile-section">
        <h2 className="user-profile-section-title">Recent Posts</h2>
        {profile.posts.length === 0 ? (
          <p className="user-profile-empty">No posts yet.</p>
        ) : (
          profile.posts.map(post => (
            <div key={post.id} className="user-post-card">
              <p className="user-post-caption">{post.caption}</p>
              {post.muscle_groups && (
                <div className="user-post-muscles">
                  {post.muscle_groups.split(',').map((mg, i) => (
                    <span key={i} className="user-muscle-tag">{mg.trim()}</span>
                  ))}
                </div>
              )}
              <div className="user-post-meta">
                <span>❤️ {post.likes_count}</span>
                <span>💬 {post.comments_count}</span>
                <span>{getTimeAgo(post.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}