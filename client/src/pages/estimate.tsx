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
  return (
    <svg style={{ height, width: "auto" }} viewBox="0 0 568 202" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M496.773 136.802C486.583 136.802 477.093 135.083 468.304 131.644C459.643 128.204 452.127 123.428 445.758 117.314C439.39 111.072 434.422 103.812 430.855 95.5324C427.289 87.2529 425.506 78.2092 425.506 68.4012C425.506 58.5932 427.289 49.5495 430.855 41.27C434.422 32.9905 439.39 25.7937 445.758 19.6797C452.127 13.4382 459.643 8.5979 468.304 5.15874C476.966 1.71958 486.455 0 496.773 0C506.963 0 516.325 1.71958 524.859 5.15874C533.521 8.47053 541.036 13.2472 547.405 19.4886C553.901 25.6027 558.869 32.7994 562.308 41.0789C565.875 49.3584 567.658 58.4658 567.658 68.4012C567.658 78.3365 565.875 87.444 562.308 95.7234C558.869 104.003 553.901 111.263 547.405 117.505C541.036 123.619 533.521 128.396 524.859 131.835C516.325 135.146 506.963 136.802 496.773 136.802ZM496.773 119.798C504.161 119.798 510.975 118.524 517.217 115.976C523.586 113.429 529.063 109.862 533.648 105.277C538.361 100.564 541.991 95.0865 544.539 88.8451C547.214 82.6036 548.551 75.789 548.551 68.4012C548.551 61.0133 547.214 54.1987 544.539 47.9572C541.991 41.7158 538.361 36.3023 533.648 31.7167C529.063 27.0038 523.586 23.3736 517.217 20.8261C510.975 18.2785 504.161 17.0048 496.773 17.0048C489.258 17.0048 482.316 18.2785 475.947 20.8261C469.705 23.3736 464.228 27.0038 459.515 31.7167C454.802 36.3023 451.108 41.7158 448.433 47.9572C445.886 54.1987 444.612 61.0133 444.612 68.4012C444.612 75.789 445.886 82.6036 448.433 88.8451C451.108 95.0865 454.802 100.564 459.515 105.277C464.228 109.862 469.705 113.429 475.947 115.976C482.316 118.524 489.258 119.798 496.773 119.798Z" fill="currentColor"/>
      <path d="M366.656 136.802C356.466 136.802 347.04 135.146 338.379 131.835C329.844 128.396 322.393 123.619 316.024 117.505C309.783 111.263 304.879 104.003 301.312 95.7234C297.746 87.444 295.962 78.3365 295.962 68.4012C295.962 58.4658 297.746 49.3584 301.312 41.0789C304.879 32.7994 309.846 25.6027 316.024 19.4886C322.393 13.2472 329.844 8.47053 338.379 5.15874C347.04 1.71958 356.466 0 366.656 0C370.223 0 373.726 0.254621 377.165 0.763862C380.604 1.14573 384.044 1.78233 387.483 2.67367L387.483 20.0618C384.044 18.7881 380.604 17.8967 377.165 17.3875C373.726 16.8783 370.223 16.6236 366.656 16.6236C359.268 16.6236 352.326 17.8967 345.83 20.4443C339.461 22.9919 333.857 26.5584 329.017 31.1441C324.304 35.7297 320.61 41.207 317.935 47.5758C315.388 53.9447 314.114 60.8866 314.114 68.4012C314.114 75.9158 315.388 82.8577 317.935 89.2265C320.61 95.5954 324.304 101.073 329.017 105.658C333.857 110.244 339.461 113.811 345.83 116.358C352.326 118.906 359.268 120.179 366.656 120.179C370.223 120.179 373.726 119.924 377.165 119.415C380.604 118.906 384.044 118.015 387.483 116.741L387.483 134.129C384.044 135.02 380.604 135.656 377.165 136.038C373.726 136.548 370.223 136.802 366.656 136.802Z" fill="currentColor"/>
      <path d="M195.305 136.802C185.115 136.802 175.625 135.083 166.836 131.644C158.175 128.204 150.659 123.428 144.29 117.314C137.922 111.072 132.954 103.812 129.387 95.5324C125.82 87.2529 124.037 78.2092 124.037 68.4012C124.037 58.5932 125.82 49.5495 129.387 41.27C132.954 32.9905 137.922 25.7937 144.29 19.6797C150.659 13.4382 158.175 8.5979 166.836 5.15874C175.498 1.71958 184.987 0 195.305 0C205.495 0 214.857 1.71958 223.391 5.15874C232.053 8.47053 239.568 13.2472 245.937 19.4886C252.433 25.6027 257.401 32.7994 260.84 41.0789C264.407 49.3584 266.19 58.4658 266.19 68.4012C266.19 78.3365 264.407 87.444 260.84 95.7234C257.401 104.003 252.433 111.263 245.937 117.505C239.568 123.619 232.053 128.396 223.391 131.835C214.857 135.146 205.495 136.802 195.305 136.802ZM195.305 119.798C202.693 119.798 209.508 118.524 215.749 115.976C222.118 113.429 227.595 109.862 232.181 105.277C236.893 100.564 240.523 95.0865 243.071 88.8451C245.746 82.6036 247.083 75.789 247.083 68.4012C247.083 61.0133 245.746 54.1987 243.071 47.9572C240.523 41.7158 236.893 36.3023 232.181 31.7167C227.595 27.0038 222.118 23.3736 215.749 20.8261C209.508 18.2785 202.693 17.0048 195.305 17.0048C187.79 17.0048 180.848 18.2785 174.479 20.8261C168.237 23.3736 162.76 27.0038 158.047 31.7167C153.334 36.3023 149.641 41.7158 146.965 47.9572C144.418 54.1987 143.144 61.0133 143.144 68.4012C143.144 75.789 144.418 82.6036 146.965 88.8451C149.641 95.0865 153.334 100.564 158.047 105.277C162.76 109.862 168.237 113.429 174.479 115.976C180.848 118.524 187.79 119.798 195.305 119.798Z" fill="currentColor"/>
      <path d="M0 134.511V2.29102H37.3369C47.5269 2.29102 56.826 3.94692 65.2338 7.25871C73.6416 10.5705 80.9657 15.2198 87.2072 21.2065C93.5759 27.0658 98.5436 34.0714 102.11 42.2235C105.677 50.3757 107.46 59.356 107.46 69.1641V67.6356C107.46 77.4436 105.677 86.4873 102.11 94.7668C98.5436 102.919 93.5759 110.052 87.2072 116.166C80.9657 122.153 73.6416 126.866 65.2338 130.305C56.826 133.617 47.5269 135.273 37.3369 135.273L0 134.511ZM18.7246 118.269H36.1127C44.0089 118.269 51.2057 117.059 57.7019 114.639C64.3254 112.091 70.0574 108.588 74.8976 104.13C79.8654 99.5441 83.6866 94.0669 86.3615 87.698C89.0365 81.3292 90.3739 74.3236 90.3739 66.6816V68.5923C90.3739 60.9503 89.0365 53.9447 86.3615 47.5758C83.6866 41.207 79.8654 35.7934 74.8976 31.335C70.0574 26.7494 64.3254 23.1829 57.7019 20.6353C51.2057 18.0877 44.0089 16.8139 36.1127 16.8139H18.7246V118.269Z" fill="currentColor"/>
    </svg>
  );
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
