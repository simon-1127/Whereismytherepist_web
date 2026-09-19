import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import Footer from "../../components/Footer";
import { LegalSection, LegalPart, LegalList, TocLink } from "../../components/legal/LegalBits";

export const metadata = {
  title: "Privacy Policy",
  description: "How Where's My Therapist collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <PageHeader
        title="Privacy"
        highlight="Policy"
        description="Last updated 14 September 2026. How we collect, use, store, and protect your personal information."
      />

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 w-full flex-grow grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 bg-white border border-slate-200 rounded-2xl p-5 max-h-[80vh] overflow-y-auto">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Privacy Policy</p>
            <TocLink href="#privacy-1">1. About WMT</TocLink>
            <TocLink href="#privacy-2">2. Information We Collect</TocLink>
            <TocLink href="#privacy-3">3. Audio, Video & Transcription</TocLink>
            <TocLink href="#privacy-4">4. AI Processing</TocLink>
            <TocLink href="#privacy-5">5. How We Use Your Information</TocLink>
            <TocLink href="#privacy-6">6. Health & Mental-Health Data</TocLink>
            <TocLink href="#privacy-7">7. When We Share Information</TocLink>
            <TocLink href="#privacy-8">8. Third-Party AI & Service Providers</TocLink>
            <TocLink href="#privacy-9">9. Data Security</TocLink>
            <TocLink href="#privacy-10">10. Data Retention</TocLink>
            <TocLink href="#privacy-11">11. Account Deletion</TocLink>
            <TocLink href="#privacy-12">12. Your Privacy Rights</TocLink>
            <TocLink href="#privacy-13">13. Children</TocLink>
            <TocLink href="#privacy-14">14. Cookies & Analytics</TocLink>
            <TocLink href="#privacy-15">15. International Processing</TocLink>
            <TocLink href="#privacy-16">16. De-Identified Information</TocLink>
            <TocLink href="#privacy-17">17. Data Breaches</TocLink>
            <TocLink href="#privacy-18">18. Changes</TocLink>
            <TocLink href="#privacy-19">19. Contact</TocLink>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mt-5 mb-3">Third-Party Services</p>
            <TocLink href="#thirdparty">Data Processing Partners</TocLink>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mt-5 mb-3">Therapy Confidentiality</p>
            <TocLink href="#consent">Consent & Confidentiality</TocLink>
          </div>
        </aside>

        {/* Content */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10">

          <LegalPart title="Privacy Policy">
            <p className="text-sm text-slate-500 mb-8">Effective Date: 14 September 2026</p>
            <p className="mb-8">
              Where's My Therapist ("WMT", "we", "us", or "our") respects your privacy and is committed to
              protecting the personal information entrusted to us. This Privacy Policy explains how Where's
              My Therapist collects, uses, stores, discloses, and protects personal information when you use
              our website, mobile application, and related services (collectively, the "Services"). By
              creating an account or using the Services, you acknowledge that you have read this Privacy
              Policy. Where applicable law requires consent, we will obtain the required consent before
              processing your personal data.
            </p>

            <LegalSection id="privacy-1" title="1. About Where's My Therapist">
              <p>Where's My Therapist is a digital mental healthcare service that may provide access to:</p>
              <LegalList items={[
                "Psychologists", "Therapists", "Counsellors", "Psychiatrists", "AI-powered emotional support",
                "Mental-health assessments", "Therapy and consultation services",
                "Therapy-session transcription and AI-assisted analysis", "Wellness reports",
                "Medication and wellness tracking", "Group and family therapy",
                "Peer-support/community features", "Progress tracking", "Workplace Employee Assistance Programs (\"EAP\")",
                "Mental-health resources", "Other mental-health and wellness services",
              ]} />
            </LegalSection>

            <LegalSection id="privacy-2" title="2. Information We Collect">
              <p>We collect only information reasonably necessary to provide, secure, improve, and administer the Services.</p>
              <p className="font-semibold text-slate-700 mt-4">2.1 Information You Provide</p>
              <p>Depending on the features you use, we may collect:</p>
              <p className="font-semibold text-slate-700 mt-2">Account Information</p>
              <LegalList items={[
                "Name", "Email address", "Phone number", "Date of birth or age",
                "Gender, where voluntarily provided", "Profile information",
                "Login and authentication information", "Communication preferences",
                "Other information required to maintain your account",
              ]} />
              <p className="font-semibold text-slate-700 mt-4">Mental-Health Information</p>
              <p>If you choose to use mental-health services, you may provide:</p>
              <LegalList items={[
                "Mental-health concerns", "Symptoms and experiences", "Therapy goals", "Assessment responses",
                "Questionnaire responses", "Emotional wellbeing information", "Treatment-related information",
                "Information concerning your personal circumstances", "Medication information",
                "Wellness information", "Progress information", "Other information you voluntarily provide",
              ]} />
              <p>Some of this information may constitute sensitive personal information or health-related information under applicable law.</p>
              <p className="font-semibold text-slate-700 mt-4">Therapy Information</p>
              <p>Depending on the service, we may process:</p>
              <LegalList items={[
                "Appointment information", "Provider information", "Communications with providers",
                "Information shared during therapy", "Provider-generated notes or records",
                "Session-related information", "Other information necessary to facilitate care",
              ]} />
            </LegalSection>

            <LegalSection id="privacy-3" title="3. Audio, Video and Transcription">
              <p>Some WMT features may allow therapy or consultation sessions to be conducted using audio or video. Where the relevant functionality is enabled, WMT may process:</p>
              <LegalList items={["Audio", "Video", "Transcriptions", "Text derived from sessions", "Session metadata", "Information generated from such content"]} />
              <p>We will provide appropriate notice and obtain any consent required by applicable law before recording, transcribing, or analyzing session content. WMT will not secretly record therapy sessions. Where transcription or AI-assisted analysis is enabled, the user and/or provider will be informed of the applicable functionality.</p>
            </LegalSection>

            <LegalSection id="privacy-4" title="4. AI Processing">
              <p>Certain WMT features use artificial intelligence. AI may be used to:</p>
              <LegalList items={[
                "Provide emotional-support interactions", "Generate conversation summaries", "Transcribe sessions",
                "Analyze conversations", "Identify relevant themes or patterns", "Generate wellness reports",
                "Assist providers in reviewing information", "Personalize the user experience",
                "Improve specific functionality of the Services",
              ]} />
              <p>Where personal information is sent to a third-party AI service provider, WMT will disclose the relevant processing and obtain consent where required. WMT does not represent AI-generated information as a medical diagnosis. AI-generated information is intended to assist users and/or qualified healthcare professionals and may contain inaccuracies.</p>
            </LegalSection>

            <LegalSection id="privacy-5" title="5. How We Use Your Information">
              <p>We may use personal information to:</p>
              <LegalList items={[
                "Create and maintain your account", "Provide therapy and mental-health services",
                "Connect you with healthcare professionals", "Facilitate appointments",
                "Facilitate communication with providers", "Process payments", "Provide AI-powered features",
                "Generate summaries and wellness reports", "Provide assessments and wellness tools",
                "Provide customer support", "Maintain security", "Detect fraud, abuse, or unauthorized activity",
                "Improve the Services", "Conduct analytics using appropriate safeguards",
                "Comply with legal obligations", "Respond to lawful requests", "Protect users and the public",
                "Perform other purposes disclosed to you at the time of collection",
              ]} />
              <p>We will not use personal information for an unrelated purpose where applicable law requires additional consent.</p>
            </LegalSection>

            <LegalSection id="privacy-6" title="6. Health and Mental-Health Data">
              <p>Mental-health information is particularly sensitive. WMT does not sell your mental-health or health information. We do not use health or mental-health information for targeted advertising. We do not use therapy information to create advertising profiles. We will only disclose mental-health information in accordance with this Privacy Policy, applicable law, your instructions/consent where required, or circumstances where disclosure is legally permitted or required.</p>
            </LegalSection>

            <LegalSection id="privacy-7" title="7. When We Share Information">
              <p className="font-semibold text-slate-700">Healthcare Providers</p>
              <p>Information necessary to provide your requested service may be made available to your selected psychologist, therapist, psychiatrist, counsellor, or other provider.</p>
              <p className="font-semibold text-slate-700 mt-4">Technology and Infrastructure Providers</p>
              <p>We may use third-party providers for:</p>
              <LegalList items={["Cloud infrastructure", "Data storage", "Video services", "Transcription", "AI processing", "Authentication", "Payments", "Messaging", "Email/SMS delivery", "Security", "Analytics", "Technical support"]} />
              <p>These providers may process information on our behalf and subject to appropriate contractual and security safeguards.</p>
              <p className="font-semibold text-slate-700 mt-4">Employers / EAP Customers</p>
              <p>Where you use WMT through an employer-sponsored EAP:</p>
              <LegalList items={[
                "We may provide organizations with program-level or aggregated information",
                "We may provide utilization statistics where appropriate",
                "We will not ordinarily provide employers with the contents of private therapy sessions",
                "We will not disclose individual therapy information merely because an employee participates in an EAP",
              ]} />
              <p>Any exceptions will be based on applicable law, a valid authorization, or clearly disclosed program terms.</p>
              <p className="font-semibold text-slate-700 mt-4">Legal and Safety Reasons</p>
              <p>We may disclose information where reasonably necessary to:</p>
              <LegalList items={["Comply with applicable law", "Respond to lawful governmental requests", "Comply with court orders", "Protect someone from serious and imminent harm", "Investigate fraud or abuse", "Protect WMT's legal rights", "Enforce our agreements"]} />
            </LegalSection>

            <LegalSection id="privacy-8" title="8. Third-Party AI and Service Providers">
              <p>If WMT uses third-party providers to process personal information, those providers may receive only the information reasonably necessary for the service they provide. WMT will take reasonable steps to require relevant providers to maintain appropriate security and confidentiality. A current list of the material third-party processors WMT uses is set out below in <a href="#thirdparty" className="text-indigo-600 underline">Third-Party Services & Data Processing</a>.</p>
            </LegalSection>

            <LegalSection id="privacy-9" title="9. Data Security">
              <p>We use reasonable technical and organizational safeguards designed to protect personal information. These may include:</p>
              <LegalList items={["Encryption during transmission", "Encryption at rest where appropriate", "Access controls", "Authentication", "Role-based access", "Monitoring", "Logging", "Secure infrastructure", "Access limitation", "Security testing", "Other appropriate safeguards"]} />
              <p>No internet-based service can guarantee absolute security.</p>
            </LegalSection>

            <LegalSection id="privacy-10" title="10. Data Retention">
              <p>We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including:</p>
              <LegalList items={["Providing Services", "Maintaining accounts", "Maintaining appropriate healthcare/service records", "Meeting legal obligations", "Resolving disputes", "Preventing fraud and abuse", "Enforcing agreements", "Protecting legal rights"]} />
              <p>Specific retention periods may vary depending on the category of information and applicable legal requirements. When information is no longer required, we will take reasonable steps to delete, anonymize, or securely dispose of it, subject to applicable legal obligations.</p>
            </LegalSection>

            <LegalSection id="privacy-11" title="11. Account Deletion">
              <p>If you create a WMT account, you may request or initiate account deletion from within your account settings, or by contacting <a href="mailto:chitranshu@wheresmytherapist.com" className="text-indigo-600 underline">chitranshu@wheresmytherapist.com</a>.</p>
              <p>Certain information may need to be retained where required by law, necessary to establish or defend legal claims, or otherwise permitted by applicable law. Apple requires apps that allow account creation to provide users with a mechanism to initiate account deletion within the app.</p>
            </LegalSection>

            <LegalSection id="privacy-12" title="12. Your Privacy Rights">
              <p>Subject to applicable law, you may have rights to:</p>
              <LegalList items={["Access personal information", "Request correction", "Request deletion", "Withdraw consent", "Request information regarding processing", "Raise a grievance", "Request other legally available rights"]} />
              <p>Requests can be submitted to <a href="mailto:chitranshu@wheresmytherapist.com" className="text-indigo-600 underline">chitranshu@wheresmytherapist.com</a>. We may need to verify your identity before processing certain requests.</p>
            </LegalSection>

            <LegalSection id="privacy-13" title="13. Children">
              <p>WMT is not intended to knowingly collect personal information from children except where permitted by applicable law and appropriate parental/guardian requirements have been satisfied. Where services are made available to minors, WMT will implement age-appropriate safeguards and consent mechanisms required by applicable law.</p>
            </LegalSection>

            <LegalSection id="privacy-14" title="14. Cookies and Analytics">
              <p>WMT may use cookies, SDKs, logs, analytics tools, and similar technologies to:</p>
              <LegalList items={["Maintain functionality", "Improve performance", "Understand usage", "Detect security issues", "Measure product performance", "Improve the Services"]} />
              <p>We will not use health or mental-health information for targeted advertising.</p>
            </LegalSection>

            <LegalSection id="privacy-15" title="15. International Processing">
              <p>Some service providers may process information outside India. Where personal information is transferred internationally, WMT will comply with applicable legal requirements and implement appropriate safeguards where required.</p>
            </LegalSection>

            <LegalSection id="privacy-16" title="16. De-Identified Information">
              <p>We may use aggregated, anonymized, or appropriately de-identified information for:</p>
              <LegalList items={["Analytics", "Product improvement", "Research", "Statistical analysis", "Service development", "Understanding broader mental-health trends"]} />
              <p>We will not intentionally attempt to re-identify properly anonymized information.</p>
            </LegalSection>

            <LegalSection id="privacy-17" title="17. Data Breaches">
              <p>If WMT becomes aware of a personal data breach, we will take reasonable steps to:</p>
              <LegalList items={["Investigate", "Contain the incident", "Mitigate potential harm", "Secure affected systems", "Notify affected users and/or authorities where required by applicable law"]} />
            </LegalSection>

            <LegalSection id="privacy-18" title="18. Changes to This Policy">
              <p>We may update this Privacy Policy periodically. Material changes may be communicated through the application, website, email, or another appropriate method. The latest version will always include the updated "Last Updated" date.</p>
            </LegalSection>

            <LegalSection id="privacy-19" title="19. Contact">
              <p>Where's My Therapist</p>
              <p>Email: <a href="mailto:chitranshu@wheresmytherapist.com" className="text-indigo-600 underline">chitranshu@wheresmytherapist.com</a></p>
              <p>Website: <a href="https://wheresmytherapist.com/" className="text-indigo-600 underline">https://wheresmytherapist.com/</a></p>
            </LegalSection>
          </LegalPart>

          <LegalPart title="Third-Party Services & Data Processing">
            <div id="thirdparty" className="scroll-mt-28">
              <p className="mb-6">Where's My Therapist uses certain third-party technology providers to operate and deliver its Services. These providers may process personal information on behalf of WMT or as otherwise described in their respective privacy documentation. The third-party services currently used by WMT may include the following:</p>

              <LegalSection id="thirdparty-1" title="1. Supabase">
                <p>WMT uses Supabase for backend infrastructure, including services such as database storage, authentication, application infrastructure, and related backend functionality. Depending on the functionality used, information processed through Supabase may include: account information, authentication information, user profile information, application data, therapy/service-related information, user-generated content, technical information, and other information necessary to operate WMT.</p>
                <p>WMT configures access controls and security measures designed to limit unauthorized access to information stored through its backend infrastructure. Supabase maintains its own security and privacy controls for its infrastructure. WMT remains responsible for determining how information is collected and used within the WMT application.</p>
              </LegalSection>

              <LegalSection id="thirdparty-2" title="2. Twilio">
                <p>WMT may use Twilio for services such as phone-number verification, OTP delivery, SMS communications, notifications, and other communication functionality. Information processed through Twilio may include phone number, verification information, communication metadata, message delivery information, and other information necessary to provide the relevant communication service. Twilio maintains its own privacy and security program and provides mechanisms for data protection and data retention.</p>
              </LegalSection>

              <LegalSection id="thirdparty-3" title="3. Razorpay">
                <p>WMT uses Razorpay to facilitate payments. When you make a payment, Razorpay may process information necessary to complete and verify the transaction, including name, contact information, transaction information, payment-related information, order information, transaction identifiers, and technical information associated with the transaction.</p>
                <p>WMT does not intend to store your complete card credentials, banking passwords, UPI PIN, or other authentication credentials unless explicitly stated within the relevant payment flow. Payment processing may be subject to Razorpay's own privacy practices and applicable payment regulations.</p>
              </LegalSection>

              <LegalSection id="thirdparty-4" title="4. Google Sign-In">
                <p>WMT may allow users to create or access their WMT account using Google Sign-In. If you choose Google Sign-In, Google may provide WMT with information authorized through the Google authentication flow, which may include name, email address, profile information, Google account identifier, and authentication-related information.</p>
                <p>WMT uses this information to create, authenticate, and maintain your WMT account. WMT does not receive your Google account password through the normal Google authentication process.</p>
              </LegalSection>

              <LegalSection id="thirdparty-5" title="5. Sign in with Apple">
                <p>WMT may allow users to create or access their account using Sign in with Apple. If you choose Sign in with Apple, Apple may provide WMT with information authorized through Apple's authentication process, which may include name, email address or Apple's private relay email address, Apple account identifier, and authentication-related information.</p>
                <p>If you choose Apple's private email relay functionality, WMT may receive a relay email address rather than your personal email address. WMT uses this information to authenticate and maintain your WMT account. WMT does not receive your Apple account password through the normal Sign in with Apple authentication process.</p>
              </LegalSection>

              <LegalSection id="thirdparty-6" title="6. Daily.co">
                <p>WMT uses Daily.co to facilitate real-time audio and video communication for certain therapy and consultation services. Depending on the functionality used, Daily.co may process audio and video streams, session information, participant identifiers, device and network information, connection information, session metadata, and other technical information required to establish and maintain communications.</p>
                <p>WMT does not represent that every therapy session is automatically recorded. Where recording, transcription, or other processing of session content is enabled, WMT will provide appropriate notice and obtain consent where required.</p>
              </LegalSection>

              <LegalSection id="thirdparty-7" title="7. OpenAI">
                <p>WMT may use OpenAI's API and related artificial-intelligence technology to provide certain AI-powered features. Depending on the functionality you use, information sent to OpenAI may include messages submitted to the WMT AI companion, user-provided information, conversation content, text submitted for analysis, information necessary to generate an AI response, information used to generate summaries or other AI-assisted outputs, and other information required for the specific AI feature.</p>
                <p>WMT will only send information to OpenAI that is reasonably necessary for the relevant functionality. Where WMT uses OpenAI's API, OpenAI states that API inputs and outputs are not used to train its models by default unless the customer explicitly opts into applicable data-sharing programs. Where therapy-session transcripts, wellness information, or other sensitive information are processed using OpenAI, WMT will apply appropriate safeguards and obtain consent where required by applicable law. AI-generated content is not a medical diagnosis and does not replace professional healthcare judgment.</p>
              </LegalSection>

              <LegalSection id="thirdparty-8" title="Third-Party Data Protection">
                <p>WMT expects third-party service providers that process information on WMT's behalf to maintain appropriate security and confidentiality measures. The use of third-party providers does not mean that WMT sells personal information to those providers. Third-party providers may process information only for the purposes necessary to provide their services, comply with applicable law, maintain security, or perform other authorized functions.</p>
                <p>Third-party providers may operate infrastructure in countries outside India. Where applicable, WMT will implement safeguards and comply with applicable requirements governing international transfers.</p>
              </LegalSection>

              <LegalSection id="thirdparty-9" title="Changes to Third-Party Providers">
                <p>WMT may change, add, or remove third-party service providers as our Services evolve. Where a change materially affects how personal information is processed, WMT may update this Privacy Policy and provide additional notice or obtain consent where required by law.</p>
              </LegalSection>
            </div>
          </LegalPart>

          <LegalPart title="Therapy Consent & Confidentiality Policy">
            <div id="consent" className="scroll-mt-28">
              <LegalSection id="consent-1" title="1. Your Therapy Relationship">
                <p>When you book a session through WMT, you may be connected with an independent psychologist, therapist, psychiatrist, counsellor, or other healthcare professional. The professional is responsible for the professional services they provide. WMT provides technology and platform infrastructure to facilitate access to those services.</p>
              </LegalSection>

              <LegalSection id="consent-2" title="2. Informed Participation">
                <p>Before participating in therapy, you should provide information that is reasonably accurate and relevant to your care. You should also inform your provider about circumstances that may be important to your safety or treatment. You may ask your provider questions about:</p>
                <LegalList items={["Their qualifications", "Their professional approach", "The nature of the service", "Confidentiality", "Session arrangements", "Fees", "Cancellation", "Treatment expectations", "Other concerns you may have"]} />
              </LegalSection>

              <LegalSection id="consent-3" title="3. Confidentiality">
                <p>Therapy conversations are intended to remain confidential subject to:</p>
                <LegalList items={["Applicable law", "Professional obligations", "Valid legal orders", "Serious safety concerns", "Mandatory reporting requirements", "Other legally recognized exceptions"]} />
                <p>No platform can guarantee absolute confidentiality in every circumstance.</p>
              </LegalSection>

              <LegalSection id="consent-4" title="4. Digital Communication">
                <p>When using WMT, therapy-related information may travel through digital systems. Although WMT uses reasonable safeguards, users should understand that no electronic system can guarantee absolute security.</p>
              </LegalSection>

              <LegalSection id="consent-5" title="5. Session Recording">
                <p>WMT will not intentionally record therapy sessions without appropriate authorization or consent where required. If a feature records or transcribes a session, the relevant feature will be disclosed to the user and/or provider and appropriate consent will be obtained where required.</p>
              </LegalSection>

              <LegalSection id="consent-6" title="6. Transcription">
                <p>If transcription is enabled:</p>
                <LegalList items={[
                  "Audio/video may be processed to generate text",
                  "The resulting transcription may be made available to the appropriate user and/or provider",
                  "The transcription may be used for functionality such as summaries or wellness reports",
                  "Access will be controlled according to the relevant service configuration",
                  "The information will be handled according to WMT's Privacy Policy",
                ]} />
              </LegalSection>

              <LegalSection id="consent-7" title="7. AI Analysis of Sessions">
                <p>If a provider chooses to use WMT's AI-assisted session analysis:</p>
                <LegalList items={[
                  "Relevant session information may be processed by the AI functionality",
                  "AI may generate summaries, themes, observations, or wellness-related information",
                  "AI output may be inaccurate",
                  "The output is intended to assist the provider",
                  "The provider remains responsible for the final professional interpretation",
                ]} />
                <p>AI does not replace the provider's professional judgment.</p>
              </LegalSection>

              <LegalSection id="consent-8" title="8. Consent for AI Processing">
                <p>Where required, WMT will request appropriate consent before sending therapy-session information to an AI or third-party processing service. You may decline optional AI-enabled functionality where the service allows you to do so. Declining an optional AI feature should not prevent you from accessing unrelated core services unless that processing is necessary for the requested service.</p>
              </LegalSection>

              <LegalSection id="consent-9" title="9. Confidentiality Limitations">
                <p>Confidentiality may be limited where disclosure is:</p>
                <LegalList items={["Required by law", "Required by a valid court or governmental order", "Necessary to address a serious and imminent threat to life or safety", "Required under mandatory reporting laws", "Otherwise legally permitted or required"]} />
                <p>Your healthcare provider may also have professional and legal obligations concerning confidentiality.</p>
              </LegalSection>

              <LegalSection id="consent-10" title="10. EAP and Employer Programs">
                <p>If therapy is provided through an employer-sponsored EAP:</p>
                <LegalList items={[
                  "Your participation should remain confidential except where applicable law, valid consent, or program terms provide otherwise",
                  "Employers may receive aggregated or program-level information",
                  "Individual therapy content will not ordinarily be disclosed to the employer",
                  "WMT will not ordinarily provide an employer with the content of private therapy conversations",
                  "Any specific reporting arrangements will be disclosed through the relevant EAP terms",
                ]} />
              </LegalSection>

              <LegalSection id="consent-11" title="11. Emergency and Safety Situations">
                <p>WMT and/or a healthcare professional may take appropriate action where there is a serious and imminent risk of harm, subject to applicable law and professional obligations. WMT is not an emergency response service.</p>
              </LegalSection>

              <LegalSection id="consent-12" title="12. Your Questions and Rights">
                <p>If you have questions regarding confidentiality, data processing, transcription, AI analysis, or therapy-related information, contact <a href="mailto:chitranshu@wheresmytherapist.com" className="text-indigo-600 underline">chitranshu@wheresmytherapist.com</a>. You may also exercise applicable privacy rights as described in this Privacy Policy.</p>
              </LegalSection>

              <LegalSection id="consent-13" title="13. Acknowledgement">
                <p>By participating in therapy through WMT, you acknowledge that you have read and understood this policy. Where specific consent is legally required — for example, for recording, transcription, or certain AI processing — WMT will provide an appropriate consent mechanism.</p>
              </LegalSection>
            </div>
          </LegalPart>

        </div>
      </div>

      <Footer />
    </div>
  );
}
