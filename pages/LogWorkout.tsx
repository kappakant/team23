import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
}

interface WorkoutLog {
  id: string;
  date: string;
  workoutType: string;
  customTitle: string;
  durationMinutes: string;
  exercises: Exercise[];
  note: string;
  media: MediaFile[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WORKOUT_TYPES = [
  "Push", "Pull", "Legs", "Upper Body", "Full Body",
  "Cardio", "Arms", "Back & Bis", "Chest & Tris", "Other",
];

const ACCEPTED_TYPES = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm";
const MAX_IMAGE_MB = 20;
const MAX_VIDEO_MB = 200;

const EMPTY_EXERCISE = (): Exercise => ({
  id: crypto.randomUUID(), name: "", sets: "", reps: "", weight: "",
});

const EMPTY_WORKOUT: WorkoutLog = {
  id: "", date: "", workoutType: "", customTitle: "",
  durationMinutes: "", exercises: [], note: "", media: [],
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

function fmtSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", placeholder = "", error = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        min={type === "number" ? 0 : undefined}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm
                   text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
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

function ExerciseRow({ exercise, index, onChange, onRemove, errors }: {
  exercise: Exercise; index: number;
  onChange: (id: string, field: keyof Exercise, val: string) => void;
  onRemove: (id: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Field label={`Exercise ${index + 1}`} value={exercise.name}
            onChange={v => onChange(exercise.id, "name", v)}
            placeholder="e.g. Bench Press" error={errors[`ex_name_${index}`]} />
        </div>
        <button type="button" onClick={() => onRemove(exercise.id)}
          className="mt-6 text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none">✕</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Sets" value={exercise.sets} type="number"
          onChange={v => onChange(exercise.id, "sets", v)} placeholder="4" error={errors[`ex_sets_${index}`]} />
        <Field label="Reps" value={exercise.reps} type="number"
          onChange={v => onChange(exercise.id, "reps", v)} placeholder="8" error={errors[`ex_reps_${index}`]} />
        <Field label="Weight (lbs)" value={exercise.weight} type="number"
          onChange={v => onChange(exercise.id, "weight", v)} placeholder="135" error={errors[`ex_weight_${index}`]} />
      </div>
    </div>
  );
}

// ─── Media Upload ─────────────────────────────────────────────────────────────

function MediaUpload({ media, onChange }: {
  media: MediaFile[];
  onChange: (updated: MediaFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mediaError, setMediaError] = useState("");

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    setMediaError("");
    const newMedia: MediaFile[] = [];
    const errs: string[] = [];

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        errs.push(`"${file.name}" is not a supported format.`);
        return;
      }
      const limitMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size > limitMB * 1024 * 1024) {
        errs.push(`"${file.name}" exceeds the ${limitMB} MB limit.`);
        return;
      }
      const preview = URL.createObjectURL(file);
      newMedia.push({ id: crypto.randomUUID(), file, preview, type: isImage ? "image" : "video" });
    });

    if (errs.length) setMediaError(errs.join(" "));
    if (newMedia.length) onChange([...media, ...newMedia]);
  };

