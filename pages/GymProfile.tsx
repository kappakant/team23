interface GymProfileData {
  profileImageUrl: string;
  name: string;
  location: string;
  features: string[];
  rating: number | null;
  topMembers: string[];
}

const EMPTY_GYM_PROFILE: GymProfileData = {
  profileImageUrl: "NA",
  name: "GYM NAME",
  location: "GYM LOCATION",
  features: [],
  rating: null,
  topMembers: ["", "", "", "", ""],
};

function StarRating({ rating }: { rating: number | null }) {
  const filled = rating ?? 0;
  const starShadow = "0 0 1px rgba(255, 255, 255, 0.3)";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className="text-xl leading-none text-zinc-300"
            style={{ textShadow: starShadow }}
            aria-hidden="true"
          >
            {index < filled ? "★" : "☆"}
          </span>
        ))}
      </div>
      <span className="text-sm text-zinc-500 font-normal">{rating ?? ""}</span>
    </div>
  );
}

export default function GymProfile() {
  const gym = EMPTY_GYM_PROFILE;

  return (
    <div
      className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center"
      style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", fontWeight: 800, letterSpacing: "-0.01em" }}
    >
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
            {gym.profileImageUrl ? (
              <img
                src={gym.profileImageUrl}
                alt="Gym profile"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          <div className="text-center w-full">
            <h1 className="text-2xl font-black text-white min-h-8">{gym.name}</h1>
            <p className="text-sm text-zinc-500 font-normal mt-0.5 min-h-5">{gym.location}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Features</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 min-h-20">
            {gym.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {gym.features.map(feature => (
                  <span
                    key={feature}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            ) : null}
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
              Ready to compete? Join this gym&apos;s competition and climb the leaderboard.
            </p>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-black bg-white text-black hover:bg-zinc-200 transition-colors whitespace-nowrap"
            >
              Join Competition
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Leaderboard</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex flex-col divide-y divide-zinc-800">
              {gym.topMembers.slice(0, 5).map((member, index) => (
                <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="text-sm font-black text-zinc-400 w-8">#{index + 1}</span>
                  <span className="text-sm text-zinc-300 font-normal flex-1">{member}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
