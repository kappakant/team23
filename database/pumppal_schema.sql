-- ============================================
-- PUMPPAL COMPLETE DATABASE SCHEMA
-- All 26 tables for PumpPal fitness app
-- ============================================

DROP DATABASE IF EXISTS pumppal;
CREATE DATABASE pumppal;
USE pumppal;

-- ============================================
-- GYMS (Create first - referenced by users)
-- ============================================

CREATE TABLE gyms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  country VARCHAR(50) DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INT DEFAULT 0,
  phone VARCHAR(20),
  website VARCHAR(255),
  hours TEXT,
  amenities JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_location (latitude, longitude),
  INDEX idx_city_state (city, state),
  INDEX idx_rating (average_rating DESC)
);

-- ============================================
-- BADGES (Create early - referenced by users and events)
-- ============================================

CREATE TABLE badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  category ENUM('Lifting', 'Gym', 'Social', 'Streak', 'Special') NOT NULL,
  badge_tier ENUM('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond') DEFAULT 'Bronze',
  criteria_description TEXT,
  points_awarded INT DEFAULT 0,
  is_stackable BOOLEAN DEFAULT FALSE,
  max_stack INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS & PROFILES
-- ============================================

CREATE TABLE users (
  firebase_uid VARCHAR(128) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  profile_image_url VARCHAR(255),
  bio TEXT,
  age INT,
  height_inches INT,
  weight_lbs INT,
  gender ENUM('Male', 'Female', 'Other', 'PreferNotToSay'),
  lifter_type ENUM('Aesthetic', 'Power', 'Calisthenic') DEFAULT 'Aesthetic',
  primary_gym_id INT,
  score INT DEFAULT 0,
  current_streak_days INT DEFAULT 0,
  longest_streak_days INT DEFAULT 0,
  last_gym_checkin DATE,
  allow_contact_sync BOOLEAN DEFAULT FALSE,
  profile_visibility ENUM('Public', 'FriendsOnly', 'Private') DEFAULT 'Public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (primary_gym_id) REFERENCES gyms(id),
  INDEX idx_username (username),
  INDEX idx_score (score DESC)
);

-- ============================================
-- MUSCLE GROUPS
-- ============================================

CREATE TABLE muscle_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- ============================================
-- PERSONAL RECORDS
-- ============================================

CREATE TABLE personal_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  gym_id INT,
  pr_type ENUM('Bench', 'Deadlift', 'Squat', 'TreadmillMile', 'StairmasterFlights') NOT NULL,
  weight_lbs INT,
  reps INT DEFAULT 1,
  distance_miles DECIMAL(5, 2),
  time_seconds INT,
  flights_climbed INT,
  video_url VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  report_count INT DEFAULT 0,
  flagged BOOLEAN DEFAULT FALSE,
  pr_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL,
  INDEX idx_user_pr (user_id, pr_type),
  INDEX idx_gym_leaderboard (gym_id, pr_type, weight_lbs DESC)
);

-- ============================================
-- POSTS
-- ============================================

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  image_url VARCHAR(255),
  video_url VARCHAR(255),
  caption TEXT,
  lift_rating INT CHECK (lift_rating >= 1 AND lift_rating <= 5),
  pr_id INT,
  outfit_tags JSON,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  visibility ENUM('Public', 'FriendsOnly', 'Private') DEFAULT 'Public',
  workout_date DATE,
  gym_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (pr_id) REFERENCES personal_records(id) ON DELETE SET NULL,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_created (created_at DESC),
  INDEX idx_posts_feed (created_at DESC, visibility)
);

-- ============================================
-- SOCIAL RELATIONSHIPS
-- ============================================

CREATE TABLE followers (
  follower_id VARCHAR(128) NOT NULL,
  following_id VARCHAR(128) NOT NULL,
  status ENUM('Pending', 'Accepted', 'Blocked') DEFAULT 'Accepted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  INDEX idx_following (following_id),
  CHECK (follower_id != following_id)
);

-- ============================================
-- POST INTERACTIONS
-- ============================================

CREATE TABLE post_muscle_groups (
  post_id INT NOT NULL,
  muscle_group_id INT NOT NULL,
  PRIMARY KEY (post_id, muscle_group_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id) ON DELETE CASCADE
);

CREATE TABLE likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post_likes (post_id)
);

CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  INDEX idx_post_comments (post_id, created_at DESC)
);

