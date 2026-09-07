"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"client" | "provider" | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        setRole(profile?.role || null);
      }
      setRoleLoaded(true);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        setRole(profile?.role || null);
      } else {
        setRole(null);
      }
      setRoleLoaded(true);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

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
        { href: "/provider/profile", label: "My Profile" },
      ]
    : [
        { href: "/therapists", label: "Therapists" },
        ...(user ? [{ href: "/sessions", label: "My Bookings" }] : []),
        ...(user ? [{ href: "/profile", label: "My Profile" }] : []),
      ];

  const homeHref = isProvider ? "/provider/dashboard" : "/";

  return (
    <>
      <nav className="flex items-center justify-between px-5 md:px-8 py-4 bg-white shadow-sm border-b border-slate-100 relative z-40">
        <div className="flex items-center gap-3">
          <Link href={homeHref}>
            <img src="/logo.png" alt="Where's My Therapist Logo" className="h-8 md:h-10" />
          </Link>
          {roleLoaded && isProvider && (
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
              Provider
            </span>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-blue-600 transition-colors">
              {link.label}
            </Link>
          ))}
          {!isProvider && (
            <>
              <a href="#" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">Therapy <span className="text-[10px] text-slate-400">▼</span></a>
              <a href="#" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">Online <span className="text-[10px] text-slate-400">▼</span></a>
              <a href="#" className="hover:text-blue-600 transition-colors">Resources</a>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-[#1E1B4B]">{isProvider ? "Provider Account" : "My Account"}</span>
                <span className="text-[10px] text-slate-500">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block bg-gradient-to-r from-blue-700 to-pink-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </nav>

      {/* MOBILE SLIDE-OUT MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 md:hidden transition-opacity" onClick={() => setIsMenuOpen(false)} />
      )}

      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-5 flex justify-end">
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="flex flex-col gap-6 px-6 text-lg font-medium text-slate-700">
          {user && <span className="text-sm text-slate-400 border-b border-slate-100 pb-2 truncate">{user.email}{isProvider ? " · Provider" : ""}</span>}
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 border-b border-slate-100 pb-3">
              {link.label}
            </Link>
          ))}
          {!isProvider && (
            <>
              <a href="#" className="hover:text-blue-600 border-b border-slate-100 pb-3">Therapy</a>
              <a href="#" className="hover:text-blue-600 border-b border-slate-100 pb-3">Online</a>
            </>
          )}
          {user ? (
            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="mt-4 border border-red-200 text-red-600 px-6 py-3 rounded-full text-base font-semibold w-full text-center">
              Logout
            </button>
          ) : (
            <Link href="/login" className="mt-4 bg-gradient-to-r from-blue-700 to-pink-500 text-white px-6 py-3 rounded-full text-base font-semibold w-full text-center">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
