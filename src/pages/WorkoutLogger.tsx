import { useState, useEffect, useRef } from 'react';
import './WorkoutLogger.css';

// ── Exercise Library ────────────────────────────────────────────────────────
type ExerciseType = 'compound' | 'isolation';

interface Exercise {
  name: string;
  type: ExerciseType;
  muscleGroup: string;
}

const PRESET_EXERCISES: Exercise[] = [
  // Compound
  { name: 'Bench Press',        type: 'compound',  muscleGroup: 'Chest'     },
  { name: 'Squat',              type: 'compound',  muscleGroup: 'Legs'      },
  { name: 'Deadlift',           type: 'compound',  muscleGroup: 'Back'      },
  { name: 'Overhead Press',     type: 'compound',  muscleGroup: 'Shoulders' },
  { name: 'Barbell Row',        type: 'compound',  muscleGroup: 'Back'      },
  { name: 'Pull Up',            type: 'compound',  muscleGroup: 'Back'      },
  { name: 'Dip',                type: 'compound',  muscleGroup: 'Chest'     },
  { name: 'Romanian Deadlift',  type: 'compound',  muscleGroup: 'Legs'      },
  { name: 'Front Squat',        type: 'compound',  muscleGroup: 'Legs'      },
  { name: 'Incline Bench Press',type: 'compound',  muscleGroup: 'Chest'     },
  // Isolation
  { name: 'Bicep Curl',         type: 'isolation', muscleGroup: 'Arms'      },
  { name: 'Tricep Pushdown',    type: 'isolation', muscleGroup: 'Arms'      },
  { name: 'Lateral Raise',      type: 'isolation', muscleGroup: 'Shoulders' },
  { name: 'Leg Curl',           type: 'isolation', muscleGroup: 'Legs'      },
  { name: 'Leg Extension',      type: 'isolation', muscleGroup: 'Legs'      },
  { name: 'Cable Fly',          type: 'isolation', muscleGroup: 'Chest'     },
  { name: 'Face Pull',          type: 'isolation', muscleGroup: 'Shoulders' },
  { name: 'Hammer Curl',        type: 'isolation', muscleGroup: 'Arms'      },
  { name: 'Skull Crusher',      type: 'isolation', muscleGroup: 'Arms'      },
  { name: 'Calf Raise',         type: 'isolation', muscleGroup: 'Legs'      },
];

const REST_TIME: Record<ExerciseType, number> = {
  compound:  180, // 3 min
  isolation: 90,  // 90 sec
};

// ── Types ───────────────────────────────────────────────────────────────────
interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
}

interface ExerciseLog {
  exercise: Exercise;
  sets: SetLog[];
}

