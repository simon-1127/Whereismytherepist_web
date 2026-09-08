import "./globals.css";
import Navbar from "../components/Navbar";
import { createClient } from "../lib/supabase/server";

export const metadata = {
  title: "WheresMyTherapist",
  description: "Find the right therapist for where you are in life.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

// Navbar lives here — ONCE — instead of being rendered by every individual
// page. Next.js App Router keeps this layout (and the client Navbar mounted
// inside it) alive across client-side navigations between pages, so the
// role/user state fetched below only needs to happen on a full page load,
// never on every link click. This is what fixes the bug where the nav would
// flash/revert to the default menu on every navigation while it re-fetched
// role from scratch.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "client" | "provider" | null = null;
  if (user) {
    const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
    role = (userRow?.role as "client" | "provider") || null;
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar initialUser={user} initialRole={role} />
        {children}
      </body>
    </html>
  );
}
