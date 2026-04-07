import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFullProfile } from '../services/api';
import './Profile.css';

interface Badge {
  name: string;
  category: string;
  badge_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  stack_count: number;
}

interface PR {
  pr_type: string;
  weight_lbs: number;
  time_seconds: number;
  pr_date: string;
}

interface Post {
  id: number;
  caption: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  image_url: string;
  muscle_groups: string;
}

interface FullProfile {
  firebase_uid: string;
  username: string;
  display_name: string;
  bio: string;
  profile_image_url: string;
  lifter_type: string;
  score: number;
  current_streak_days: number;
  primary_gym_name: string;
  followers_count: number;
  following_count: number;
  badges: Badge[];
  prs: PR[];
  posts: Post[];
}

const tierColors: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#a8a9ad',
  Gold: '#ffd700',
  Platinum: '#b0c4de',
  Diamond: '#4a90e2',
};

const tierEmoji: Record<string, string> = {
  Bronze: '💪',
  Silver: '🏋️',
  Gold: '⏱️',
  Platinum: '🛡️',
  Diamond: '💎',
};

function getBestPR(prs: PR[], type: string): number {
  const filtered = prs?.filter(p => p.pr_type === type) || [];
  if (filtered.length === 0) return 0;
  return Math.max(...filtered.map(p => p.weight_lbs || 0));
}

