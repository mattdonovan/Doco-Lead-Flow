import { useState, useRef, useEffect } from "react";
import Cal from "@calcom/embed-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Home, Wrench, ChevronLeft, MapPin, ClipboardList, Bell } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertQuoteRequest } from "@shared/schema";
import { fuzzyMatchCities } from "@/lib/cities";

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

const SERVICE_QUESTIONS: Record<string, { q1: { question: string; options: string[]; multiSelect?: boolean }; q2: { question: string; options: string[]; multiSelect?: boolean } }> = {
  roofing: {
    q1: { question: "How old is your current roof?", options: ["Under 10 years", "10\u201320 years", "20+ years", "Don't know"] },
    q2: { question: "What's the situation?", options: ["Active leak or water damage", "Missing or visibly damaged shingles", "Storm or hail damage", "Just aging \u2014 time for a replacement", "Not sure, need an inspection"], multiSelect: true },
  },
  siding: {
    q1: { question: "What's your current siding material?", options: ["Vinyl", "Wood", "Fiber cement", "Hardie", "Not sure"] },
    q2: { question: "What's driving this project?", options: ["Visible damage or rot", "Storm damage", "Just outdated \u2014 ready for an upgrade", "Selling the home soon", "Not sure, need an opinion"], multiSelect: true },
  },
  windows: {
    q1: { question: "Roughly how many windows?", options: ["1 to 3", "4 to 8", "9 or more", "Full house \u2014 not sure on count"] },
    q2: { question: "What's the main reason (or reasons)?", options: ["Drafty or poor insulation", "Condensation or fogging between panes", "Damaged / won't open or close", "Storm damage", "Just upgrading for curb appeal"], multiSelect: true },
  },
  gutters: {
    q1: { question: "What's the main reason (or reasons)?", options: ["Overflowing during rain", "Sagging or pulling away", "Visible damage or holes", "I don't have gutters yet", "Full replacement \u2014 they're just old"], multiSelect: true },
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

function parseName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
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

interface BookingDetails {
  uid: string;
  startTime: string;
  endTime?: string;
  location?: string;
  timezone?: string;
}

function formatBookingDate(iso: string, tz?: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    timeZone: tz,
  });
}

function formatBookingTime(startIso: string, endIso?: string, tz?: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: tz };
  const start = new Date(startIso).toLocaleTimeString("en-US", opts);
  if (!endIso) return start;
  const endOpts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", timeZone: tz };
  const end = new Date(endIso).toLocaleTimeString("en-US", endOpts);
  return `${start.replace(/ [A-Z]{2,4}$/, "")} – ${end}${start.match(/ [A-Z]{2,4}$/)?.[0] ?? ""}`;
}

