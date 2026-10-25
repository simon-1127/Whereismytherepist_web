import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";
import { LegalSection, LegalList, TocLink } from "../../components/legal/LegalBits";
import { SESSION, POLICY } from "../../lib/policy";

export const metadata = {
  title: "Cancellation, Reschedule & Refund Policy",
  description:
    "How rescheduling, therapist changes and refunds work on Where's My Therapist. Sessions are 50 minutes, rescheduling is free when the problem isn't on your side, and refunds reach you in 5–7 working days.",
  alternates: { canonical: "/cancellation-refund-policy" },
};

const SUPPORT = "support@wheresmytherapist.com";
const UPDATED = "4 October 2026";

const GLANCE = [
  { big: `${SESSION.talkMinutes} min`, small: `with your therapist, in a ${SESSION.slotMinutes}-minute slot` },
  { big: "Free", small: "reschedule when the problem wasn't on your side" },
  { big: `${POLICY.clientReschedules}×`, small: `you can reschedule a booking yourself, up to ${POLICY.rescheduleCutoffHours} hours before` },
  { big: POLICY.refundDays, small: "working days for a refund to reach you" },
];

const OUTCOMES = [
  {
    who: "Your therapist didn't join",
    what: "You can reschedule for free, or switch to a different therapist. You won't lose your payment.",
    tone: "teal",
  },
  {
    who: "Nobody joined",
    what: "You can reschedule for free.",
    tone: "teal",
  },
  {
    who: "Something broke on our side",
    what: "If our video or booking system failed, you can reschedule for free. Nobody is penalised.",
    tone: "teal",
  },
  {
    who: "You didn't join",
    what: "Your therapist kept the time for you, so the session counts as attended and isn't refunded. If you can't make it, please reschedule at least 24 hours ahead.",
    tone: "rose",
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Cancellation, Reschedule & Refund Policy"
        description={`Plans change, and technology sometimes lets us down. Here is exactly what happens when they do, in plain language. Last updated ${UPDATED}.`}
      />

      <div className="shell w-full py-12">
        <ul data-reveal-group className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GLANCE.map((g) => (
            <li key={g.small} className="card p-5">
              <span className="text-brand block font-display text-3xl font-bold leading-none">{g.big}</span>
              <span className="mt-2 block text-[15px] text-ink-2">{g.small}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="shell grid w-full flex-grow grid-cols-1 gap-10 pb-16 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-28 max-h-[75vh] overflow-y-auto p-5">
            <p className="mb-3 text-sm font-semibold text-ink-3">On this page</p>
            <TocLink href="#length">1. How long a session is</TocLink>
            <TocLink href="#reschedule">2. Rescheduling a session</TocLink>
            <TocLink href="#no-cancel">3. Why there&rsquo;s no cancel button</TocLink>
            <TocLink href="#on-the-day">4. If something goes wrong on the day</TocLink>
            <TocLink href="#therapist-cancels">5. If your therapist cancels</TocLink>
            <TocLink href="#switch">6. Switching therapist</TocLink>
            <TocLink href="#refunds">7. Refunds</TocLink>
            <TocLink href="#attendance">8. How attendance is recorded</TocLink>
            <TocLink href="#plans">9. App plans and subscriptions</TocLink>
            <TocLink href="#contact">10. Talk to us</TocLink>
          </div>
        </aside>

        <main className="sheet space-y-10 p-6 md:p-12">
          <LegalSection id="length" title="1. How long a session is">
            <p>
              Every session is booked as a {SESSION.slotMinutes}-minute slot: {SESSION.talkMinutes} minutes with your therapist,
              followed by a {SESSION.breakMinutes}-minute break so sessions never run into each other and your therapist can
              arrive for the next person fresh. All sessions are the same length, and the price shown on a therapist&rsquo;s
              profile is for one full session.
            </p>
          </LegalSection>

          <LegalSection id="reschedule" title="2. Rescheduling a session">
            <p>You can move a booking to another time yourself, from My sessions in the app.</p>
            <LegalList
              items={[
                `Up to ${POLICY.rescheduleCutoffHours} hours before the session starts.`,
                `Up to ${POLICY.clientReschedules} times for each booking.`,
                "Free of charge. You pay nothing extra to move to another time with the same therapist.",
              ]}
            />
            <p>
              Within {POLICY.rescheduleCutoffHours} hours of the start, your therapist has already set the time aside for you, so
              the app can&rsquo;t move the booking. If something urgent has come up, write to us and we&rsquo;ll see what we can do.
            </p>
            <p>
              Rescheduling is always free, and doesn&rsquo;t count towards your limit, when the problem was on your therapist&rsquo;s
              side or ours (see sections 4 and 5).
            </p>
          </LegalSection>

          <LegalSection id="no-cancel" title="3. Why there&rsquo;s no cancel button">
            <p>
              When you book, your therapist turns other people away to keep that hour for you. So instead of cancelling, you move
              the session to a time that works. Your payment stays with the booking and simply moves with it. If you believe you
              should get your money back, section 7 explains how.
            </p>
          </LegalSection>

          <LegalSection id="on-the-day" title="4. If something goes wrong on the day">
            <p>
              {POLICY.attendanceCheckMinutes} minutes after the start time, we automatically check who joined the call. What
              happens next depends on what we find:
            </p>
            <ul className="mt-2 grid gap-3 sm:grid-cols-2">
              {OUTCOMES.map((o) => (
                <li
                  key={o.who}
                  className={`rounded-2xl border-l-4 px-4 py-3.5 ${o.tone === "teal" ? "border-teal bg-teal-soft/60" : "border-rose bg-rose-soft"}`}
                >
                  <p className="font-semibold text-ink">{o.who}</p>
                  <p className="mt-1 text-[15px]">{o.what}</p>
                </li>
              ))}
            </ul>
            <p>Running late? Join as soon as you can. You&rsquo;ll have the rest of your time, though the session still ends at its usual time.</p>
          </LegalSection>

          <LegalSection id="therapist-cancels" title="5. If your therapist cancels">
            <p>
              If your therapist cancels a confirmed booking or doesn&rsquo;t show up, it&rsquo;s never your loss. You can:
            </p>
            <LegalList
              items={[
                "Reschedule with the same therapist at no cost, or",
                "Switch to a different therapist (see section 6), or",
                "Ask us for a refund (see section 7).",
              ]}
            />
            <p>
              We hold therapists to this. A therapist who cancels or doesn&rsquo;t show up doesn&rsquo;t get paid for that booking if
              you switch or are refunded.
            </p>
          </LegalSection>

          <LegalSection id="switch" title="6. Switching therapist">
            <p>
              Sometimes a therapist isn&rsquo;t the right fit, or isn&rsquo;t available when you need them. When you&rsquo;re able to
              switch, your payment moves with you:
            </p>
            <LegalList
              items={[
                "Same price: nothing more to pay.",
                "The new therapist costs more: you pay only the difference.",
                `The new therapist costs less: we refund the difference to your original payment method within ${POLICY.refundDays} working days.`,
              ]}
            />
          </LegalSection>

          <LegalSection id="refunds" title="7. Refunds">
            <p>
              Most problems are solved by rescheduling or switching. If you think you should be refunded, email{" "}
              <a href={`mailto:${SUPPORT}?subject=Refund%20request`} className="link">{SUPPORT}</a> with your booking date and the
              therapist&rsquo;s name. A real person on our team will look at the session record and reply. We refund when:
            </p>
            <LegalList
              items={[
                "There was a technical failure on our side.",
                "Our staff or support made a mistake.",
                "Your therapist was at fault, for example by cancelling or not showing up.",
                "You were charged twice, or charged without a booking being confirmed.",
              ]}
            />
            <p>
              Approved refunds go back to the original payment method (UPI, card or netbanking) within {POLICY.refundDays} working
              days. Your bank may take a little longer to show it.
            </p>
            <p>
              Sessions you joined, or missed without rescheduling at least {POLICY.rescheduleCutoffHours} hours ahead, aren&rsquo;t
              refunded, except where the law requires it.
            </p>
          </LegalSection>

          <LegalSection id="attendance" title="8. How attendance is recorded">
            <p>To settle questions fairly, without anyone having to take sides, we automatically record:</p>
            <LegalList
              items={[
                "When you and your therapist joined and left the call, as reported by our video provider.",
                "Attempts to join, and connection failures.",
              ]}
            />
            <p>
              We never record what is said or shown in a session. These records are used only to apply this policy and resolve
              disputes, and you can ask us for the record of your own session. See our{" "}
              <Link href="/privacy" className="link">Privacy Policy</Link> for more.
            </p>
          </LegalSection>

          <LegalSection id="plans" title="9. App plans and subscriptions">
            <p>
              Starter and Growth plans, the 3-week free trial and auto-renewal are covered in section 12 of our{" "}
              <Link href="/terms#terms-12" className="link">Terms of Use</Link>. In short: cancel before the trial ends and you pay
              nothing; cancelling later stops future charges.
            </p>
          </LegalSection>

          <LegalSection id="contact" title="10. Talk to us">
            <p>
              Write to <a href={`mailto:${SUPPORT}`} className="link">{SUPPORT}</a> or WhatsApp us on{" "}
              <a href="https://wa.me/919111776035" className="link">+91 91117 76035</a>.
            </p>
            <p className="rounded-2xl bg-rose-soft px-4 py-3 text-rose-deep">
              If you&rsquo;re in crisis right now, please don&rsquo;t wait for a session: call Tele MANAS on{" "}
              <a href="tel:14416" className="font-bold underline underline-offset-4">14416</a>, free and open 24/7.
            </p>
          </LegalSection>
        </main>
      </div>
      <Footer />
    </div>
  );
}
