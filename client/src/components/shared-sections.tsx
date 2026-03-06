import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Facebook, Instagram, Linkedin, Phone, Mail, MapPin, Shield } from "lucide-react";

const PROCESS_STEPS = [
  { num: "01", title: "Free Inspection", desc: "Your Project Manager will complete a full exterior inspection of your home including 3D imagery when appropriate. After the inspection, we will review any areas of concern with you and provide a clear explanation of our findings along with an estimate for the recommended work." },
  { num: "02", title: "Filing an Insurance Claim", desc: "If the damage may qualify for insurance coverage, the next step is filing a claim with your insurance company. Your Project Manager will provide the documentation and scope information necessary to support your claim and help guide you through the process." },
  { num: "03", title: "Scope Agreement", desc: "In many cases, your Project Manager will meet with your insurance company's representative onsite to review the damage and confirm the scope of work. Once the insurance company has completed their review, we will meet with you to walk through the final approved scope of the project." },
  { num: "04", title: "Design Meeting", desc: "Before construction begins, we will hold a design meeting to finalize the details of your project. During this meeting, we will confirm product selections, review construction plans, and address any special considerations or requests you may have for your build day." },
  { num: "05", title: "Project Scheduling", desc: "Once selections are finalized, our team will place orders with our suppliers and coordinate with our construction crews. Within approximately 72 hours of your design meeting, we will confirm product availability and provide you with an estimated timeline for your project." },
  { num: "06", title: "Project Scheduled", desc: "When materials are ready and scheduling is finalized, our team will contact you to confirm your construction dates. Materials will typically be delivered to your driveway prior to the start of construction, and we will confirm the expected start and completion dates with you." },
  { num: "07", title: "Build Day", desc: "Construction day can be busy, loud, and exciting as your home transformation begins. Your Project Manager will provide a preparation guide beforehand to help minimize inconvenience for you and your family." },
  { num: "08", title: "Project Completion", desc: "With construction complete, you can enjoy the improved look, protection, and value of your home. You will receive a final paid-in-full invoice for your records, along with any applicable warranty documentation." },
];

const SLIDE_COLORS = [
  "bg-[#0D2B2E]", "bg-[#0B2035]", "bg-[#162830]", "bg-[#0F1F2B]",
  "bg-[#192B28]", "bg-[#1A2030]", "bg-[#1C2820]", "bg-[#101E2A]",
];

