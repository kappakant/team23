import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/api';
import './Profile.css';

interface UserProfile {
  firebase_uid: string;
  username: string;
  display_name: string;
  email: string;
  bio: string;
  age: number;
  height_inches: number;
  weight_lbs: number;
  lifter_type: string;
  score: number;
  current_streak_days: number;
  primary_gym_name: string;
  followers_count: number;
  following_count: number;
  badges_count: number;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const navigate = useNavigate();

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getInitials = (username: string) => {
    return username ? username.substring(0, 2).toUpperCase() : 'U';
  };

  const formatHeight = (inches: number) => {
    if (!inches) return '—';
    const ft = Math.floor(inches / 12);
    const inc = inches % 12;
    return `${ft}'${inc}"`;
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
    const loadProfile = async () => {
      if (!user) return;
      try {
        const data = await getUserProfile(user.uid);
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="profile-screen">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
          Loading Profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-screen">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
          Profile not found
        </div>
      </div>
    );
  }

  return (
    <div className="profile-screen">
      {/* Status Bar */}
      <div className="profile-status-bar">
        <span className="profile-status-time">{getCurrentTime()}</span>
        <div className="profile-status-icons">
          <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 6.5C5.5 2 10.5 0 12 0s6.5 2 11 6.5"/>
            <path d="M5 10.5c2-2 4.5-3 7-3s5 1 7 3"/>
            <circle cx="12" cy="16" r="2" fill="currentColor" stroke="none"/>
          </svg>
          <svg width="18" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="1" width="20" height="10" rx="2"/>
            <rect x="21" y="4" width="2" height="4" rx="1"/>
          </svg>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {/* Header */}
        <div className="profile-header-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
            <h1 className="profile-app-title">PUMP PAL</h1>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}
            >
              Logout
            </button>
          </div>

          {/* Profile Info Card */}
          <div className="profile-info-card">
            <div className="profile-top">
              <div className="profile-avatar-large">
                <div className="profile-avatar-placeholder">
                  {getInitials(profile.username)}
                </div>
              </div>

              <div className="profile-basic-info">
                <h2 className="profile-name">{profile.display_name || profile.username}</h2>
                <div className="profile-username-tag">@{profile.username}</div>
                <div className="profile-stats-inline">
                  {profile.age && <span>{profile.age}</span>}
                  {profile.age && profile.height_inches && <span>•</span>}
                  {profile.height_inches && <span>{formatHeight(profile.height_inches)}</span>}
                  {profile.height_inches && profile.weight_lbs && <span>•</span>}
                  {profile.weight_lbs && <span>{profile.weight_lbs} lbs</span>}
                </div>
                {profile.primary_gym_name && (
                  <div className="profile-home-gym">{profile.primary_gym_name}</div>
                )}
                {profile.lifter_type && (
                  <div className="profile-lifter-type">
                    Type of Lifter: <span>{profile.lifter_type}</span>
                  </div>
                )}
                {profile.bio && (
                  <div className="profile-bio">{profile.bio}</div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-card-profile">
            <div className="stat-item-profile">
              <div className="stat-label-profile">Score</div>
              <div className="stat-value-profile">{profile.score?.toLocaleString() || 0}</div>
            </div>
            <div className="stat-item-profile">
              <div className="stat-label-profile">Followers</div>
              <div className="stat-value-profile">{profile.followers_count || 0}</div>
            </div>
            <div className="stat-item-profile">
              <div className="stat-label-profile">Following</div>
              <div className="stat-value-profile">{profile.following_count || 0}</div>
            </div>
            <div className="stat-item-profile">
              <div className="stat-label-profile">Streak</div>
              <div className="stat-value-profile">{profile.current_streak_days || 0}🔥</div>
            </div>
          </div>

          {/* Badges */}
          <div className="badges-section">
            <div className="badge-card">
              <svg className="badge-icon bronze" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <div className="badge-info">
                <div className="badge-name">Bronze Lifter PR</div>
              </div>
            </div>
            <div className="badge-card">
              <svg className="badge-icon diamond" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <div className="badge-info">
                <div className="badge-name">Diamond Lifter</div>
              </div>
            </div>
          </div>

          {/* Gym Section */}
          {profile.primary_gym_name && (
            <div className="gym-section">
              <div className="gym-header">
                <h3 className="gym-name">{profile.primary_gym_name.toUpperCase()}</h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => navigate('/')}>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>
        <div className="nav-item" onClick={() => navigate('/log-workout')}>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>
        <div className="nav-item" onClick={() => navigate('/gym-profile')}>
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>
        <div className="nav-item active">
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;