function buildGoogleCalUrl(d: BookingDetails): string {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const end = d.endTime ?? new Date(new Date(d.startTime).getTime() + 3600000).toISOString();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Estimate Visit with DOCO Exteriors",
    dates: `${fmt(d.startTime)}/${fmt(end)}`,
    details: "Your estimate visit with DOCO Exteriors is confirmed.",
    ...(d.location ? { location: d.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function buildICSUrl(d: BookingDetails): string {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const end = d.endTime ?? new Date(new Date(d.startTime).getTime() + 3600000).toISOString();
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DOCO Exteriors//EN",
    "BEGIN:VEVENT",
    `UID:${d.uid}@docoexteriors.com`,
    `DTSTART:${fmt(d.startTime)}`,
    `DTEND:${fmt(end)}`,
    "SUMMARY:Estimate Visit with DOCO Exteriors",
    d.location ? `LOCATION:${d.location}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  return `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
}

function buildBookingNotes(
  formData: FormData,
  serviceAnswers: Record<string, Record<string, string | string[]>>,
  homeContext: string[],
): string {
  const { firstName, lastName } = parseName(formData.fullName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const serviceLabels = SERVICES.filter(s => formData.services.includes(s.id)).map(s => s.label);
  const propertyLabel = PROPERTY_TYPES.find(p => p.id === formData.propertyType)?.label ?? "";
  const timelineLabel = TIMELINES.find(t => t.id === formData.projectTimeline)?.label ?? "";

  const lines: string[] = [];

  lines.push(`${fullName} is requesting an estimate for:`);
  serviceLabels.forEach(l => lines.push(`  • ${l}`));
  lines.push("");

  lines.push(`Property: ${propertyLabel} in ${formData.city}, MN`);
  lines.push(`Timeline: ${timelineLabel}`);
  if (formData.hasInsuranceClaim !== null) {
    lines.push(`Insurance claim: ${formData.hasInsuranceClaim ? "Yes" : "No"}`);
  }
  if (formData.phone) {
    lines.push(`Phone: ${formData.phone}`);
  }

  const serviceEntries = Object.entries(serviceAnswers);
  if (serviceEntries.length > 0) {
    lines.push("");
    lines.push("Project details:");
    serviceEntries.forEach(([svcId, answers]) => {
      const svcLabel = SERVICES.find(s => s.id === svcId)?.label ?? svcId;
      lines.push(`  ${svcLabel}:`);
      Object.entries(answers).forEach(([q, a]) => {
        const answer = Array.isArray(a) ? a.join(", ") : a;
        lines.push(`    ${q}: ${answer}`);
      });
    });
  }

  if (homeContext.length > 0) {
    lines.push("");
    lines.push("Additional context:");
    homeContext.forEach(chip => lines.push(`  • ${chip}`));
  }

  return lines.join("\n");
}

function BookingScreen({
  formData,
  serviceAnswers,
  homeContext,
  onBack,
  onBookingComplete,
}: {
  formData: FormData;
  serviceAnswers: Record<string, Record<string, string | string[]>>;
  homeContext: string[];
  onBack: () => void;
  onBookingComplete: (details?: BookingDetails) => void;
}) {
  const [calError, setCalError] = useState(false);

  useEffect(() => {
    (async function () {
      try {
        const { getCalApi } = await import("@calcom/embed-react");
        const cal = await getCalApi({ namespace: "estimate-visit" });
        cal("ui", {
          theme: "dark",
          cssVarsPerTheme: {
            light: { "cal-brand": "#58E3EA" },
            dark: { "cal-brand": "#58E3EA" },
          },
          hideEventTypeDetails: true,
          layout: "month_view",
        });
        cal("on", {
          action: "bookingSuccessful",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: (e: any) => {
            const b = e?.detail?.data?.booking ?? e?.data?.booking ?? e?.booking ?? {};
            onBookingComplete({
              uid: b.uid ?? "",
              startTime: b.startTime ?? "",
              endTime: b.endTime,
              location: b.location || undefined,
              timezone: b.attendees?.[0]?.timeZone ?? b.organizer?.timeZone,
            });
          },
        });
        cal("on", {
          action: "linkFailed",
          callback: () => setCalError(true),
        });
      } catch {
        setCalError(true);
      }
    })();
  }, [onBookingComplete]);

  const notes = buildBookingNotes(formData, serviceAnswers, homeContext);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="text-center pt-20 pb-6 px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Schedule your estimate</h1>
          <p className="text-white/50 text-base">Pick a time that works for you</p>
        </div>
        {calError ? (
          <div className="max-w-md mx-auto px-6 py-12 text-center">
            <div className="bg-white/[0.04] border border-white/10 rounded-lg p-8 mb-6">
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                The booking calendar couldn't load. You can schedule directly at the link below, or our team will reach out within one business day.
              </p>
              <a
                href="https://cal.com/matt-donovan-uztzdy/estimate-visit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-6 py-3 rounded transition-all hover:bg-[#3ABFC6]"
              >
                Open Booking Page
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        ) : (
          <Cal
            namespace="estimate-visit"
            calLink="matt-donovan-uztzdy/estimate-visit"
            style={{ width: "100%", minHeight: "600px" }}
            config={{
              layout: "month_view",
              useSlotsViewOnSmallScreen: "true",
              theme: "dark",
              name: formData.fullName,
              email: formData.email,
              notes,
            }}
          />
        )}
        <div className="text-center py-6">
          <button
            onClick={onBack}
            className="text-white/50 text-[13px] font-semibold tracking-wider uppercase hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      </motion.div>
    </div>
  );
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
  const [showBooking, setShowBooking] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | undefined>();

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

  const [serviceAnswers, setServiceAnswers] = useState<Record<string, Record<string, string | string[]>>>({});
  const [homeContext, setHomeContext] = useState<string[]>([]);

  const [cityInput, setCityInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [surroundingPrompt, setSurroundingPrompt] = useState(false);
  const [surroundingAcknowledged, setSurroundingAcknowledged] = useState(false);
  const [notifyMode, setNotifyMode] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city");
    const cityType = params.get("cityType") as "service" | "surrounding" | null;
    if (city && cityType) {
      setCityInput(city);
      setFormData(prev => ({ ...prev, city, cityType }));
      setStep(1);
    }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (step === 2 && formData.projectTimeline) {
      const t = setTimeout(() => setStep(3), 200);
      return () => clearTimeout(t);
    }
  }, [formData.projectTimeline]);

  useEffect(() => {
    const slugs = ["location", "project", "details", "contact"];
    window.history.replaceState(null, '', `#${slugs[step] ?? "contact"}`);
  }, [step]);

  useEffect(() => {
    if (submitted) window.history.replaceState(null, '', '#success');
  }, [submitted]);

  useEffect(() => {
    if (showBooking) window.history.replaceState(null, '', '#booking');
  }, [showBooking]);

  useEffect(() => {
    if (showSummary) window.history.replaceState(null, '', '#summary');
  }, [showSummary]);

  const cityMatches = fuzzyMatchCities(cityInput);
  const filteredCities = cityMatches.exact;
  const fuzzyCities = cityMatches.fuzzy;

  const selectCity = (city: { name: string; type: "service" | "surrounding" }) => {
    setCityInput(city.name);
    setFormData(prev => ({ ...prev, city: city.name, cityType: city.type }));
    setShowSuggestions(false);
    setSurroundingAcknowledged(false);
    if (city.type === "surrounding") {
      setSurroundingPrompt(true);
    } else {
      setSurroundingPrompt(false);
    }
    setStep(1);
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
      setShowDetailFlow(false);
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
        return formData.city !== "" && formData.cityType !== null;
      case 1:
        if (surroundingPrompt && !surroundingAcknowledged && !notifySubmitted) return false;
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
  const totalDetailSteps = activeServiceKeys.length + 1;

  const handleDetailNext = () => {
    if (detailStep < totalDetailSteps - 1) {
      setDetailStep(prev => prev + 1);
    } else {
      detailMutation.mutate({
        serviceDetails: serviceAnswers as Record<string, Record<string, string>>,
        homeContext: homeContext.length > 0 ? homeContext : undefined,
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

  const toggleMultiAnswer = (service: string, question: string, option: string) => {
    setServiceAnswers(prev => {
      const existing = prev[service]?.[question];
      const current: string[] = Array.isArray(existing) ? existing : [];
      const next = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      return { ...prev, [service]: { ...(prev[service] || {}), [question]: next } };
    });
  };

  const isMultiSelected = (service: string, question: string, option: string): boolean => {
    const val = serviceAnswers[service]?.[question];
    return Array.isArray(val) ? val.includes(option) : false;
  };

  const toggleContext = (chip: string) => {
    setHomeContext(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  const QUESTIONS = [
    "What city is your property in?",
    "Tell us about your project.",
    "A few more details.",
    "Almost done! Add your contact info to submit.",
  ];

  const TOTAL_STEPS = 4;


  if (showDetailFlow) {
    const currentServiceKey = detailStep < activeServiceKeys.length ? activeServiceKeys[detailStep] : null;
    const currentServiceLabel = currentServiceKey ? SERVICES.find(s => s.id === currentServiceKey)?.label : null;
    const currentQuestions = currentServiceKey ? SERVICE_QUESTIONS[currentServiceKey] : null;
    const isContextStep = detailStep === activeServiceKeys.length;

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

        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 md:px-12 pt-8 md:py-16 lg:block lg:pt-12">
          <div className="flex-1 lg:flex-none">
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
                        const isMulti = !!currentQuestions.q1.multiSelect;
                        const selected = isMulti
                          ? isMultiSelected(currentServiceKey, currentQuestions.q1.question, opt)
                          : serviceAnswers[currentServiceKey]?.[currentQuestions.q1.question] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => isMulti
                              ? toggleMultiAnswer(currentServiceKey, currentQuestions.q1.question, opt)
                              : setAnswer(currentServiceKey, currentQuestions.q1.question, opt)
                            }
                            className={`flex items-center gap-4 px-5 py-3.5 rounded-lg border-2 transition-all text-left ${
                              selected ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                            }`}
                            data-testid={`button-detail-q1-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {isMulti ? (
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"}`}>
                                {selected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                            ) : (
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"}`}>
                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
                              </div>
                            )}
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
                          const isMulti = !!currentQuestions.q2.multiSelect;
                          const selected = isMulti
                            ? isMultiSelected(currentServiceKey, currentQuestions.q2.question, opt)
                            : serviceAnswers[currentServiceKey]?.[currentQuestions.q2.question] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => isMulti
                                ? toggleMultiAnswer(currentServiceKey, currentQuestions.q2.question, opt)
                                : setAnswer(currentServiceKey, currentQuestions.q2.question, opt)
                              }
                              className={`flex items-center gap-4 px-5 py-3.5 rounded-lg border-2 transition-all text-left ${
                                selected ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                              }`}
                              data-testid={`button-detail-q2-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {isMulti ? (
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"}`}>
                                  {selected && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                              ) : (
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"}`}>
                                  {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
                                </div>
                              )}
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

              </motion.div>
            </AnimatePresence>
          </div>

          <div className="sticky bottom-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.06] px-8 md:px-0 pt-4 pb-8 md:pt-6 md:pb-0 lg:mt-8 flex items-center justify-between z-40" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
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

  if (submitted && showSummary) {
    const { firstName } = parseName(formData.fullName);
    const serviceEntries = Object.entries(serviceAnswers);
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12 pt-16 pb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            <div className="mb-10 lg:mb-0 lg:sticky lg:top-16">
              <div className="w-16 h-16 rounded-full bg-[#58E3EA]/20 flex items-center justify-center mb-6">
                <Check size={28} className="text-[#58E3EA]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">No problem, {firstName}.</h1>
              <p className="text-white/60 text-base leading-relaxed mb-2">
                Our team will personally review your request and reach out within one business day to find a time that works for you.
              </p>
              <p className="text-white/40 text-sm mb-8">Confirmation sent to <span className="text-[#58E3EA]">{formData.email}</span></p>
              <button
                onClick={() => navigate("/")}
                className="text-white/50 text-[13px] font-semibold tracking-wider uppercase hover:text-white transition-colors"
              >
                Back to Home
              </button>
            </div>

            <div>
              <div className="bg-white/[0.03] border border-white/10 rounded-lg mb-4 overflow-hidden">
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
              </div>

              {serviceEntries.length > 0 && (
                <div className="bg-white/[0.03] border border-white/10 rounded-lg mb-4 overflow-hidden">
                  {serviceEntries.map(([svcId, answers]) => {
                    const svc = SERVICES.find(s => s.id === svcId);
                    return (
                      <div key={svcId} className="p-5 border-b border-white/[0.06] last:border-b-0">
                        <p className="text-[10px] font-extrabold tracking-widest uppercase text-[#58E3EA] mb-3">{svc?.label}</p>
                        {Object.entries(answers).map(([q, a]) => (
                          <div key={q} className="mb-2 last:mb-0">
                            <span className="text-[11px] text-white/40">{q}</span>
                            <p className="text-sm text-white/80">{Array.isArray(a) ? a.join(", ") : a}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              {homeContext.length > 0 && (
                <div className="bg-white/[0.03] border border-white/10 rounded-lg p-5">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3">Additional Context</p>
                  <div className="flex flex-wrap gap-2">
                    {homeContext.map(chip => (
                      <span key={chip} className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-[#58E3EA] bg-[#58E3EA]/10 border border-[#58E3EA]/30">{chip}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (submitted && showBooking) {
    return (
      <BookingScreen
        formData={formData}
        serviceAnswers={serviceAnswers}
        homeContext={homeContext}
        onBack={() => setShowBooking(false)}
        onBookingComplete={(details) => { setBookingCompleted(true); setBookingDetails(details); setShowBooking(false); }}
      />
    );
  }

  if (submitted) {
    const { firstName } = parseName(formData.fullName);
    const serviceEntries = Object.entries(serviceAnswers);
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12 pt-16 pb-16">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            <div className="text-center lg:text-left mb-10 lg:mb-0 lg:sticky lg:top-16">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35, type: "spring", stiffness: 320, damping: 22 }}>
                  <div className="w-9 h-9 rounded-full bg-[#58E3EA] flex items-center justify-center shrink-0">
                    <Check size={18} strokeWidth={3} className="text-[#0A0A0A]" />
                  </div>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  You're all set, {firstName}!
                </h1>
              </div>
              <p className="text-white/60 text-base leading-relaxed mb-3">
                Our team will personally review your request and get back to you within one business day to confirm the details.
              </p>
              <p className="text-white/40 text-sm mb-8">
                We've sent a confirmation to <span className="text-[#58E3EA]">{formData.email}</span>
              </p>
              <div className="flex flex-col gap-4 items-center lg:items-start">
                {!detailsSubmitted && (
                  <button
                    onClick={() => { setShowDetailFlow(true); setDetailStep(0); }}
                    className="bg-[#58E3EA] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-8 py-4 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:bg-[#3ABFC6] hover:-translate-y-0.5"
                  >
                    Add More Details
                    <ArrowUpRight size={16} strokeWidth={2.5} />
                  </button>
                )}
                {bookingCompleted ? (
                  <div className="flex flex-col gap-4 items-center lg:items-start w-full">
                    <div className="inline-flex items-center gap-2.5 text-[#58E3EA] text-sm font-bold tracking-wider uppercase">
                      <Check size={16} strokeWidth={2.5} />
                      Estimate Scheduled
                    </div>

                    {bookingDetails?.startTime && (
                      <div className="w-full bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden text-left">
                        <div className="px-5 py-4 border-b border-white/[0.06]">
                          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1">When</p>
                          <p className="text-sm font-semibold text-white">{formatBookingDate(bookingDetails.startTime, bookingDetails.timezone)}</p>
                          <p className="text-sm text-white/60">{formatBookingTime(bookingDetails.startTime, bookingDetails.endTime, bookingDetails.timezone)}</p>
                        </div>
                        {bookingDetails.location && (
                          <div className="px-5 py-4 border-b border-white/[0.06]">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1">Where</p>
                            <p className="text-sm text-white/70">{bookingDetails.location}</p>
                          </div>
                        )}
                        <div className="px-5 py-4 border-b border-white/[0.06]">
                          <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-2">Add to calendar</p>
                          <div className="flex gap-3 flex-wrap">
                            <a
                              href={buildGoogleCalUrl(bookingDetails)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded px-3 py-1.5 transition-colors"
                            >
                              Google
                            </a>
                            <a
                              href={buildICSUrl(bookingDetails)}
                              download="estimate-visit.ics"
                              className="text-[12px] font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded px-3 py-1.5 transition-colors"
                            >
                              Apple / Outlook
                            </a>
                          </div>
                        </div>
                        {bookingDetails.uid && (
                          <div className="px-5 py-4">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-2">Need to make a change?</p>
                            <div className="flex gap-4">
                              <a
                                href={`https://cal.com/booking/${bookingDetails.uid}?reschedule=true`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[12px] font-semibold text-[#58E3EA] hover:text-white transition-colors"
                              >
                                Reschedule
                              </a>
                              <a
                                href={`https://cal.com/booking/${bookingDetails.uid}?cancel=true`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[12px] font-semibold text-white/40 hover:text-white transition-colors"
                              >
                                Cancel
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => navigate("/")}
                      className="text-white/40 text-[13px] font-semibold tracking-wider uppercase hover:text-white transition-colors"
                    >
                      Back to DOCO
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowBooking(true)}
                      className="border border-white/20 text-white text-sm font-bold tracking-wider uppercase px-8 py-3.5 rounded cursor-pointer inline-flex items-center gap-2.5 transition-all hover:border-white/40"
                    >
                      Schedule an Estimate
                      <ArrowUpRight size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="text-white/40 text-[13px] font-semibold tracking-wider uppercase hover:text-white transition-colors"
                    >
                      Back to DOCO
                    </button>
                  </>
                )}
                {!detailsSubmitted && (
                  <p className="text-white/40 text-[13px]">Help us prepare for your estimate visit with a few optional questions.</p>
                )}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden">
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
              <div className={`p-5 ${serviceEntries.length > 0 || homeContext.length > 0 ? "border-b border-white/[0.06]" : ""}`}>
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
              {serviceEntries.map(([svcId, answers], idx) => (
                <div key={svcId} className={`p-5 ${idx < serviceEntries.length - 1 || homeContext.length > 0 ? "border-b border-white/[0.06]" : ""}`}>
                  <p className="text-[10px] font-extrabold tracking-widest uppercase text-[#58E3EA] mb-3">{SERVICES.find(s => s.id === svcId)?.label}</p>
                  {Object.entries(answers).map(([q, a]) => (
                    <div key={q} className="mb-2 last:mb-0">
                      <span className="text-[11px] text-white/40">{q}</span>
                      <p className="text-sm text-white/80">{Array.isArray(a) ? a.join(", ") : a}</p>
                    </div>
                  ))}
                </div>
              ))}
              {homeContext.length > 0 && (
                <div className="p-5">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-white/40 mb-3">Additional Context</p>
                  <div className="flex flex-wrap gap-2">
                    {homeContext.map(chip => (
                      <span key={chip} className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-[#58E3EA] bg-[#58E3EA]/10 border border-[#58E3EA]/30">{chip}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
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
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="h-1 bg-white/[0.06]">
          <motion.div className="h-full bg-[#58E3EA]" initial={{ width: "0%" }} animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>

        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60" data-testid="button-mobile-back">
            <ChevronLeft size={16} />
            <DocoLogo height={18} />
          </button>
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/40">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
        </div>

        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 md:px-12 pt-8 md:py-16 lg:block lg:pt-12">
          <div className="flex-1 lg:flex-none">
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
                          setSurroundingAcknowledged(false);
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

                  </div>
                )}

                {step === 1 && (
                  <div className="mb-8">
                    {formData.city && formData.cityType === "service" && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-2 text-[#58E3EA] text-sm font-medium">
                        <Check size={16} /> {formData.city} is in our service area!
                      </motion.div>
                    )}

                    {surroundingPrompt && !surroundingAcknowledged && !notifySubmitted && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-white/[0.04] border border-white/10 rounded-lg p-5">
                        <p className="text-sm text-white/80 mb-1 font-semibold">We're expanding to {formData.city} soon!</p>
                        <p className="text-[13px] text-white/50 mb-5 leading-relaxed">
                          We're not quite in your area yet, but we're growing fast. You can continue if your project start date is a ways out, or we can notify you when we arrive.
                        </p>
                        {!notifyMode ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setSurroundingAcknowledged(true)}
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
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-[#58E3EA]/10 border border-[#58E3EA]/30 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Check size={16} className="text-[#58E3EA]" />
                          <p className="text-sm font-semibold text-[#58E3EA]">You're on the list!</p>
                        </div>
                        <p className="text-[13px] text-white/50 mb-4">We'll let you know as soon as we start serving {formData.city}.</p>
                        <button
                          onClick={() => setSurroundingAcknowledged(true)}
                          className="text-[12px] font-bold tracking-wider uppercase text-white/60 hover:text-white transition-colors"
                          data-testid="button-continue-after-notify"
                        >
                          Or continue with an estimate anyway &rarr;
                        </button>
                      </motion.div>
                    )}

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

          <div className="sticky bottom-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.06] px-8 md:px-0 pt-4 pb-8 md:pt-6 md:pb-0 lg:mt-8 flex items-center justify-between z-40" style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
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
