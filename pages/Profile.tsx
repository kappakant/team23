import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
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

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const getUsername = (email: string | null | undefined) => {
    if (!email) return 'User';
    return email.split('@')[0];
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
          <h1 className="profile-app-title">PUMP PAL</h1>

          {/* Profile Info Card */}
          <div className="profile-info-card">
            <div className="profile-top">
              <div className="profile-avatar-large">
                <div className="profile-avatar-placeholder">
                  {getInitials(user?.email)}
                </div>
              </div>

              <div className="profile-basic-info">
                <h2 className="profile-name">{getUsername(user?.email)}</h2>
                <div className="profile-stats-inline">
                  <span>25</span>
                  <span>•</span>
                  <span>6'2"</span>
                  <span>•</span>
                  <span>200 lbs</span>
                </div>
                <div className="profile-home-gym">Downtown.Gym</div>
                <div className="profile-lifter-type">
                  Type of Lifter: <span>Aesthetic</span>
                </div>
              </div>
            </div>

            {/* This Week's Lifts */}
            <div className="weekly-lifts-section">
              <h3 className="section-title">This Week's Lifts</h3>
              <div className="lifts-grid">
                <div className="lift-stat-card">
                  <svg className="lift-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="9" width="4" height="12" rx="1"/>
                    <rect x="10" y="3" width="4" height="18" rx="1"/>
                    <rect x="18" y="9" width="4" height="12" rx="1"/>
                  </svg>
                  <div className="lift-value">275</div>
                  <div className="lift-unit">lb</div>
                </div>

                <div className="lift-stat-card">
                  <svg className="lift-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="12" r="3"/>
                  </svg>
                  <div className="lift-value">450</div>
                  <div className="lift-unit">lbs</div>
                </div>

                <div className="lift-stat-card">
                  <svg className="lift-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H4"/>
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M8 11v4"/>
                    <path d="M12 11v4"/>
                    <path d="M16 11v4"/>
                  </svg>
                  <div className="lift-value">360</div>
                  <div className="lift-unit">lbs</div>
                </div>

                <div className="lift-stat-card">
                  <svg className="lift-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20"/>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                  <div className="lift-value">2.0</div>
                  <div className="lift-unit">mi</div>
                </div>
              </div>
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

          {/* Stats */}
          <div className="stats-card-profile">
            <div className="stat-item-profile">
              <div className="stat-label-profile">Score</div>
              <div className="stat-value-profile">12,082</div>
            </div>
            <div className="stat-item-profile">
              <div className="stat-label-profile">Followers</div>
              <div className="stat-value-profile">345</div>
            </div>
            <div className="stat-item-profile">
              <div className="stat-label-profile">Following</div>
              <div className="stat-value-profile">450</div>
            </div>
          </div>

          {/* Gym Section */}
          <div className="gym-section">
            <div className="gym-header">
              <h3 className="gym-name">DOWNTOWN GYM</h3>
              <div className="gym-rating">
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span className="star">★</span>
                <span>4.5</span>
              </div>
            </div>

            <div className="mutual-friends-label">Mutual Friends</div>
            <div className="mutual-friends-avatars">
              <div className="mutual-avatar"></div>
              <div className="mutual-avatar"></div>
              <div className="mutual-avatar"></div>
              <button className="see-more-btn">›</button>
            </div>

            <div className="gym-leader-section">
              <div className="gym-leader-title">Current Gym Leader</div>
              <div className="gym-leader-card">
                <div className="leader-avatar"></div>
                <div className="leader-stats">
                  <div className="leader-stat">
                    <span className="leader-stat-value">205</span>
                    <span className="leader-stat-unit">lbs</span>
                  </div>
                  <div className="leader-stat">
                    <span className="leader-stat-value">325</span>
                    <span className="leader-stat-unit">lbs</span>
                  </div>
                  <div className="leader-stat">
                    <span className="leader-stat-value">205</span>
                    <span className="leader-stat-unit">lbs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

        <div className="nav-item">
          <div className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>

        <div className="nav-item">
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