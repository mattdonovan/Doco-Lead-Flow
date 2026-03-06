import { SiteNav, GuidedProcess, CTASection, SiteFooter, ScrollToTop } from "@/components/shared-sections";

export default function About() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <ScrollToTop />
      <SiteNav variant="subpage" />

      <section className="pt-[68px] bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-8 py-24 md:py-32 flex flex-col items-center text-center">
          <img src="/logo-footer.svg" alt="DOCO Exteriors" style={{ height: 80, width: "auto" }} className="mb-16" />

          <div className="text-left w-full space-y-6">
            <p className="text-white/70 text-base leading-relaxed">Dear Valued Customer,</p>

            <p className="text-white/70 text-base leading-relaxed">
              We founded DOCO Exteriors with a simple purpose: to create a company where homeowners can experience a higher standard of service. Our work is guided by four core values—Integrity, Discipline, Ownership, and a commitment to serving the communities we are a part of.
            </p>

            <p className="text-white/70 text-base leading-relaxed">
              At DOCO Exteriors, our team is committed to doing what is right, not just what is easy. Every project is approached with care, professionalism, and a dedication to delivering work that meets the highest standards.
            </p>

            <p className="text-white/70 text-base leading-relaxed">
              Our goal is that when our work is complete, your home and your experience with us leave you in a better place than before we had the opportunity to serve you. To achieve this, we have developed clear processes and strong partnerships with trusted manufacturers whose products and values align with our commitment to quality.
            </p>

            <p className="text-white/70 text-base leading-relaxed">
              Our process is designed to keep you—the homeowner—at the center of every step. We prioritize clear communication so you always know what to expect next, while also keeping the process simple and efficient. This allows us to complete your project smoothly so you can enjoy the comfort, protection, and value of your improved home as soon as possible.
            </p>

            <p className="text-white/70 text-base leading-relaxed">
              Thank you for the opportunity to earn your trust.
            </p>

            <div className="pt-4">
              <p className="text-white/50 text-base">Sincerely,</p>
              <p className="text-[#58E3EA] text-lg font-semibold mt-2">Kris and Jenna Donovan</p>
              <p className="text-white/40 text-sm mt-1">Founders, DOCO Exteriors</p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#F5F4F0] py-24 px-8 md:px-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[clamp(28px,3vw,40px)] font-extrabold text-[#0A0A0A] tracking-tight mb-4">Our Core Values</h2>
          <p className="text-[#444] text-base mb-12 max-w-xl">The principles that guide every project and every interaction at DOCO Exteriors.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Integrity", desc: "We do what is right, even when no one is watching. Honesty and transparency are the foundation of every relationship we build." },
              { title: "Discipline", desc: "We follow proven processes and hold ourselves to the highest standards. Consistency and attention to detail set us apart." },
              { title: "Ownership", desc: "We treat your home as if it were our own. Every team member takes personal responsibility for the quality of their work." },
              { title: "Community", desc: "We are committed to serving and strengthening the Twin Cities communities where we live and work." },
            ].map((val, i) => (
              <div key={i} className="bg-white p-8 rounded shadow-sm" data-testid={`card-value-${i}`}>
                <div className="w-10 h-10 rounded bg-[#58E3EA]/10 flex items-center justify-center mb-4">
                  <span className="text-[#3ABFC6] font-black text-lg">{val.title[0]}</span>
                </div>
                <h3 className="text-[#0A0A0A] font-bold text-lg mb-3">{val.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GuidedProcess />
      <CTASection />
      <SiteFooter />
    </div>
  );
}
