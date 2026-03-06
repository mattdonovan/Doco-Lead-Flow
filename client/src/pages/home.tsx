import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Facebook, Instagram, Linkedin, Phone, Mail, MapPin, Shield } from "lucide-react";

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

function DocoLogo({ height = 28 }: { height?: number }) {
  return <img src="/logo-header.svg" alt="DOCO Exteriors" style={{ height, width: "auto" }} />;
}

function DocoLogoFooter({ height = 56 }: { height?: number }) {
  return <img src="/logo-footer.svg" alt="DOCO Exteriors" style={{ height, width: "auto" }} />;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* NAV */}
      <nav
        data-testid="nav-main"
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-[68px] transition-all duration-300 ${
          isNavScrolled ? "bg-[#0A0A0A]/95 backdrop-blur-xl" : "bg-[#0A0A0A]/92 backdrop-blur-lg"
        }`}
        style={{ borderBottom: "1px solid rgba(88,227,234,0.12)" }}
      >
        <a href="#" className="flex items-center" data-testid="link-home-logo">
          <DocoLogo height={28} />
        </a>
        <ul className="hidden md:flex items-center gap-9 list-none">
          <li><button onClick={() => scrollTo("home")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-home"><span className="text-[#58E3EA] mr-1">&#9658;</span>Home</button></li>
          <li><button onClick={() => scrollTo("about")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-about">About</button></li>
          <li><button onClick={() => scrollTo("services")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-services">Services</button></li>
          <li><button onClick={() => scrollTo("contact")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-contact">Contact</button></li>
        </ul>
        <button
          onClick={() => navigate("/estimate")}
          className="bg-[#58E3EA] text-[#0A0A0A] text-[13px] font-bold tracking-wider uppercase px-6 py-2.5 rounded cursor-pointer transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
          data-testid="button-nav-estimate"
        >
          Get Free Estimate
        </button>
      </nav>

      {/* HERO */}
      <section id="home" className="min-h-screen grid grid-cols-1 lg:grid-cols-2 pt-[68px] bg-[#0A0A0A]">
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#58E3EA] mb-6 flex items-center gap-2.5"
          >
            <span className="w-8 h-0.5 bg-[#58E3EA]" />
            Minneapolis Exterior Specialists
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[clamp(42px,5.5vw,72px)] font-extrabold leading-[1.05] tracking-tight mb-7"
            data-testid="text-hero-headline"
          >
            Protecting Homes,<br/><span className="text-[#58E3EA]">Exceeding</span><br/>Expectations.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-base leading-relaxed text-white/65 max-w-[460px] mb-11"
          >
            At DOCO Exteriors, Kris and Jenna Donovan lead a team dedicated to delivering superior roofing, siding, windows, and gutters across the greater Minneapolis metro. Every project is personal.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-6 flex-wrap"
          >
            <button
              onClick={() => navigate("/estimate")}
              className="bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-8 py-4 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
              data-testid="button-hero-estimate"
            >
              Get Free Estimate
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => scrollTo("services")}
              className="text-white text-[13px] font-semibold tracking-wider uppercase inline-flex items-center gap-2 border-b border-white/30 pb-0.5 transition-colors hover:text-[#58E3EA] hover:border-[#58E3EA]"
              data-testid="button-hero-services"
            >
              Our Services
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>
        <div className="relative bg-[#1A1A1A] hidden lg:block">
          <div className="grid grid-rows-2 h-full">
            <div className="overflow-hidden" style={{ borderBottom: "3px solid #0A0A0A" }}>
              <img
                src="https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=900&q=80"
                alt="Roof installation"
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[6s]"
              />
            </div>
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80"
                alt="Home exterior"
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[6s]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-[#F5F4F0] text-[#0A0A0A] grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        <div className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80"
            alt="Minneapolis home exterior"
            className="w-full h-full object-cover block min-h-[400px]"
          />
        </div>
        <div className="p-12 md:p-16 lg:py-24 lg:px-[72px] flex flex-col justify-center">
          <h2 className="text-[clamp(34px,4vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-7 text-[#0A0A0A]" data-testid="text-about-headline">
            Built on Trust,<br/>Finished with Pride.
          </h2>
          <p className="text-[15px] leading-relaxed text-[#444] mb-5 max-w-[480px]">
            DOCO Exteriors was founded by Kris and Jenna Donovan with one goal in mind: to give Minneapolis homeowners an exterior contractor they can genuinely trust. We see your home as more than a project — it's your biggest investment and where life happens.
          </p>
          <p className="text-[15px] leading-relaxed text-[#444] mb-5 max-w-[480px]">
            With deep roots in the Twin Cities, our crews show up on time, communicate clearly, and leave every job site cleaner than they found it. From a full roof replacement to new windows and gutters, we bring the same level of care to every single home.
          </p>
          <a href="#about" className="text-[#0A0A0A] text-[13px] font-bold tracking-wider uppercase inline-flex items-center gap-2 mt-2 border-b-2 border-[#0A0A0A] pb-0.5 self-start transition-colors hover:text-[#3ABFC6] hover:border-[#3ABFC6]" data-testid="link-about-more">
            More about us
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </a>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="bg-[#F5F4F0] px-8 md:px-20 pt-20 pb-24" style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
        <h2 className="text-[clamp(28px,3vw,40px)] font-extrabold text-[#0A0A0A] tracking-tight mb-12" data-testid="text-numbers-headline">Our Numbers</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { num: "15", suffix: "+", label: "Years Serving\nMinneapolis" },
            { num: "8", suffix: "", label: "Crew Members &\nGrowing" },
            { num: "40", suffix: "+", label: "Twin Cities\nCommunities Served" },
            { num: "600", suffix: "+", label: "Projects\nCompleted" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 md:p-10 rounded shadow-sm" data-testid={`card-number-${i}`}>
              <div className="text-[52px] font-black text-[#0A0A0A] tracking-tighter leading-none mb-3">
                {item.num}<span className="text-[#3ABFC6]">{item.suffix}</span>
              </div>
              <div className="text-[12px] font-semibold tracking-wider uppercase text-[#888] leading-snug whitespace-pre-line">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-[#111111] px-8 md:px-20 pt-24">
        <div className="flex items-end justify-between mb-14">
          <h2 className="text-[clamp(28px,3vw,42px)] font-extrabold tracking-tight" data-testid="text-services-headline">Our Services</h2>
          <div className="flex gap-3">
            <button className="w-11 h-11 border border-white/20 bg-transparent text-white flex items-center justify-center rounded-sm transition-all hover:bg-[#58E3EA] hover:border-[#58E3EA] hover:text-[#0A0A0A]" data-testid="button-services-prev">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button className="w-11 h-11 border border-white/20 bg-transparent text-white flex items-center justify-center rounded-sm transition-all hover:bg-[#58E3EA] hover:border-[#58E3EA] hover:text-[#0A0A0A]" data-testid="button-services-next">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
          {[
            { tag: "Roofing", title: "Roof Replacement & Repair", desc: "From storm damage to full replacements, we handle asphalt, metal, and architectural shingles with precision.", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" },
            { tag: "Siding", title: "Siding Installation", desc: "Fiber cement, vinyl, or engineered wood — our siding crews deliver crisp, clean installations that last decades.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
            { tag: "Windows", title: "Window Replacement", desc: "Energy-efficient, Minnesota-rated windows installed to keep heat in and cold out — lowering your bills year-round.", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80" },
            { tag: "Gutters", title: "Gutter Systems", desc: "Seamless gutters, guards, and downspout systems that protect your foundation through Minnesota's harshest seasons.", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80" },
          ].map((svc, i) => (
            <div key={i} className="relative overflow-hidden aspect-[3/4] cursor-pointer bg-[#1A1A1A] group" data-testid={`card-service-${i}`}>
              <img src={svc.img} alt={svc.tag} className="w-full h-full object-cover transition-transform duration-600 opacity-70 group-hover:scale-[1.06] group-hover:opacity-85" />
              <div className="absolute bottom-0 left-0 right-0 p-7" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)" }}>
                <span className="inline-block bg-[#58E3EA] text-[#0A0A0A] text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-sm mb-3">{svc.tag}</span>
                <h3 className="text-xl font-bold mb-2.5 tracking-tight">{svc.title}</h3>
                <p className="text-[13px] text-white/70 leading-relaxed mb-4">{svc.desc}</p>
                <button
                  onClick={() => navigate("/estimate")}
                  className="text-[12px] font-bold tracking-wider uppercase text-[#58E3EA] flex items-center gap-1.5 transition-all group-hover:gap-2.5"
                  data-testid={`link-service-quote-${i}`}
                >
                  Get a quote <ArrowUpRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PROCESS */}
        <div id="process" className="mt-20 pb-24">
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
                  className={`grid grid-cols-1 md:grid-cols-2 min-h-[480px] ${SLIDE_COLORS[activeStep]}`}
                >
                  <div className="flex items-center justify-center border-r border-white/[0.05] p-8">
                    <div className="w-40 h-40 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center flex-col gap-2.5">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(88,227,234,0.22)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-white/[0.18] text-center">Animation<br />Area</span>
                    </div>
                  </div>
                  <div className="p-10 md:p-14 flex flex-col justify-center">
                    <div className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#58E3EA] mb-4">
                      Step {PROCESS_STEPS[activeStep].num} of 08
                    </div>
                    <h3 className="text-[clamp(20px,2.2vw,30px)] font-extrabold tracking-tight leading-[1.15] mb-4 text-white">
                      {PROCESS_STEPS[activeStep].title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/[0.58] max-w-[360px]">
                      {PROCESS_STEPS[activeStep].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
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

      {/* FOOTER */}
      <footer className="bg-[#111111] px-8 md:px-20 pt-20 pb-10" style={{ borderTop: "1px solid rgba(88,227,234,0.1)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 pb-16" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex flex-col items-start gap-5 lg:col-span-1 md:col-span-2">
            <DocoLogoFooter height={56} />
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
              <li><button onClick={() => scrollTo("services")} className="text-[13px] text-white/55 hover:text-white transition-colors">Roofing</button></li>
              <li><button onClick={() => scrollTo("services")} className="text-[13px] text-white/55 hover:text-white transition-colors">Siding</button></li>
              <li><button onClick={() => scrollTo("services")} className="text-[13px] text-white/55 hover:text-white transition-colors">Windows</button></li>
              <li><button onClick={() => scrollTo("services")} className="text-[13px] text-white/55 hover:text-white transition-colors">Gutters</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#58E3EA] mb-5">Company</h4>
            <ul className="flex flex-col gap-3">
              <li><button onClick={() => scrollTo("about")} className="text-[13px] text-white/55 hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => scrollTo("process")} className="text-[13px] text-white/55 hover:text-white transition-colors">Our Process</button></li>
              <li><button onClick={() => scrollTo("contact")} className="text-[13px] text-white/55 hover:text-white transition-colors">Contact</button></li>
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
    </div>
  );
}
