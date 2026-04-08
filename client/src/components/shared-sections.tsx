import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowRight, Facebook, Instagram, Linkedin, Mail, MapPin, Shield, FileText, CheckCircle2, X } from "lucide-react";
import { SERVICE_AREA, SURROUNDING_AREA } from "@/lib/cities";
import inspectionBg from "@assets/inspection-2_1773362648618.jpg";
import insuranceBg from "@assets/insurance-2_1773362648618.jpg";
import designMeetingBg from "@assets/design-meeting-2_1773362648618.jpg";
import schedulingBg from "@assets/scheduling_1773362648618.jpg";
import scheduledBg from "@assets/scheduled_1773362648618.jpg";
import buildDayBg from "@assets/build-day-2_1773362648617.jpg";
import projectCompleteBg from "@assets/completion-2_1773362648618.jpg";

const PROCESS_STEPS = [
  { num: "01", title: "Free Inspection", desc: "Your Project Manager will complete a full exterior inspection of your home including 3D imagery when appropriate. After the inspection, we will review any areas of concern with you and provide a clear explanation of our findings along with an estimate for the recommended work.", bgImage: inspectionBg },
  { num: "02", title: "Potential Insurance Claim", desc: "If the damage may qualify for insurance coverage, the next step is filing a claim with your insurance company. Your Project Manager will provide the documentation and scope information necessary to support your claim and help guide you through the process.", callout: "In many cases, your Project Manager will meet with your insurance company's representative onsite to review the damage and confirm the scope of work. Once approved, we'll walk through the final scope together.", bgImage: insuranceBg },
  { num: "03", title: "Design Meeting", desc: "Before construction begins, we will hold a design meeting to finalize the details of your project. During this meeting, we will confirm product selections, review construction plans, and address any special considerations or requests you may have for your build day.", bgImage: designMeetingBg },
  { num: "04", title: "Project Scheduling", desc: "Once selections are finalized, our team will place orders with our suppliers and coordinate with our construction crews. Within approximately 72 hours of your design meeting, we will confirm product availability and provide you with an estimated timeline for your project.", bgImage: schedulingBg },
  { num: "05", title: "Project Scheduled", desc: "When materials are ready and scheduling is finalized, our team will contact you to confirm your construction dates. Materials will typically be delivered to your driveway prior to the start of construction, and we will confirm the expected start and completion dates with you.", bgImage: scheduledBg },
  { num: "06", title: "Build Day", desc: "Construction day can be busy, loud, and exciting as your home transformation begins. Your Project Manager will provide a preparation guide beforehand to help minimize inconvenience for you and your family.", bgImage: buildDayBg },
  { num: "07", title: "Project Completion", desc: "With construction complete, you can enjoy the improved look, protection, and value of your home. You will receive a final paid-in-full invoice for your records, along with any applicable warranty documentation.", bgImage: projectCompleteBg },
];

const SLIDE_COLORS = [
  "bg-[#0D2B2E]", "bg-[#0B2035]", "bg-[#162830]", "bg-[#0F1F2B]",
  "bg-[#192B28]", "bg-[#1A2030]", "bg-[#1C2820]",
];


