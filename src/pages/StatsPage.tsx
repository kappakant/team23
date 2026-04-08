import { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { getFullProfile } from '../services/api';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import WorkoutLogger from './WorkoutLogger';
import './StatsPage.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Types ───────────────────────────────────────────────────────────────────
interface WorkoutSet {
  exercise: string;
  setNumber: number;
  weight: number;
  reps: number;
  loggedAt: Date;
}

interface DaySummary {
  day: string;
  sets: WorkoutSet[];
  startTime: Date;
  endTime: Date;
}

type WorkoutStore = Record<string, DaySummary>;

const LIFT_KEYS = ['Bench', 'Squat', 'Deadlift'] as const;
type LiftKey = typeof LIFT_KEYS[number];

const LIFT_COLORS: Record<LiftKey, string> = {
  Bench:    '#4a90e2',
  Squat:    '#22a55b',
  Deadlift: '#e0443a',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function weeklyGainRate(weeks: number) {
  if (weeks < 26)  return 0.02;
  if (weeks < 104) return 0.008;
  return 0.002;
}

function experienceLabel(weeks: number) {
  if (weeks < 26)  return 'Beginner';
  if (weeks < 104) return 'Intermediate';
  return 'Advanced';
}

function getBestPR(prs: any[], type: string): number {
  const filtered = prs?.filter(p => p.pr_type === type) || [];
  if (!filtered.length) return 0;
  return Math.max(...filtered.map((p: any) => p.weight_lbs || 0));
}

function calcDuration(startTime: Date, endTime: Date): string {
  const secs = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function buildCombinedData(
  history: { date: string; weight: number }[],
  weeksLifting: number,
  weeksAhead = 12
) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const historicalPoints = sorted.map(h => ({
    label:     h.date,
    actual:    h.weight,
    projected: null as number | null,
    isNow:     false,
  }));

  const latestWeight = sorted.length ? sorted[sorted.length - 1].weight : 0;
  const projectedPoints: typeof historicalPoints = [];

  if (latestWeight > 0) {
    let w = latestWeight;
    for (let i = 0; i <= weeksAhead; i++) {
      projectedPoints.push({
        label:     i === 0 ? 'Now' : `+${i}w`,
        actual:    i === 0 ? latestWeight : null as any,
        projected: Math.round(w),
        isNow:     i === 0,
      });
      w += w * weeklyGainRate(weeksLifting + i);
    }
  }

  return [...historicalPoints, ...projectedPoints];
}

// ── Day Summary Modal ───────────────────────────────────────────────────────
function DaySummaryModal({ summary, dayName, onClose }: {
  summary: DaySummary | null;
  dayName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const grouped = summary?.sets.reduce<Record<string, WorkoutSet[]>>((acc, s) => {
    acc[s.exercise] = acc[s.exercise] ? [...acc[s.exercise], s] : [s];
    return acc;
  }, {}) ?? {};

  const totalVolume = summary?.sets.reduce((n, s) => n + s.weight * s.reps, 0) ?? 0;
  const duration    = summary ? calcDuration(summary.startTime, summary.endTime) : '—';

  return (
    <div className="pp-day-modal-overlay">
      <div className="pp-day-modal">
        <div className="pp-day-modal-header">
          <div>
            <h2 className="pp-day-modal-title">{summary?.day ?? dayName}</h2>
            <p className="pp-day-modal-sub">
              {summary ? `${summary.sets.length} sets logged` : 'No workout logged'}
            </p>
          </div>
          <button className="pp-day-modal-close" onClick={onClose}>✕</button>
        </div>

        {!summary ? (
          <p className="pp-day-modal-empty">No workout logged for this day.</p>
        ) : (
          <>
            <div className="pp-day-modal-stats">
              <div className="pp-day-modal-stat">
                <span className="pp-day-modal-stat-val">{duration}</span>
                <span className="pp-day-modal-stat-lbl">Time in gym</span>
              </div>
              <div className="pp-day-modal-stat">
                <span className="pp-day-modal-stat-val">{summary.sets.length}</span>
                <span className="pp-day-modal-stat-lbl">Total sets</span>
              </div>
              <div className="pp-day-modal-stat">
                <span className="pp-day-modal-stat-val">{totalVolume.toLocaleString()}</span>
                <span className="pp-day-modal-stat-lbl">Volume (lbs)</span>
              </div>
            </div>

            <div className="pp-day-modal-exercises">
              {Object.entries(grouped).map(([exercise, sets]) => (
                <div key={exercise} className="pp-day-modal-exercise">
                  <p className="pp-day-modal-ex-name">{exercise}</p>
                  <table className="pp-day-modal-table">
                    <thead>
                      <tr>
                        <th>Set</th>
                        <th>Weight</th>
                        <th>Reps</th>
                        <th>Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sets.map(s => (
                        <tr key={s.setNumber}>
                          <td>{s.setNumber}</td>
                          <td>{s.weight > 0 ? `${s.weight} lbs` : 'BW'}</td>
                          <td>{s.reps}</td>
                          <td>{s.weight > 0 ? `${(s.weight * s.reps).toLocaleString()} lbs` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Day Circle ──────────────────────────────────────────────────────────────
function DayCircle({ day, status, isToday, onClick }: {
  day: string;
  status: boolean | null;
  isToday: boolean;
  onClick: () => void;
}) {
  const cls =
    status === true  ? 'pp-day-circle pp-day-hit' :
    isToday          ? 'pp-day-circle pp-day-today' :
    status === false ? 'pp-day-circle pp-day-miss' :
                       'pp-day-circle pp-day-future';

  return (
    <div className="pp-day-col">
      <div
        className={cls}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
        title={isToday ? 'Begin workout' : status !== null ? 'View workout summary' : undefined}
      >
        {status === true && (
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"
               strokeLinecap="round" strokeLinejoin="round" className="pp-day-icon">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {status === false && !isToday && (
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"
               strokeLinecap="round" strokeLinejoin="round" className="pp-day-icon">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
        {isToday && status !== true && (
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"
               strokeLinecap="round" strokeLinejoin="round" className="pp-day-icon">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </div>
      <span className="pp-day-label pp-day-label-today">{day}</span>
    </div>
  );
}

// ── Lift Chart ──────────────────────────────────────────────────────────────
function LiftChart({
  lift,
  weeksLifting,
  initialPR,
}: {
  lift: LiftKey;
  weeksLifting: number;
  initialPR: number;
}) {
  const color = LIFT_COLORS[lift];
  const today = new Date().toISOString().split('T')[0];

  const [history,         setHistory]        = useState<{ date: string; weight: number }[]>(
    initialPR ? [{ date: today, weight: initialPR }] : []
  );
  const [inputWeight,     setInputWeight]     = useState('');
  const [pastInputWeight, setPastInputWeight] = useState('');
  const [pastInputDate,   setPastInputDate]   = useState('');
  const [activeTab,       setActiveTab]       = useState<'today' | 'past'>('today');
  const [error,           setError]           = useState('');

  const addEntry = (date: string, weightStr: string) => {
    const w = parseFloat(weightStr);
    if (!w || w <= 0)  { setError('Enter a valid weight.');     return; }
    if (!date)         { setError('Enter a valid date.');        return; }
    if (date > today)  { setError('Cannot log a future date.'); return; }
    if (history.find(h => h.date === date)) {
      setError('An entry for that date already exists.');
      return;
    }

    const sorted = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const rate   = weeklyGainRate(weeksLifting);
    const before = [...sorted].reverse().find(h => h.date < date);
    const after  = sorted.find(h => h.date > date);

    if (before) {
      const weeksDiff   = (new Date(date).getTime() - new Date(before.date).getTime()) / (7 * 86400000);
      const maxPossible = Math.round(before.weight * Math.pow(1 + rate, weeksDiff) * 1.15);
      const minPossible = Math.round(before.weight * Math.pow(0.95, weeksDiff));
      if (w > maxPossible) {
        setError(`Unrealistic jump from ${before.weight} lbs on ${before.date}. Max expected ~${maxPossible} lbs.`);
        return;
      }
      if (w < minPossible) {
        setError(`Unusually large drop from ${before.weight} lbs on ${before.date}. Min expected ~${minPossible} lbs.`);
        return;
      }
    }

    if (after) {
      const weeksDiff   = (new Date(after.date).getTime() - new Date(date).getTime()) / (7 * 86400000);
      const maxPossible = Math.round(after.weight * Math.pow(1 + rate, weeksDiff) * 1.15);
      const minPossible = Math.round(after.weight * Math.pow(0.95, weeksDiff));
      if (w > maxPossible) {
        setError(`Too high given the next entry of ${after.weight} lbs on ${after.date}. Max expected ~${maxPossible} lbs.`);
        return;
      }
      if (w < minPossible) {
        setError(`Too low given the next entry of ${after.weight} lbs on ${after.date}. Min expected ~${minPossible} lbs.`);
        return;
      }
    }

    setHistory(prev => [...prev, { date, weight: w }]);
    setInputWeight('');
    setPastInputWeight('');
    setPastInputDate('');
    setError('');
  };

  const handleRemove = (date: string) =>
    setHistory(prev => prev.filter(h => h.date !== date));

  const chartData = buildCombinedData(history, weeksLifting);
  const nowIndex  = chartData.findIndex(d => d.isNow);

  return (
    <div className="pp-lift-chart-block">
      <div className="pp-lift-chart-title" style={{ color }}>{lift}</div>

      {chartData.length === 0 ? (
        <p className="pp-stats-empty">Add an entry below to see your chart.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#aaa' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: '#aaa' }} unit=" lbs" width={64} />
            <Tooltip
              formatter={(val: any, name: any) => [`${val} lbs`, name]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e3e0d9', fontSize: 13 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {nowIndex >= 0 && (
              <ReferenceLine
                x={chartData[nowIndex].label}
                stroke="#ccc"
                strokeDasharray="4 4"
                label={{ value: 'Today', position: 'insideTopRight', fontSize: 11, fill: '#aaa' }}
              />
            )}
            <Line type="monotone" dataKey="actual" name="Actual"
              stroke={color} strokeWidth={2.5} dot={{ r: 4, fill: color }}
              connectNulls={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="projected" name="Projected"
              stroke={color} strokeWidth={2} strokeDasharray="6 4"
              dot={false} connectNulls={false} activeDot={{ r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <div className="pp-input-tabs">
        <button
          className={`pp-input-tab${activeTab === 'today' ? ' pp-input-tab-active' : ''}`}
          style={activeTab === 'today' ? { borderBottomColor: color, color } : {}}
          onClick={() => { setActiveTab('today'); setError(''); }}
        >
          Log Today
        </button>
        <button
          className={`pp-input-tab${activeTab === 'past' ? ' pp-input-tab-active' : ''}`}
          style={activeTab === 'past' ? { borderBottomColor: color, color } : {}}
          onClick={() => { setActiveTab('past'); setError(''); }}
        >
          Add Past Entry
        </button>
      </div>

      <div className="pp-tab-panel-wrap">
        <div className={`pp-tab-panel${activeTab === 'today' ? ' pp-tab-panel-active' : ''}`}>
          <div className="pp-lift-input-row">
            <span className="pp-today-date-label">{today}</span>
            <input
              type="number"
              placeholder="Weight (lbs)"
              value={inputWeight}
              onChange={e => setInputWeight(e.target.value)}
              className="pp-lift-input pp-lift-input-weight"
              min={0}
            />
            <button className="pp-lift-add-btn" style={{ background: color }}
              onClick={() => addEntry(today, inputWeight)}>
              + Add
            </button>
          </div>
        </div>

        <div className={`pp-tab-panel${activeTab === 'past' ? ' pp-tab-panel-active' : ''}`}>
          <div className="pp-lift-input-row">
            <input
              type="date"
              value={pastInputDate}
              max={today}
              onChange={e => setPastInputDate(e.target.value)}
              className="pp-lift-input pp-lift-input-date"
            />
            <input
              type="number"
              placeholder="Weight (lbs)"
              value={pastInputWeight}
              onChange={e => setPastInputWeight(e.target.value)}
              className="pp-lift-input pp-lift-input-weight"
              min={0}
            />
            <button className="pp-lift-add-btn" style={{ background: color }}
              onClick={() => addEntry(pastInputDate, pastInputWeight)}>
              + Add
            </button>
          </div>
        </div>
      </div>

      {error && <p className="pp-lift-error">{error}</p>}

      {history.length > 0 && (
        <div className="pp-lift-history">
          {[...history]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(h => (
              <div key={h.date} className="pp-lift-history-row">
                <span className="pp-lift-history-date">{h.date}</span>
                <span className="pp-lift-history-weight">{h.weight} lbs</span>
                <button className="pp-lift-remove-btn" onClick={() => handleRemove(h.date)}>✕</button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ── Main Stats Page ─────────────────────────────────────────────────────────
export default function Stats() {
  const [profile,      setProfile]      = useState<any>(null);
  const [weeksLifting, setWeeksLifting] = useState(52);
  const [activeIdx,    setActiveIdx]    = useState(0);
  const [showLogger,   setShowLogger]   = useState(false);
  const [summaryDay,   setSummaryDay]   = useState<number | null>(null);
  const [workoutStore, setWorkoutStore] = useState<WorkoutStore>({});
  const user = auth.currentUser;

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await getFullProfile(user.uid);
      if (data && !data.error) setProfile(data);
    };
    load();
  }, [user]);

  const handleWorkoutComplete = (logs: any[], startTime: Date, endTime: Date) => {
    const dateKey = startTime.toISOString().split('T')[0];
    const dayName = DAYS[startTime.getDay()];
    const sets: WorkoutSet[] = logs.flatMap(log =>
      log.sets.map((s: any) => ({
        exercise:  log.exercise.name,
        setNumber: s.setNumber,
        weight:    s.weight,
        reps:      s.reps,
        loggedAt:  endTime,
      }))
    );
    setWorkoutStore(prev => ({
      ...prev,
      [dateKey]: { day: dayName, sets, startTime, endTime },
    }));
  };

  // Build this week's attendance dynamically from workoutStore
  const today     = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weekAttendanceDynamic: (boolean | null)[] = DAYS.map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key      = d.toISOString().split('T')[0];
    const todayKey = today.toISOString().split('T')[0];
    if (key > todayKey) return null;
    return workoutStore[key] ? true : false;
  });

  const hit    = weekAttendanceDynamic.filter(d => d === true).length;
  const missed = weekAttendanceDynamic.filter(d => d === false).length;

  const currentPRs: Record<LiftKey, number> = {
    Bench:    profile ? getBestPR(profile.prs, 'Bench')    : 0,
    Squat:    profile ? getBestPR(profile.prs, 'Squat')    : 0,
    Deadlift: profile ? getBestPR(profile.prs, 'Deadlift') : 0,
  };

  return (
    <div className="pp-stats-root">
      {showLogger && (
        <WorkoutLogger
          onClose={() => setShowLogger(false)}
          onComplete={(logs, start, end) => {
            handleWorkoutComplete(logs, start, end);
            setShowLogger(false);
          }}
        />
      )}
      {summaryDay !== null && (() => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + summaryDay);
        const key = d.toISOString().split('T')[0];
        return (
          <DaySummaryModal
            summary={workoutStore[key] ?? null}
            dayName={DAYS[summaryDay]}
            onClose={() => setSummaryDay(null)}
          />
        );
      })()}

      <div className="pp-stats-topbar">
        <span className="pp-stats-app-title">PUMPPAL</span>
        <button className="pp-begin-workout-btn" onClick={() => setShowLogger(true)}>
          Begin Workout
        </button>
      </div>

      <div className="pp-stats-body">

        <section className="pp-stats-card">
          <div className="pp-stats-card-header">
            <h2 className="pp-stats-card-title">This Week</h2>
            <span className="pp-stats-card-sub">{hit} / {hit + missed} days hit</span>
          </div>
          <div className="pp-week-row">
            {DAYS.map((day, i) => {
              const d = new Date(weekStart);
              d.setDate(weekStart.getDate() + i);
              const isToday = d.toISOString().split('T')[0] === today.toISOString().split('T')[0];
              const isTodayUnlogged = isToday && weekAttendanceDynamic[i] !== true;
              return (
                <DayCircle
                  key={day}
                  day={day}
                  status={weekAttendanceDynamic[i]}
                  isToday={isTodayUnlogged}
                  onClick={() => isTodayUnlogged ? setShowLogger(true) : setSummaryDay(i)}
                />
              );
            })}
          </div>
          <div className="pp-week-legend">
            <span className="pp-legend-item pp-legend-hit"><span className="pp-legend-dot" /> Gym day</span>
            <span className="pp-legend-item pp-legend-miss"><span className="pp-legend-dot" /> Missed</span>
            <span className="pp-legend-item pp-legend-future"><span className="pp-legend-dot" /> Upcoming</span>
          </div>
        </section>

        <section className="pp-stats-card">
          <div className="pp-stats-card-header">
            <h2 className="pp-stats-card-title">Lift Progress & Projections</h2>
            <div className="pp-exp-toggle">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => {
                const weeks = level === 'Beginner' ? 10 : level === 'Intermediate' ? 52 : 156;
                return (
                  <button
                    key={level}
                    className={`pp-exp-btn${weeksLifting === weeks ? ' pp-exp-active' : ''}`}
                    onClick={() => setWeeksLifting(weeks)}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="pp-exp-label">
            Experience: <strong>{experienceLabel(weeksLifting)}</strong>
            &nbsp;— ~{(weeklyGainRate(weeksLifting) * 100).toFixed(1)}% gain/week projected
          </p>

          <div className="pp-carousel">
            <button
              className="pp-carousel-arrow pp-carousel-prev"
              onClick={() => setActiveIdx(i => (i - 1 + LIFT_KEYS.length) % LIFT_KEYS.length)}
              aria-label="Previous lift"
            >
              ‹
            </button>
            <div className="pp-carousel-track-wrap">
              <div
                className="pp-carousel-track"
                style={{ transform: `translateX(-${activeIdx * 100}%)` }}
              >
                {LIFT_KEYS.map(lift => (
                  <div className="pp-carousel-slide" key={lift}>
                    <LiftChart
                      lift={lift}
                      weeksLifting={weeksLifting}
                      initialPR={currentPRs[lift]}
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              className="pp-carousel-arrow pp-carousel-next"
              onClick={() => setActiveIdx(i => (i + 1) % LIFT_KEYS.length)}
              aria-label="Next lift"
            >
              ›
            </button>
          </div>

          <div className="pp-carousel-dots">
            {LIFT_KEYS.map((lift, i) => (
              <button
                key={lift}
                className={`pp-carousel-dot${i === activeIdx ? ' pp-dot-active' : ''}`}
                onClick={() => setActiveIdx(i)}
                style={i === activeIdx ? { background: LIFT_COLORS[lift] } : {}}
                aria-label={lift}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}