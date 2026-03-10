import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Home, Wrench, ChevronLeft, MapPin, ClipboardList, Bell, ChevronDown, Upload, Camera, X } from "lucide-react";
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

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyMatchCities(input: string): { exact: typeof ALL_CITIES; fuzzy: typeof ALL_CITIES } {
  const q = input.trim().toLowerCase();
  if (!q) return { exact: [], fuzzy: [] };
  const exact = ALL_CITIES.filter(c => c.name.toLowerCase().startsWith(q));
  if (exact.length > 0) return { exact, fuzzy: [] };
  const threshold = Math.max(2, Math.floor(q.length * 0.4));
  const scored = ALL_CITIES
    .map(c => {
      const name = c.name.toLowerCase();
      const sub = name.slice(0, q.length);
      const dist = levenshtein(q, sub);
      const fullDist = levenshtein(q, name);
      return { city: c, dist: Math.min(dist, fullDist) };
    })
    .filter(s => s.dist <= threshold)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 5);
  return { exact: [], fuzzy: scored.map(s => s.city) };
}

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

const PROPERTY_TYPES = [
  { id: "single-family", label: "Single Family Home" },
  { id: "townhouse", label: "Townhouse" },
  { id: "multi-family", label: "Multi-Family" },
  { id: "commercial", label: "Commercial" },
];

const TIMELINES = [
  { id: "asap", label: "As soon as possible" },
  { id: "1-3-months", label: "Within 1\u20133 months" },
  { id: "3-6-months", label: "Within 3\u20136 months" },
  { id: "just-exploring", label: "Just exploring options" },
];

const SIDEBAR_SECTIONS = [
  { label: "Location", icon: MapPin },
  { label: "Project", icon: Home },
  { label: "Details", icon: Wrench },
  { label: "Review", icon: ClipboardList },
];

const SERVICE_QUESTIONS: Record<string, { q1: { question: string; options: string[] }; q2: { question: string; options: string[] } }> = {
  roofing: {
    q1: { question: "How old is your current roof?", options: ["Under 10 years", "10\u201320 years", "20+ years", "Don't know"] },
    q2: { question: "What's the situation?", options: ["Active leak or water damage", "Missing or visibly damaged shingles", "Storm or hail damage", "Just aging \u2014 time for a replacement", "Not sure, need an inspection"] },
  },
  siding: {
    q1: { question: "What's your current siding material?", options: ["Vinyl", "Wood", "Fiber cement", "Hardie", "Not sure"] },
    q2: { question: "What's driving this project?", options: ["Visible damage or rot", "Storm damage", "Just outdated \u2014 ready for an upgrade", "Selling the home soon", "Not sure, need an opinion"] },
  },
  windows: {
    q1: { question: "Roughly how many windows?", options: ["1 to 3", "4 to 8", "9 or more", "Full house \u2014 not sure on count"] },
    q2: { question: "What's the main reason?", options: ["Drafty or poor insulation", "Condensation or fogging between panes", "Damaged / won't open or close", "Storm damage", "Just upgrading for curb appeal"] },
  },
  gutters: {
    q1: { question: "What's the main issue?", options: ["Overflowing during rain", "Sagging or pulling away", "Visible damage or holes", "I don't have gutters yet", "Full replacement \u2014 they're just old"] },
    q2: { question: "Do you have gutter guards?", options: ["Yes", "No", "Not sure"] },
  },
};

const HOME_CONTEXT_CHIPS = {
  "About the home": ["Just bought this home", "Getting ready to sell", "Previous work done here", "HOA approval may be needed"],
  "About the job": ["Two stories or higher", "Steep roof pitch", "Detached garage to include", "Hard to access areas"],
  "About you": ["I've gotten other estimates already", "I'd like to be home during the estimate", "I prefer communication by text", "I prefer communication by phone"],
};

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
  fullName: string;
  email: string;
  phone: string;
}