type Phase = 'pick' | 'active' | 'rest' | 'summary';

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Sub-components ──────────────────────────────────────────────────────────
function ExercisePicker({ onSelect }: { onSelect: (e: Exercise) => void }) {
  const [query,  setQuery]  = useState('');
  const [custom, setCustom] = useState('');
  const [type,   setType]   = useState<ExerciseType>('compound');

  const filtered = PRESET_EXERCISES.filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  const groups = filtered.reduce<Record<string, Exercise[]>>((acc, e) => {
    acc[e.muscleGroup] = acc[e.muscleGroup] ? [...acc[e.muscleGroup], e] : [e];
    return acc;
  }, {});

  const addCustom = () => {
    if (!custom.trim()) return;
    onSelect({ name: custom.trim(), type, muscleGroup: 'Custom' });
  };

  return (
    <div className="wl-picker">
      <h2 className="wl-picker-title">Choose an exercise</h2>

      <input
        className="wl-search"
        placeholder="Search exercises..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />

      <div className="wl-preset-list">
        {Object.entries(groups).map(([group, exercises]) => (
          <div key={group} className="wl-group">
            <p className="wl-group-label">{group}</p>
            {exercises.map(ex => (
              <button key={ex.name} className="wl-exercise-row" onClick={() => onSelect(ex)}>
                <span className="wl-exercise-name">{ex.name}</span>
                <span className={`wl-exercise-badge wl-badge-${ex.type}`}>{ex.type}</span>
              </button>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="wl-empty">No matches — add a custom exercise below.</p>
        )}
      </div>

      <div className="wl-custom-section">
        <p className="wl-custom-label">Custom exercise</p>
        <div className="wl-custom-row">
          <input
            className="wl-custom-input"
            placeholder="Exercise name"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
          />
          <div className="wl-type-toggle">
            {(['compound', 'isolation'] as ExerciseType[]).map(t => (
              <button
                key={t}
                className={`wl-type-btn${type === t ? ' wl-type-active' : ''}`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="wl-custom-add-btn" onClick={addCustom}>Add</button>
        </div>
      </div>
    </div>
  );
}

function SetInput({
  setNumber,
  prevSet,
  onLog,
}: {
  setNumber: number;
  prevSet?: SetLog;
  onLog: (weight: number, reps: number) => void;
}) {
  const [weight, setWeight] = useState(prevSet ? String(prevSet.weight) : '');
  const [reps,   setReps]   = useState(prevSet ? String(prevSet.reps)   : '');
  const [error,  setError]  = useState('');

  const handle = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!w || w <= 0) { setError('Enter a valid weight.'); return; }
    if (!r || r <= 0) { setError('Enter a valid rep count.'); return; }
    setError('');
    onLog(w, r);
  };

  return (
    <div className="wl-set-input">
      <p className="wl-set-number">Set {setNumber}</p>
      {prevSet && (
        <p className="wl-prev-set">
          Last set: {prevSet.weight} lbs × {prevSet.reps} reps
        </p>
      )}
      <div className="wl-set-row">
        <div className="wl-set-field">
          <label className="wl-set-label">Weight (lbs)</label>
          <input
            type="number"
            className="wl-set-inp"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            min={0}
            placeholder="0"
          />
        </div>
        <div className="wl-set-field">
          <label className="wl-set-label">Reps</label>
          <input
            type="number"
            className="wl-set-inp"
            value={reps}
            onChange={e => setReps(e.target.value)}
            min={0}
            placeholder="0"
          />
        </div>
      </div>
      {error && <p className="wl-error">{error}</p>}
      <button className="wl-log-btn" onClick={handle}>Log Set</button>
    </div>
  );
}

function RestTimer({
  seconds,
  exerciseType,
  onSkip,
  onDone,
}: {
  seconds: number;
  exerciseType: ExerciseType;
  onSkip: () => void;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const total = REST_TIME[exerciseType];
  const pct   = (remaining / total) * 100;

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const circumference = 2 * Math.PI * 54;
  const dashOffset    = circumference * (1 - pct / 100);

  return (
    <div className="wl-rest">
      <p className="wl-rest-title">Rest</p>
      <p className="wl-rest-sub">
        {exerciseType === 'compound' ? 'Compound lift — 3 min rest' : 'Isolation — 90 sec rest'}
      </p>

      <div className="wl-ring-wrap">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#f0ede6" strokeWidth="8" />
          <circle
            cx="64" cy="64" r="54"
            fill="none"
            stroke="#22a55b"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="wl-ring-time">{formatTime(remaining)}</span>
      </div>

      <button className="wl-skip-btn" onClick={onSkip}>Skip rest</button>
    </div>
  );
}

function WorkoutSummary({
  logs,
  duration,
  onClose,
}: {
  logs: ExerciseLog[];
  duration: number;
  onClose: () => void;
}) {
  const totalSets   = logs.reduce((n, l) => n + l.sets.length, 0);
  const totalVolume = logs.reduce(
    (n, l) => n + l.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
  );

  return (
    <div className="wl-summary">
      <div className="wl-summary-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="#22a55b" strokeWidth="2.5"
             strokeLinecap="round" strokeLinejoin="round" className="wl-summary-icon">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <h2 className="wl-summary-title">Workout complete!</h2>
      </div>

      <div className="wl-summary-stats">
        <div className="wl-summary-stat">
          <span className="wl-summary-val">{formatTime(duration)}</span>
          <span className="wl-summary-lbl">Duration</span>
        </div>
        <div className="wl-summary-stat">
          <span className="wl-summary-val">{totalSets}</span>
          <span className="wl-summary-lbl">Total sets</span>
        </div>
        <div className="wl-summary-stat">
          <span className="wl-summary-val">{totalVolume.toLocaleString()}</span>
          <span className="wl-summary-lbl">Volume (lbs)</span>
        </div>
      </div>

      {logs.map((log, i) => (
        <div key={i} className="wl-summary-exercise">
          <div className="wl-summary-ex-header">
            <span className="wl-summary-ex-name">{log.exercise.name}</span>
            <span className={`wl-exercise-badge wl-badge-${log.exercise.type}`}>
              {log.exercise.type}
            </span>
          </div>
          <table className="wl-summary-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Weight</th>
                <th>Reps</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {log.sets.map(s => (
                <tr key={s.setNumber}>
                  <td>{s.setNumber}</td>
                  <td>{s.weight} lbs</td>
                  <td>{s.reps}</td>
                  <td>{(s.weight * s.reps).toLocaleString()} lbs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <button className="wl-done-btn" onClick={onClose}>Done</button>
    </div>
  );
}

// ── Main WorkoutLogger ──────────────────────────────────────────────────────
export default function WorkoutLogger({ onClose, onComplete }: {
  onClose: () => void;
  onComplete: (logs: ExerciseLog[], startTime: Date, endTime: Date) => void;
}) {
  const [phase,           setPhase]           = useState<Phase>('pick');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [logs,            setLogs]            = useState<ExerciseLog[]>([]);
  const [currentSetNum,   setCurrentSetNum]   = useState(1);
  const [restSeconds,     setRestSeconds]     = useState(0);

  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Elapsed timer
  useEffect(() => {
    if (phase === 'summary') return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const currentLog = logs.find(l => l.exercise.name === currentExercise?.name);
  const prevSet    = currentLog?.sets[currentSetNum - 2];

  const handleSelectExercise = (ex: Exercise) => {
    setCurrentExercise(ex);
    if (!logs.find(l => l.exercise.name === ex.name)) {
      setLogs(prev => [...prev, { exercise: ex, sets: [] }]);
    }
    setCurrentSetNum(
      (logs.find(l => l.exercise.name === ex.name)?.sets.length ?? 0) + 1
    );
    setPhase('active');
  };

  const handleLogSet = (weight: number, reps: number) => {
    if (!currentExercise) return;
    const newSet: SetLog = { setNumber: currentSetNum, weight, reps };
    setLogs(prev => prev.map(l =>
      l.exercise.name === currentExercise.name
        ? { ...l, sets: [...l.sets, newSet] }
        : l
    ));
    setRestSeconds(REST_TIME[currentExercise.type]);
    setPhase('rest');
  };

  const handleRestDone = () => {
    setCurrentSetNum(n => n + 1);
    setPhase('active');
  };

  const handleEndWorkout = () => {
    const endTime = new Date();
    setElapsed(Math.floor((endTime.getTime() - startTime.current) / 1000));
    onComplete(logs, new Date(startTime.current), endTime);
    setPhase('summary');
  };

  return (
    <div className="wl-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wl-modal">

        {/* ── Top bar ─────────────────────────────────── */}
        <div className="wl-topbar">
          <span className="wl-topbar-title">
            {phase === 'pick'    ? 'New Workout'          :
             phase === 'summary' ? 'Summary'              :
             currentExercise?.name ?? 'Workout'}
          </span>
          <div className="wl-topbar-right">
            {phase !== 'pick' && phase !== 'summary' && (
              <>
                <span className="wl-elapsed">{formatTime(elapsed)}</span>
                <button className="wl-switch-btn"
                  onClick={() => setPhase('pick')}>
                  Switch exercise
                </button>
                <button className="wl-end-btn" onClick={handleEndWorkout}>
                  End workout
                </button>
              </>
            )}
            {phase === 'pick' && logs.length > 0 && (
              <button className="wl-end-btn" onClick={handleEndWorkout}>
                End workout
              </button>
            )}
            <button className="wl-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────── */}
        <div className="wl-content">
          {phase === 'pick' && (
            <ExercisePicker onSelect={handleSelectExercise} />
          )}

          {phase === 'active' && currentExercise && (
            <div className="wl-active">
              <div className="wl-exercise-info">
                <span className="wl-active-name">{currentExercise.name}</span>
                <span className={`wl-exercise-badge wl-badge-${currentExercise.type}`}>
                  {currentExercise.type}
                </span>
              </div>
              <SetInput
                setNumber={currentSetNum}
                prevSet={prevSet}
                onLog={handleLogSet}
              />
              {currentLog && currentLog.sets.length > 0 && (
                <div className="wl-logged-sets">
                  <p className="wl-logged-label">Logged sets</p>
                  {currentLog.sets.map(s => (
                    <div key={s.setNumber} className="wl-logged-row">
                      <span className="wl-logged-set">Set {s.setNumber}</span>
                      <span>{s.weight} lbs × {s.reps} reps</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {phase === 'rest' && currentExercise && (
            <RestTimer
              seconds={restSeconds}
              exerciseType={currentExercise.type}
              onSkip={handleRestDone}
              onDone={handleRestDone}
            />
          )}

          {phase === 'summary' && (
            <WorkoutSummary
              logs={logs}
              duration={elapsed}
              onClose={onClose}
            />
          )}
        </div>

      </div>
    </div>
  );
}