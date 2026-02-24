import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface WorkoutLog {
  id: string;
  date: string;
  workoutType: string;
  customTitle: string;
  durationMinutes: string;
  exercises: Exercise[];
  note: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WORKOUT_TYPES = [
  "Push",
  "Pull",
  "Legs",
  "Upper Body",
  "Full Body",
  "Cardio",
  "Arms",
  "Back & Bis",
  "Chest & Tris",
  "Other",
];

const EMPTY_EXERCISE = (): Exercise => ({
  id: crypto.randomUUID(),
  name: "",
  sets: "",
  reps: "",
  weight: "",
});

const EMPTY_WORKOUT: WorkoutLog = {
  id: "",
  date: "",
  workoutType: "",
  customTitle: "",
  durationMinutes: "",
  exercises: [],
  note: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validate(w: WorkoutLog): Record<string, string> {
  const e: Record<string, string> = {};
  if (!w.workoutType) e.workoutType = "Please select a workout type.";
  if (!w.customTitle.trim()) e.customTitle = "Please enter a workout title.";
  if (!w.durationMinutes || Number(w.durationMinutes) <= 0)
    e.duration = "Please enter a valid duration.";
  w.exercises.forEach((ex, i) => {
    if (!ex.name.trim()) e[`ex_name_${i}`] = "Exercise name required.";
    if (ex.sets && Number(ex.sets) <= 0) e[`ex_sets_${i}`] = "Must be positive.";
    if (ex.reps && Number(ex.reps) <= 0) e[`ex_reps_${i}`] = "Must be positive.";
    if (ex.weight && Number(ex.weight) <= 0) e[`ex_weight_${i}`] = "Must be positive.";
  });
  return e;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", placeholder = "", error = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        min={type === "number" ? 0 : undefined}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm
                   text-white placeholder-zinc-600 focus:outline-none focus:border-white
                   transition-colors"
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 flex flex-col gap-4 border border-zinc-800">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">{title}</h2>
      {children}
    </div>
  );
}

// ─── Exercise Row ─────────────────────────────────────────────────────────────

function ExerciseRow({
  exercise, index, onChange, onRemove, errors,
}: {
  exercise: Exercise;
  index: number;
  onChange: (id: string, field: keyof Exercise, val: string) => void;
  onRemove: (id: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
      {/* Exercise name + remove */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Field
            label={`Exercise ${index + 1}`}
            value={exercise.name}
            onChange={v => onChange(exercise.id, "name", v)}
            placeholder="e.g. Bench Press"
            error={errors[`ex_name_${index}`]}
          />
        </div>
        <button
          type="button"
          onClick={() => onRemove(exercise.id)}
          className="mt-6 text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Sets / Reps / Weight */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Field
            label="Sets"
            value={exercise.sets}
            type="number"
            onChange={v => onChange(exercise.id, "sets", v)}
            placeholder="4"
            error={errors[`ex_sets_${index}`]}
          />
        </div>
        <div>
          <Field
            label="Reps"
            value={exercise.reps}
            type="number"
            onChange={v => onChange(exercise.id, "reps", v)}
            placeholder="8"
            error={errors[`ex_reps_${index}`]}
          />
        </div>
        <div>
          <Field
            label="Weight (lbs)"
            value={exercise.weight}
            type="number"
            onChange={v => onChange(exercise.id, "weight", v)}
            placeholder="135"
            error={errors[`ex_weight_${index}`]}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LogWorkout() {
  const [workout, setWorkout]       = useState<WorkoutLog>(EMPTY_WORKOUT);
  const [exercises, setExercises]   = useState<Exercise[]>([]);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [saved, setSaved]           = useState(false);
  const [showOther, setShowOther]   = useState(false);

  // Top-level field setter
  const set = <K extends keyof WorkoutLog>(key: K, val: WorkoutLog[K]) =>
    setWorkout(p => ({ ...p, [key]: val }));

  // Workout type selection
  const handleTypeSelect = (type: string) => {
    if (type === "Other") {
      setShowOther(true);
      set("workoutType", "");
    } else {
      setShowOther(false);
      set("workoutType", type);
    }
  };

  // Exercise handlers
  const addExercise = () => setExercises(prev => [...prev, EMPTY_EXERCISE()]);

  const updateExercise = (id: string, field: keyof Exercise, val: string) =>
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, [field]: val } : ex));

  const removeExercise = (id: string) =>
    setExercises(prev => prev.filter(ex => ex.id !== id));

  // Save
  const handleSave = () => {
    const full: WorkoutLog = {
      ...workout,
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      exercises,
    };
    const errs = validate(full);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    console.log("[PumpPal] Workout logged:", full);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Reset
  const handleReset = () => {
    setWorkout(EMPTY_WORKOUT);
    setExercises([]);
    setErrors({});
    setSaved(false);
    setShowOther(false);
  };

  return (
    <div
      className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center"
      style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", fontWeight: 800, letterSpacing: "-0.01em" }}
    >
      {/* Header */}
      <div className="w-full max-w-lg mb-8 flex flex-col items-center gap-1">
        <h1 className="text-5xl font-black tracking-tight text-white">PUMPPAL</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-white mt-1">Log Workout</p>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* ── Workout Type ──────────────────────────────────────────────── */}
        <Section title="Workout Type">
          <div className="flex flex-wrap gap-2">
            {WORKOUT_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeSelect(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide
                            border transition-colors ${
                  workout.workoutType === type ||
                  (type === "Other" && showOther)
                    ? "bg-white text-black border-white"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {errors.workoutType && (
            <span className="text-xs text-red-400">{errors.workoutType}</span>
          )}

          {/* Other free text */}
          {showOther && (
            <Field
              label="Custom workout type"
              value={workout.workoutType}
              onChange={v => set("workoutType", v)}
              placeholder="e.g. Olympic Lifting"
            />
          )}
        </Section>

        {/* ── Workout Details ───────────────────────────────────────────── */}
        <Section title="Details">
          <Field
            label="Workout Title"
            value={workout.customTitle}
            onChange={v => set("customTitle", v)}
            placeholder="e.g. Heavy Push Day"
            error={errors.customTitle}
          />
          <Field
            label="Duration (minutes)"
            value={workout.durationMinutes}
            type="number"
            onChange={v => set("durationMinutes", v)}
            placeholder="60"
            error={errors.duration}
          />
        </Section>

        {/* ── Exercises ─────────────────────────────────────────────────── */}
        <Section title="Exercises">
          {exercises.length === 0 && (
            <p className="text-xs text-zinc-600">No exercises added yet.</p>
          )}

          {exercises.map((ex, i) => (
            <ExerciseRow
              key={ex.id}
              exercise={ex}
              index={i}
              onChange={updateExercise}
              onRemove={removeExercise}
              errors={errors}
            />
          ))}

          <button
            type="button"
            onClick={addExercise}
            className="flex items-center gap-2 text-sm font-black text-zinc-400
                       hover:text-white transition-colors self-start"
          >
            <span className="text-lg leading-none">+</span> Add Exercise
          </button>
        </Section>

        {/* ── Personal Note ─────────────────────────────────────────────── */}
        <Section title="Note">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              How did it go?
            </label>
            <textarea
              value={workout.note}
              onChange={e => set("note", e.target.value)}
              placeholder="Felt strong today, hit a new PR on bench..."
              rows={3}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm
                         text-white placeholder-zinc-600 focus:outline-none focus:border-white
                         transition-colors resize-none font-normal"
            />
          </div>
        </Section>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-white hover:bg-zinc-200 text-black font-black
                       rounded-xl py-3 text-sm transition-colors"
          >
            Log Workout
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                       text-zinc-300 font-black rounded-xl py-3 text-sm transition-colors"
          >
            Reset
          </button>
        </div>

        {saved && (
          <p className="text-center text-sm text-green-400 animate-pulse">
            ✓ Workout logged!
          </p>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

