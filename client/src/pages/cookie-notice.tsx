import { SiteNav, SiteFooter } from "@/components/shared-sections";
import { SEOHead } from "@/components/seo-head";

export default function CookieNotice() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEOHead
        title="Cookie Notice | DOCO Exteriors"
        description="DOCO Exteriors cookie notice — what cookies this site uses and why."
      />
      <SiteNav variant="subpage" />

      <section className="pt-[68px] bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-8 py-24 md:py-32">
          <p className="text-[#58E3EA] text-sm font-semibold mb-3">Legal</p>
          <h1 className="text-[clamp(32px,4vw,52px)] font-black tracking-tighter leading-[1.05] mb-4">Cookie Notice</h1>
          <p className="text-white/40 text-sm mb-16">Effective date: April 8, 2026</p>

          <div className="space-y-12 text-white/70 text-base leading-relaxed">

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Our cookies</h2>
              <p>The DOCO Exteriors website sets no first-party cookies. We do not use cookies for tracking, advertising, or analytics.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Cal.com scheduling embed</h2>
              <p>Our estimate scheduling feature is powered by Cal.com. When you interact with the scheduling calendar on this site, Cal.com may set functional cookies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your timezone for accurate time display</li>
                <li>Maintain your session state during the booking process</li>
              </ul>
              <p>These cookies are strictly functional — they are not used for advertising, retargeting, or any form of behavioral tracking. They expire at the end of your session or shortly after.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Analytics</h2>
              <p>We currently use no analytics tools on this site. If we add analytics in the future, we will use privacy-respecting, cookieless tools and update this notice accordingly.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Your choices</h2>
              <p>You can configure your browser to block or delete cookies at any time. Blocking Cal.com's functional cookies may prevent the scheduling calendar from working correctly, but will not affect your ability to submit an estimate request through the form.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Contact</h2>
              <p>Questions about cookies? Reach us at <a href="mailto:support@docoexteriors.com" className="text-[#58E3EA] hover:underline">support@docoexteriors.com</a>.</p>
            </div>

          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
