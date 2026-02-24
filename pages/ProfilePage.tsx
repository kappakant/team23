

import { useState, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PRs {
  bench: string;
  squat: string;
  deadlift: string;
}

interface Cardio {
  treadmillDistance: string;
  treadmillUnit: "miles" | "km";
  stairMasterFlights: string;
}

interface UserProfile {
  name: string;
  age: string;
  weight: string;
  weightUnit: "lbs" | "kg";
  prs: PRs;
  cardio: Cardio;
  favoriteGym: string;
  socialLink: string;
}

interface MemoryItem {
  id: string;
  createdAt: string;
  title: string;
  message: string;
}

// ─── Empty defaults ───────────────────────────────────────────────────────────

const EMPTY_PROFILE: UserProfile = {
  name: "",
  age: "",
  weight: "",
  weightUnit: "lbs",
  prs: { bench: "", squat: "", deadlift: "" },
  cardio: { treadmillDistance: "", treadmillUnit: "miles", stairMasterFlights: "" },
  favoriteGym: "",
  socialLink: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pos = (v: string) => v !== "" && Number(v) <= 0;

function validate(p: UserProfile): Record<string, string> {
  const e: Record<string, string> = {};
  if (p.age !== "" && (Number(p.age) < 0 || Number(p.age) > 120))
    e.age = "Age must be 0–120.";
  if (p.weight !== "" && Number(p.weight) <= 0)
    e.weight = "Weight must be positive.";
  if (pos(p.prs.bench))      e.bench     = "Must be positive.";
  if (pos(p.prs.squat))      e.squat     = "Must be positive.";
  if (pos(p.prs.deadlift))   e.deadlift  = "Must be positive.";
  if (pos(p.cardio.treadmillDistance)) e.treadmill = "Must be positive.";
  if (pos(p.cardio.stairMasterFlights)) e.stairs   = "Must be positive.";
  return e;
}

function hasStats(p: UserProfile) {
  return [p.prs.bench, p.prs.squat, p.prs.deadlift,
          p.cardio.treadmillDistance, p.cardio.stairMasterFlights]
    .some(v => v !== "" && Number(v) > 0);
}

function generateMemory(p: UserProfile): MemoryItem {
  const prs = [
    p.prs.bench    && `Bench ${p.prs.bench} ${p.weightUnit}`,
    p.prs.squat    && `Squat ${p.prs.squat} ${p.weightUnit}`,
    p.prs.deadlift && `Deadlift ${p.prs.deadlift} ${p.weightUnit}`,
  ].filter(Boolean);
  const cardio = [
    p.cardio.treadmillDistance && `${p.cardio.treadmillDistance} ${p.cardio.treadmillUnit} on treadmill`,
    p.cardio.stairMasterFlights && `${p.cardio.stairMasterFlights} StairMaster flights`,
  ].filter(Boolean);
  const all = [...prs, ...cardio];
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleDateString(),
    title: "🏆 Snapshot Memory",
    message: `On this day: ${all.join(" · ")}.`,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Labelled text/number input */
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
                   text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500
                   transition-colors"
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

/** Pill-style unit toggle */
function UnitToggle<T extends string>({
  options, value, onChange,
}: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-zinc-700 self-end">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-2 text-xs font-semibold transition-colors ${
            value === o
              ? "bg-white text-black"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Section wrapper */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 flex flex-col gap-4 border border-zinc-800">
      <h2 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h2>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile]         = useState<UserProfile>(EMPTY_PROFILE);
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [saved, setSaved]             = useState(false);
  const [memoriesOn, setMemoriesOn]   = useState(false);
  const [memories, setMemories]       = useState<MemoryItem[]>([]);
  const [noStats, setNoStats]         = useState(false);
  const [videoURL, setVideoURL]       = useState<string | null>(null);
  const videoInputRef                 = useRef<HTMLInputElement>(null);
  const saveTimerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generic top-level field setter
  const set = useCallback(<K extends keyof UserProfile>(key: K, val: UserProfile[K]) =>
    setProfile(p => ({ ...p, [key]: val })), []);

  // PR setter
  const setPR = (key: keyof PRs, val: string) =>
    setProfile(p => ({ ...p, prs: { ...p.prs, [key]: val } }));

  // Cardio setter
  const setCardio = (key: keyof Cardio, val: string) =>
    setProfile(p => ({ ...p, cardio: { ...p.cardio, [key]: val } }));

  // Save handler
  const handleSave = () => {
    const errs = validate(profile);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    console.log("[PumpPal] Profile saved:", profile);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaved(true);
    saveTimerRef.current = setTimeout(() => setSaved(false), 2500);
  };

  // Reset handler
  const handleReset = () => {
    setProfile(EMPTY_PROFILE);
    setErrors({});
    setSaved(false);
    setMemories([]);
    setNoStats(false);
    setMemoriesOn(false);
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoURL(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Video upload
  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoURL(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoURL(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Generate memory
  const handleGenerateMemory = () => {
    if (!hasStats(profile)) { setNoStats(true); return; }
    setNoStats(false);
    setMemories(prev => [generateMemory(profile), ...prev]);
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center" style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", fontWeight: 800, letterSpacing: '-0.01em' }}>
      {/* Header */}
      <div className="w-full max-w-lg mb-8 flex items-center gap-3">
        <h1 className="text-5xl font-black tracking-tight text-white">PUMPPAL</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-white mt-1">Personal Profile</p>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* ── Basic Info ─────────────────────────────────────────────────── */}
        <Section title="Basic Info">
          <Field label="Name" value={profile.name}
            onChange={v => set("name", v)} placeholder="Your name" />

          <Field label="Age" value={profile.age} type="number"
            onChange={v => set("age", v)} placeholder="25" error={errors.age} />

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Field label="Weight" value={profile.weight} type="number"
                onChange={v => set("weight", v)} placeholder="185" error={errors.weight} />
            </div>
            <UnitToggle
              options={["lbs", "kg"] as const}
              value={profile.weightUnit}
              onChange={v => set("weightUnit", v)}
            />
          </div>

          <Field label="Favorite Gym" value={profile.favoriteGym}
            onChange={v => set("favoriteGym", v)} placeholder="Gold's Gym, Venice" />
        </Section>

        {/* ── PRs ────────────────────────────────────────────────────────── */}
        <Section title="Personal Records">
          <div className="grid grid-cols-3 gap-3">
            {(["bench","squat","deadlift"] as (keyof PRs)[]).map(lift => (
              <div key={lift}>
                <Field
                  label={lift.charAt(0).toUpperCase() + lift.slice(1)}
                  value={profile.prs[lift]}
                  type="number"
                  onChange={v => setPR(lift, v)}
                  placeholder="0"
                  error={errors[lift]}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600">Values in {profile.weightUnit}</p>
        </Section>

        

        {/* ── Socials ────────────────────────────────────────────────────── */}
        <Section title="Socials">
          <Field label="Profile Link (Instagram / TikTok / other)"
            value={profile.socialLink}
            onChange={v => set("socialLink", v)}
            placeholder="https://instagram.com/yourhandle" />
        </Section>

        {/* ── Video ──────────────────────────────────────────────────────── */}
        <Section title="Highlight Reel (optional)">
          {videoURL ? (
            <div className="flex flex-col gap-2">
              <video
                src={videoURL}
                controls
                className="rounded-xl w-full max-h-52 object-cover bg-zinc-800"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="text-xs text-red-400 hover:text-red-300 self-start"
              >
                ✕ Remove video
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 border-2
                              border-dashed border-zinc-700 rounded-xl py-8 cursor-pointer
                              hover:border-orange-500 transition-colors">
              <span className="text-2xl">🎬</span>
              <span className="text-sm text-zinc-400">Upload mp4 / mov / webm</span>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={handleVideo}
              />
            </label>
          )}
        </Section>

        {/* ── Memories ───────────────────────────────────────────────────── */}
        <Section title="Memories">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Enable memories</span>
            <button
            type="button"
            onClick={() => setMemoriesOn(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
                memoriesOn ? "bg-green-500" : "bg-zinc-600"
            }`}
            >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow
                                transition-transform ${memoriesOn ? "translate-x-5 bg-black" : "translate-x-0"}`} />
            </button>
          </div>

          {memoriesOn && (
            <>
              <button
                type="button"
                onClick={handleGenerateMemory}
                className="text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                           rounded-lg px-4 py-2 text-zinc-200 transition-colors self-start"
              >
                ✨ Generate preview memory
              </button>

              {noStats && (
                <p className="text-xs text-yellow-500">Add stats to generate a memory.</p>
              )}

              {memories.length > 0 && (
                <div className="flex flex-col gap-3 mt-1">
                  {memories.map(m => (
                    <div key={m.id}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                      <p className="font-bold text-sm">{m.title}</p>
                      <p className="text-xs text-zinc-400 mb-1">{m.createdAt}</p>
                      <p className="text-sm text-zinc-200">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Section>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold
                       rounded-xl py-3 text-sm transition-colors"
          >
            Save Profile
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700
                       text-zinc-300 font-semibold rounded-xl py-3 text-sm transition-colors"
          >
            Reset
          </button>
        </div>

        {saved && (
          <p className="text-center text-sm text-green-400 animate-pulse">
            ✓ Profile saved!
          </p>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

