import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";
import { LegalSection, LegalPart, LegalList, TocLink } from "../../components/legal/LegalBits";

export const metadata = {
  title: 'Terms of Use and Medical & AI Disclaimer',
  description: "The terms governing your use of Where's My Therapist, including our medical and AI disclaimer.",
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Terms of"
        highlight="Use"
        description="Last updated 14 September 2026. Please read this alongside our Medical & AI Disclaimer below before using the Services."
      />

      <div className="shell grid w-full flex-grow grid-cols-1 gap-10 py-12 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-28 max-h-[75vh] overflow-y-auto p-5">
            <p className="mb-3 text-sm font-semibold text-rose">Read this first</p>
            <TocLink href="#disclaimer">Medical & AI Disclaimer</TocLink>
            <p className="text-sm font-semibold text-ink-3 mt-5 mb-3">Terms of Use</p>
            <TocLink href="#terms-1">1. About WMT</TocLink>
            <TocLink href="#terms-2">2. Eligibility</TocLink>
            <TocLink href="#terms-3">3. Account</TocLink>
            <TocLink href="#terms-4">4. Healthcare Professionals</TocLink>
            <TocLink href="#terms-5">5. No Guarantee of Outcomes</TocLink>
            <TocLink href="#terms-6">6. Emergency Situations</TocLink>
            <TocLink href="#terms-7">7. AI Services</TocLink>
            <TocLink href="#terms-8">8. Provider-Supporting AI</TocLink>
            <TocLink href="#terms-9">9. User Content</TocLink>
            <TocLink href="#terms-10">10. Prohibited Use</TocLink>
            <TocLink href="#terms-11">11. Community Features</TocLink>
            <TocLink href="#terms-12">12. Payments</TocLink>
            <TocLink href="#terms-13">13. App Store Terms</TocLink>
            <TocLink href="#terms-14">14. Intellectual Property</TocLink>
            <TocLink href="#terms-15">15. Third-Party Services</TocLink>
            <TocLink href="#terms-16">16. Service Availability</TocLink>
            <TocLink href="#terms-17">17. Suspension or Termination</TocLink>
            <TocLink href="#terms-18">18. Disclaimer</TocLink>
            <TocLink href="#terms-19">19. Limitation of Liability</TocLink>
            <TocLink href="#terms-20">20. Indemnification</TocLink>
            <TocLink href="#terms-21">21. Changes</TocLink>
            <TocLink href="#terms-22">22. Governing Law</TocLink>
            <TocLink href="#terms-23">23. Contact</TocLink>
          </div>
        </aside>

        <div className="sheet p-6 md:p-12">

          {/* MEDICAL & AI DISCLAIMER — prominent, first thing on the page */}
          <div id="disclaimer" className="scroll-mt-28 mb-14 bg-rose-soft rounded-[var(--radius-card)] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              
              <h2 className="text-xl font-bold text-rose-deep">Medical & AI Disclaimer</h2>
            </div>
            <p className="text-xs text-rose-deep/80 mb-6">Last Updated: 14 September 2026 — please read this carefully before using the Services.</p>
            <p className="text-sm text-ink mb-6">
              Where's My Therapist ("WMT") provides technology-enabled mental-health and wellness services.
            </p>

            <div className="space-y-6 text-sm text-ink leading-relaxed">
              <div>
                <p className="font-bold mb-1.5">1. Not an Emergency Service</p>
                <p>WMT is not an emergency response service. If you or another person is experiencing an immediate medical or mental-health emergency, serious risk of harm, suicidal thoughts with immediate danger, or another life-threatening situation, do not rely solely on WMT. Contact your local emergency service, go to the nearest emergency department, or seek immediate in-person professional assistance. In India, you can also reach <a href="tel:14416" className="underline font-semibold">Tele MANAS at 14416</a> or the <a href="tel:18005990019" className="underline font-semibold">KIRAN helpline at 1800-599-0019</a>, both toll-free and available 24/7.</p>
              </div>
              <div>
                <p className="font-bold mb-1.5">2. AI Is Not a Doctor or Therapist</p>
                <p>WMT may provide AI-powered features. AI-generated responses are not equivalent to advice from a qualified psychologist, psychiatrist, therapist, counsellor, physician, or other healthcare professional. AI may make mistakes. AI may misunderstand context, miss important information, or produce inaccurate or incomplete information.</p>
              </div>
              <div>
                <p className="font-bold mb-1.5">3. No AI Diagnosis</p>
                <p>Unless expressly provided by a qualified healthcare professional, AI-generated content should not be interpreted as:</p>
                <LegalList items={["A psychiatric diagnosis", "A psychological diagnosis", "A medical diagnosis", "A treatment plan", "A prescription", "A medication recommendation", "A definitive clinical assessment"]} />
              </div>
              <div>
                <p className="font-bold mb-1.5">4. AI Wellness Reports</p>
                <p>WMT may generate AI-assisted wellness reports based on information such as questionnaires, user-provided information, or therapy-session transcripts. These reports are intended to assist qualified professionals. They are not intended to independently diagnose or treat a user. A healthcare professional must exercise their own professional judgment before relying on any AI-generated output.</p>
              </div>
              <div>
                <p className="font-bold mb-1.5">5. Human Oversight</p>
                <p>Where AI-generated information is provided to a healthcare professional, the professional remains responsible for evaluating the information. AI-generated content should be treated as supporting information rather than a replacement for professional judgment.</p>
              </div>
              <div>
                <p className="font-bold mb-1.5">6. Medication</p>
                <p>WMT may provide medication tracking or related informational features. WMT does not independently prescribe medication through AI. Users should not start, stop, change, or modify medication based solely on AI-generated information. Medication decisions should be made with an appropriately qualified healthcare professional.</p>
              </div>
              <div>
                <p className="font-bold mb-1.5">7. Therapy</p>
                <p>Therapy delivered through WMT may be provided by independent healthcare professionals. The professional is responsible for their clinical decisions and professional services. WMT does not guarantee any particular therapeutic outcome.</p>
              </div>
              <div>
                <p className="font-bold mb-1.5">8. Informational Content</p>
                <p>Mental-health articles, educational resources, assessments, AI responses, and other informational content are provided for general informational and wellness purposes. They should not be treated as a substitute for individualized professional care.</p>
              </div>
              <div>
                <p className="font-bold mb-1.5">9. Accuracy</p>
                <p>Although WMT seeks to provide useful and accurate information, we cannot guarantee that all information or AI-generated content will always be accurate, complete, current, or appropriate for every individual.</p>
              </div>
              <div>
                <p className="font-bold mb-1.5">10. User Responsibility</p>
                <p>You remain responsible for decisions you make based on information obtained through the Services. When in doubt, consult a qualified healthcare professional.</p>
              </div>
            </div>
          </div>

          <LegalPart title="Terms of Use">
            <p className="mb-8">
              These Terms of Service ("Terms") govern your access to and use of the Where's My Therapist
              application, website, and related services ("Services"). By accessing or using WMT, you agree
              to these Terms. If you do not agree with these Terms, you should not use the Services.
            </p>

            <LegalSection id="terms-1" title="1. About WMT">
              <p>Where's My Therapist is a technology-enabled mental healthcare service that may facilitate access to psychologists, therapists, counsellors, psychiatrists, AI-powered tools, wellness resources, assessments, and related services.</p>
              <p>WMT may act as a technology platform and facilitator. Unless expressly stated otherwise, WMT itself does not provide medical diagnosis or treatment merely by operating the technology platform. Healthcare services may be provided by independent healthcare professionals.</p>
            </LegalSection>

            <LegalSection id="terms-2" title="2. Eligibility">
              <p>You must meet the minimum age and legal requirements applicable to the Services you use. Certain Services may have additional eligibility requirements. You agree to provide accurate information and keep your account information reasonably current.</p>
            </LegalSection>

            <LegalSection id="terms-3" title="3. Account">
              <p>You are responsible for:</p>
              <LegalList items={["Maintaining the confidentiality of your account credentials", "Providing accurate information", "Securing access to your device", "Not sharing your account with unauthorized persons", "Notifying us of suspected unauthorized access"]} />
              <p>You are responsible for activity occurring through your account unless caused by circumstances beyond your reasonable control.</p>
            </LegalSection>

            <LegalSection id="terms-4" title="4. Healthcare Professionals">
              <p>WMT may connect you with independent healthcare professionals. Healthcare professionals may include psychologists, therapists, psychiatrists, counsellors, and other qualified professionals. The professional — not WMT — is responsible for their professional assessment, advice, diagnosis, treatment, and clinical decisions. You should verify the provider information displayed in the application before beginning a consultation.</p>
            </LegalSection>

            <LegalSection id="terms-5" title="5. No Guarantee of Outcomes">
              <p>Mental healthcare outcomes vary between individuals. WMT does not guarantee:</p>
              <LegalList items={["A particular therapeutic outcome", "Improvement in symptoms", "Diagnosis", "Treatment success", "A particular provider-user relationship", "Any specific health outcome"]} />
            </LegalSection>

            <LegalSection id="terms-6" title="6. Emergency Situations">
              <p>WMT is not an emergency medical service. The Services should not be used as a substitute for:</p>
              <LegalList items={["Emergency medical services", "Hospital emergency departments", "Police or emergency authorities", "Suicide/crisis hotlines", "Immediate professional intervention"]} />
              <p>If you believe that you or another person is in immediate danger, contact your local emergency service or seek immediate in-person medical assistance.</p>
            </LegalSection>

            <LegalSection id="terms-7" title="7. AI Services">
              <p>WMT may provide AI-powered features. AI features may:</p>
              <LegalList items={["Produce incorrect information", "Misinterpret information", "Generate incomplete responses", "Fail to identify important circumstances", "Produce inappropriate recommendations"]} />
              <p>AI outputs are not a substitute for professional medical or psychological judgment. You should not rely solely on AI output when making medical, psychiatric, psychological, medication, or emergency decisions.</p>
            </LegalSection>

            <LegalSection id="terms-8" title="8. Provider-Supporting AI">
              <p>Certain WMT features may generate summaries, transcriptions, conversation analysis, or wellness reports for healthcare professionals. These features are intended to support — not replace — the provider's professional judgment. The provider remains responsible for reviewing relevant information and making independent clinical decisions.</p>
            </LegalSection>

            <LegalSection id="terms-9" title="9. User Content">
              <p>You may submit text, images, audio, video, questionnaire responses, documents, or other information through the Services ("User Content"). You retain your rights in your User Content. You grant WMT the limited rights necessary to host, process, transmit, display, analyze, and otherwise use User Content solely to provide and operate the Services, subject to our Privacy Policy and applicable law. We will not use therapy-session content for unrelated advertising purposes.</p>
            </LegalSection>

            <LegalSection id="terms-10" title="10. Prohibited Use">
              <p>You agree not to:</p>
              <LegalList items={[
                "Misuse the Services", "Impersonate another person", "Provide false information", "Attempt unauthorized access",
                "Interfere with platform security", "Reverse engineer the Services except where permitted by law",
                "Upload malicious software", "Harass providers or other users", "Abuse community features",
                "Use the Services for unlawful purposes", "Attempt to obtain another person's private information",
                "Circumvent platform security or access restrictions",
              ]} />
            </LegalSection>

            <LegalSection id="terms-11" title="11. Community Features">
              <p>Where WMT provides peer/community functionality, users must communicate respectfully. WMT may remove content or restrict accounts that violate community rules. Community content is not a substitute for professional mental healthcare.</p>
            </LegalSection>

            <LegalSection id="terms-12" title="12. Payments">
              <p>Fees for paid Services will be displayed before purchase where reasonably practicable. Prices may vary by:</p>
              <LegalList items={["Provider", "Service", "Session duration", "Location", "Program", "Subscription", "Other applicable factors"]} />
              <p>Payments may be processed by third-party payment providers. Refunds and cancellations are subject to the applicable cancellation and refund policy displayed at the time of purchase.</p>
              <p><strong>Free trial and auto-renewal.</strong> New app accounts get a 21-day free trial of the Starter plan. To start the trial you may be asked to set up a recurring payment mandate (UPI AutoPay or a card or bank e-mandate) through our payment partner. You will not be charged during the trial. Unless you cancel before the trial ends, your chosen plan (Starter at ₹299 per month or Growth at ₹799 per month, or the yearly price shown at signup) begins on day 22 and renews automatically each billing period until you cancel.</p>
              <LegalList items={[
                "We remind you by email and in the app at least 3 days before the trial ends.",
                "Your bank or UPI app sends a pre-debit notification at least 24 hours before each charge, as required by the Reserve Bank of India.",
                "You can cancel any time from Settings in the app, from your UPI app's AutoPay section, or by writing to support@wheresmytherapist.com. Cancelling stops future charges; you keep access until the end of the period already paid for.",
                "Charges already made for a billing period are not refunded except where required by law or where you were charged in error.",
                "If a price changes, we tell you at least 30 days in advance and the change applies from your next billing period.",
              ]} />
            </LegalSection>

            <LegalSection id="terms-13" title="13. App Store Terms">
              <p>If you download WMT through Apple's App Store, your use of the application is also subject to Apple's applicable terms and conditions. These Terms are between you and WMT and not Apple. Apple is not responsible for providing maintenance or support for WMT.</p>
            </LegalSection>

            <LegalSection id="terms-14" title="14. Intellectual Property">
              <p>WMT and its licensors own or control the intellectual property associated with the Services, including:</p>
              <LegalList items={["Software", "Branding", "Logos", "Designs", "Text", "Graphics", "Interfaces", "Content", "Technology"]} />
              <p>You may not reproduce, modify, distribute, sell, or commercially exploit WMT's intellectual property without authorization.</p>
            </LegalSection>

            <LegalSection id="terms-15" title="15. Third-Party Services">
              <p>WMT may integrate third-party services. Third-party services may have their own terms and privacy policies. WMT is not responsible for third-party services outside our reasonable control.</p>
            </LegalSection>

            <LegalSection id="terms-16" title="16. Service Availability">
              <p>We aim to maintain reliable Services but do not guarantee uninterrupted availability. Services may occasionally be unavailable due to:</p>
              <LegalList items={["Maintenance", "Updates", "Technical failures", "Network problems", "Security incidents", "Third-party failures", "Circumstances beyond our reasonable control"]} />
            </LegalSection>

            <LegalSection id="terms-17" title="17. Suspension or Termination">
              <p>WMT may suspend or terminate access where reasonably necessary, including where:</p>
              <LegalList items={["These Terms are violated", "Fraud or abuse is suspected", "Security is threatened", "Required by law", "Continued access creates a significant risk to users or the platform"]} />
              <p>You may stop using the Services at any time.</p>
            </LegalSection>

            <LegalSection id="terms-18" title="18. Disclaimer">
              <p>To the maximum extent permitted by law, WMT provides technology and platform services on an "as available" basis. Nothing in these Terms excludes rights or protections that cannot legally be excluded.</p>
            </LegalSection>

            <LegalSection id="terms-19" title="19. Limitation of Liability">
              <p>To the maximum extent permitted by applicable law, WMT will not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the Services. Nothing in these Terms limits liability that cannot legally be limited.</p>
            </LegalSection>

            <LegalSection id="terms-20" title="20. Indemnification">
              <p>To the extent permitted by applicable law, you agree to indemnify WMT against claims arising from:</p>
              <LegalList items={["Your unlawful use of the Services", "Your violation of these Terms", "Your violation of another person's rights", "Your misuse of the platform"]} />
            </LegalSection>

            <LegalSection id="terms-21" title="21. Changes">
              <p>We may update these Terms from time to time. Continued use of the Services following material changes may constitute acceptance where permitted by law.</p>
            </LegalSection>

            <LegalSection id="terms-22" title="22. Governing Law">
              <p>These Terms are governed by the laws of India. Disputes shall be subject to the jurisdiction specified by applicable law and, where legally permissible, the courts of Indore, Madhya Pradesh.</p>
            </LegalSection>

            <LegalSection id="terms-23" title="23. Contact">
              <p>Where's My Therapist</p>
              <p>Email: <a href="mailto:chitranshu@wheresmytherapist.com" className="text-rose underline">chitranshu@wheresmytherapist.com</a></p>
              <p>Website: <a href="https://wheresmytherapist.com/" className="text-rose underline">https://wheresmytherapist.com/</a></p>
            </LegalSection>
          </LegalPart>
        </div>
      </div>

      <Footer />
    </div>
  );
}
