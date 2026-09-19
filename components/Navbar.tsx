"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type Role = "client" | "provider" | null;

export default function Navbar({
  initialUser = null,
  initialRole = null,
}: {
  initialUser?: any;
  initialRole?: Role;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(initialUser);
  const [role, setRole] = useState<Role>(initialRole);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Navbar now lives once in the root layout (see app/layout.tsx) instead of
  // being rendered separately on every page, so this effect only runs ONCE
  // per full page load — not on every client-side navigation. Combined with
  // seeding state from server-fetched props above, this eliminates the old
  // bug where the nav would flash/revert to the default (client) menu on
  // every navigation while role was refetched from scratch.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        setRole(profile?.role || null);
      } else {
        setRole(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tiny bit of scroll-awareness so the bar reads as "floating glass" over
  // the hero and settles into a crisper, more opaque bar once content is
  // scrolling underneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isProvider = role === "provider";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Provider accounts are a completely separate section of the site — no
  // "Therapists" browsing, no client booking nav, nothing crossed over.
  // There is intentionally no "become a provider" link anywhere: provider
  // accounts are provisioned by an admin directly in the database (see
  // sql/002_lock_provider_writes_to_role.sql), never through the app.
  const navLinks = isProvider
    ? [
        { href: "/provider/dashboard", label: "Dashboard" },
        { href: "/provider/bookings", label: "Bookings" },
        { href: "/provider/availability", label: "Availability" },
        { href: "/provider/profile", label: "My Profile" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/therapists", label: "Therapists" },
        ...(user ? [{ href: "/sessions", label: "My Bookings" }] : []),
        ...(user ? [{ href: "/profile", label: "My Profile" }] : []),
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
      ];

  const homeHref = isProvider ? "/provider/dashboard" : "/";

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <>
      <nav
        className={`sticky top-0 z-40 flex items-center justify-between px-5 md:px-8 transition-all duration-300 relative ${
          scrolled
            ? "py-3 bg-white/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(30,27,75,0.18)]"
            : "py-5 bg-gradient-to-b from-white/80 via-white/60 to-white/40 backdrop-blur-sm"
        } border-b border-slate-100`}
      >
        {/* Signature brand hairline — a quiet constant across every page */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-400 to-pink-500 opacity-70" />
        <div className="flex items-center gap-3">
          <Link href={homeHref} className="group relative flex items-center gap-3">
            <span aria-hidden className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-400/0 via-indigo-400/0 to-pink-400/0 blur-lg transition-all duration-300 group-hover:from-blue-400/20 group-hover:via-indigo-400/20 group-hover:to-pink-400/20" />
            <img
              src="/logo.png"
              alt="Where's My Therapist Logo"
              className="relative h-8 md:h-10 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-2"
            />
          </Link>
          {isProvider && (
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
              Provider
            </span>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-700">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative px-3.5 py-2 rounded-full transition-colors duration-200 ${
                isActive(link.href) ? "text-[#1E1B4B]" : "hover:text-blue-600"
              }`}
            >
              {isActive(link.href) && (
                <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-pink-500/10 border border-indigo-100" />
              )}
              <span className="relative inline-flex items-center gap-1.5">
                {isActive(link.href) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-pink-500" />
                )}
                {link.label}
                {!isActive(link.href) && (
                  <span className="pointer-events-none absolute left-0 -bottom-1.5 h-[2px] w-0 rounded-full bg-gradient-to-r from-blue-600 to-pink-500 transition-all duration-300 ease-out group-hover:w-full" />
                )}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-[#1E1B4B]">{isProvider ? "Provider Account" : "My Account"}</span>
                <span className="text-[10px] text-slate-500">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-full transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-sm active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex items-center bg-gradient-to-r from-blue-700 to-pink-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 text-slate-600 rounded-full transition-colors hover:bg-slate-100 active:scale-90"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </nav>

      {/* MOBILE SLIDE-OUT MENU */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden animate-[fade-in_0.2s_ease-out]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div aria-hidden className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-400 to-pink-500" />
        <div className="p-5 flex justify-end">
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-500 rounded-full transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="flex flex-col gap-6 px-6 text-lg font-medium text-slate-700">
          {user && <span className="text-sm text-slate-400 border-b border-slate-100 pb-2 truncate">{user.email}{isProvider ? " · Provider" : ""}</span>}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`border-b border-slate-100 pb-3 transition-colors ${isActive(link.href) ? "text-blue-600" : "hover:text-blue-600"}`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="mt-4 border border-red-200 text-red-600 px-6 py-3 rounded-full text-base font-semibold w-full text-center transition-transform active:scale-95">
              Logout
            </button>
          ) : (
            <Link href="/login" className="mt-4 bg-gradient-to-r from-blue-700 to-pink-500 text-white px-6 py-3 rounded-full text-base font-semibold w-full text-center transition-transform active:scale-95">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
