"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "./PageHeader";
import Footer from "./Footer";

const FAQS = [
  { q: "How long does it take to hear back?", a: "Usually within a day, often much sooner. For anything urgent, message us on WhatsApp." },
  { q: "Can I request a feature or report a bug?", a: "Yes, please do. Include as much detail as you can and we'll review it with the product team." },
  { q: "Do you partner with employers or insurers?", a: "Yes. We work with employers, insurers and other health platforms. Write to us with the details." },
  { q: "How do I apply for a job?", a: "See what's open on our", link: { href: "/careers", label: "careers page" } },
  { q: "Can we partner on research or clinical studies?", a: "We're keen to support mental health research. Email us your proposal." },
];

const CHANNELS = [
  { label: "Support", value: "support@wheresmytherapist.com", href: "mailto:support@wheresmytherapist.com" },
  { label: "Partnerships and press", value: "manager@wheresmytherapist.com", href: "mailto:manager@wheresmytherapist.com" },
  { label: "WhatsApp", value: "+91 91117 76035", href: "https://wa.me/919111776035" },
];

export default function ContactPageClient() {
  const [open, setOpen] = useState<number | null>(0);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  // No backend for this form yet: it opens the visitor's email app with
  // everything filled in, so a message is never silently dropped.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:support@wheresmytherapist.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageHeader title="Talk to us" description="Questions, feedback or an idea to work on together. A real person replies, usually within a day." />

      <main className="shell space-y-16 py-16 md:space-y-24 md:py-20">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={handleSubmit} className="sheet space-y-5 p-6 md:p-10">
            <h2 className="text-3xl font-bold">Send a message</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className="field-label">Your name</label>
                <input id="c-name" required autoComplete="name" value={form.name} onChange={set("name")} className="field" />
              </div>
              <div>
                <label htmlFor="c-email" className="field-label">Email</label>
                <input id="c-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className="field" />
              </div>
            </div>
            <div>
              <label htmlFor="c-subject" className="field-label">Subject</label>
              <input id="c-subject" required value={form.subject} onChange={set("subject")} className="field" />
            </div>
            <div>
              <label htmlFor="c-message" className="field-label">Message</label>
              <textarea id="c-message" required rows={5} value={form.message} onChange={set("message")} className="field" />
            </div>
            <button type="submit" className="btn btn-primary">Open in my email app</button>
          </form>

          <div className="space-y-4">
            <div className="card p-6 md:p-8">
              <h2 className="text-2xl font-semibold">Other ways to reach us</h2>
              <dl className="mt-5 space-y-4">
                {CHANNELS.map((c) => (
                  <div key={c.label}>
                    <dt className="text-sm text-ink-3">{c.label}</dt>
                    <dd><a href={c.href} className="link text-[17px]" target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{c.value}</a></dd>
                  </div>
                ))}
                <div>
                  <dt className="text-sm text-ink-3">Where we are</dt>
                  <dd className="text-[17px]">Indore, with a team across India</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-[var(--radius-card)] bg-rose p-6 text-white md:p-8">
              <h2 className="text-2xl font-semibold">Need help right now?</h2>
              <p className="mt-2 text-white/85">If you&rsquo;re in crisis or having thoughts of suicide, please call one of these free, 24/7 lines.</p>
              <div className="mt-5 space-y-2">
                <a href="tel:14416" className="flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 font-semibold hover:bg-white/25">
                  Tele MANAS <span className="font-display text-xl">14416</span>
                </a>
                <a href="tel:18005990019" className="flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 font-semibold hover:bg-white/25">
                  KIRAN <span className="font-display text-xl">1800-599-0019</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="text-4xl font-bold md:text-5xl">Common questions</h2>
          <ul className="divide-y divide-line border-y border-line">
            {FAQS.map((f, i) => (
              <li key={f.q}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-xl font-semibold"
                >
                  {f.q}
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist-2 text-lg transition-transform ${open === i ? "rotate-45" : ""}`} aria-hidden>+</span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden">
                    <p className="pb-5 text-ink-2">
                      {f.a}
                      {f.link && <> <Link href={f.link.href} className="link">{f.link.label}</Link>.</>}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