  const remove = (id: string) => {
    const item = media.find(m => m.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    onChange(media.filter(m => m.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2
                    cursor-pointer transition-colors select-none
                    ${dragOver ? "border-white bg-zinc-800" : "border-zinc-700 hover:border-zinc-500 bg-zinc-800/50"}`}
      >
        <span className="text-2xl">📸</span>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Tap or drag to upload
        </p>
        <p className="text-xs text-zinc-600 text-center">
          Photos (JPG, PNG, GIF, WebP · up to 20 MB) &nbsp;·&nbsp; Videos (MP4, MOV, WebM · up to 200 MB)
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={e => processFiles(e.target.files)}
      />

      {mediaError && <span className="text-xs text-red-400">{mediaError}</span>}

      {/* Previews */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map(m => (
            <div key={m.id} className="relative group rounded-xl overflow-hidden bg-zinc-800 aspect-square">
              {m.type === "image" ? (
                <img src={m.preview} alt={m.file.name}
                  className="w-full h-full object-cover" />
              ) : (
                <video src={m.preview} className="w-full h-full object-cover" muted playsInline
                  onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                  onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }} />
              )}

              {/* Overlay info */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                              flex flex-col justify-between p-2">
                <button onClick={() => remove(m.id)}
                  className="self-end bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5
                             flex items-center justify-center text-xs font-black leading-none transition-colors">
                  ✕
                </button>
                <div>
                  {m.type === "video" && (
                    <span className="bg-zinc-900/80 text-white text-xs font-bold px-1.5 py-0.5 rounded mr-1">
                      ▶ VIDEO
                    </span>
                  )}
                  <p className="text-xs text-zinc-300 truncate mt-0.5">{fmtSize(m.file.size)}</p>
                </div>
              </div>

              {/* Video badge (always visible) */}
              {m.type === "video" && (
                <span className="absolute top-1 left-1 bg-black/70 text-white text-xs font-black
                                 px-1.5 py-0.5 rounded group-hover:opacity-0 transition-opacity">▶</span>
              )}
            </div>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <p className="text-xs text-zinc-600">{media.length} file{media.length > 1 ? "s" : ""} selected</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LogWorkout() {
  const [workout, setWorkout]     = useState<WorkoutLog>(EMPTY_WORKOUT);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [media, setMedia]         = useState<MediaFile[]>([]);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [saved, setSaved]         = useState(false);
  const [showOther, setShowOther] = useState(false);

  const set = <K extends keyof WorkoutLog>(key: K, val: WorkoutLog[K]) =>
    setWorkout(p => ({ ...p, [key]: val }));

  const handleTypeSelect = (type: string) => {
    if (type === "Other") { setShowOther(true); set("workoutType", ""); }
    else { setShowOther(false); set("workoutType", type); }
  };

  const addExercise    = () => setExercises(p => [...p, EMPTY_EXERCISE()]);
  const updateExercise = (id: string, field: keyof Exercise, val: string) =>
    setExercises(p => p.map(ex => ex.id === id ? { ...ex, [field]: val } : ex));
  const removeExercise = (id: string) => setExercises(p => p.filter(ex => ex.id !== id));

  const handleSave = () => {
    const full: WorkoutLog = {
      ...workout,
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      exercises,
      media,
    };
    const errs = validate(full);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    console.log("[PumpPal] Workout logged:", full);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    media.forEach(m => URL.revokeObjectURL(m.preview));
    setWorkout(EMPTY_WORKOUT);
    setExercises([]);
    setMedia([]);
    setErrors({});
    setSaved(false);
    setShowOther(false);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center"
      style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", fontWeight: 800, letterSpacing: "-0.01em" }}>

      <div className="w-full max-w-lg mb-8 flex flex-col items-center gap-1">
        <h1 className="text-5xl font-black tracking-tight text-white">PUMPPAL</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-white mt-1">Log Workout</p>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* Workout Type */}
        <Section title="Workout Type">
          <div className="flex flex-wrap gap-2">
            {WORKOUT_TYPES.map(type => (
              <button key={type} type="button" onClick={() => handleTypeSelect(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide border transition-colors ${
                  workout.workoutType === type || (type === "Other" && showOther)
                    ? "bg-white text-black border-white"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500"}`}>
                {type}
              </button>
            ))}
          </div>
          {errors.workoutType && <span className="text-xs text-red-400">{errors.workoutType}</span>}
          {showOther && (
            <Field label="Custom workout type" value={workout.workoutType}
              onChange={v => set("workoutType", v)} placeholder="e.g. Olympic Lifting" />
          )}
        </Section>

        {/* Details */}
        <Section title="Details">
          <Field label="Workout Title" value={workout.customTitle}
            onChange={v => set("customTitle", v)} placeholder="e.g. Heavy Push Day" error={errors.customTitle} />
          <Field label="Duration (minutes)" value={workout.durationMinutes} type="number"
            onChange={v => set("durationMinutes", v)} placeholder="60" error={errors.duration} />
        </Section>

        {/* Exercises */}
        <Section title="Exercises">
          {exercises.length === 0 && <p className="text-xs text-zinc-600">No exercises added yet.</p>}
          {exercises.map((ex, i) => (
            <ExerciseRow key={ex.id} exercise={ex} index={i}
              onChange={updateExercise} onRemove={removeExercise} errors={errors} />
          ))}
          <button type="button" onClick={addExercise}
            className="flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-white transition-colors self-start">
            <span className="text-lg leading-none">+</span> Add Exercise
          </button>
        </Section>

        {/* Media Upload */}
        <Section title="Photos & Videos">
          <MediaUpload media={media} onChange={setMedia} />
        </Section>

        {/* Note */}
        <Section title="Note">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">How did it go?</label>
            <textarea value={workout.note} onChange={e => set("note", e.target.value)}
              placeholder="Felt strong today, hit a new PR on bench..."
              rows={3}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm
                         text-white placeholder-zinc-600 focus:outline-none focus:border-white
                         transition-colors resize-none font-normal" />
          </div>
        </Section>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={handleSave}
            className="flex-1 bg-white hover:bg-zinc-200 text-black font-black rounded-xl py-3 text-sm transition-colors">
            Log Workout
          </button>
          <button type="button" onClick={handleReset}
            className="px-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                       text-zinc-300 font-black rounded-xl py-3 text-sm transition-colors">
            Reset
          </button>
        </div>

        {saved && (
          <p className="text-center text-sm text-green-400 animate-pulse">✓ Workout logged!</p>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
