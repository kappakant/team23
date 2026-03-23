-- ============================================
-- PUMPPAL SEED DATA
-- Sample data for testing
-- ============================================


-- Insert muscle groups
INSERT INTO muscle_groups (name) VALUES
('Chest'), ('Back'), ('Legs'), ('Biceps'), ('Triceps'),
('Shoulders'), ('Core'), ('Glutes'), ('Hamstrings'), 
('Cardio'), ('Full Body'), ('Calves'), ('Forearms');

-- Insert sample gyms
INSERT INTO gyms (name, address, city, state, zip_code, latitude, longitude, average_rating, total_ratings, phone) VALUES
('Downtown Gym', '123 Main St', 'Syracuse', 'NY', '13210', 43.0481, -76.1474, 4.5, 45, '315-555-0100'),
('Gold\'s Gym Syracuse', '456 University Ave', 'Syracuse', 'NY', '13210', 43.0369, -76.1351, 4.7, 89, '315-555-0101'),
('Planet Fitness Westside', '789 West Genesee St', 'Syracuse', 'NY', '13204', 43.0465, -76.1622, 4.2, 120, '315-555-0102'),
('Anytime Fitness North', '321 Northern Blvd', 'Syracuse', 'NY', '13211', 43.0756, -76.1356, 4.6, 67, '315-555-0103'),
('CrossFit Syracuse', '555 Erie Blvd', 'Syracuse', 'NY', '13202', 43.0515, -76.1498, 4.8, 34, '315-555-0104');

-- Insert badges
INSERT INTO badges (name, description, category, badge_tier, criteria_description, points_awarded, is_stackable, max_stack) VALUES
-- Lifting badges
('Bronze Lifter', 'Beginner level strength achieved', 'Lifting', 'Bronze', 'Complete 10 workouts', 100, FALSE, 1),
('Silver Lifter', 'Novice level strength', 'Lifting', 'Silver', 'Bench 225 lbs', 250, FALSE, 1),
('Gold Lifter', 'Intermediate level strength', 'Lifting', 'Gold', 'Total 1000 lbs combined', 500, FALSE, 1),
('Platinum Lifter', 'Advanced level strength', 'Lifting', 'Platinum', 'Bench 315 lbs', 1000, FALSE, 1),
('Diamond Lifter', 'Elite level strength achieved', 'Lifting', 'Diamond', 'Total 1500 lbs combined', 2500, FALSE, 1),

-- Gym badges
('Gym Hero', 'Top 10 lifter at gym', 'Gym', 'Gold', 'Rank in top 10 at your gym', 500, TRUE, 999),
('Gym Monster', 'Number one at gym', 'Gym', 'Diamond', '#1 ranked lifter at a gym', 2000, TRUE, 999),
('Founding Lifter', 'First PR at new gym', 'Gym', 'Silver', 'First to record a PR at a gym', 300, TRUE, 999),

-- Social badges
('Social Starter', '10 followers milestone', 'Social', 'Bronze', 'Reach 10 followers', 50, FALSE, 1),
('Social Rising', '100 followers milestone', 'Social', 'Silver', 'Reach 100 followers', 250, FALSE, 1),
('Social Star', '1000 followers milestone', 'Social', 'Gold', 'Reach 1000 followers', 1000, FALSE, 1),
('Viral Lifter', 'Post went viral', 'Social', 'Platinum', '1000 likes on single post', 750, TRUE, 999),
('Comment King', 'Active community member', 'Social', 'Bronze', '100 comments posted', 100, FALSE, 1),

-- Streak badges
('Week Warrior', '7-day workout streak', 'Streak', 'Bronze', 'Workout 7 days in a row', 100, TRUE, 999),
('Month Master', '30-day workout streak', 'Streak', 'Silver', 'Workout 30 days in a row', 500, TRUE, 999),
('Quarter Champion', '90-day workout streak', 'Streak', 'Gold', 'Workout 90 days in a row', 1500, TRUE, 999),
('Year Champion', '365-day workout streak', 'Streak', 'Diamond', 'Workout 365 days in a row', 5000, TRUE, 999),

-- Special badges
('Badge Collector', 'Collect your first 10 badges', 'Special', 'Gold', 'Earn 10 different badges', 500, FALSE, 1),
('Event Champion', 'Win a gym competition', 'Special', 'Platinum', 'Place 1st in gym event', 1000, TRUE, 999),
('Perfect Form', 'Technique master', 'Special', 'Gold', 'Have 10 verified PRs with video', 750, FALSE, 1),
('Early Bird', 'Morning workout warrior', 'Special', 'Silver', 'Check in before 6am 30 times', 300, FALSE, 1),
('Night Owl', 'Late night grinder', 'Special', 'Silver', 'Check in after 10pm 30 times', 300, FALSE, 1);