export default function EstimatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [showDetailFlow, setShowDetailFlow] = useState(false);
  const [detailStep, setDetailStep] = useState(0);
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    city: "",
    cityType: null,
    propertyType: "",
    services: [],
    hasInsuranceClaim: null,
    projectTimeline: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const [serviceAnswers, setServiceAnswers] = useState<Record<string, Record<string, string>>>({});
  const [homeContext, setHomeContext] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [cityInput, setCityInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [surroundingPrompt, setSurroundingPrompt] = useState(false);
  const [notifyMode, setNotifyMode] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [reviewExpanded, setReviewExpanded] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const cityMatches = fuzzyMatchCities(cityInput);
  const filteredCities = cityMatches.exact;
  const fuzzyCities = cityMatches.fuzzy;

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

  const parseName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
  };

  const submitMutation = useMutation({
    mutationFn: async (data: InsertQuoteRequest) => {
      const res = await apiRequest("POST", "/api/quotes", data);
      return res.json();
    },
    onSuccess: (data) => {
      setQuoteId(data.id);
      setSubmitted(true);
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    },
  });

  const detailMutation = useMutation({
    mutationFn: async (data: { serviceDetails?: Record<string, Record<string, string>>; homeContext?: string[]; photoUrl?: string }) => {
      const res = await apiRequest("PATCH", `/api/quotes/${quoteId}/details`, data);
      return res.json();
    },
    onSuccess: () => {
      setDetailsSubmitted(true);
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
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
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(id) ? prev.services.filter(s => s !== id) : [...prev.services, id],
    }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return formData.city !== "" && formData.cityType !== null && !surroundingPrompt;
      case 1:
        return formData.propertyType !== "" && formData.services.length > 0;
      case 2:
        return formData.projectTimeline !== "";
      case 3:
        return (
          formData.fullName.trim().split(/\s+/).length >= 2 &&
          isValidEmail(formData.email) &&
          isValidPhone(formData.phone)
        );
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canProceed()) return;
    if (step === 3) {
      handleSubmit();
      return;
    }
    setStep(prev => prev + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    const { firstName, lastName } = parseName(formData.fullName);
    const data: InsertQuoteRequest = {
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone || null,
      address: null,
      city: formData.city + ", MN",
      services: formData.services,
      propertyType: formData.propertyType,
      projectTimeline: formData.projectTimeline,
      additionalDetails: null,
      hasInsuranceClaim: formData.hasInsuranceClaim ?? false,
      selectedOfferings: null,
    };
    submitMutation.mutate(data);
  };

  const activeServiceKeys = formData.services.filter(s => SERVICE_QUESTIONS[s]);
  const totalDetailSteps = activeServiceKeys.length + 2;

  const handleDetailNext = () => {
    if (detailStep < totalDetailSteps - 1) {
      setDetailStep(prev => prev + 1);
    } else {
      detailMutation.mutate({
        serviceDetails: serviceAnswers,
        homeContext: homeContext.length > 0 ? homeContext : undefined,
        photoUrl: photoPreview || undefined,
      });
    }
  };

  const handleDetailBack = () => {
    if (detailStep > 0) setDetailStep(prev => prev - 1);
  };

  const setAnswer = (service: string, question: string, answer: string) => {
    setServiceAnswers(prev => ({
      ...prev,
      [service]: { ...(prev[service] || {}), [question]: answer },
    }));
  };

  const toggleContext = (chip: string) => {
    setHomeContext(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const QUESTIONS = [
    "What city is your property in?",
    "Tell us about your project.",
    "A few more details.",
    "Almost done! Add your contact info to submit.",
  ];

  const TOTAL_STEPS = 4;

  if (detailsSubmitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-[#58E3EA]/20 flex items-center justify-center mx-auto mb-8">
            <Check size={40} className="text-[#58E3EA]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4" data-testid="text-details-complete-headline">
            Thanks for the extra details!
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-10">
            This helps us prepare for your estimate visit. Our team will be in touch within one business day.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-8 py-4 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
            data-testid="button-details-complete-home"
          >
            Back to Home
            <ArrowUpRight size={16} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    );
  }

  if (showDetailFlow) {
    const currentServiceKey = detailStep < activeServiceKeys.length ? activeServiceKeys[detailStep] : null;
    const currentServiceLabel = currentServiceKey ? SERVICES.find(s => s.id === currentServiceKey)?.label : null;
    const currentQuestions = currentServiceKey ? SERVICE_QUESTIONS[currentServiceKey] : null;
    const isContextStep = detailStep === activeServiceKeys.length;
    const isPhotoStep = detailStep === activeServiceKeys.length + 1;

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <button onClick={() => detailStep === 0 ? setShowDetailFlow(false) : handleDetailBack()} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors" data-testid="button-detail-back">
            <ChevronLeft size={16} />
            <DocoLogo height={18} />
          </button>
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/40">
            {detailStep + 1} of {totalDetailSteps}
          </span>
        </div>
        <div className="h-1 bg-white/[0.06]">
          <motion.div className="h-full bg-[#58E3EA]" animate={{ width: `${((detailStep + 1) / totalDetailSteps) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>

        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 md:px-12 py-8 md:py-16">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={detailStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>

                {currentServiceKey && currentQuestions && (
                  <div>
                    <div className="flex items-start gap-3 mb-8">
                      <DocoAvatar />
                      <div>
                        <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase text-[#58E3EA] mb-1">{currentServiceLabel}</span>
                        <p className="text-lg md:text-xl font-semibold text-white leading-snug" data-testid="text-detail-question">
                          {currentQuestions.q1.question}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mb-8">
                      {currentQuestions.q1.options.map(opt => {
                        const selected = serviceAnswers[currentServiceKey]?.[currentQuestions.q1.question] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setAnswer(currentServiceKey, currentQuestions.q1.question, opt)}
                            className={`flex items-center gap-4 px-5 py-3.5 rounded-lg border-2 transition-all text-left ${
                              selected ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                            }`}
                            data-testid={`button-detail-q1-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"}`}>
                              {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
                            </div>
                            <span className="text-sm font-medium text-white">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mb-8">
                      <p className="text-lg md:text-xl font-semibold text-white leading-snug mb-4" data-testid="text-detail-question-2">
                        {currentQuestions.q2.question}
                      </p>
                      <div className="flex flex-col gap-2">
                        {currentQuestions.q2.options.map(opt => {
                          const selected = serviceAnswers[currentServiceKey]?.[currentQuestions.q2.question] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => setAnswer(currentServiceKey, currentQuestions.q2.question, opt)}
                              className={`flex items-center gap-4 px-5 py-3.5 rounded-lg border-2 transition-all text-left ${
                                selected ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                              }`}
                              data-testid={`button-detail-q2-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"}`}>
                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
                              </div>
                              <span className="text-sm font-medium text-white">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {isContextStep && (
                  <div>
                    <div className="flex items-start gap-3 mb-8">
                      <DocoAvatar />
                      <p className="text-lg md:text-xl font-semibold text-white leading-snug" data-testid="text-context-question">
                        Anything else that might help us prepare? Select any that apply.
                      </p>
                    </div>
                    {Object.entries(HOME_CONTEXT_CHIPS).map(([category, chips]) => (
                      <div key={category} className="mb-6">
                        <p className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3">{category}</p>
                        <div className="flex flex-wrap gap-2">
                          {chips.map(chip => {
                            const selected = homeContext.includes(chip);
                            return (
                              <button
                                key={chip}
                                onClick={() => toggleContext(chip)}
                                className={`text-[12px] font-medium px-3 py-2 rounded-lg transition-all ${
                                  selected ? "text-[#58E3EA] bg-[#58E3EA]/10 border border-[#58E3EA]/30" : "text-white/50 bg-white/[0.04] border border-white/10 hover:text-white/70 hover:bg-white/[0.08]"
                                }`}
                                data-testid={`chip-context-${chip.toLowerCase().replace(/\s+/g, "-")}`}
                              >
                                {chip}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isPhotoStep && (
                  <div>
                    <div className="flex items-start gap-3 mb-8">
                      <DocoAvatar />
                      <p className="text-lg md:text-xl font-semibold text-white leading-snug" data-testid="text-photo-question">
                        Got a photo? Totally optional.
                      </p>
                    </div>
                    <p className="text-sm text-white/50 mb-6 leading-relaxed">
                      A photo of the damage, the area, or even just the front of your house is plenty.
                    </p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} data-testid="input-photo-file" />
                    {!photoPreview ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-white/20 rounded-lg py-12 flex flex-col items-center gap-3 transition-all hover:border-[#58E3EA]/40 hover:bg-[#58E3EA]/[0.02]"
                        data-testid="button-upload-photo"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center">
                          <Camera size={24} className="text-white/40" />
                        </div>
                        <span className="text-sm font-medium text-white/50">Tap to upload a photo</span>
                        <span className="text-[11px] text-white/30">JPG, PNG, or HEIC</span>
                      </button>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden">
                        <img src={photoPreview} alt="Uploaded" className="w-full max-h-[300px] object-cover rounded-lg" />
                        <button
                          onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                          data-testid="button-remove-photo"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
            <button
              onClick={detailStep === 0 ? () => setShowDetailFlow(false) : handleDetailBack}
              className="flex items-center gap-2 text-white/50 text-sm font-medium hover:text-white transition-colors"
              data-testid="button-detail-step-back"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              onClick={handleDetailNext}
              disabled={detailMutation.isPending}
              className="text-sm font-bold tracking-wider uppercase px-8 py-3.5 rounded inline-flex items-center gap-2 transition-all bg-[#58E3EA] text-[#0A0A0A] hover:bg-[#3ABFC6] hover:-translate-y-0.5 cursor-pointer"
              data-testid="button-detail-step-next"
            >
              {detailMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Submitting...
                </span>
              ) : detailStep === totalDetailSteps - 1 ? (
                <>Submit Details <ArrowUpRight size={16} strokeWidth={2.5} /></>
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const { firstName } = parseName(formData.fullName);
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-[#58E3EA]/20 flex items-center justify-center mx-auto mb-8">
            <Check size={40} className="text-[#58E3EA]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4" data-testid="text-success-headline">
            You're all set, {firstName}!
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-3">
            Our team will personally review your request and get back to you within one business day with a straightforward, no-pressure estimate.
          </p>
          <p className="text-white/40 text-sm mb-10">
            We've sent a confirmation to <span className="text-[#58E3EA]">{formData.email}</span>
          </p>
          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => {
                setShowDetailFlow(true);
                setDetailStep(0);
              }}
              className="bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-8 py-4 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
              data-testid="button-add-details"
            >
              Add More Details
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </button>
            <p className="text-white/40 text-[13px] mb-2">Help us prepare for your estimate visit with a few optional questions.</p>
            <button
              onClick={() => navigate("/")}
              className="text-white/50 text-[13px] font-semibold tracking-wider uppercase hover:text-white transition-colors"
              data-testid="button-success-home"
            >
              No thanks, take me home
            </button>
          </div>
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
            Questions?<br />
            <a href="mailto:hello@docoexteriors.com" className="text-[#58E3EA] hover:underline">hello@docoexteriors.com</a>
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
                      {showSuggestions && cityInput.trim().length >= 2 && filteredCities.length === 0 && fuzzyCities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-white/10 rounded z-50 overflow-hidden">
                          <div className="px-4 pt-3 pb-1.5">
                            <p className="text-xs text-white/40 font-medium" data-testid="text-did-you-mean">Did you mean?</p>
                          </div>
                          {fuzzyCities.map((city) => (
                            <button
                              key={city.name}
                              onClick={() => selectCity(city)}
                              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/[0.06] flex items-center justify-between transition-colors"
                              data-testid={`city-option-fuzzy-${city.name.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <span>{city.name}, MN</span>
                              {city.type === "surrounding" && (
                                <span className="text-[10px] font-bold tracking-wider uppercase text-yellow-400/70">Expanding Soon</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {showSuggestions && cityInput.trim().length >= 2 && filteredCities.length === 0 && fuzzyCities.length === 0 && (
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
                          Or continue with an estimate anyway &rarr;
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="mb-8">
                    <label className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3 block">Property type</label>
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

                    {formData.propertyType && (
                      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3 block">Which services are you interested in?</label>
                        <div className="grid grid-cols-2 gap-3" data-testid="input-services">
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
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 2 && (
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
                              onClick={() => setFormData(prev => ({ ...prev, projectTimeline: tl.id }))}
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
                  </div>
                )}

                {step === 3 && (
                  <div className="mb-8">
                    <div className="mb-6">
                      <button
                        onClick={() => setReviewExpanded(!reviewExpanded)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-5 py-4 flex items-center justify-between transition-all hover:bg-white/[0.05]"
                        data-testid="button-toggle-review"
                      >
                        <span className="text-[11px] font-bold tracking-wider uppercase text-white/40">Review Your Selections</span>
                        <ChevronDown size={16} className={`text-white/40 transition-transform ${reviewExpanded ? "rotate-180" : ""}`} />
                      </button>
                      {reviewExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-white/[0.03] border border-t-0 border-white/10 rounded-b-lg overflow-hidden">
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
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <p className="text-[11px] font-bold tracking-wider uppercase text-white/40">Your Information</p>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                        data-testid="input-full-name"
                      />
                      <p className="text-[11px] text-white/30 -mt-2">First and Last name</p>
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
              ) : step === 3 ? (
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