CREATE TABLE post_reactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_post_reaction (user_id, post_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

-- ============================================
-- GYM FEATURES
-- ============================================

CREATE TABLE gym_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gym_id INT NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_gym_review (gym_id, user_id),
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  INDEX idx_gym_rating (gym_id, rating DESC)
);

CREATE TABLE gym_checkins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  gym_id INT NOT NULL,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  INDEX idx_user_gym (user_id, gym_id),
  INDEX idx_date (checkin_date DESC),
  INDEX idx_gym_checkins_count (gym_id, user_id)
);

CREATE TABLE gym_followers (
  user_id VARCHAR(128) NOT NULL,
  gym_id INT NOT NULL,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, gym_id),
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

CREATE TABLE gym_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gym_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATETIME NOT NULL,
  end_date DATETIME,
  max_participants INT,
  badge_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id),
  INDEX idx_gym_date (gym_id, event_date)
);

CREATE TABLE event_participants (
  event_id INT NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attended BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES gym_events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

CREATE TABLE gym_leaderboards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gym_id INT NOT NULL,
  user_id VARCHAR(128) NOT NULL,
  gender ENUM('Male', 'Female', 'Other'),
  pr_type ENUM('Bench', 'Deadlift', 'Squat', 'TreadmillMile', 'StairmasterFlights') NOT NULL,
  weight_lbs INT,
  bodyweight_lbs INT,
  time_seconds INT,
  rank_overall INT,
  rank_gender INT,
  rank_weight_class INT,
  pr_id INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_gym_user_pr_type (gym_id, user_id, pr_type),
  FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (pr_id) REFERENCES personal_records(id) ON DELETE CASCADE,
  INDEX idx_gym_type_rank (gym_id, pr_type, rank_overall),
  INDEX idx_pr_leaderboard (gym_id, pr_type, weight_lbs DESC)
);

-- ============================================
-- WORKOUT TRACKING
-- ============================================

CREATE TABLE weekly_lifts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  week_start_date DATE NOT NULL,
  bench_total_lbs INT DEFAULT 0,
  squat_total_lbs INT DEFAULT 0,
  deadlift_total_lbs INT DEFAULT 0,
  cardio_distance_miles DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_week (user_id, week_start_date),
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  INDEX idx_user_week (user_id, week_start_date DESC)
);

CREATE TABLE workout_splits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  split_name VARCHAR(100) NOT NULL,
  split_data JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

-- ============================================
-- GAMIFICATION
-- ============================================

CREATE TABLE user_badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  badge_id INT NOT NULL,
  stack_count INT DEFAULT 1,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_badge (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  INDEX idx_user_badges (user_id)
);

CREATE TABLE points_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  points_change INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  reference_type ENUM('Post', 'Like', 'Streak', 'GymCheckin', 'PR', 'Badge', 'Other'),
  reference_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  INDEX idx_user_points (user_id, created_at DESC)
);

CREATE TABLE streaks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  streak_type ENUM('DailyPost', 'GymCheckin', 'WorkoutLogging') NOT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  UNIQUE KEY unique_user_streak_type (user_id, streak_type),
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

-- ============================================
-- NOTIFICATIONS & REMINDERS
-- ============================================

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  type ENUM('FriendPost', 'Like', 'Comment', 'Follow', 'ProgressReminder', 'StreakReminder', 'GymEvent', 'PR', 'Badge'),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link_type ENUM('Post', 'User', 'Gym', 'Event'),
  link_id VARCHAR(128),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read, created_at DESC)
);

CREATE TABLE progress_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128) NOT NULL,
  photo_url VARCHAR(255) NOT NULL,
  photo_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, photo_date DESC)
);

-- ============================================
-- REPORTING & MODERATION
-- ============================================

CREATE TABLE pr_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pr_id INT NOT NULL,
  reported_by VARCHAR(128) NOT NULL,
  reason TEXT,
  status ENUM('Pending', 'Reviewed', 'Upheld', 'Dismissed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pr_id) REFERENCES personal_records(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  INDEX idx_status (status)
);

CREATE TABLE friend_suggestions (
  user_id VARCHAR(128) NOT NULL,
  suggested_user_id VARCHAR(128) NOT NULL,
  suggestion_reason ENUM('SameGym', 'SameLiftingCategory', 'MutualFriends', 'Contacts'),
  shown_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dismissed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, suggested_user_id),
  FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE,
  FOREIGN KEY (suggested_user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

