

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PRs {
  bench: number;
  squat: number;
  deadlift: number;
}

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number; // lbs
}

interface WorkoutLog {
  id: string;
  date: string;
  title: string;
  durationMinutes: number;
  exercises: WorkoutExercise[];
}

interface MockUser {
  name: string;
  username: string;
  avatarInitials: string; // used as placeholder if no photo
  favoriteGym: string;
  followers: number;
  following: number;
  weightUnit: "lbs" | "kg";
  prs: PRs;
  recentWorkouts: WorkoutLog[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Replace this with real user data from your backend when ready.

const MOCK_USER: MockUser = {
  name: "User Name",
  username: "@User_username",
  avatarInitials: "NA",
  favoriteGym: "NA",
  followers: 0,
  following: 0,
  weightUnit: "lbs",
  prs: {
    bench: 0,
    squat: 0,
    deadlift: 0,
  },
  recentWorkouts: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFollowers(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return n.toString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single PR stat card */
function PRCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-1">
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="text-xs text-zinc-400 uppercase tracking-widest">{unit}</span>
      <span className="text-xs font-bold text-zinc-300 mt-1">{label}</span>
    </div>
  );
}

/** Single workout log card */
function WorkoutCard({ workout, unit }: { workout: WorkoutLog; unit: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-black text-white text-sm">{workout.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{workout.date}</p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-3 py-1">
          <span className="text-xs text-zinc-400">⏱</span>
          <span className="text-xs font-bold text-zinc-300">{workout.durationMinutes}m</span>
        </div>
      </div>

      {/* Exercise preview — always show first 2, expand for rest */}
      <div className="flex flex-col gap-2">
        {workout.exercises.slice(0, expanded ? workout.exercises.length : 2).map((ex, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">{ex.name}</span>
            <span className="text-xs text-zinc-500">
              {ex.sets}×{ex.reps}
              {ex.weight > 0 ? ` @ ${ex.weight}${unit}` : " BW"}
            </span>
          </div>
        ))}
      </div>

      {/* Expand toggle if more than 2 exercises */}
      {workout.exercises.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-zinc-500 hover:text-white transition-colors self-start"
        >
          {expanded ? "Show less ↑" : `+${workout.exercises.length - 2} more exercises`}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserProfileView() {
  const user = MOCK_USER;
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const handleFollow = () => {
    setIsFollowing(prev => {
      const next = !prev;
      setFollowerCount(c => next ? c + 1 : c - 1);
      return next;
    });
  };

  return (
    <div
      className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center"
      style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", fontWeight: 800, letterSpacing: "-0.01em" }}
    >
      <div className="w-full max-w-lg flex flex-col gap-6">

        {/* ── Header / Identity ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 pt-4">

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700
                          flex items-center justify-center text-2xl font-black text-white">
            {user.avatarInitials}
          </div>

          {/* Name + username */}
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <p className="text-sm text-zinc-500 font-normal mt-0.5">{user.username}</p>
          </div>

          {/* Follow button */}
          <button
            type="button"
            onClick={handleFollow}
            className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all ${
              isFollowing
                ? "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            {isFollowing ? "Following ✓" : "Follow"}
          </button>

          {/* Stats row: followers, following, gym */}
          <div className="flex items-center justify-center gap-6 w-full
                          bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-white">{formatFollowers(followerCount)}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-normal">Followers</span>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-white">{formatFollowers(user.following)}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-normal">Following</span>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-white text-center leading-tight">{user.favoriteGym}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-normal">Gym</span>
            </div>
          </div>
        </div>

        {/* ── PR Dashboard ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-white">
            Top Lifts
          </h2>
          <div className="flex gap-3">
            <PRCard label="Bench" value={user.prs.bench} unit={user.weightUnit} />
            <PRCard label="Squat" value={user.prs.squat} unit={user.weightUnit} />
            <PRCard label="Deadlift" value={user.prs.deadlift} unit={user.weightUnit} />
          </div>
        </div>

        {/* ── Recent Workouts ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-white">
            Recent Activity
          </h2>
          {user.recentWorkouts.length === 0 ? (
            <p className="text-sm text-zinc-600">No workouts logged yet.</p>
          ) : (
            user.recentWorkouts.map(w => (
              <WorkoutCard key={w.id} workout={w} unit={user.weightUnit} />
            ))
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

