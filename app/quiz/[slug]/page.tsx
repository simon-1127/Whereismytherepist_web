import { notFound } from "next/navigation";
import Footer from "../../../components/Footer";
import QuizRunner from "../../../components/quiz/QuizRunner";
import { CONCERN_QUIZZES, QUIZ_BY_SLUG } from "../../../lib/quiz";
import { jsonLd, SITE_URL } from "../../../lib/site";

export function generateStaticParams() {
  return CONCERN_QUIZZES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = QUIZ_BY_SLUG[slug];
  if (!c) return {};
  return {
    title: `${c.title} Self-Check: Free 20-Question Quiz`,
    description: `${c.intro} A free, private ${c.title.toLowerCase()} self-check with an AI summary of possible causes, things to try and how counselling can help. No sign-up.`,
    alternates: { canonical: `/quiz/${c.slug}` },
  };
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concern = QUIZ_BY_SLUG[slug];
  if (!concern) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Quiz",
          name: `${concern.title} self-check`,
          url: `${SITE_URL}/quiz/${concern.slug}`,
          about: { "@type": "MedicalCondition", name: concern.title },
          educationalUse: "self-assessment",
          isAccessibleForFree: true,
          inLanguage: "en-IN",
          publisher: { "@id": `${SITE_URL}/#org` },
        })}
      />
      <main className="relative isolate flex-1 overflow-clip">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#eef9fb_0%,#f3f0ff_45%,#f5f7fc_100%)]" />
        <div aria-hidden className="absolute -left-40 -top-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#00b8bc]/20 blur-[110px]" />
        <div aria-hidden className="absolute -right-40 top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#522cad]/15 blur-[120px]" />
        <div className="shell py-10 md:py-16">
          <QuizRunner concern={concern} />
        </div>
      </main>
      <Footer />
    </>
  );
}