function getBestMile(prs: PR[]): string {
  const filtered = prs?.filter(p => p.pr_type === 'TreadmillMile') || [];
  if (filtered.length === 0) return '';
  const best = Math.min(...filtered.map(p => p.time_seconds || 9999));
  if (best === 9999) return '';
  const mins = Math.floor(best / 60);
  const secs = best % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getBestStairmaster(prs: PR[]): number {
  const filtered = prs?.filter(p => p.pr_type === 'StairmasterFlights') || [];
  if (filtered.length === 0) return 0;
  return Math.max(...filtered.map(p => p.weight_lbs || 0));
}

export default function Profile() {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await getFullProfile(user.uid);
      if (data && !data.error) setProfile(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSaveBio = async () => {
    if (!user) return;
    await fetch(`http://localhost:3000/api/users/bio`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebase_uid: user.uid, bio: bioText })
    });
    setProfile(prev => prev ? { ...prev, bio: bioText } : prev);
    setEditingBio(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const lifts = profile ? [
    { label: 'Bench', value: getBestPR(profile.prs, 'Bench'), unit: 'lbs' },
    { label: 'Squat', value: getBestPR(profile.prs, 'Squat'), unit: 'lbs' },
    { label: 'Deadlift', value: getBestPR(profile.prs, 'Deadlift'), unit: 'lbs' },
    ...(getBestMile(profile.prs) ? [{ label: 'Mile', value: getBestMile(profile.prs), unit: 'min' }] : []),
    ...(getBestStairmaster(profile.prs) ? [{ label: 'Stairmaster', value: getBestStairmaster(profile.prs), unit: 'flights' }] : []),
  ].filter(l => l.value && l.value !== 0 && l.value !== '') : [];

  if (loading) return <div className="pp-loading">Loading...</div>;
  if (!profile) return <div className="pp-loading">Profile not found</div>;

  return (
    <div className="pp-page">

      {/* ── App Title ───────────────────────────────────────────────────── */}
      <div className="pp-top-bar">
        <h1 className="pp-app-title">PUMPPAL</h1>
        <button className="pp-edit-btn pp-edit-top" onClick={() => navigate('/profile-edit')}>
          Edit Profile
        </button>
      </div>

      {/* ── Profile Header ──────────────────────────────────────────────── */}
      <div className="pp-header">
        <div className="pp-avatar">
          {profile.profile_image_url
            ? <img src={profile.profile_image_url} alt="avatar" />
            : <span>{profile.username?.substring(0, 2).toUpperCase()}</span>
          }
        </div>

        <div className="pp-info">
          <div className="pp-name-row">
            <div>
              <h2 className="pp-display-name">{profile.display_name || profile.username}</h2>
              <p className="pp-username">@{profile.username}</p>
            </div>
          </div>

          <div className="pp-stats-row">
            <span>Following <strong>{profile.following_count || 0}</strong></span>
            <div className="pp-stats-divider" />
            <span>Followers <strong>{profile.followers_count || 0}</strong></span>
          </div>

          {editingBio ? (
            <div className="pp-bio-edit">
              <textarea
                className="pp-bio-input"
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                placeholder="Write a bio..."
                maxLength={150}
                rows={3}
                autoFocus
              />
              <div className="pp-bio-edit-actions">
                <button className="pp-bio-save-btn" onClick={handleSaveBio}>Save</button>
                <button className="pp-bio-cancel-btn" onClick={() => setEditingBio(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="pp-bio-row">
              {profile.bio
                ? <p className="pp-bio">{profile.bio}</p>
                : <span className="pp-bio-placeholder">No bio yet</span>
              }
              <button
                className="pp-bio-edit-btn"
                onClick={() => { setBioText(profile.bio || ''); setEditingBio(true); }}
                title="Edit bio"
              >
                ✏️
              </button>
            </div>
          )}
          {profile.lifter_type && <p className="pp-lifter-type">{profile.lifter_type} Lifter</p>}
          {profile.primary_gym_name && <p className="pp-gym">📍 {profile.primary_gym_name}</p>}
        </div>
      </div>

      {/* ── Badges Earned ───────────────────────────────────────────────── */}
      {profile.badges?.length > 0 && (
        <div className="pp-section">
          <h3 className="pp-section-title">
            <span className="pp-section-title-inner">Badges Earned</span>
          </h3>
          <div className="pp-badges-row">
            {profile.badges.map((badge, i) => (
              <div key={i} className="pp-badge-item" title={badge.name}>
                <div className="pp-badge-shield" style={{ borderColor: tierColors[badge.badge_tier] }}>
                  <span className="pp-badge-emoji">{tierEmoji[badge.badge_tier]}</span>
                  {badge.stack_count > 1 && (
                    <span className="pp-badge-stack">x{badge.stack_count}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Lifts ───────────────────────────────────────────────────── */}
      <div className="pp-section">
        <h3 className="pp-section-title">
          <span className="pp-section-title-inner">
            Top Lifts
            <button className="pp-add-lift-btn" onClick={() => navigate('/log-workout')} title="Add lift">+</button>
          </span>
        </h3>
        {lifts.length > 0 ? (
          <div className="pp-lifts-grid">
            {lifts.map((lift, i) => (
              <div key={i} className="pp-lift-col">
                <span className="pp-lift-label">{lift.label}</span>
                <div className="pp-lift-card">
                  <span className="pp-lift-value">{lift.value} {lift.unit}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pp-lifts-empty">
            <p>No lifts recorded yet</p>
          </div>
        )}
      </div>

      {/* ── Pump Score ──────────────────────────────────────────────────── */}
      <div className="pp-section">
        <h3 className="pp-section-title">
          <span className="pp-section-title-inner">Pump Score</span>
        </h3>
        <div className="pp-pumpscore">
          <div className="pp-pumpscore-row">
            <span className="pp-pumpscore-fire">🔥</span>
            <span className="pp-pumpscore-value">{profile.score?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* ── Recent Posts ────────────────────────────────────────────────── */}
      <div className="pp-section">
        <h3 className="pp-section-title">
          <span className="pp-section-title-inner">Recent Posts</span>
        </h3>
        {profile.posts?.length === 0 ? (
          <div className="pp-empty">
            <p>No posts yet</p>
          </div>
        ) : (
          <div className="pp-posts-grid">
            {profile.posts?.map(post => (
              <div key={post.id} className="pp-post-card">
                {post.image_url
                  ? <img src={post.image_url} alt="post" className="pp-post-img" />
                  : (
                    <div className="pp-post-img-placeholder">
                      <span>{post.muscle_groups?.split(',')[0]?.trim() || '💪'}</span>
                    </div>
                  )
                }
                <div className="pp-post-body">
                  <p className="pp-post-caption">{post.caption}</p>
                  <div className="pp-post-meta">
                    <span>🤍 {post.likes_count} Likes</span>
                    <span>💬 {post.comments_count} Comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}