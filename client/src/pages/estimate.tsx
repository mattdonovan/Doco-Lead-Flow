import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Home, Wrench, MessageSquare, ChevronLeft, MapPin, ClipboardList, Bell } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertQuoteRequest } from "@shared/schema";

const SERVICE_AREA = [
  "Albertville", "Andover", "Anoka", "Becker", "Big Lake", "Blaine",
  "Brooklyn Center", "Brooklyn Park", "Buffalo", "Champlin", "Coon Rapids",
  "Crystal", "Dayton", "Delano", "Elk River", "Golden Valley", "Hamel",
  "Howard Lake", "Loretto", "Maple Grove", "Medina", "Monticello",
  "New Hope", "Osseo", "Otsego", "Plymouth", "Ramsey", "Robbinsdale",
  "Rogers", "St. Michael", "Watertown", "Waverly",
];

const SURROUNDING_AREA = [
  "Afton", "Apple Valley", "Bayport", "Belle Plaine", "Bloomington",
  "Burnsville", "Cambridge", "Cannon Falls", "Carver", "Chanhassen",
  "Chaska", "Cottage Grove", "East Bethel", "Eagan", "Eden Prairie",
  "Edina", "Excelsior", "Farmington", "Forest Lake", "Fridley",
  "Hopkins", "Hugo", "Lake Elmo", "Lakeville", "Lino Lakes",
  "Mahtomedi", "Maplewood", "Minnetonka", "Mound", "Newport",
  "North Branch", "Northfield", "Oak Park Heights", "Oakdale",
  "Prior Lake", "Richfield", "Rosemount", "Roseville", "Savage",
  "Shakopee", "Shorewood", "Spring Lake Park", "St. Louis Park",
  "St. Paul", "Stacy", "Stillwater", "Victoria", "Waconia",
  "Wayzata", "White Bear Lake", "Woodbury", "Wyoming",
];

const ALL_CITIES = [
  ...SERVICE_AREA.map(c => ({ name: c, type: "service" as const })),
  ...SURROUNDING_AREA.map(c => ({ name: c, type: "surrounding" as const })),
].sort((a, b) => a.name.localeCompare(b.name));

const SERVICE_IMAGES: Record<string, string> = {
  roofing: "https://cdn.midjourney.com/365218d6-e05d-4ccf-860d-234a277025fd/0_0.png",
  siding: "https://cdn.midjourney.com/039404f0-2543-4e83-a864-1b8e898f73c1/0_0.png",
  windows: "https://cdn.midjourney.com/15c2b54f-384d-4719-9eab-116caf3f4bc9/0_0.png",
  gutters: "https://cdn.midjourney.com/10a24684-6aa4-4c97-8ad4-e6ce00a8fb6f/0_0.png",
};

const SERVICES = [
  { id: "roofing", label: "Roofing", desc: "Replacement & Repair" },
  { id: "siding", label: "Siding", desc: "Installation & Repair" },
  { id: "windows", label: "Windows", desc: "Energy-Efficient Upgrades" },
  { id: "gutters", label: "Gutters", desc: "Seamless Systems" },
];

const SERVICE_OFFERINGS: Record<string, string[]> = {
  roofing: ["Full Roof Replacement", "Storm Damage Repair", "Architectural Shingles", "Metal Roofing"],
  siding: ["Fiber Cement Siding", "Vinyl Siding", "Engineered Wood Siding", "Soffit & Fascia"],
  windows: ["Double & Triple Pane", "Custom Sizing & Styles", "Low-E Glass Coating", "Full Frame Replacement"],
  gutters: ["Seamless Gutters", "Gutter Guards", "Downspout Systems", "Ice Dam Prevention"],
};

const PROPERTY_TYPES = [
  { id: "single-family", label: "Single Family Home" },
  { id: "townhouse", label: "Townhouse" },
  { id: "multi-family", label: "Multi-Family" },
  { id: "commercial", label: "Commercial" },
];

const TIMELINES = [
  { id: "asap", label: "As soon as possible" },
  { id: "1-3-months", label: "Within 1–3 months" },
  { id: "3-6-months", label: "Within 3–6 months" },
  { id: "just-exploring", label: "Just exploring options" },
];

