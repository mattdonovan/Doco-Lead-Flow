import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, Home, Wrench, Clock, User, MessageSquare, ChevronLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertQuoteRequest } from "@shared/schema";

const SERVICES = [
  { id: "roofing", label: "Roofing", icon: "🏠", desc: "Replacement & Repair" },
  { id: "siding", label: "Siding", icon: "🧱", desc: "Installation & Repair" },
  { id: "windows", label: "Windows", icon: "🪟", desc: "Energy-Efficient Upgrades" },
  { id: "gutters", label: "Gutters", icon: "🌧️", desc: "Seamless Systems" },
];

const PROPERTY_TYPES = [
  { id: "single-family", label: "Single Family Home" },
  { id: "townhouse", label: "Townhouse" },
  { id: "multi-family", label: "Multi-Family" },
  { id: "commercial", label: "Commercial" },
];

const TIMELINES = [
  { id: "asap", label: "As soon as possible" },
  { id: "1-3-months", label: "Within 1-3 months" },
  { id: "3-6-months", label: "Within 3-6 months" },
  { id: "just-exploring", label: "Just exploring options" },
];

const SIDEBAR_SECTIONS = [
  { label: "Services", icon: Wrench },
  { label: "Property", icon: Home },
  { label: "About You", icon: User },
  { label: "Details", icon: MessageSquare },
  { label: "Timeline", icon: Clock },
];

function DocoLogo({ height = 24 }: { height?: number }) {
  return <img src="/logo-header.svg" alt="DOCO Exteriors" style={{ height, width: "auto" }} />;
}

interface FormData {
  services: string[];
  propertyType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  hasInsuranceClaim: boolean | null;
  additionalDetails: string;
  projectTimeline: string;
}

const AVATAR_ICON = (
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#58E3EA] to-[#3ABFC6] flex items-center justify-center text-[#0A0A0A] font-bold text-sm shrink-0">
    D
  </div>
);

