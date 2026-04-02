import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GymProfileData {
  id: string;
  profileImageUrl: string;
  name: string;
  location: string;
  features: string[];
  rating: number | null;
  topMembers: string[];
  lat: number;
  lng: number;
  distance?: number; // miles
  visited?: boolean;
}

interface Badge {
  id: string;
  icon: string;
  label: string;
  earned: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const GYMS: GymProfileData[] = [
  {
    id: "1",
    profileImageUrl: "",
    name: "Iron Temple",
    location: "Brooklyn, NY",
    features: ["Free Weights", "Sauna", "24/7", "Boxing"],
    rating: 4,
    topMembers: ["Alex R.", "Jordan M.", "Sam T.", "Chris P.", "Taylor W."],
    lat: 40.68,
    lng: -73.94,
    distance: 0.3,
    visited: true,
  },
  {
    id: "2",
    profileImageUrl: "",
    name: "Peak Performance",
    location: "Manhattan, NY",
    features: ["Cardio", "Yoga", "Pool", "Spinning"],
    rating: 5,
    topMembers: ["Morgan L.", "Riley K.", "Drew S.", "Quinn B.", "Avery J."],
    lat: 40.72,
    lng: -73.99,
    distance: 0.8,
    visited: false,
  },
  {
    id: "3",
    profileImageUrl: "",
    name: "Grind House",
    location: "Queens, NY",
    features: ["CrossFit", "Olympic Lifting", "Nutrition Bar"],
    rating: 3,
    topMembers: ["Casey N.", "Blake H.", "Rowan F.", "Sage D.", "Finley C."],
    lat: 40.65,
    lng: -73.88,
    distance: 1.4,
    visited: false,
  },
  {
    id: "4",
    profileImageUrl: "",
    name: "The Forge",
    location: "Hoboken, NJ",
    features: ["Powerlifting", "Kettlebells", "Personal Training"],
    rating: 4,
    topMembers: ["Hunter A.", "Skyler B.", "River C.", "Phoenix D.", "Ember E."],
    lat: 40.745,
    lng: -74.03,
    distance: 2.1,
    visited: false,
  },
];

const INITIAL_BADGES: Badge[] = [
  { id: "explorer", icon: "🗺️", label: "Explorer", earned: false },
  { id: "regular", icon: "🏅", label: "Regular", earned: false },
  { id: "globetrotter", icon: "🌍", label: "Globetrotter", earned: false },
  { id: "first_visit", icon: "⭐", label: "First Visit", earned: true },
  { id: "rated", icon: "🌟", label: "Rated", earned: true },
];

const EMPTY_GYM: GymProfileData = {
  id: "0",
  profileImageUrl: "",
  name: "GYM NAME",
  location: "GYM LOCATION",
  features: [],
  rating: null,
  topMembers: ["", "", "", "", ""],
  lat: 40.7128,
  lng: -74.006,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Project lat/lng to x/y % within our fake map bounds
const MAP_BOUNDS = { minLat: 40.62, maxLat: 40.77, minLng: -74.06, maxLng: -73.84 };

function project(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x, y };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number | null }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-lg leading-none text-zinc-300">
            {i < (rating ?? 0) ? "★" : "☆"}
          </span>
        ))}
      </div>
      <span className="text-sm text-zinc-500 font-normal">{rating ?? ""}</span>
    </div>
  );
}

function TabBar({ active, onChange }: { active: "profile" | "map"; onChange: (t: "profile" | "map") => void }) {
  return (
    <div className="flex w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-1 gap-1">
      {(["profile", "map"] as const).map(tab => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
            active === tab ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {tab === "profile" ? "Profile" : "🗺 Map"}
        </button>
      ))}
    </div>
  );
}

// ─── Gym Profile Panel ────────────────────────────────────────────────────────

