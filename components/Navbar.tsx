"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type Role = "client" | "provider" | null;
type NavUser = { id: string; email: string | null; name?: string | null } | null;

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Navbar({
  initialUser = null,
  initialRole = null,
}: {
  initialUser?: NavUser;
  initialRole?: Role;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<NavUser>(initialUser);
  const [role, setRole] = useState<Role>(initialRole);
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const userIdRef = useRef<string | null>(initialUser?.id ?? null);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  // Server props win after every navigation (router.refresh, sign-in).
  useEffect(() => {
    setUser(initialUser);
    setRole(initialRole);
    userIdRef.current = initialUser?.id ?? null;
  }, [initialUser?.id, initialUser?.name, initialRole]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const nextId = session?.user?.id ?? null;
      // TOKEN_REFRESHED fires every hour with the same user; skip it.
      if (nextId === userIdRef.current) return;
      userIdRef.current = nextId;
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
      if (!nextId) {
        setRole(null);
        return;
      }
      supabase
        .from("users")
        .select("role")
        .eq("id", nextId)
        .single()
        .then(({ data: row }) => setRole((row?.role as Role) || null));
      if (event === "SIGNED_IN") router.refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  // Shrinks once you scroll; slides away while scrolling down and comes
  // back as soon as you scroll up.
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 12);
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 220);
          last = y;
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isProvider = role === "provider";

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  const links = isProvider
    ? [
        { href: "/provider/dashboard", label: "Dashboard" },
        { href: "/provider/bookings", label: "Sessions" },
        { href: "/provider/availability", label: "Availability" },
      ]
    : [
        { href: "/therapists", label: "Find a therapist" },
        ...(user ? [{ href: "/sessions", label: "My sessions" }] : []),
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ];

  const homeHref = isProvider ? "/provider/dashboard" : "/";
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  const accountHref = isProvider ? "/provider/profile" : "/profile";
  const displayName = user?.name || user?.email || "";
  const letter = (displayName.trim()[0] || "?").toUpperCase();

  // ---- Sliding indicator: sits under the current page, follows the hover ----
  const linksRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number; show: boolean }>({ left: 0, width: 0, show: false });

  const moveTo = useCallback((el: HTMLElement | null) => {
    if (!el || !linksRef.current) return setBar((b) => ({ ...b, show: false }));
    const host = linksRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setBar({ left: r.left - host.left + 14, width: r.width - 28, show: true });
  }, []);

  const resetBar = useCallback(() => {
    moveTo(linksRef.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null);
  }, [moveTo]);

  useIsoLayoutEffect(() => {
    resetBar();
  }, [pathname, links.length, resetBar]);

  useEffect(() => {
    const onResize = () => resetBar();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(resetBar).catch(() => undefined);
    return () => window.removeEventListener("resize", onResize);
  }, [resetBar]);

  const accountActive = isActive(accountHref);
  // On the home page the bar starts see-through over the hero, then turns
  // solid once you scroll.
  const overHero = pathname === "/" && !scrolled && !menuOpen;

  return (
    <>
      <header
        className={`nav-enter sticky top-0 z-40 border-b transition-[transform,background-color,box-shadow,border-color] duration-300 ease-out ${
          overHero
            ? "border-transparent bg-transparent"
            : scrolled
              ? "border-line bg-white/90 shadow-[0_8px_30px_-20px_rgb(82_44_173/0.4)] backdrop-blur-xl"
              : "border-transparent bg-white/80 backdrop-blur-xl"
        } ${hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"}`}
      >
        {/* Logo gradient hairline */}
        <div aria-hidden className="h-[3px] bg-[linear-gradient(90deg,#00b8bc,#0077c6,#522cad,#ff5266,#00b8bc)] bg-[length:200%_100%] animate-[hairline_10s_linear_infinite]" />
        <nav
          aria-label="Main"
          className={`shell flex items-center gap-6 transition-[height] duration-300 ease-out ${scrolled ? "h-[62px]" : "h-[74px]"}`}
        >
          <Link href={homeHref} className="group flex shrink-0 items-center gap-2.5" aria-label="Where's My Therapist home">
            <img
              src="/favicon.png"
              alt=""
              className={`object-contain transition-[transform,width,height] duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 ${
                scrolled ? "h-9 w-9" : "h-11 w-11"
              }`}
            />
            <span className="hidden leading-none sm:block">
              <span className="block font-display text-[19px] font-bold tracking-tight text-ink">wheres</span>
              <span className="text-brand block font-display text-[17px] font-semibold tracking-tight transition-[letter-spacing] duration-300 group-hover:tracking-normal">
                my therapist
              </span>
            </span>
          </Link>
          {isProvider && (
            <span className="hidden rounded-full bg-lilac px-2.5 py-1 text-xs font-semibold text-brand-violet lg:inline">
              Therapist account
            </span>
          )}

          <div ref={linksRef} onMouseLeave={resetBar} className="relative ml-auto hidden h-full items-stretch md:flex">
            {links.map((l) => {
              const on = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? "page" : undefined}
                  onMouseEnter={(e) => moveTo(e.currentTarget)}
                  onFocus={(e) => moveTo(e.currentTarget)}
                  onBlur={resetBar}
                  className={`relative flex items-center px-3.5 text-[15px] transition-[color,transform] duration-200 hover:-translate-y-px ${
                    on ? "font-semibold text-ink" : "font-medium text-ink-2 hover:text-brand-violet"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {/* One indicator that glides between links */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 h-[3px] rounded-t-full bg-[linear-gradient(90deg,#00b8bc,#0077c6,#522cad)] transition-[left,width,opacity] duration-300 ease-[cubic-bezier(.2,.7,.2,1)]"
              style={{ left: bar.left, width: bar.width, opacity: bar.show ? 1 : 0 }}
            />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            {user ? (
              <div className="hidden items-center gap-3 md:flex">
                <span aria-hidden className="h-6 w-px bg-line" />
                <Link
                  href={accountHref}
                  aria-label={`Your profile${user.name ? ` (${user.name})` : ""}`}
                  title={displayName}
                  aria-current={accountActive ? "page" : undefined}
                  className="group relative grid h-10 w-10 place-items-center rounded-full"
                >
                  {/* Gradient ring that brightens and turns on hover / when on the profile page */}
                  <span
                    aria-hidden
                    className={`absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,#00b8bc,#0077c6,#522cad,#ff5266,#00b8bc)] transition-[opacity,transform] duration-500 group-hover:rotate-180 ${
                      accountActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                  <span className="relative grid h-10 w-10 place-items-center rounded-full bg-brand font-display text-base font-semibold text-white ring-2 ring-white transition-transform duration-300 group-hover:scale-95">
                    {letter}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="text-sm font-semibold text-ink-3 transition-colors hover:text-rose disabled:opacity-50"
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <span aria-hidden className="mr-2 h-6 w-px bg-line" />
                <Link href="/login" className="px-3 text-[15px] font-semibold text-ink-2 transition-colors hover:text-brand-violet">
                  Sign in
                </Link>
                <Link href="/login?mode=signup" className="btn btn-primary btn-sm btn-shine hover:-translate-y-0.5">
                  Get started
                </Link>
              </div>
            )}

            {user && (
              <Link
                href={accountHref}
                aria-label="Your profile"
                className="grid h-10 w-10 place-items-center rounded-full bg-brand font-display text-base font-semibold text-white md:hidden"
              >
                {letter}
              </Link>
            )}
            <button
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink transition-transform active:scale-90 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile: bottom sheet, reachable with a thumb; links slide in one by one */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-[fade-in_.2s_ease-out]"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[var(--radius-sheet)] bg-paper px-5 pb-8 pt-3 animate-[sheet-up_.32s_cubic-bezier(.2,.8,.2,1)]">
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-line" />
            {user && (
              <div className="mb-4 flex items-center gap-3 px-1">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand font-display text-lg font-semibold text-white">{letter}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name || "Your account"}</p>
                  <p className="truncate text-sm text-ink-3">
                    {user.email}
                    {isProvider ? " (therapist)" : ""}
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-col">
              {[{ href: homeHref, label: "Home" }, ...links, ...(user ? [{ href: accountHref, label: "Profile" }] : [])].map((l, i) => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  style={{ animation: `item-in .4s ${80 + i * 45}ms cubic-bezier(.2,.7,.2,1) both` }}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-xl font-semibold transition-colors ${
                    isActive(l.href) && l.href !== "/" ? "bg-lilac text-brand-violet" : "text-ink-2 active:bg-mist"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-5" style={{ animation: "item-in .4s 320ms cubic-bezier(.2,.7,.2,1) both" }}>
              {user ? (
                <button onClick={handleLogout} disabled={signingOut} className="btn btn-quiet w-full">
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              ) : (
                <Link href="/login" className="btn btn-primary w-full">
                  Sign in or create account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
