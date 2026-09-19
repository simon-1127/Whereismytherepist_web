"use client";

import { useState } from "react";
import PageHeader from "./PageHeader";
import Footer from "./Footer";
import Reveal from "./Reveal";
import Link from "next/link";

const FAQS = [
  {
    q: "How long does it take to hear back?",
    a: "We aim to respond to all inquiries within 24 hours, usually much faster. For urgent matters, please reach out over WhatsApp.",
  },
  {
    q: "Can I request a feature or report a bug?",
    a: "Absolutely! We love hearing from users. Please include as much detail as possible, and we'll review it with the product team.",
  },
  {
    q: "Do you offer partnerships or integrations?",
    a: "Yes! We're open to strategic partnerships with employers, insurers, and other health platforms. Reach out with details.",
  },
  {
    q: "How do I apply for a job?",
    a: "Head over to our Careers page to see open roles and apply directly.",
    link: { href: "/careers", label: "Careers page" },
  },
  {
    q: "Can I partner for research or clinical studies?",
    a: "We're very interested in advancing mental health research. Please email us with your proposal.",
  },
];

const inputClasses =
  "w-full px-4 py-3 border border-slate-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400";

export default function ContactPageClient() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // NOTE: this form is currently front-end only (no email/backend wired up
    // yet) — it shows a confirmation, but nothing is actually sent anywhere.
    // Wire this to a real endpoint (e.g. an email service or a Supabase
    // table + notification) before relying on it in production.
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      (e.target as HTMLFormElement).reset();
    }, 4000);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <PageHeader
        title="Let's"
        highlight="talk"
        description="Have questions, feedback, or want to collaborate? We're here to listen — we get back to you within 24 hours."
      />

      <Reveal className="max-w-5xl mx-auto px-5 md:px-8 py-14 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-[#1E1B4B] mb-6">Send us a message</h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-[fade-up_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
                <p className="text-2xl mb-2">✓</p>
                <p className="font-bold text-emerald-800 mb-1">Message sent!</p>
                <p className="text-sm text-emerald-700">Thanks for reaching out. We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Full Name</label>
                  <input required type="text" className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Email Address</label>
                  <input required type="email" className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Phone Number</label>
                  <input required type="tel" className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Subject</label>
                  <input required type="text" className={inputClasses} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Message</label>
                  <textarea required rows={4} className={inputClasses} />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-700 to-pink-500 text-white py-3.5 rounded-xl font-bold transition-all duration-300 hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  Send Message →
                </button>
                <p className="text-xs text-slate-400 text-center">We'll get back to you within 24 hours.</p>
              </form>
            )}
          </div>

          {/* Info */}
          <div>
            <h2 className="text-xl font-extrabold text-[#1E1B4B] mb-6">Contact Info</h2>
            <div className="space-y-6 mb-8">
              <div>
                <p className="font-semibold text-[#1E1B4B] mb-1">Manager Email</p>
                <a href="mailto:manager@wheresmytherapist.com" className="text-indigo-600 underline decoration-indigo-200 hover:decoration-indigo-600 transition-colors text-sm">manager@wheresmytherapist.com</a>
              </div>
              <div>
                <p className="font-semibold text-[#1E1B4B] mb-1">Support Email</p>
                <a href="mailto:support@wheresmytherapist.com" className="text-indigo-600 underline decoration-indigo-200 hover:decoration-indigo-600 transition-colors text-sm">support@wheresmytherapist.com</a>
              </div>
              <div>
                <p className="font-semibold text-[#1E1B4B] mb-1">WhatsApp Business</p>
                <a href="https://wa.me/919111776035" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline decoration-indigo-200 hover:decoration-indigo-600 transition-colors text-sm">+91 91117 76035</a>
              </div>
              <div>
                <p className="font-semibold text-[#1E1B4B] mb-1">Location</p>
                <p className="text-sm text-slate-600">Indore, India<br />(Remote-first — team across India)</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="font-bold text-red-800 mb-2 flex items-center gap-2">🆘 Crisis Support</p>
              <p className="text-sm text-red-700 mb-3">If you're in crisis or having suicidal thoughts, please reach out immediately.</p>
              <a href="tel:14416" className="block text-sm font-semibold text-red-800 underline mb-1">Call or text 14416 — Tele MANAS (24/7, toll-free)</a>
              <a href="tel:18005990019" className="block text-sm font-semibold text-red-800 underline">Or call 1800-599-0019 — KIRAN Helpline (24/7, toll-free)</a>
            </div>
          </div>
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal className="bg-white border-y border-slate-200 py-14 w-full">
        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <h2 className="text-2xl font-extrabold text-[#1E1B4B] text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="border border-slate-200 rounded-2xl overflow-hidden transition-colors duration-200 hover:border-indigo-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 font-semibold text-[#1E1B4B] flex justify-between items-center transition-colors hover:bg-slate-50"
                >
                  {faq.q}
                  <span className={`text-slate-400 transition-transform duration-300 ${openFaq === i ? "rotate-45 text-blue-600" : ""}`}>+</span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: openFaq === i ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                      {faq.a}{" "}
                      {faq.link && (
                        <Link href={faq.link.href} className="text-indigo-600 underline hover:text-indigo-800 transition-colors">{faq.link.label}</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Footer />
    </div>
  );
}