function GymProfilePanel({ gym, onBack }: { gym: GymProfileData; onBack?: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      {onBack && (
        <button type="button" onClick={onBack}
          className="self-start flex items-center gap-1 text-xs font-black text-zinc-500 hover:text-white transition-colors">
          ← Back to map
        </button>
      )}

      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center">
          {gym.profileImageUrl
            ? <img src={gym.profileImageUrl} alt="Gym" className="w-full h-full object-cover" />
            : <span className="text-3xl">🏋️</span>}
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">{gym.name}</h1>
          <p className="text-sm text-zinc-500 font-normal mt-0.5">{gym.location}</p>
          {gym.distance != null && (
            <p className="text-xs text-zinc-600 font-normal mt-0.5">{gym.distance} mi away</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-white">Features</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 min-h-16">
          {gym.features.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {gym.features.map(f => (
                <span key={f} className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">{f}</span>
              ))}
            </div>
          ) : <p className="text-xs text-zinc-600">No features listed.</p>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-white">Rating</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <StarRating rating={gym.rating} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-white">Competition</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-300 font-normal leading-snug">
            Ready to compete? Join this gym's competition and climb the leaderboard.
          </p>
          <button type="button"
            className="px-4 py-2 rounded-xl text-xs font-black bg-white text-black hover:bg-zinc-200 transition-colors whitespace-nowrap">
            Join Competition
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-white">Leaderboard</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex flex-col divide-y divide-zinc-800">
            {gym.topMembers.slice(0, 5).map((member, i) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <span className="text-sm font-black text-zinc-400 w-8">#{i + 1}</span>
                <span className="text-sm text-zinc-300 font-normal flex-1">{member}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Map Tab ──────────────────────────────────────────────────────────────────

function MapTab({ onSelectGym }: { onSelectGym: (gym: GymProfileData) => void }) {
  const [points, setPoints] = useState(120);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [checkedIn, setCheckedIn] = useState<string[]>(["1"]);
  const [activePin, setActivePin] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleCheckIn = (gym: GymProfileData) => {
    if (checkedIn.includes(gym.id)) return;
    const newCheckedIn = [...checkedIn, gym.id];
    setCheckedIn(newCheckedIn);
    let earned = 0;

    setBadges(prev => prev.map(b => {
      if (b.id === "first_visit" && !b.earned) return { ...b, earned: true };
      if (b.id === "explorer" && newCheckedIn.length >= 2 && !b.earned) { earned++; return { ...b, earned: true }; }
      if (b.id === "regular" && newCheckedIn.length >= 3 && !b.earned) { earned++; return { ...b, earned: true }; }
      if (b.id === "globetrotter" && newCheckedIn.length >= 4 && !b.earned) { earned++; return { ...b, earned: true }; }
      return b;
    }));

    const pts = 50 + earned * 25;
    setPoints(p => p + pts);
    showToast(`+${pts} pts${earned ? ` · ${earned} new badge${earned > 1 ? "s" : ""}!` : ""} — checked into ${gym.name}!`);
    setActivePin(null);
  };

  const nearby = [...GYMS].sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99)).slice(0, 3);
  const userPos = project(40.705, -73.97);

  return (
    <div className="flex flex-col gap-5">

      {/* Points bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Your Points</p>
          <p className="text-2xl font-black text-white mt-0.5">{points.toLocaleString()}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {badges.map(b => (
            <div key={b.id} title={b.label}
              className={`flex flex-col items-center gap-0.5 transition-opacity ${b.earned ? "opacity-100" : "opacity-25"}`}>
              <span className="text-xl">{b.icon}</span>
              <span className="text-xs text-zinc-500 font-normal" style={{ fontSize: "0.6rem" }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-white">Gym Map</h2>
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
          style={{ height: 300 }}
          onClick={() => setActivePin(null)}>

          {/* Fake map grid */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Fake roads */}
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#3f3f46" strokeWidth="2"/>
            <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#3f3f46" strokeWidth="1.5"/>
            <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#3f3f46" strokeWidth="1.5"/>
            <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#3f3f46" strokeWidth="1"/>
            <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#3f3f46" strokeWidth="1"/>
            <line x1="50%" y1="0" x2="45%" y2="100%" stroke="#3f3f46" strokeWidth="1"/>
          </svg>

          {/* Gym pins */}
          {GYMS.map(gym => {
            const pos = project(gym.lat, gym.lng);
            const isActive = activePin === gym.id;
            const visited = checkedIn.includes(gym.id);
            return (
              <div key={gym.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-100%)", position: "absolute", zIndex: isActive ? 20 : 10 }}
                onClick={e => { e.stopPropagation(); setActivePin(isActive ? null : gym.id); }}>

                {/* Pin */}
                <div className={`flex flex-col items-center cursor-pointer group`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black shadow-lg transition-transform group-hover:scale-110 ${
                    visited ? "bg-white border-white text-black" : "bg-zinc-800 border-zinc-500 text-white"
                  } ${isActive ? "scale-125" : ""}`}>
                    🏋️
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-0.5 ${visited ? "bg-white" : "bg-zinc-500"}`} />
                </div>

                {/* Popup */}
                {isActive && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 rounded-xl p-3 w-44 shadow-xl"
                    onClick={e => e.stopPropagation()}>
                    <p className="text-xs font-black text-white truncate">{gym.name}</p>
                    <p className="text-xs text-zinc-500 font-normal">{gym.distance} mi · {gym.location}</p>
                    <StarRating rating={gym.rating} />
                    <div className="flex gap-1.5 mt-2">
                      <button type="button" onClick={() => onSelectGym(gym)}
                        className="flex-1 py-1 rounded-lg text-xs font-black bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
                        View
                      </button>
                      <button type="button" onClick={() => handleCheckIn(gym)}
                        disabled={checkedIn.includes(gym.id)}
                        className={`flex-1 py-1 rounded-lg text-xs font-black transition-colors ${
                          checkedIn.includes(gym.id)
                            ? "bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed"
                            : "bg-white text-black hover:bg-zinc-200"
                        }`}>
                        {checkedIn.includes(gym.id) ? "✓ Done" : "Check In"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* User dot */}
          <div style={{ left: `${userPos.x}%`, top: `${userPos.y}%`, transform: "translate(-50%,-50%)", position: "absolute", zIndex: 30 }}>
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping" />
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white border border-white" />
              <span className="text-xs text-zinc-400 font-normal">Visited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-500" />
              <span className="text-xs text-zinc-400 font-normal">Unvisited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500 border border-white" />
              <span className="text-xs text-zinc-400 font-normal">You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby suggestions */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-white">Suggested Nearby</h2>
        <div className="flex flex-col gap-2">
          {nearby.map(gym => {
            const visited = checkedIn.includes(gym.id);
            return (
              <div key={gym.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg flex-shrink-0">
                  🏋️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{gym.name}</p>
                  <p className="text-xs text-zinc-500 font-normal">{gym.distance} mi · {gym.location}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {gym.features.slice(0, 2).map(f => (
                      <span key={f} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full font-normal">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button type="button" onClick={() => onSelectGym(gym)}
                    className="px-3 py-1 rounded-lg text-xs font-black bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
                    View
                  </button>
                  <button type="button" onClick={() => { setActivePin(gym.id); handleCheckIn(gym); }}
                    disabled={visited}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                      visited
                        ? "bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}>
                    {visited ? "✓ Visited" : "+50 pts"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-black px-5 py-3 rounded-2xl shadow-xl z-50 animate-bounce">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GymProfile() {
  const [tab, setTab] = useState<"profile" | "map">("profile");
  const [selectedGym, setSelectedGym] = useState<GymProfileData | null>(null);

  const handleSelectGym = (gym: GymProfileData) => {
    setSelectedGym(gym);
    setTab("profile");
  };

  const gym = selectedGym ?? EMPTY_GYM;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center"
      style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", fontWeight: 800, letterSpacing: "-0.01em" }}>
      <div className="w-full max-w-lg flex flex-col gap-5">

        {/* App header */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-5xl font-black tracking-tight">PUMPPAL</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Gym Explorer</p>
        </div>

        <TabBar active={tab} onChange={t => { setTab(t); if (t === "map") setSelectedGym(null); }} />

        {tab === "profile" ? (
          <GymProfilePanel gym={gym} onBack={selectedGym ? () => { setSelectedGym(null); setTab("map"); } : undefined} />
        ) : (
          <MapTab onSelectGym={handleSelectGym} />
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}