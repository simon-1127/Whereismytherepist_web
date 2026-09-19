import "./globals.css";
import Navbar from "../components/Navbar";
import { createClient } from "../lib/supabase/server";

export const metadata = {
  title: {
    default: "Where's My Therapist",
    template: "%s — Where's My Therapist",
  },
  description: "Find the right therapist for where you are in life.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

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
