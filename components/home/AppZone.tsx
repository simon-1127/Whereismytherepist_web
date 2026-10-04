import ContourMap from "./ContourMap";

/**
 * Full-bleed "the app" band: everything about the app (features,
 * comparison, plans) sits on one deep navy → violet canvas so it reads as
 * its own chapter, distinct from the light "find a therapist" part above.
 */
export default function AppZone({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-label="The Where's My Therapist app"
      className="relative isolate overflow-hidden rounded-t-[48px] bg-[linear-gradient(160deg,#0d0c3a_0%,#1b1660_38%,#3b228f_72%,#522cad_100%)] pb-20 pt-20 text-white md:rounded-t-[72px] md:pb-28 md:pt-28"
    >
      {/* Soft brand light + faint contours, behind the content */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-10 -z-10 h-[38rem] w-[38rem] rounded-full bg-[#00b8bc]/20 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-[40%] -z-10 h-[34rem] w-[34rem] rounded-full bg-[#ff5266]/20 blur-[120px]" />
      <ContourMap className="pointer-events-none absolute -right-48 -top-24 -z-10 h-[900px] w-[900px] opacity-25" />
      <div className="space-y-24 md:space-y-32">{children}</div>
    </section>
  );
}
