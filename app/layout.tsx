import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Navbar from "../components/Navbar";
import CookieConsent from "../components/CookieConsent";
import ScrollReveal from "../components/ScrollReveal";
import { createClient } from "../lib/supabase/server";
import { consentBootstrapScript } from "../lib/consent";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  KEYWORDS,
  SITE_NAME,
  SITE_URL,
  VERIFICATION,
  jsonLd,
  organizationJsonLd,
} from "../lib/site";

const GOOGLE_TAG_ID = "G-7YGYQEECPC";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "health",
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/logo_full.png", width: 1024, height: 1024, alt: "Where's My Therapist logo" }],
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: ["/logo_full.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: {
    ...(VERIFICATION.google ? { google: VERIFICATION.google } : {}),
    ...(VERIFICATION.bing ? { other: { "msvalidate.01": VERIFICATION.bing } } : {}),
  },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "content-language": "en-IN",
  },
};

export const viewport: Viewport = { themeColor: "#522cad" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "client" | "provider" | null = null;
  let name: string | null = null;
  if (user) {
    const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single();
    role = (userRow?.role as "client" | "provider") || null;
    // For the round profile icon's letter.
    const { data: prof } = await supabase
      .from(role === "provider" ? "provider_profiles" : "client_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    name = prof?.full_name || null;
  }

  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organizationJsonLd())} />
      </head>
      <body className="min-h-screen antialiased">
        {/* Consent Mode v2: everything denied until the visitor chooses. */}
        <Script id="google-consent" strategy="beforeInteractive">
          {consentBootstrapScript(GOOGLE_TAG_ID)}
        </Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} strategy="afterInteractive" />
        <Navbar initialUser={user ? { id: user.id, email: user.email ?? null, name } : null} initialRole={role} />
        <div className="flex min-h-[calc(100vh-75px)] flex-col">{children}</div>
        <CookieConsent />
        <ScrollReveal />
      </body>
    </html>
  );
}
