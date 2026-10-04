import Icon from "./icons/Icon";

const FEATURES = [
  { icon: "sparkles", title: "AI companion", desc: "Think out loud any time between sessions, with a companion you name yourself." },
  { icon: "users", title: "Licensed therapists", desc: "Real video sessions with vetted, licensed mental health professionals." },
  { icon: "book-open", title: "Journal and mood tracking", desc: "Log how you feel, spot patterns and get simple wellness insights." },
  { icon: "heart", title: "Guided breathing", desc: "Short exercises for the moments you need to reset." },
  { icon: "plus-circle", title: "MediTrack", desc: "Medication reminders, so a dose doesn't get missed." },
  { icon: "clock", title: "Session reminders", desc: "A nudge before every appointment." },
] as const;

const LANGUAGES = ["English", "हिन्दी", "தமிழ்", "తెలుగు", "বাংলা", "मराठी", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ਪੰਜਾਬੀ"];

// TODO: real store URLs once the listings are live.
const APP_STORE_URL = "#";
const PLAY_STORE_URL = "#";
const PROVIDER_APPLY_URL = "/for-therapists";

export default function AboutAppSection() {
  return (
    <div className="shell">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <div data-reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15">
            <img src="/favicon.png" alt="" className="h-5 w-5 rounded-full bg-white object-contain" />
            The Where&rsquo;s My Therapist app
          </span>
          <h2 className="mt-6 text-[2.6rem] font-bold leading-[1.05] md:text-6xl">
            Support between sessions, in the language you think in
          </h2>
          <p className="mt-5 max-w-md text-lg text-white/75">
            Therapy is an hour a week. The app is there for the rest of it: an AI companion, journaling, breathing and
            reminders, all in 10 Indian languages.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2" aria-label="Languages">
            {LANGUAGES.map((l) => (
              <li key={l} className="rounded-full bg-white/10 px-3.5 py-1.5 text-[15px] font-medium ring-1 ring-white/10">{l}</li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={APP_STORE_URL} className="btn bg-white text-ink hover:bg-lilac">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.02.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              App Store
            </a>
            <a href={PLAY_STORE_URL} className="btn bg-white text-ink hover:bg-lilac">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3.6 2.4c-.35.36-.55.9-.55 1.6v16c0 .7.2 1.24.55 1.6l.1.09L13 12.1v-.2L3.7 2.31l-.1.09z" /><path d="M16.2 15.3l-3.2-3.2v-.2l3.2-3.2 3.62 2.06c1.03.59 1.03 1.55 0 2.14l-3.62 2.4z" /><path d="M13 12.1L3.7 21.6c.36.38.97.43 1.65.05l10.85-6.17-3.2-3.38z" /><path d="M13 11.9l3.2-3.38L5.35 2.35c-.68-.38-1.29-.32-1.65.06L13 11.9z" /></svg>
              Google Play
            </a>
          </div>
          <p className="mt-6 text-[15px] text-white/60">
            Are you a therapist? <a href={PROVIDER_APPLY_URL} className="font-semibold text-white underline underline-offset-4">Apply to join</a>
          </p>
        </div>

        <ul data-reveal-group className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-[var(--radius-card)] bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#00b8bc,#0077c6_45%,#ff5266)] text-white">
                <Icon name={f.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-white/70">{f.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
