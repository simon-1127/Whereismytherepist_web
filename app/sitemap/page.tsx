import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";

export const metadata = {
  title: 'Sitemap',
  description: "Every page on Where's My Therapist.",
  alternates: { canonical: '/sitemap' },
};

const SECTIONS = [
  { title: "Explore", links: [["/", "Home"], ["/therapists", "Find a therapist"], ["/quiz", "Free self-check quizzes"]] },
  { title: "Your account", links: [["/login", "Sign in or create an account"], ["/profile", "Your profile"], ["/sessions", "My sessions"], ["/provider/dashboard", "Therapist dashboard"]] },
  { title: "Company", links: [["/about", "About us"], ["/careers", "Careers"], ["/contact", "Contact"], ["/for-therapists", "Join as a therapist"]] },
  { title: "Legal", links: [["/privacy", "Privacy policy"], ["/terms", "Terms of use, including the medical and AI disclaimer"]] },
];

export default function SitemapPage() {
  return (
    <>
      <PageHeader title="Sitemap" description="Every page on Where's My Therapist." />
      <main className="shell py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <section key={s.title} className="border-t-2 border-ink pt-5">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {s.links.map(([href, label]) => (
                  <li key={href}><Link href={href} className="link">{label}</Link></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