export function GuidedProcess() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="bg-[#111111] text-white px-8 md:px-20 py-24">
      <h2 className="text-[clamp(26px,3vw,38px)] font-extrabold tracking-tight pb-12" data-testid="text-process-headline">Our Guided Process</h2>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        <div className="border-r border-white/[0.07] flex flex-col">
          {PROCESS_STEPS.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`flex items-start px-6 py-4 text-left transition-all ${activeStep === i ? "" : "opacity-70 hover:opacity-90"}`}
              data-testid={`button-process-step-${i}`}
            >
              <div className="flex flex-col items-center shrink-0 w-8 mr-3 pt-0.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                    activeStep === i
                      ? "bg-[#58E3EA] border-[#58E3EA] shadow-[0_0_0_4px_rgba(88,227,234,0.13)]"
                      : "bg-transparent border-white/[0.18]"
                  }`}
                />
                {i < PROCESS_STEPS.length - 1 && (
                  <div className={`w-px flex-1 min-h-[24px] mt-1 ${activeStep === i ? "bg-[#58E3EA]/[0.18]" : "bg-white/[0.07]"}`} />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold tracking-[0.14em] uppercase transition-colors ${activeStep === i ? "text-[#58E3EA]" : "text-white/[0.28]"}`}>
                  {step.num}
                </span>
                <span className={`text-[13px] leading-snug transition-colors ${activeStep === i ? "text-white font-bold" : "text-white/[0.42] font-semibold"}`}>
                  {step.title}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.38 }}
              className={`flex flex-col h-full ${SLIDE_COLORS[activeStep]}`}
            >
              <div className="flex items-center justify-center p-8 md:p-12">
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center flex-col gap-2.5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(88,227,234,0.22)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-white/[0.18] text-center">Animation<br />Area</span>
                </div>
              </div>
              <div className="px-10 md:px-14 pb-10 md:pb-14 flex flex-col justify-center flex-1">
                <div className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#58E3EA] mb-4">
                  Step {PROCESS_STEPS[activeStep].num} of 08
                </div>
                <h3 className="text-[clamp(20px,2.2vw,30px)] font-extrabold tracking-tight leading-[1.15] mb-4 text-white">
                  {PROCESS_STEPS[activeStep].title}
                </h3>
                <p className="text-sm leading-relaxed text-white/[0.58] max-w-[420px]">
                  {PROCESS_STEPS[activeStep].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  const [, navigate] = useLocation();

  return (
    <section id="contact" className="bg-[#0E2233] text-white px-8 md:px-20 py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-16" style={{ borderTop: "1px solid rgba(88,227,234,0.1)" }}>
      <div>
        <h2 className="text-[clamp(32px,4vw,56px)] font-black tracking-tighter leading-[1.05]" data-testid="text-cta-headline">
          Ready for a<br/><span className="text-[#58E3EA]">Free Estimate?</span>
        </h2>
        <p className="mt-5 text-base text-white/50 leading-relaxed max-w-[440px]">
          Kris and Jenna personally review every request. We'll get back to you within one business day with a straightforward, no-pressure estimate.
        </p>
      </div>
      <div className="flex flex-col items-start lg:items-center gap-6">
        <p className="text-white/60 text-base leading-relaxed max-w-md">
          Start our quick guided process to tell us about your project. It only takes a couple of minutes, and we'll have everything we need to get you a fast, accurate estimate.
        </p>
        <button
          onClick={() => navigate("/estimate")}
          className="bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-10 py-4 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
          data-testid="button-cta-estimate"
        >
          Start Your Free Estimate
          <ArrowUpRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const [, navigate] = useLocation();

  return (
    <footer className="bg-[#111111] text-white px-8 md:px-20 pt-20 pb-10" style={{ borderTop: "1px solid rgba(88,227,234,0.1)", fontFamily: "'Montserrat', sans-serif" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 pb-16" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex flex-col items-start gap-5 lg:col-span-1 md:col-span-2">
          <img src="/logo-footer.svg" alt="DOCO Exteriors" style={{ height: 56, width: "auto" }} />
          <p className="text-[13px] text-white/50 leading-relaxed max-w-[280px]">
            Minneapolis-based exterior contractors you can count on. Kris & Jenna Donovan, owners.
          </p>
          <div className="flex gap-3 mt-1">
            <div className="w-9 h-9 border border-white/15 rounded-sm flex items-center justify-center cursor-pointer transition-all hover:border-[#58E3EA] hover:bg-[#58E3EA]/10" data-testid="button-social-facebook">
              <Facebook size={16} className="text-white/60" />
            </div>
            <div className="w-9 h-9 border border-white/15 rounded-sm flex items-center justify-center cursor-pointer transition-all hover:border-[#58E3EA] hover:bg-[#58E3EA]/10" data-testid="button-social-instagram">
              <Instagram size={16} className="text-white/60" />
            </div>
            <div className="w-9 h-9 border border-white/15 rounded-sm flex items-center justify-center cursor-pointer transition-all hover:border-[#58E3EA] hover:bg-[#58E3EA]/10" data-testid="button-social-linkedin">
              <Linkedin size={16} className="text-white/60" />
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#58E3EA] mb-5">Services</h4>
          <ul className="flex flex-col gap-3">
            <li><button onClick={() => navigate("/services/roofing")} className="text-[13px] text-white/55 hover:text-white transition-colors">Roofing</button></li>
            <li><button onClick={() => navigate("/services/siding")} className="text-[13px] text-white/55 hover:text-white transition-colors">Siding</button></li>
            <li><button onClick={() => navigate("/services/windows")} className="text-[13px] text-white/55 hover:text-white transition-colors">Windows</button></li>
            <li><button onClick={() => navigate("/services/gutters")} className="text-[13px] text-white/55 hover:text-white transition-colors">Gutters</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#58E3EA] mb-5">Company</h4>
          <ul className="flex flex-col gap-3">
            <li><button onClick={() => navigate("/about")} className="text-[13px] text-white/55 hover:text-white transition-colors">About Us</button></li>
            <li><button onClick={() => navigate("/")} className="text-[13px] text-white/55 hover:text-white transition-colors">Our Process</button></li>
            <li><button onClick={() => navigate("/estimate")} className="text-[13px] text-white/55 hover:text-white transition-colors">Contact</button></li>
            <li><a href="#" className="text-[13px] text-white/55 hover:text-white transition-colors">Reviews</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#58E3EA] mb-5">Contact</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="tel:+16515550100" className="text-[13px] text-white/55 hover:text-white transition-colors flex items-center gap-2"><Phone size={12} /> (651) 555-0100</a></li>
            <li><a href="mailto:hello@docoexteriors.com" className="text-[13px] text-white/55 hover:text-white transition-colors flex items-center gap-2"><Mail size={12} /> hello@docoexteriors.com</a></li>
            <li><span className="text-[13px] text-white/55 flex items-center gap-2"><MapPin size={12} /> Minneapolis, MN</span></li>
            <li><span className="text-[13px] text-white/55 flex items-center gap-2"><Shield size={12} /> Licensed & Insured</span></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[12px] text-white/30">
          &copy; 2025 DOCO Exteriors. All rights reserved. Owned by <a href="#" className="text-[#58E3EA]">Kris & Jenna Donovan</a>.
        </p>
        <p className="text-[12px] text-white/30">
          <a href="#" className="text-[#58E3EA]">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href="#" className="text-[#58E3EA]">Terms of Service</a>
        </p>
      </div>
    </footer>
  );
}

export function SiteNav() {
  const [, navigate] = useLocation();

  return (
    <nav
      data-testid="nav-main"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-[68px] bg-[#0A0A0A]/95 backdrop-blur-xl"
      style={{ borderBottom: "1px solid rgba(88,227,234,0.12)" }}
    >
      <button onClick={() => navigate("/")} className="flex items-center" data-testid="link-home-logo">
        <img src="/logo-header.svg" alt="DOCO Exteriors" style={{ height: 28, width: "auto" }} />
      </button>
      <ul className="hidden md:flex items-center gap-9 list-none">
        <li><button onClick={() => navigate("/")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-home">Home</button></li>
        <li><button onClick={() => navigate("/about")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-about">About</button></li>
        <li><button onClick={() => navigate("/#services")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-services">Services</button></li>
        <li><button onClick={() => navigate("/estimate")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-contact">Contact</button></li>
      </ul>
      <button
        onClick={() => navigate("/estimate")}
        className="bg-[#58E3EA] text-[#0A0A0A] text-[13px] font-bold tracking-wider uppercase px-6 py-2.5 rounded cursor-pointer transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
        data-testid="button-nav-estimate"
      >
        Get Free Estimate
      </button>
    </nav>
  );
}
