import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { SiteNav, GuidedProcess, CTASection, SiteFooter, ScrollToTop, OtherServicesSection } from "@/components/shared-sections";

interface ServiceData {
  slug: string;
  title: string;
  headline: string;
  heroImage: string;
  description: string;
  features: { title: string; desc: string }[];
  benefits: string[];
  ctaText: string;
}

const SERVICES: Record<string, ServiceData> = {
  roofing: {
    slug: "roofing",
    title: "Roofing",
    headline: "Expert Roof Replacement & Repair",
    heroImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80",
    description: "Your roof is your home's first line of defense against Minnesota's harsh weather. From storm damage repairs to complete replacements, DOCO Exteriors delivers professional roofing solutions that protect your family and investment for decades to come.",
    features: [
      { title: "Full Roof Replacement", desc: "Complete tear-off and installation with premium materials rated for Minnesota's climate. We ensure proper ventilation, ice and water shield, and industry-leading underlayment systems." },
      { title: "Storm Damage Repair", desc: "Rapid response for hail, wind, and storm damage. We document all damage thoroughly and work directly with your insurance company to ensure your claim covers the necessary repairs." },
      { title: "Architectural Shingles", desc: "Upgrade your home's curb appeal with dimensional architectural shingles that offer superior wind resistance, longer warranties, and a more distinguished appearance." },
      { title: "Metal Roofing", desc: "Long-lasting metal roofing solutions that can withstand extreme weather, reduce energy costs, and provide decades of maintenance-free protection for your home." },
    ],
    benefits: [
      "Licensed and insured crews with 15+ years experience",
      "Manufacturer-certified installations",
      "Comprehensive warranty coverage",
      "Free detailed roof inspections with 3D imagery",
      "Insurance claim assistance and documentation",
      "Clean job sites — we leave your property better than we found it",
    ],
    ctaText: "Get a Free Roof Inspection",
  },
  siding: {
    slug: "siding",
    title: "Siding",
    headline: "Premium Siding Installation & Replacement",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    description: "New siding transforms your home's appearance while providing critical protection against moisture, wind, and temperature extremes. DOCO Exteriors installs top-tier siding products that combine beauty, durability, and energy efficiency.",
    features: [
      { title: "Fiber Cement Siding", desc: "The gold standard in exterior cladding. Fiber cement siding resists fire, moisture, pests, and rot while maintaining its beautiful appearance for decades with minimal maintenance." },
      { title: "Vinyl Siding", desc: "Cost-effective and versatile, modern vinyl siding offers excellent insulation properties, comes in a wide range of colors and styles, and never needs painting." },
      { title: "Engineered Wood Siding", desc: "Get the natural beauty of real wood with enhanced durability. Engineered wood siding resists splitting, cracking, and decay while providing authentic wood grain textures." },
      { title: "Soffit & Fascia", desc: "Complete your home's exterior with properly installed soffit and fascia that protect your roof structure, improve attic ventilation, and give your home a finished, polished look." },
    ],
    benefits: [
      "Expert color and style consultation",
      "Proper moisture barrier installation",
      "Seamless integration with existing trim and features",
      "Energy-efficient insulated siding options",
      "Wide selection of premium materials and finishes",
      "Detailed project timeline and clear communication",
    ],
    ctaText: "Get a Free Siding Estimate",
  },
  windows: {
    slug: "windows",
    title: "Windows",
    headline: "Energy-Efficient Window Replacement",
    heroImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80",
    description: "Old, drafty windows cost you money every month and compromise your home's comfort. DOCO Exteriors installs Minnesota-rated, energy-efficient windows that keep your home comfortable year-round while reducing your energy bills.",
    features: [
      { title: "Double & Triple Pane", desc: "Advanced multi-pane glass with argon or krypton gas fill provides superior insulation, reducing heat transfer and keeping your home comfortable through Minnesota's temperature extremes." },
      { title: "Custom Sizing & Styles", desc: "Every window is measured and manufactured to fit your home perfectly. Choose from casement, double-hung, sliding, bay, bow, and specialty shapes to match your home's architecture." },
      { title: "Low-E Glass Coating", desc: "Low-emissivity coatings reflect heat back into your home during winter and block solar heat gain during summer, significantly reducing your HVAC costs year-round." },
      { title: "Full Frame Replacement", desc: "When simple insert replacements aren't enough, our full-frame installation method ensures proper insulation, flashing, and weatherproofing for maximum energy efficiency and longevity." },
    ],
    benefits: [
      "Significant reduction in heating and cooling costs",
      "Reduced outside noise for a quieter home",
      "UV protection for your furniture and flooring",
      "Enhanced home security with modern locking systems",
      "Increased home value and curb appeal",
      "Professional installation with no mess left behind",
    ],
    ctaText: "Get a Free Window Consultation",
  },
  gutters: {
    slug: "gutters",
    title: "Gutters",
    headline: "Seamless Gutter Systems & Protection",
    heroImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
    description: "Properly functioning gutters are essential to protecting your home's foundation, landscaping, and siding from water damage. DOCO Exteriors installs custom seamless gutter systems designed to handle Minnesota's heaviest rains and spring snowmelt.",
    features: [
      { title: "Seamless Gutters", desc: "Custom-fabricated on-site to fit your home perfectly, seamless gutters eliminate joints and seams where leaks typically develop, providing reliable water management for years to come." },
      { title: "Gutter Guards", desc: "Keep leaves, debris, and ice out of your gutters with professional-grade gutter protection systems. Reduce maintenance and prevent clogs that can cause water damage to your home." },
      { title: "Downspout Systems", desc: "Properly sized and positioned downspouts direct water safely away from your foundation. We design complete drainage solutions that protect your home's structural integrity." },
      { title: "Ice Dam Prevention", desc: "Minnesota winters demand special attention to ice dam prevention. We install heated gutter systems and proper edge ventilation to prevent costly ice dam damage to your roof and gutters." },
    ],
    benefits: [
      "Custom color matching to complement your home",
      "Heavy-gauge aluminum for durability",
      "Proper slope and alignment for optimal drainage",
      "Foundation protection from water damage",
      "Prevents fascia board rot and soffit damage",
      "Reduces basement flooding risk",
    ],
    ctaText: "Get a Free Gutter Assessment",
  },
};