const SIDEBAR_SECTIONS = [
  { label: "Location", icon: MapPin },
  { label: "Property", icon: Home },
  { label: "Services", icon: Wrench },
  { label: "Details", icon: MessageSquare },
  { label: "Review", icon: ClipboardList },
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  if (!phone.trim()) return true;
  return phone.replace(/\D/g, "").length === 10;
}

const SQUARE_DELAYS = [0, 0.4, 0.8, 0.25, 0.65, 1.05, 0.5, 0.9, 1.3];

function DocoAvatar() {
  return (
    <>
      <style>{`
        @keyframes squarePulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
      `}</style>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#58E3EA] to-[#3ABFC6] flex items-center justify-center shrink-0 p-[10px]">
        <div className="grid grid-cols-3 gap-[3px]">
          {SQUARE_DELAYS.map((delay, i) => (
            <div
              key={i}
              className="w-[5px] h-[5px] rounded-[1px] bg-[#0A0A0A]"
              style={{
                animation: "squarePulse 2.4s ease-in-out infinite",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function DocoLogo({ height = 24 }: { height?: number }) {
  return <img src="/logo-header.svg" alt="DOCO Exteriors" style={{ height, width: "auto" }} />;
}

interface FormData {
  city: string;
  cityType: "service" | "surrounding" | null;
  propertyType: string;
  services: string[];
  hasInsuranceClaim: boolean | null;
  projectTimeline: string;
  selectedOfferings: string[];
  additionalDetails: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function EstimatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    city: "",
    cityType: null,
    propertyType: "",
    services: [],
    hasInsuranceClaim: null,
    projectTimeline: "",
    selectedOfferings: [],
    additionalDetails: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [cityInput, setCityInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [surroundingPrompt, setSurroundingPrompt] = useState(false);
  const [notifyMode, setNotifyMode] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const offeringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredCities = cityInput.trim()
    ? ALL_CITIES.filter(c => c.name.toLowerCase().startsWith(cityInput.toLowerCase()))
    : [];

  const selectCity = (city: { name: string; type: "service" | "surrounding" }) => {
    setCityInput(city.name);
    setFormData(prev => ({ ...prev, city: city.name, cityType: city.type }));
    setShowSuggestions(false);
    if (city.type === "surrounding") {
      setSurroundingPrompt(true);
    } else {
      setSurroundingPrompt(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: InsertQuoteRequest) => {
      const res = await apiRequest("POST", "/api/quotes", data);
      return res.json();
    },
    onSuccess: () => setSubmitted(true),
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again or call us directly.", variant: "destructive" });
    },
  });

  const notifyMutation = useMutation({
    mutationFn: async (data: { email: string; city: string }) => {
      const res = await apiRequest("POST", "/api/notify", data);
      return res.json();
    },
    onSuccess: () => setNotifySubmitted(true),
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    },
  });

  const toggleService = (id: string) => {
    setFormData(prev => {
      const next = prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id];
      const validOfferings = next.flatMap(s => SERVICE_OFFERINGS[s] || []);
      return {
        ...prev,
        services: next,
        selectedOfferings: prev.selectedOfferings.filter(o => validOfferings.includes(o)),
      };
    });
  };

  const allOfferings = formData.services.flatMap(s => SERVICE_OFFERINGS[s] || []);
  const allOfferingsSelected = allOfferings.length > 0 && allOfferings.every(o => formData.selectedOfferings.includes(o));

  const toggleOffering = (offering: string) => {
    setFormData(prev => ({
      ...prev,
      selectedOfferings: prev.selectedOfferings.includes(offering)
        ? prev.selectedOfferings.filter(o => o !== offering)
        : [...prev.selectedOfferings, offering],
    }));
  };

  const toggleAllOfferings = () => {
    if (allOfferingsSelected) {
      setFormData(prev => ({ ...prev, selectedOfferings: [] }));
    } else {
      setFormData(prev => ({ ...prev, selectedOfferings: [...allOfferings] }));
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return formData.city !== "" && formData.cityType !== null && !surroundingPrompt;
      case 1:
        return formData.propertyType !== "";
      case 2:
        return formData.services.length > 0;
      case 3:
        return formData.projectTimeline !== "";
      case 4:
        return (
          formData.firstName.trim() !== "" &&
          formData.lastName.trim() !== "" &&
          isValidEmail(formData.email) &&
          isValidPhone(formData.phone)
        );
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canProceed()) return;
    if (step === 4) {
      handleSubmit();
      return;
    }
    setStep(prev => prev + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    const data: InsertQuoteRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || null,
      address: null,
      city: formData.city + ", MN",
      services: formData.services,
      propertyType: formData.propertyType,
      projectTimeline: formData.projectTimeline,
      additionalDetails: formData.additionalDetails || null,
      hasInsuranceClaim: formData.hasInsuranceClaim ?? false,
      selectedOfferings: formData.selectedOfferings.length > 0 ? formData.selectedOfferings : null,
    };
    submitMutation.mutate(data);
  };

  const QUESTIONS = [
    "What city is your property in?",
    "What type of property is this for?",
    "Which services are you interested in? Select all that apply.",
    "Let's get some details about your project.",
    "Here's a summary of your request. Please add your contact info to submit.",
  ];

  const TOTAL_STEPS = 5;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-[#58E3EA]/20 flex items-center justify-center mx-auto mb-8">
            <Check size={40} className="text-[#58E3EA]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4" data-testid="text-success-headline">
            You're all set, {formData.firstName}!
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-3">
            Kris and Jenna will personally review your request and get back to you within one business day with a straightforward, no-pressure estimate.
          </p>
          <p className="text-white/40 text-sm mb-10">
            We've sent a confirmation to <span className="text-[#58E3EA]">{formData.email}</span>
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-8 py-4 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
            data-testid="button-success-home"
          >
            Back to Home
            <ArrowUpRight size={16} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0A0A0A]">
        <div className="p-6 pb-10">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8" data-testid="button-back-home">
            <ChevronLeft size={16} />
            <DocoLogo height={20} />
          </button>
        </div>
        <div className="flex-1 px-4">
          {SIDEBAR_SECTIONS.map((section, i) => {
            const Icon = section.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <div key={i} className="flex items-center gap-3 py-3 px-3" data-testid={`sidebar-step-${i}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                  isCompleted ? "bg-[#58E3EA] text-[#0A0A0A]" : isActive ? "border-2 border-[#58E3EA] text-[#58E3EA]" : "border border-white/20 text-white/30"
                }`}>
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
                </div>
                <span className={`text-[13px] font-medium transition-colors ${isActive ? "text-white" : isCompleted ? "text-[#58E3EA]" : "text-white/30"}`}>
                  {section.label}
                </span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#58E3EA]" />}
              </div>
            );
          })}
        </div>
        <div className="p-6 border-t border-white/[0.06]">
          <p className="text-[11px] text-white/30 leading-relaxed">
            Questions? Call us at<br />
            <a href="tel:+16515550100" className="text-[#58E3EA] hover:underline">(651) 555-0100</a>
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60" data-testid="button-mobile-back">
            <ChevronLeft size={16} />
            <DocoLogo height={18} />
          </button>
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/40">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
        </div>

        <div className="lg:hidden h-1 bg-white/[0.06]">
          <motion.div className="h-full bg-[#58E3EA]" initial={{ width: "0%" }} animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>

        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 md:px-12 py-8 md:py-16">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
                <div className="flex items-start gap-3 mb-8">
                  <DocoAvatar />
                  <div>
                    <p className="text-lg md:text-xl font-semibold text-white leading-snug" data-testid="text-question">
                      {QUESTIONS[step]}
                    </p>
                  </div>
                </div>

                {step === 0 && (
                  <div className="mb-8">
                    <div ref={cityRef} className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Start typing your city..."
                        value={cityInput}
                        onChange={(e) => {
                          setCityInput(e.target.value);
                          setShowSuggestions(true);
                          setSurroundingPrompt(false);
                          setNotifyMode(false);
                          setNotifySubmitted(false);
                          setFormData(prev => ({ ...prev, city: "", cityType: null }));
                        }}
                        onFocus={() => { if (cityInput.trim()) setShowSuggestions(true); }}
                        className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                        data-testid="input-city"
                      />
                      {showSuggestions && filteredCities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded max-h-[240px] overflow-y-auto z-50">
                          {filteredCities.map((city) => (
                            <button
                              key={city.name}
                              onClick={() => selectCity(city)}
                              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/[0.06] flex items-center justify-between transition-colors"
                              data-testid={`city-option-${city.name.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <span>{city.name}, MN</span>
                              {city.type === "surrounding" && (
                                <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-400/70">Expanding Soon</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {showSuggestions && cityInput.trim().length >= 2 && filteredCities.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded p-4">
                          <p className="text-sm text-white/50">We don't currently serve this area. Try a different city in the Minneapolis metro.</p>
                        </div>
                      )}
                    </div>

                    {formData.cityType === "service" && formData.city && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-[#58E3EA] text-sm font-medium">
                        <Check size={16} /> {formData.city} is in our service area!
                      </motion.div>
                    )}

                    {surroundingPrompt && !notifySubmitted && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 bg-white/[0.04] border border-white/10 rounded-lg p-5">
                        <p className="text-sm text-white/80 mb-1 font-semibold">We're expanding to {formData.city} soon!</p>
                        <p className="text-[13px] text-white/50 mb-5 leading-relaxed">
                          We're not quite in your area yet, but we're growing fast. You can continue if your project start date is a ways out, or we can notify you when we arrive.
                        </p>
                        {!notifyMode ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setSurroundingPrompt(false)}
                              className="bg-[#58E3EA] text-[#0A0A0A] text-[12px] font-bold tracking-wider uppercase px-5 py-3 rounded transition-all hover:bg-[#3ABFC6]"
                              data-testid="button-continue-anyway"
                            >
                              Continue with my estimate
                            </button>
                            <button
                              onClick={() => setNotifyMode(true)}
                              className="border border-white/20 text-white text-[12px] font-bold tracking-wider uppercase px-5 py-3 rounded transition-all hover:border-[#58E3EA] hover:text-[#58E3EA] flex items-center gap-2"
                              data-testid="button-notify-me"
                            >
                              <Bell size={13} /> Notify me
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <label className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-1.5 block">Your email</label>
                              <input
                                type="email"
                                placeholder="you@email.com"
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                                className="w-full bg-white/[0.06] border border-white/10 px-4 py-3 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA]"
                                data-testid="input-notify-email"
                              />
                            </div>
                            <button
                              onClick={() => { if (isValidEmail(notifyEmail)) notifyMutation.mutate({ email: notifyEmail, city: formData.city }); }}
                              disabled={!isValidEmail(notifyEmail) || notifyMutation.isPending}
                              className={`text-[12px] font-bold tracking-wider uppercase px-5 py-3 rounded transition-all ${
                                isValidEmail(notifyEmail) && !notifyMutation.isPending
                                  ? "bg-[#58E3EA] text-[#0A0A0A] hover:bg-[#3ABFC6] cursor-pointer"
                                  : "bg-white/10 text-white/30 cursor-not-allowed"
                              }`}
                              data-testid="button-submit-notify"
                            >
                              {notifyMutation.isPending ? "Sending..." : "Submit"}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {notifySubmitted && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 bg-[#58E3EA]/10 border border-[#58E3EA]/30 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Check size={16} className="text-[#58E3EA]" />
                          <p className="text-sm font-semibold text-[#58E3EA]">You're on the list!</p>
                        </div>
                        <p className="text-[13px] text-white/50 mb-4">We'll let you know as soon as we start serving {formData.city}.</p>
                        <button
                          onClick={() => { setSurroundingPrompt(false); setNotifySubmitted(false); }}
                          className="text-[12px] font-bold tracking-wider uppercase text-white/60 hover:text-white transition-colors"
                          data-testid="button-continue-after-notify"
                        >
                          Or continue with an estimate anyway →
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-3 mb-8" data-testid="input-property-type">
                    {PROPERTY_TYPES.map((pt) => {
                      const selected = formData.propertyType === pt.id;
                      return (
                        <button
                          key={pt.id}
                          onClick={() => setFormData(prev => ({ ...prev, propertyType: pt.id }))}
                          className={`flex items-center gap-4 px-5 py-4 rounded-lg border-2 transition-all text-left ${
                            selected ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                          }`}
                          data-testid={`button-property-${pt.id}`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"
                          }`}>
                            {selected && <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />}
                          </div>
                          <span className="text-sm font-medium text-white">{pt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-2 gap-3 mb-8" data-testid="input-services">
                    {SERVICES.map((svc) => {
                      const selected = formData.services.includes(svc.id);
                      return (
                        <button
                          key={svc.id}
                          onClick={() => toggleService(svc.id)}
                          className={`relative overflow-hidden rounded-lg border-2 transition-all aspect-[4/3] group ${
                            selected ? "border-[#58E3EA]" : "border-white/10 hover:border-white/20"
                          }`}
                          data-testid={`button-service-${svc.id}`}
                        >
                          <img
                            src={SERVICE_IMAGES[svc.id]}
                            alt={svc.label}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                              selected ? "opacity-60 scale-[1.02]" : "opacity-40 group-hover:opacity-50"
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="relative z-10 flex flex-col items-start justify-end h-full p-4">
                            <span className="text-sm font-bold text-white">{svc.label}</span>
                            <span className="text-[11px] text-white/60">{svc.desc}</span>
                          </div>
                          {selected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded bg-[#58E3EA] flex items-center justify-center z-10">
                              <Check size={14} strokeWidth={3} className="text-[#0A0A0A]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 3 && (
                  <div className="mb-8 space-y-8">
                    <div>
                      <label className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3 block">Is this an insurance claim?</label>
                      <div className="flex gap-3">
                        {[
                          { val: true, label: "Yes" },
                          { val: false, label: "No" },
                        ].map((opt) => (
                          <button
                            key={String(opt.val)}
                            onClick={() => setFormData(prev => ({ ...prev, hasInsuranceClaim: opt.val }))}
                            className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-all ${
                              formData.hasInsuranceClaim === opt.val
                                ? "border-[#58E3EA] bg-[#58E3EA]/[0.06] text-[#58E3EA]"
                                : "border-white/10 text-white/50 hover:border-white/20"
                            }`}
                            data-testid={`button-insurance-${opt.val ? "yes" : "no"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3 block">When are you looking to get started?</label>
                      <div className="flex flex-col gap-2">
                        {TIMELINES.map((tl) => {
                          const selected = formData.projectTimeline === tl.id;
                          return (
                            <button
                              key={tl.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, projectTimeline: tl.id }));
                                setTimeout(() => {
                                  offeringsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }, 100);
                              }}
                              className={`flex items-center gap-4 px-5 py-3.5 rounded-lg border-2 transition-all text-left ${
                                selected ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                              }`}
                              data-testid={`button-timeline-${tl.id}`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"
                              }`}>
                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
                              </div>
                              <span className="text-sm font-medium text-white">{tl.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {formData.projectTimeline && formData.services.length > 0 && (
                      <motion.div
                        ref={offeringsRef}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-white/40">What are you looking for?</label>
                          <button
                            onClick={toggleAllOfferings}
                            className="text-[11px] font-bold tracking-wider uppercase text-[#58E3EA] hover:text-[#3ABFC6] transition-colors"
                            data-testid="button-select-all-offerings"
                          >
                            {allOfferingsSelected ? "Deselect all" : "Select all"}
                          </button>
                        </div>
                        {formData.services.map(svcId => {
                          const svc = SERVICES.find(s => s.id === svcId);
                          const offerings = SERVICE_OFFERINGS[svcId] || [];
                          if (!svc) return null;
                          return (
                            <div key={svcId} className="mb-4">
                              <p className="text-[12px] font-semibold text-white/60 mb-2 uppercase tracking-wide">{svc.label}</p>
                              <div className="flex flex-wrap gap-2">
                                {offerings.map(offering => {
                                  const selected = formData.selectedOfferings.includes(offering);
                                  return (
                                    <button
                                      key={offering}
                                      onClick={() => toggleOffering(offering)}
                                      className={`text-[11px] font-medium px-2.5 py-1 rounded transition-all cursor-pointer ${
                                        selected
                                          ? "text-[#58E3EA] bg-[#58E3EA]/10"
                                          : "text-white/40 bg-white/[0.04] hover:text-white/60 hover:bg-white/[0.08]"
                                      }`}
                                      data-testid={`button-offering-${offering.toLowerCase().replace(/\s+/g, "-")}`}
                                    >
                                      {offering}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <div className="mt-6">
                          <label className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3 block">Other details (optional)</label>
                          <textarea
                            placeholder="Anything else we should know about your project?"
                            value={formData.additionalDetails}
                            onChange={(e) => setFormData(prev => ({ ...prev, additionalDetails: e.target.value }))}
                            rows={3}
                            className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03] resize-none"
                            data-testid="input-additional-details"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="mb-8">
                    <div className="bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden mb-8">
                      <div className="p-5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin size={14} className="text-[#58E3EA]" />
                          <span className="text-sm font-semibold text-white">{formData.city}, MN</span>
                          {formData.cityType === "surrounding" && (
                            <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-400/70 bg-yellow-400/10 px-2 py-0.5 rounded">Expanding Soon</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Home size={14} className="text-[#58E3EA]" />
                          <span className="text-sm text-white/70">{PROPERTY_TYPES.find(p => p.id === formData.propertyType)?.label}</span>
                        </div>
                      </div>

                      <div className="p-5 border-b border-white/[0.06]">
                        <p className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3">Services</p>
                        <div className="flex gap-3 flex-wrap">
                          {formData.services.map(svcId => {
                            const svc = SERVICES.find(s => s.id === svcId);
                            return (
                              <div key={svcId} className="relative w-[100px] h-[70px] rounded overflow-hidden">
                                <img src={SERVICE_IMAGES[svcId]} alt={svc?.label} className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <span className="absolute bottom-2 left-2 text-[11px] font-bold text-white">{svc?.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {formData.selectedOfferings.length > 0 && (
                        <div className="p-5 border-b border-white/[0.06]">
                          <p className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3">Specific Needs</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedOfferings.map(o => (
                              <span key={o} className="text-[11px] font-medium text-[#58E3EA] bg-[#58E3EA]/10 px-2.5 py-1 rounded">{o}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-5">
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                          <div>
                            <span className="text-white/40 text-[11px] font-bold tracking-wider uppercase">Insurance</span>
                            <p className="text-white/80 mt-0.5">{formData.hasInsuranceClaim === true ? "Yes" : formData.hasInsuranceClaim === false ? "No" : "Not specified"}</p>
                          </div>
                          <div>
                            <span className="text-white/40 text-[11px] font-bold tracking-wider uppercase">Timeline</span>
                            <p className="text-white/80 mt-0.5">{TIMELINES.find(t => t.id === formData.projectTimeline)?.label}</p>
                          </div>
                          {formData.additionalDetails && (
                            <div className="col-span-2 mt-2">
                              <span className="text-white/40 text-[11px] font-bold tracking-wider uppercase">Details</span>
                              <p className="text-white/60 mt-0.5 text-[13px] leading-relaxed">{formData.additionalDetails}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[11px] font-bold tracking-wider uppercase text-white/40">Your Information</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                          data-testid="input-first-name"
                        />
                        <input
                          type="text"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                          data-testid="input-last-name"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          onBlur={() => setEmailTouched(true)}
                          className={`w-full bg-white/[0.06] border px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03] ${
                            emailTouched && formData.email && !isValidEmail(formData.email) ? "border-red-400/60" : "border-white/10"
                          }`}
                          data-testid="input-email"
                        />
                        {emailTouched && formData.email && !isValidEmail(formData.email) && (
                          <p className="text-red-400 text-[11px] mt-1.5">Please enter a valid email address</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone number (optional)"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                          onBlur={() => setPhoneTouched(true)}
                          className={`w-full bg-white/[0.06] border px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03] ${
                            phoneTouched && formData.phone && !isValidPhone(formData.phone) ? "border-red-400/60" : "border-white/10"
                          }`}
                          data-testid="input-phone"
                        />
                        {phoneTouched && formData.phone && !isValidPhone(formData.phone) && (
                          <p className="text-red-400 text-[11px] mt-1.5">Please enter a valid 10-digit phone number</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
            <button
              onClick={step === 0 ? () => navigate("/") : goBack}
              className="flex items-center gap-2 text-white/50 text-sm font-medium hover:text-white transition-colors"
              data-testid="button-step-back"
            >
              <ArrowLeft size={16} />
              {step === 0 ? "Home" : "Back"}
            </button>
            <button
              onClick={goNext}
              disabled={!canProceed() || submitMutation.isPending}
              className={`text-sm font-bold tracking-wider uppercase px-8 py-3.5 rounded inline-flex items-center gap-2 transition-all ${
                canProceed() && !submitMutation.isPending
                  ? "bg-[#58E3EA] text-[#0A0A0A] hover:bg-[#3ABFC6] hover:-translate-y-0.5 cursor-pointer"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
              data-testid="button-step-next"
            >
              {submitMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : step === 4 ? (
                <>
                  Submit Request
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </>
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