-- Insert test users
INSERT INTO users (firebase_uid, username, email, display_name, bio, age, height_inches, weight_lbs, gender, lifter_type, primary_gym_id, score, current_streak_days) VALUES
('test-uid-001', 'alex_gains', 'alex@pumppal.com', 'Alex Jordan', 'Pushing limits every day 💪 | Aesthetic crew', 25, 72, 185, 'Male', 'Aesthetic', 1, 12500, 15),
('test-uid-002', 'jen_strong', 'jen@pumppal.com', 'Jennifer Strong', 'Fitness is life! 🔥 | CrossFit athlete', 28, 65, 140, 'Female', 'Power', 5, 18200, 42),
('test-uid-003', 'mike_lifts', 'mike@pumppal.com', 'Mike Johnson', 'Eat. Sleep. Lift. Repeat. 🏋️', 30, 70, 210, 'Male', 'Power', 2, 21800, 7),
('test-uid-004', 'sarah_fit', 'sarah@pumppal.com', 'Sarah Williams', 'Stronger than yesterday 💯', 24, 66, 135, 'Female', 'Aesthetic', 1, 9500, 3);

-- Insert sample PRs
INSERT INTO personal_records (user_id, gym_id, pr_type, weight_lbs, pr_date, verified) VALUES
-- Alex's PRs
('test-uid-001', 1, 'Bench', 275, CURDATE() - INTERVAL 5 DAY, TRUE),
('test-uid-001', 1, 'Squat', 365, CURDATE() - INTERVAL 10 DAY, TRUE),
('test-uid-001', 1, 'Deadlift', 425, CURDATE() - INTERVAL 15 DAY, TRUE),

-- Jen's PRs
('test-uid-002', 5, 'Bench', 185, CURDATE() - INTERVAL 3 DAY, TRUE),
('test-uid-002', 5, 'Squat', 265, CURDATE() - INTERVAL 8 DAY, TRUE),
('test-uid-002', 5, 'Deadlift', 315, CURDATE() - INTERVAL 12 DAY, TRUE),

-- Mike's PRs
('test-uid-003', 2, 'Bench', 405, CURDATE() - INTERVAL 2 DAY, TRUE),
('test-uid-003', 2, 'Squat', 545, CURDATE() - INTERVAL 7 DAY, TRUE),
('test-uid-003', 2, 'Deadlift', 605, CURDATE() - INTERVAL 14 DAY, TRUE),

-- Sarah's PRs
('test-uid-004', 1, 'Bench', 135, CURDATE() - INTERVAL 4 DAY, TRUE),
('test-uid-004', 1, 'Squat', 225, CURDATE() - INTERVAL 9 DAY, TRUE);

-- Insert sample posts
INSERT INTO posts (user_id, caption, workout_date, likes_count, comments_count, gym_id) VALUES
('test-uid-001', 'New bench PR! 275 lbs felt smooth 💪', CURDATE() - INTERVAL 5 DAY, 48, 12, 1),
('test-uid-002', 'Crushed leg day today! Squats hitting different 🔥', CURDATE() - INTERVAL 3 DAY, 76, 18, 5),
('test-uid-003', 'Deadlift day = best day. 605 lbs 🏋️', CURDATE() - INTERVAL 2 DAY, 124, 31, 2),
('test-uid-004', 'Morning pump session complete! Feeling strong 💯', CURDATE() - INTERVAL 1 DAY, 34, 7, 1),
('test-uid-001', 'Leg day done right. Time to eat! 🍗', CURDATE(), 29, 5, 1);

-- Link PRs to posts
UPDATE posts SET pr_id = 1 WHERE id = 1;
UPDATE posts SET pr_id = 7 WHERE id = 3;

-- Tag muscle groups for posts
INSERT INTO post_muscle_groups (post_id, muscle_group_id) VALUES
(1, 1), (1, 5), -- Post 1: Chest, Triceps
(2, 3), (2, 8), (2, 7), -- Post 2: Legs, Glutes, Core
(3, 2), (3, 9), (3, 7), -- Post 3: Back, Hamstrings, Core
(4, 1), (4, 6), -- Post 4: Chest, Shoulders
(5, 3), (5, 8); -- Post 5: Legs, Glutes

