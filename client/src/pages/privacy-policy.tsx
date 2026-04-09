import { SiteNav, SiteFooter } from "@/components/shared-sections";
import { SEOHead } from "@/components/seo-head";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEOHead
        title="Privacy Policy | DOCO Exteriors"
        description="DOCO Exteriors privacy policy — what we collect, how we use it, and your rights."
      />
      <SiteNav variant="subpage" />

      <section className="pt-[68px] bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-8 py-24 md:py-32">
          <p className="text-[#58E3EA] text-sm font-semibold mb-3">Legal</p>
          <h1 className="text-[clamp(32px,4vw,52px)] font-black tracking-tighter leading-[1.05] mb-4">Privacy Policy</h1>
          <p className="text-white/40 text-sm mb-16">Effective date: April 8, 2026</p>

          <div className="space-y-12 text-white/70 text-base leading-relaxed">

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">What we collect</h2>
              <p>When you submit an estimate request through this site, we collect the information you provide directly: your name, email address, phone number, property address, city, service interests, property type, project timeline, insurance claim status, project details, and any optional context you choose to share.</p>
              <p>We do not collect advertising trackers, behavioral analytics, payment information, web behavior profiles, or any information from minors.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">How we use it</h2>
              <p>Your information is used exclusively to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Schedule and prepare for your estimate visit</li>
                <li>Send you transactional emails related to your request</li>
                <li>Track city-level service interest to inform where we expand</li>
              </ul>
              <p>We do not use your information for advertising, remarketing, or any purpose unrelated to fulfilling your estimate request.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">How we store it</h2>
              <p>Your information is stored in a PostgreSQL database hosted by Railway, a US-based infrastructure provider. We retain your information for three years following your last interaction with us, after which it is deleted.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Who we share it with</h2>
              <p>We share your information only with the service providers necessary to operate this site:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white/90">Railway</strong> — database and hosting infrastructure</li>
                <li><strong className="text-white/90">Resend</strong> — transactional email delivery</li>
                <li><strong className="text-white/90">Cal.com</strong> — estimate scheduling</li>
              </ul>
              <p>These providers are not authorized to use your information for any independent purpose. We do not sell your data.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Cookies</h2>
              <p>This site sets no first-party cookies. The Cal.com scheduling embed may set functional cookies to remember your timezone and maintain session state during booking. These are not used for advertising. See our <a href="/cookie-notice" className="text-[#58E3EA] hover:underline">Cookie Notice</a> for details.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Your rights</h2>
              <p>You have the right to access, correct, or request deletion of your personal information at any time. You may also withdraw consent to any ongoing communication. We will respond to all requests within 14 days.</p>
              <p>To exercise any of these rights, contact us at <a href="mailto:support@docoexteriors.com" className="text-[#58E3EA] hover:underline">support@docoexteriors.com</a>.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Changes to this policy</h2>
              <p>If we make material changes to this policy, we will update the effective date above. Continued use of the site after changes are posted constitutes acceptance of the updated policy.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Contact</h2>
              <p>Questions about this policy? Reach us at <a href="mailto:support@docoexteriors.com" className="text-[#58E3EA] hover:underline">support@docoexteriors.com</a>.</p>
            </div>

          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
