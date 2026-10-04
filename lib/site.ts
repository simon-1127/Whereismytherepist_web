/**
 * Site-wide SEO/GEO settings. One place to change the domain, keywords and
 * search-engine verification codes.
 */

// Must match the address the site actually serves on (the one Bing and
// Google Search Console were given). Set NEXT_PUBLIC_SITE_URL at build time;
// the fallback is the www version, which is what Bing Webmaster has.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.wheresmytherapist.com").replace(/\/$/, "");
export const SITE_NAME = "Where's My Therapist";
export const TAGLINE = "Helping you find your way back to you";

export const DEFAULT_TITLE = "Online Therapy & Counselling in India | Where's My Therapist";
export const DEFAULT_DESCRIPTION =
  "Find licensed psychologists, counsellors and therapists online across India. Compare by concern, language and price, pay with UPI, and book a private video session. Support in 10 Indian languages.";

/**
 * Search-engine verification. Paste the codes here (content="…" value only):
 *   Bing Webmaster Tools → HTML Meta Tag → msvalidate.01
 *   Google Search Console → HTML tag → google-site-verification
 */
export const VERIFICATION = {
  bing: process.env.NEXT_PUBLIC_BING_VERIFICATION || "C622178E9C0C37D8232FB7FAF1FCEF13",
  google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
};

export const SOCIALS = [
  { id: "linkedin", name: "LinkedIn", handle: "Where's My Therapist", url: "https://www.linkedin.com/company/where-s-my-therapist/", blurb: "Company news, partnerships and open roles.", color: "#0A66C2" },
  { id: "x", name: "X", handle: "@WheresMyThrpist", url: "https://x.com/WheresMyThrpist", blurb: "Quick, honest takes on mental health in India.", color: "#000000" },
  { id: "facebook", name: "Facebook", handle: "Where's My Therapist", url: "https://www.facebook.com/share/1CEaLa5izs/", blurb: "Gentle reminders and updates from our community.", color: "#1877F2" },
] as const;

export const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi"];

export const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
  "Indore", "Jaipur", "Lucknow", "Bhopal", "Chandigarh", "Kochi", "Noida", "Gurgaon",
];

export const CONCERNS = [
  "Anxiety", "Depression", "Stress", "Relationships", "Couples therapy", "Family therapy",
  "Trauma and PTSD", "Grief", "Self-esteem", "Sleep problems", "Work burnout", "Exam stress",
  "Anger management", "OCD", "Panic attacks", "Loneliness",
];

/**
 * Meta keywords. Google ignores this tag, Bing and some regional engines
 * still read it lightly. The terms that matter most also appear in visible
 * copy (home page, FAQ, page titles), which is what actually ranks.
 */
export const KEYWORDS = [
  "online therapy India", "online counselling India", "therapist near me", "psychologist near me", "counsellor near me",
  "online psychologist India", "talk to a therapist online", "affordable therapy India", "low cost counselling India",
  "mental health app India", "mental health support India", "video therapy session", "RCI licensed psychologist",
  "clinical psychologist online", "online psychiatrist consultation India", "CBT therapist India",
  "anxiety therapist online", "depression counselling online", "relationship counselling online", "couples therapy India",
  "family therapy India", "stress management counselling", "trauma therapy India", "grief counselling India",
  "therapy in Hindi", "Hindi counsellor online", "therapist who speaks Tamil", "Telugu counsellor online",
  "Bengali therapist online", "Marathi counsellor online", "Kannada therapist online", "Malayalam counsellor online",
  "pay for therapy with UPI", "AI mental health companion", "mood tracker app India", "medication reminder app",
  ...CITIES.slice(0, 12).map((c) => `therapist in ${c}`),
  ...CITIES.slice(0, 8).map((c) => `online counselling ${c}`),
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "How much does online therapy cost in India?",
    a: "On Where's My Therapist, each therapist sets their own price per session and shows it upfront. Every session costs between ₹500 and ₹1,200, depending on the therapist, and you pay only for the sessions you book, with no subscription needed. The app is free for the first 3 weeks on the Starter plan (AI companion, mood check-ins, breathing exercises), then ₹299 a month, or ₹799 for Growth. You can cancel before the trial ends and pay nothing.",
  },
  {
    q: "Are the therapists licensed?",
    a: "Yes. Every therapist is a qualified mental health professional, such as an RCI-licensed clinical psychologist or a trained counselling psychologist. We check credentials and identity before a profile goes live, and each profile lists the therapist's training and licence number.",
  },
  {
    q: "Can I get therapy in Hindi or another Indian language?",
    a: "Yes. You can filter therapists by language, including Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam and Punjabi as well as English. The app itself is also available in all 10 languages.",
  },
  {
    q: "How do online therapy sessions work?",
    a: "Pick a therapist and a time, pay with UPI, card or netbanking, and join a private, encrypted video call from your browser or the app at the scheduled time. The call opens 10 minutes before your session starts.",
  },
  {
    q: "Is online therapy as effective as in-person therapy?",
    a: "For common concerns like anxiety, depression, stress and relationship difficulties, research shows video therapy works about as well as meeting in person for most people, and it is easier to keep up with because there is no travel.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Sessions are private video calls that are not recorded, your health information is never used for advertising, and only the therapists you book can see your name.",
  },
  {
    q: "What if I am in crisis right now?",
    a: "Where's My Therapist is not an emergency service. If you are in crisis or thinking about suicide, call Tele MANAS on 14416 or the KIRAN helpline on 1800-599-0019, both free and open 24/7, or go to your nearest hospital.",
  },
];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "MedicalOrganization"],
        "@id": `${SITE_URL}/#org`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo_full.png`,
        slogan: TAGLINE,
        description: DEFAULT_DESCRIPTION,
        foundingLocation: { "@type": "Place", name: "Indore, Madhya Pradesh, India" },
        areaServed: { "@type": "Country", name: "India" },
        knowsLanguage: LANGUAGES,
        medicalSpecialty: ["Psychiatric", "Counseling"],
        founder: { "@type": "Person", name: "Chitranshu Simon" },
        sameAs: SOCIALS.map((x) => x.url),
        contactPoint: [
          { "@type": "ContactPoint", contactType: "customer support", email: "support@wheresmytherapist.com", areaServed: "IN", availableLanguage: ["English", "Hindi"] },
          { "@type": "ContactPoint", contactType: "customer support", telephone: "+91-91117-76035", areaServed: "IN" },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-IN",
        publisher: { "@id": `${SITE_URL}/#org` },
      },
    ],
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** Escapes "<" so JSON-LD can't break out of its <script> tag. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