-- Insert sample followers
INSERT INTO followers (follower_id, following_id, status) VALUES
('test-uid-001', 'test-uid-002', 'Accepted'),
('test-uid-001', 'test-uid-003', 'Accepted'),
('test-uid-001', 'test-uid-004', 'Accepted'),
('test-uid-002', 'test-uid-001', 'Accepted'),
('test-uid-002', 'test-uid-003', 'Accepted'),
('test-uid-003', 'test-uid-001', 'Accepted'),
('test-uid-003', 'test-uid-002', 'Accepted'),
('test-uid-004', 'test-uid-001', 'Accepted'),
('test-uid-004', 'test-uid-002', 'Accepted');

-- Insert likes
INSERT INTO likes (user_id, post_id) VALUES
('test-uid-002', 1), ('test-uid-003', 1), ('test-uid-004', 1),
('test-uid-001', 2), ('test-uid-003', 2), ('test-uid-004', 2),
('test-uid-001', 3), ('test-uid-002', 3), ('test-uid-004', 3),
('test-uid-001', 4), ('test-uid-002', 4), ('test-uid-003', 4);

-- Insert comments
INSERT INTO comments (post_id, user_id, comment_text) VALUES
(1, 'test-uid-002', 'Beast mode! 💪'),
(1, 'test-uid-003', 'Solid lift bro! Keep it up'),
(2, 'test-uid-001', 'Legs looking strong! 🔥'),
(2, 'test-uid-003', 'Great work!'),
(3, 'test-uid-001', 'Insane numbers man 🏋️'),
(3, 'test-uid-002', 'Goals! 💯');

-- Insert gym check-ins
INSERT INTO gym_checkins (user_id, gym_id, checkin_date) VALUES
('test-uid-001', 1, CURDATE()),
('test-uid-001', 1, CURDATE() - INTERVAL 1 DAY),
('test-uid-001', 1, CURDATE() - INTERVAL 2 DAY),
('test-uid-002', 5, CURDATE()),
('test-uid-002', 5, CURDATE() - INTERVAL 1 DAY),
('test-uid-003', 2, CURDATE()),
('test-uid-004', 1, CURDATE());

-- Insert gym followers
INSERT INTO gym_followers (user_id, gym_id) VALUES
('test-uid-001', 1),
('test-uid-002', 5),
('test-uid-003', 2),
('test-uid-004', 1),
('test-uid-001', 2);

-- Award some badges
INSERT INTO user_badges (user_id, badge_id, stack_count) VALUES
('test-uid-001', 1, 1), -- Bronze Lifter
('test-uid-001', 2, 1), -- Silver Lifter
('test-uid-001', 13, 2), -- Week Warrior x2
('test-uid-002', 1, 1), -- Bronze Lifter
('test-uid-002', 2, 1), -- Silver Lifter
('test-uid-002', 3, 1), -- Gold Lifter
('test-uid-002', 14, 1), -- Month Master
('test-uid-003', 1, 1), -- Bronze Lifter
('test-uid-003', 2, 1), -- Silver Lifter
('test-uid-003', 3, 1), -- Gold Lifter
('test-uid-003', 4, 1), -- Platinum Lifter
('test-uid-003', 6, 1); -- Gym Hero

-- Insert gym reviews
INSERT INTO gym_reviews (gym_id, user_id, rating, review_text) VALUES
(1, 'test-uid-001', 5, 'Best gym in Syracuse! Great equipment and friendly staff.'),
(1, 'test-uid-004', 4, 'Love this place. Gets crowded during peak hours though.'),
(2, 'test-uid-003', 5, 'Perfect for serious lifters. Top-notch equipment.'),
(5, 'test-uid-002', 5, 'Amazing CrossFit community. Coaches are incredible!');

-- Insert weekly lifts
INSERT INTO weekly_lifts (user_id, week_start_date, bench_total_lbs, squat_total_lbs, deadlift_total_lbs) VALUES
('test-uid-001', DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), 2750, 3650, 4250),
('test-uid-002', DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), 1850, 2650, 3150),
('test-uid-003', DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), 4050, 5450, 6050);

-- Insert sample points history
INSERT INTO points_history (user_id, points_change, reason, reference_type, reference_id) VALUES
('test-uid-001', 30, 'Posted workout photo', 'Post', 1),
('test-uid-001', 15, 'Gym check-in', 'GymCheckin', NULL),
('test-uid-001', 500, 'New gym PR - Bench 275', 'PR', 1),
('test-uid-002', 30, 'Posted workout photo', 'Post', 2),
('test-uid-002', 250, 'Earned Silver Lifter badge', 'Badge', 2),
('test-uid-003', 2000, 'Became #1 at gym', 'Badge', 7);