export default function ServicePage() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const service = SERVICES[params.slug || ""];

  if (!service) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <SiteNav />
        <div className="text-center pt-20">
          <h1 className="text-3xl font-bold mb-4">Service not found</h1>
          <button onClick={() => navigate("/")} className="text-[#58E3EA] hover:underline">Go back home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <ScrollToTop />
      <SiteNav variant="subpage" />

      {/* Hero */}
      <section className="relative pt-[68px] min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={service.heroImage} alt={service.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
        </div>
        <div className="relative z-10 px-8 md:px-20 py-24 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-[#58E3EA] text-[#0A0A0A] text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-sm mb-6">
              {service.title}
            </span>
            <h1 className="text-[clamp(36px,5vw,64px)] font-extrabold leading-[1.05] tracking-tight mb-6" data-testid="text-service-headline">
              {service.headline}
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-lg mb-8">
              {service.description}
            </p>
            <button
              onClick={() => navigate("/estimate")}
              className="bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-8 py-4 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
              data-testid="button-service-estimate"
            >
              {service.ctaText}
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#F5F4F0] text-[#0A0A0A] py-24 px-8 md:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(28px,3vw,42px)] font-extrabold tracking-tight mb-4">What We Offer</h2>
          <p className="text-[#666] text-base mb-14 max-w-xl">Comprehensive {service.title.toLowerCase()} solutions tailored to Minnesota homes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.features.map((feat, i) => (
              <div key={i} className="bg-white p-8 rounded shadow-sm" data-testid={`card-feature-${i}`}>
                <div className="w-8 h-8 rounded bg-[#58E3EA]/10 flex items-center justify-center mb-4">
                  <span className="text-[#3ABFC6] font-extrabold text-sm">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-bold text-lg mb-3 text-[#0A0A0A]">{feat.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#0A0A0A] py-24 px-8 md:px-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[clamp(28px,3vw,42px)] font-extrabold tracking-tight mb-4">Why Choose DOCO Exteriors</h2>
          <p className="text-white/50 text-base mb-14 max-w-xl">Every project comes with our commitment to quality, transparency, and your complete satisfaction.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-4 p-4" data-testid={`item-benefit-${i}`}>
                <div className="w-6 h-6 rounded-full bg-[#58E3EA]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-[#58E3EA]" />
                </div>
                <span className="text-white/70 text-sm leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OtherServicesSection currentSlug={service.slug} />
      <GuidedProcess />
      <CTASection />
      <SiteFooter />
    </div>
  );
}