const USER_BUBBLE = ({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex justify-end mb-6"
  >
    <div className="bg-[#1A2A35] text-white/80 text-sm px-5 py-3 rounded-2xl rounded-tr-sm max-w-xs">
      {text}
    </div>
  </motion.div>
);

export default function EstimatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ type: "bot" | "user"; text: string }>>([]);

  const [formData, setFormData] = useState<FormData>({
    services: [],
    propertyType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    hasInsuranceClaim: null,
    additionalDetails: "",
    projectTimeline: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertQuoteRequest) => {
      const res = await apiRequest("POST", "/api/quotes", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
    },
  });

  const addUserResponse = useCallback((text: string) => {
    setChatHistory((prev) => [...prev, { type: "user", text }]);
  }, []);

  const toggleService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter((s) => s !== id)
        : [...prev.services, id],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.services.length > 0;
      case 1:
        return formData.propertyType !== "";
      case 2:
        return formData.firstName.trim() !== "" && formData.lastName.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "";
      case 3:
        return formData.address.trim() !== "" && formData.city.trim() !== "";
      case 4:
        return formData.projectTimeline !== "";
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canProceed()) return;

    switch (step) {
      case 0:
        addUserResponse(formData.services.map((s) => SERVICES.find((sv) => sv.id === s)?.label).join(", "));
        break;
      case 1:
        addUserResponse(PROPERTY_TYPES.find((p) => p.id === formData.propertyType)?.label || "");
        break;
      case 2:
        addUserResponse(`${formData.firstName} ${formData.lastName}`);
        break;
      case 3:
        addUserResponse(`${formData.address}, ${formData.city}`);
        break;
      case 4:
        addUserResponse(TIMELINES.find((t) => t.id === formData.projectTimeline)?.label || "");
        handleSubmit();
        return;
    }

    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const data: InsertQuoteRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      services: formData.services,
      propertyType: formData.propertyType,
      projectTimeline: formData.projectTimeline,
      additionalDetails: formData.additionalDetails || null,
      hasInsuranceClaim: formData.hasInsuranceClaim ?? false,
    };
    submitMutation.mutate(data);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed()) {
      goNext();
    }
  };

  const QUESTIONS = [
    "Which services are you interested in? Select all that apply.",
    "What type of property is this for?",
    `Nice! Let's get your contact details so we can reach you.`,
    formData.firstName ? `Great to meet you, ${formData.firstName}! What's your property address?` : "What's your property address?",
    "Last question — when are you looking to get started?",
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg"
        >
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
      {/* Sidebar */}
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
              <div
                key={i}
                className="flex items-center gap-3 py-3 px-3"
                data-testid={`sidebar-step-${i}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                  isCompleted
                    ? "bg-[#58E3EA] text-[#0A0A0A]"
                    : isActive
                    ? "border-2 border-[#58E3EA] text-[#58E3EA]"
                    : "border border-white/20 text-white/30"
                }`}>
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
                </div>
                <span className={`text-[13px] font-medium transition-colors ${
                  isActive ? "text-white" : isCompleted ? "text-[#58E3EA]" : "text-white/30"
                }`}>
                  {section.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#58E3EA]" />
                )}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60" data-testid="button-mobile-back">
            <ChevronLeft size={16} />
            <DocoLogo height={18} />
          </button>
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/40">
            Step {step + 1} of 5
          </span>
        </div>

        {/* Progress bar (mobile) */}
        <div className="lg:hidden h-1 bg-white/[0.06]">
          <motion.div
            className="h-full bg-[#58E3EA]"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 md:px-12 py-8 md:py-16">
          {/* Previous answers scroll up like chat */}
          <div className="flex-1">
            {chatHistory.map((msg, i) => (
              <div key={i}>
                {msg.type === "user" && <USER_BUBBLE text={msg.text} />}
              </div>
            ))}

            {/* Current question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {/* Bot message */}
                <div className="flex items-start gap-3 mb-8">
                  {AVATAR_ICON}
                  <div>
                    <p className="text-lg md:text-xl font-semibold text-white leading-snug" data-testid="text-question">
                      {QUESTIONS[step]}
                    </p>
                  </div>
                </div>

                {/* Step content */}
                {step === 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-8" data-testid="input-services">
                    {SERVICES.map((svc) => {
                      const selected = formData.services.includes(svc.id);
                      return (
                        <button
                          key={svc.id}
                          onClick={() => toggleService(svc.id)}
                          className={`relative flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                            selected
                              ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20"
                          }`}
                          data-testid={`button-service-${svc.id}`}
                        >
                          <span className="text-3xl">{svc.icon}</span>
                          <span className="text-sm font-bold text-white">{svc.label}</span>
                          <span className="text-[11px] text-white/50">{svc.desc}</span>
                          {selected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded bg-[#58E3EA] flex items-center justify-center">
                              <Check size={12} strokeWidth={3} className="text-[#0A0A0A]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-3 mb-8" data-testid="input-property-type">
                    {PROPERTY_TYPES.map((pt) => {
                      const selected = formData.propertyType === pt.id;
                      return (
                        <button
                          key={pt.id}
                          onClick={() => setFormData((prev) => ({ ...prev, propertyType: pt.id }))}
                          className={`flex items-center gap-4 px-5 py-4 rounded-lg border-2 transition-all text-left ${
                            selected
                              ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20"
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
                    <div className="mt-4 flex items-center gap-4">
                      <label className="text-sm text-white/60">Insurance claim involved?</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, hasInsuranceClaim: true }))}
                          className={`px-4 py-2 rounded text-sm font-medium border transition-all ${
                            formData.hasInsuranceClaim === true
                              ? "border-[#58E3EA] bg-[#58E3EA]/10 text-[#58E3EA]"
                              : "border-white/10 text-white/50 hover:border-white/20"
                          }`}
                          data-testid="button-insurance-yes"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, hasInsuranceClaim: false }))}
                          className={`px-4 py-2 rounded text-sm font-medium border transition-all ${
                            formData.hasInsuranceClaim === false
                              ? "border-[#58E3EA] bg-[#58E3EA]/10 text-[#58E3EA]"
                              : "border-white/10 text-white/50 hover:border-white/20"
                          }`}
                          data-testid="button-insurance-no"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-4 mb-8" data-testid="input-contact-info" onKeyDown={handleKeyDown}>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                        data-testid="input-first-name"
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                        data-testid="input-last-name"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                      data-testid="input-email"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                      data-testid="input-phone"
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-4 mb-8" data-testid="input-address" onKeyDown={handleKeyDown}>
                    <input
                      type="text"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                      data-testid="input-street-address"
                    />
                    <input
                      type="text"
                      placeholder="City / neighborhood (e.g. Edina, Plymouth)"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03]"
                      data-testid="input-city"
                    />
                    <textarea
                      placeholder="Any additional details about your project? (optional)"
                      value={formData.additionalDetails}
                      onChange={(e) => setFormData((prev) => ({ ...prev, additionalDetails: e.target.value }))}
                      rows={3}
                      className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 text-sm font-medium text-white rounded placeholder:text-white/28 outline-none transition-all focus:border-[#58E3EA] focus:bg-[#58E3EA]/[0.03] resize-none"
                      data-testid="input-additional-details"
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col gap-3 mb-8" data-testid="input-timeline">
                    {TIMELINES.map((tl) => {
                      const selected = formData.projectTimeline === tl.id;
                      return (
                        <button
                          key={tl.id}
                          onClick={() => setFormData((prev) => ({ ...prev, projectTimeline: tl.id }))}
                          className={`flex items-center gap-4 px-5 py-4 rounded-lg border-2 transition-all text-left ${
                            selected
                              ? "border-[#58E3EA] bg-[#58E3EA]/[0.06]"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20"
                          }`}
                          data-testid={`button-timeline-${tl.id}`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            selected ? "border-[#58E3EA] bg-[#58E3EA]" : "border-white/30"
                          }`}>
                            {selected && <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />}
                          </div>
                          <span className="text-sm font-medium text-white">{tl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
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