export function GuidedProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const step = PROCESS_STEPS[activeStep];

  const scrollCarouselTo = (index: number) => {
    if (carouselRef.current) {
      const child = carouselRef.current.children[index] as HTMLElement;
      child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  return (
    <section className="bg-[#111111] text-white px-8 md:px-20 py-24">
      <h2 className="text-[clamp(26px,3vw,38px)] font-extrabold tracking-tight pb-12" data-testid="text-process-headline">Our Guided Process</h2>

      <div className="hidden md:grid md:grid-cols-[280px_1fr]">
        <div className="border-r border-white/[0.07] flex flex-col">
          {PROCESS_STEPS.map((s, i) => (
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
                  {s.num}
                </span>
                <span className={`text-[13px] leading-snug transition-colors ${activeStep === i ? "text-white font-bold" : "text-white/[0.42] font-semibold"}`}>
                  {s.title}
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
              className={`relative flex flex-col h-full min-h-[400px] ${SLIDE_COLORS[activeStep % SLIDE_COLORS.length]}`}
            >
              {"bgImage" in step && step.bgImage && (
                <>
                  <img src={step.bgImage as string} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)" }} />
                </>
              )}
              <div className="relative z-10 flex flex-col justify-end h-full px-14 pb-14 pt-16">
                <div className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#58E3EA] mb-4">
                  Step {step.num} of {String(PROCESS_STEPS.length).padStart(2, "0")}
                </div>
                <h3 className="text-[clamp(20px,2.2vw,30px)] font-extrabold tracking-tight leading-[1.15] mb-4 text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/[0.58] max-w-[420px]">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile carousel — square cards, tap to expand */}
      <div ref={carouselRef} className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-8 px-8 swipe-carousel">
        {PROCESS_STEPS.map((s, i) => (
          <div
            key={i}
            className={`relative snap-start shrink-0 w-[78vw] aspect-square rounded-lg overflow-hidden flex flex-col justify-end cursor-pointer ${SLIDE_COLORS[i % SLIDE_COLORS.length]}`}
            onClick={() => { setExpandedStep(i); }}
            data-testid={`card-process-mobile-${i}`}
          >
            {"bgImage" in s && s.bgImage && (
              <>
                <img src={s.bgImage as string} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)" }} />
              </>
            )}
            <div className="relative z-10 p-5 flex flex-col justify-end">
              <div className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#58E3EA] mb-2">
                Step {s.num} of {String(PROCESS_STEPS.length).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-extrabold tracking-tight leading-[1.2] text-white">
                {s.title}
              </h3>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/45 font-medium">
                <span>Tap to read more</span>
                <ArrowUpRight size={11} className="text-white/35" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {expandedStep !== null && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] md:hidden"
            onTouchStart={e => {
              touchStartX.current = e.touches[0].clientX;
              touchStartY.current = e.touches[0].clientY;
            }}
            onTouchEnd={e => {
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              const dy = e.changedTouches[0].clientY - touchStartY.current;
              if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
                const next = dx < 0
                  ? Math.min(expandedStep + 1, PROCESS_STEPS.length - 1)
                  : Math.max(expandedStep - 1, 0);
                setExpandedStep(next);
                scrollCarouselTo(next);
              } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
                setExpandedStep(null);
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={expandedStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className={`relative w-full h-full flex flex-col ${SLIDE_COLORS[expandedStep % SLIDE_COLORS.length]}`}
              >
                {"bgImage" in PROCESS_STEPS[expandedStep] && PROCESS_STEPS[expandedStep].bgImage && (
                  <>
                    <img src={PROCESS_STEPS[expandedStep].bgImage as string} alt="" className="absolute inset-0 w-full h-full object-cover opacity-75" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.25) 100%)" }} />
                  </>
                )}

                {/* Top bar */}
                <div className="relative z-10 flex items-center justify-between px-6 pt-14 pb-4">
                  <div className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#58E3EA]">
                    Step {PROCESS_STEPS[expandedStep].num} of {String(PROCESS_STEPS.length).padStart(2, "0")}
                  </div>
                  <button
                    onClick={() => setExpandedStep(null)}
                    className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
                    data-testid="button-process-overlay-close"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-end px-7 pb-14">
                  <h3 className="text-[clamp(22px,6vw,32px)] font-extrabold tracking-tight leading-[1.15] mb-5 text-white">
                    {PROCESS_STEPS[expandedStep].title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/70">
                    {PROCESS_STEPS[expandedStep].desc}
                  </p>

                  {/* Step dots + swipe hint */}
                  <div className="flex items-center gap-2 mt-8">
                    {PROCESS_STEPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={e => { e.stopPropagation(); setExpandedStep(i); scrollCarouselTo(i); }}
                        className={`h-1 rounded-full transition-all ${i === expandedStep ? "w-6 bg-[#58E3EA]" : "w-1.5 bg-white/25"}`}
                      />
                    ))}
                    <span className="ml-auto text-[11px] text-white/30">Swipe or tap to navigate</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

type SelectedAddress = { formatted: string; city: string; cityType: "service" | "surrounding" | null };

function detectCityType(cityName: string): "service" | "surrounding" | null {
  const n = cityName.trim().toLowerCase();
  if (SERVICE_AREA.some(c => c.toLowerCase() === n)) return "service";
  if (SURROUNDING_AREA.some(c => c.toLowerCase() === n)) return "surrounding";
  return null;
}

export function CTASection() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<SelectedAddress | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (!key || document.getElementById("google-maps-script")) return;
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    let tries = 0;
    const init = () => {
      const Autocomplete = (window as any).google?.maps?.places?.Autocomplete;
      if (!Autocomplete) {
        if (tries++ < 30) setTimeout(init, 200);
        return;
      }
      const autocomplete = new Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address", "address_components"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const formatted: string = place.formatted_address ?? "";
        const components: any[] = place.address_components ?? [];
        const cityName: string = components.find((c: any) => c.types.includes("locality"))?.long_name ?? "";
        const cityType = detectCityType(cityName);
        setSelected({ formatted, city: cityName, cityType });
      });
    };
    init();
  }, []);

  function handleContinue() {
    if (!selected) return;
    const params = new URLSearchParams({ city: selected.city, cityType: selected.cityType ?? "", address: selected.formatted });
    navigate(`/estimate?${params.toString()}`);
  }

  return (
    <section
      id="contact"
      className="text-white px-8 md:px-20 py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-16 bg-[#0b0d0e]"
      style={{ borderTop: "1px solid rgba(88,227,234,0.1)", backgroundColor: "#000000" }}
    >
      <div>
        <h2 className="text-[clamp(32px,4vw,56px)] font-black tracking-tighter leading-[1.05]" data-testid="text-cta-headline">
          Ready for a<br/><span className="text-[#58E3EA]">Free Estimate?</span>
        </h2>
        <p className="mt-5 text-base text-white/50 leading-relaxed max-w-[440px]">
          Our team personally reviews every request. We'll get back to you within one business day with a straightforward, no-pressure estimate.
        </p>
      </div>
      <div className="flex flex-col gap-5 max-w-md w-full">
        <div>
          <p className="text-white/80 font-semibold mb-1 text-[24px]">Check your service area</p>
          <p className="text-white/45 text-sm leading-relaxed">Enter your property address</p>
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your property address..."
          onChange={() => setSelected(null)}
          className="w-full bg-white/[0.06] border border-white/[0.12] rounded text-white placeholder-white/30 text-sm px-4 py-3 focus:outline-none focus:border-[#58E3EA]/60 transition-colors"
          data-testid="input-cta-address"
        />

        {selected && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {selected.cityType === "service" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 rounded bg-[#58E3EA]/[0.08] border border-[#58E3EA]/20">
                    <CheckCircle2 size={18} className="text-[#58E3EA] shrink-0" />
                    <span className="text-sm text-white/80">
                      <span className="text-white font-semibold">{selected.city}</span> is in our service area!
                    </span>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold px-8 py-3.5 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5 self-start"
                    data-testid="button-cta-continue"
                  >
                    Continue to estimate
                    <ArrowUpRight size={15} strokeWidth={2.5} />
                  </button>
                </div>
              ) : selected.cityType === "surrounding" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 px-4 py-3 rounded bg-white/[0.04] border border-white/[0.1]">
                    <MapPin size={16} className="text-white/40 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/55 leading-relaxed">
                      We're expanding to <span className="text-white/75 font-medium">{selected.city}</span> soon. You can still submit a request and we'll be in touch when we reach your area.
                    </span>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="border border-white/20 text-white/70 text-sm font-semibold px-8 py-3.5 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:border-white/40 hover:text-white self-start"
                    data-testid="button-cta-continue-surrounding"
                  >
                    Continue anyway
                    <ArrowUpRight size={15} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3 rounded bg-white/[0.04] border border-white/[0.1]">
                  <MapPin size={16} className="text-white/40 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/55 leading-relaxed">
                    We don't currently serve this area. We cover the Minneapolis/St. Cloud metro.
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
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
            Minneapolis-based exterior contractors you can count on. Locally owned.
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
            <li><button onClick={() => navigate("/estimate")} className="text-[13px] text-white/55 hover:text-white transition-colors">Contact</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#58E3EA] mb-5">Contact</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="mailto:hello@docoexteriors.com" className="text-[13px] text-white/55 hover:text-white transition-colors flex items-center gap-2"><Mail size={12} /> hello@docoexteriors.com</a></li>
            <li><span className="text-[13px] text-white/55 flex items-center gap-2"><MapPin size={12} /> Minneapolis, MN</span></li>
            <li><a href="/Reg_cert_1773018901213.pdf" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/55 hover:text-white transition-colors flex items-center gap-2"><FileText size={12} /> GC Registration Certificate</a></li>
            <li><span className="text-[13px] text-white/55 flex items-center gap-2"><Shield size={12} /> Licensed & Insured</span></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[12px] text-white/30">
          &copy; 2025 DOCO Exteriors. All rights reserved. Locally owned and operated.
        </p>
        <p className="text-[12px] text-white/30">
          <a href="#" className="text-[#58E3EA]">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href="#" className="text-[#58E3EA]">Terms of Service</a>
        </p>
      </div>
    </footer>
  );
}

export function SiteNav({ variant = "subpage" }: { variant?: "home" | "subpage" }) {
  const [, navigate] = useLocation();

  return (
    <nav
      data-testid="nav-main"
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 md:px-12 h-[68px] bg-[#0A0A0A]/95 backdrop-blur-xl"
      style={{ borderBottom: "1px solid rgba(88,227,234,0.12)" }}
    >
      <div className="flex items-center gap-2">
        {variant === "subpage" && (
          <button
            onClick={() => navigate("/")}
            className="text-white/70 hover:text-[#58E3EA] transition-colors flex items-center"
            data-testid="link-nav-back-home"
          >
            <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" />
          </button>
        )}
        <button onClick={() => navigate("/")} className="flex items-center transition-transform duration-200 hover:scale-110 focus:scale-110 focus:outline-none" data-testid="link-home-logo">
          <img src="/logo-header.svg" alt="DOCO Exteriors" style={{ height: 28, width: "auto" }} />
        </button>
      </div>
      {variant !== "subpage" && (
        <ul className="hidden md:flex items-center gap-9 list-none absolute left-1/2 -translate-x-1/2">
          <li><button onClick={() => navigate("/about")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-about">About</button></li>
          <li><button onClick={() => navigate("/#services")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-services">Services</button></li>
          <li><button onClick={() => navigate("/estimate")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-contact">Contact</button></li>
        </ul>
      )}
      <button
        onClick={() => navigate("/estimate")}
        className="bg-[#58E3EA] text-[#0A0A0A] text-[13px] font-bold px-6 py-2.5 rounded cursor-pointer transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5 ml-auto"
        data-testid="button-nav-estimate"
      >
        Free Estimate
      </button>
    </nav>
  );
}

const ALL_SERVICES = [
  { tag: "Roofing", title: "Roof Replacement & Repair", desc: "From storm damage to full replacements, we handle asphalt, metal, and architectural shingles with precision.", img: "https://cdn.midjourney.com/365218d6-e05d-4ccf-860d-234a277025fd/0_0.png", slug: "roofing" },
  { tag: "Siding", title: "Siding Installation", desc: "Steel, vinyl, or engineered wood — our siding crews deliver crisp, clean installations that last decades.", img: "https://cdn.midjourney.com/039404f0-2543-4e83-a864-1b8e898f73c1/0_0.png", slug: "siding" },
  { tag: "Windows", title: "Window Replacement", desc: "Energy-efficient, Minnesota-rated windows installed to keep heat in and cold out — lowering your bills year-round.", img: "https://cdn.midjourney.com/15c2b54f-384d-4719-9eab-116caf3f4bc9/0_0.png", slug: "windows" },
  { tag: "Gutters", title: "Gutter Systems", desc: "Seamless gutters, guards, and downspout systems that protect your foundation through Minnesota's harshest seasons.", img: "https://cdn.midjourney.com/10a24684-6aa4-4c97-8ad4-e6ce00a8fb6f/0_0.png", slug: "gutters" },
];

export function OtherServicesSection({ currentSlug }: { currentSlug: string }) {
  const [, navigate] = useLocation();
  const otherServices = ALL_SERVICES.filter((s) => s.slug !== currentSlug);

  return (
    <section className="bg-[#111111] px-8 md:px-20 pt-24 pb-0">
      <h2 className="text-[clamp(28px,3vw,42px)] font-extrabold tracking-tight text-white mb-14" data-testid="text-other-services-headline">Our Other Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5">
        {otherServices.map((svc, i) => (
          <div
            key={svc.slug}
            className="relative overflow-hidden aspect-[3/4] cursor-pointer bg-[#1A1A1A] group"
            onClick={() => navigate(`/services/${svc.slug}`)}
            data-testid={`card-other-service-${i}`}
          >
            <img src={svc.img} alt={svc.tag} className="w-full h-full object-cover transition-transform duration-600 opacity-70 group-hover:scale-[1.06] group-hover:opacity-85" />
            <div className="absolute bottom-0 left-0 right-0 p-7" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)" }}>
              <span className="inline-block bg-[#58E3EA] text-[#0A0A0A] text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-sm mb-3">{svc.tag}</span>
              <h3 className="text-xl font-bold mb-2.5 tracking-tight text-white">{svc.title}</h3>
              <p className="text-[13px] text-white/70 leading-relaxed mb-4">{svc.desc}</p>
              <span className="text-[12px] font-bold tracking-wider uppercase text-[#58E3EA] flex items-center gap-1.5 transition-all group-hover:gap-2.5">
                Learn more <ArrowUpRight size={13} strokeWidth={2.5} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
