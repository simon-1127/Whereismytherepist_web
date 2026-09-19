"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  // Mandatory: accepting the Terms/Privacy Policy — this is the only thing
  // allowed to gate account creation (see TCPA note below).
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Optional: consent to be texted/WhatsApp'd/emailed reminders at the phone
  // number above. This must NEVER block signup — TCPA requires that use of
  // the service not be conditioned on consenting to receive text messages,
  // and Twilio's own carrier-facing mockup shows this as a separate
  // "OPTIONAL" checkbox from the Terms acceptance. Keep these two concerns
  // (account creation vs. SMS opt-in) fully independent.
  const [smsConsent, setSmsConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    if (isSignUp && !termsAccepted) {
      setErrorMsg("Please accept the Terms of Service to continue.");
      return;
    }

    const params = new URLSearchParams();
    if (isSignUp) {
      params.set('terms', '1');
      if (smsConsent) {
        params.set('consent', '1');
        if (phone.trim()) params.set('phone', phone.trim());
      }
    }
    const qs = params.toString();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This tells Supabase to send them to our new route.ts file after Google approves them
        redirectTo: `${window.location.origin}/auth/callback${qs ? `?${qs}` : ''}`,
      }
    });
    if (error) setErrorMsg(error.message);
  };

  const routeUserByRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      router.refresh(); // Clear the cache
      
      if (profile?.role === 'provider') {
        router.push('/provider/dashboard');
      } else {
        router.push('/therapists');
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (isSignUp && !termsAccepted) {
      setErrorMsg("Please accept the Terms of Service to continue.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              terms_accepted: true,
              terms_accepted_at: new Date().toISOString(),
              // SMS/WhatsApp/Email marketing consent is genuinely optional —
              // only stamped when the user actually checked the box.
              comms_consent: smsConsent,
              comms_consent_at: smsConsent ? new Date().toISOString() : null,
              phone: smsConsent && phone.trim() ? phone.trim() : null,
            },
          },
        });
        if (error) throw error;
        await routeUserByRole();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await routeUserByRole();
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-pink-200/40 to-rose-100/30 blur-3xl" />

      <div className="enter sm:mx-auto sm:w-full sm:max-w-md relative">
        <Link href="/" className="group inline-block w-full">
          <img src="/logo.png" alt="Where's My Therapist" className="mx-auto h-12 w-auto transition-transform duration-300 group-hover:scale-105" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1E1B4B]">
          {isSignUp ? "Create an account" : "Sign in to your account"}
        </h2>
      </div>

      <div className="enter mt-8 sm:mx-auto sm:w-full sm:max-w-md relative" style={{ animationDelay: "100ms" }}>
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-100 sm:rounded-3xl sm:px-10">

          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100 mb-6 animate-[fade-up_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
              {errorMsg}
            </div>
          )}

          {/* Mandatory: Terms of Service + Privacy Policy — gates account creation */}
          {isSignUp && (
            <div className="mb-5">
              <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I accept the{" "}
                  <Link href="/terms" target="_blank" className="text-blue-700 underline hover:text-blue-900">Terms of Service</Link>
                  {" "}and have read the{" "}
                  <Link href="/privacy" target="_blank" className="text-blue-700 underline hover:text-blue-900">Privacy Policy</Link>.
                </span>
              </label>
            </div>
          )}

          {/* GOOGLE AUTH BUTTON */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSignUp && !termsAccepted}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white transition-all duration-200 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 transition-all duration-200 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 transition-all duration-200 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            {/* Phone Number — optional, only relevant if they want SMS/WhatsApp reminders below */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="mt-1">
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For appointment reminders via SMS/WhatsApp" className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 transition-all duration-200 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
            )}

            {/* Optional: SMS/WhatsApp/Email marketing consent — CTIA-compliant
                verbiage. This intentionally never disables a button; it's a
                pure opt-in that doesn't gate anything. */}
            {isSignUp && (
              <div>
                <label className="flex items-start gap-3 text-xs leading-relaxed text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span>
                    <span className="font-semibold text-slate-600">OPTIONAL:</span> I&rsquo;d like to receive appointment
                    reminders, updates, and support messages from Where&rsquo;s My Therapist via WhatsApp/SMS/Email at
                    the phone number provided. Message frequency varies. Message and data rates may apply. Reply HELP
                    for help or STOP to opt out. See our{" "}
                    <Link href="/terms" target="_blank" className="text-blue-700 underline hover:text-blue-900">Mobile Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" target="_blank" className="text-blue-700 underline hover:text-blue-900">Privacy Policy</Link>.
                  </span>
                </label>
              </div>
            )}

            <div>
              <button type="submit" disabled={loading || (isSignUp && !termsAccepted)} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-pink-500 transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm">
                {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-blue-600 hover:text-blue-500 transition-colors underline-offset-2 hover:underline">
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
