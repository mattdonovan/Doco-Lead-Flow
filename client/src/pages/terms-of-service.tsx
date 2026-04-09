import { SiteNav, SiteFooter } from "@/components/shared-sections";
import { SEOHead } from "@/components/seo-head";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEOHead
        title="Terms of Use | DOCO Exteriors"
        description="Terms of use for the DOCO Exteriors website and estimate request system."
      />
      <SiteNav variant="subpage" />

      <section className="pt-[68px] bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-8 py-24 md:py-32">
          <p className="text-[#58E3EA] text-sm font-semibold mb-3">Legal</p>
          <h1 className="text-[clamp(32px,4vw,52px)] font-black tracking-tighter leading-[1.05] mb-4">Terms of Use</h1>
          <p className="text-white/40 text-sm mb-16">Effective date: April 8, 2026</p>

          <div className="space-y-12 text-white/70 text-base leading-relaxed">

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Purpose of this site</h2>
              <p>This website exists to help homeowners and property managers in the Minneapolis metro area request a free exterior inspection and estimate from DOCO Exteriors. By using this site, you agree to these terms.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Estimate requests</h2>
              <p>Submitting an estimate request through this site is not a contract and does not obligate either party to proceed with any work. All estimates are determined following an on-site inspection and are provided at no cost and with no obligation.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Content accuracy</h2>
              <p>We make reasonable efforts to keep the information on this site current and accurate, but we make no warranties regarding completeness, accuracy, or timeliness. Service availability, pricing, and scope are determined at the time of your estimate visit, not by information published on this site.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Intellectual property</h2>
              <p>All content on this site — including text, images, logos, and design — is owned by DOCO Exteriors. You may share links to this site and take screenshots for personal use. Commercial use, reproduction, or distribution of our content without written permission is prohibited.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Photos you share</h2>
              <p>If you share photos of your property as part of an estimate request, you grant DOCO Exteriors a limited license to use those photos solely to evaluate and fulfill your request. We will not use your photos in public marketing materials without your explicit consent.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Third-party services</h2>
              <p>This site integrates with Cal.com, Resend, and Railway to provide scheduling, communication, and infrastructure. Your use of those services is also subject to their respective terms of service.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Limitation of liability</h2>
              <p>To the extent permitted by law, DOCO Exteriors' liability arising from your use of this site is limited to the amount paid, if any, for services rendered. We are not liable for indirect, incidental, or consequential damages.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Governing law</h2>
              <p>These terms are governed by the laws of the State of Minnesota. Any disputes will be resolved in the courts of Hennepin County, Minnesota.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-xl font-bold">Contact</h2>
              <p>Questions about these terms? Reach us at <a href="mailto:support@docoexteriors.com" className="text-[#58E3EA] hover:underline">support@docoexteriors.com</a>.</p>
            </div>

          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
