import { useState, useEffect, useRef } from "react";
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

function DocoLogo({ className = "", height = 28 }: { className?: string; height?: number }) {
  return (
    <svg className={className} style={{ height, width: "auto" }} viewBox="0 0 568 202" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M496.773 136.802C486.583 136.802 477.093 135.083 468.304 131.644C459.643 128.204 452.127 123.428 445.758 117.314C439.39 111.072 434.422 103.812 430.855 95.5324C427.289 87.2529 425.506 78.2092 425.506 68.4012C425.506 58.5932 427.289 49.5495 430.855 41.27C434.422 32.9905 439.39 25.7937 445.758 19.6797C452.127 13.4382 459.643 8.5979 468.304 5.15874C476.966 1.71958 486.455 0 496.773 0C506.963 0 516.325 1.71958 524.859 5.15874C533.521 8.47053 541.036 13.2472 547.405 19.4886C553.901 25.6027 558.869 32.7994 562.308 41.0789C565.875 49.3584 567.658 58.4658 567.658 68.4012C567.658 78.3365 565.875 87.444 562.308 95.7234C558.869 104.003 553.901 111.263 547.405 117.505C541.036 123.619 533.521 128.396 524.859 131.835C516.325 135.146 506.963 136.802 496.773 136.802ZM496.773 119.798C504.161 119.798 510.975 118.524 517.217 115.976C523.586 113.429 529.063 109.862 533.648 105.277C538.361 100.564 541.991 95.0865 544.539 88.8451C547.214 82.6036 548.551 75.789 548.551 68.4012C548.551 61.0133 547.214 54.1987 544.539 47.9572C541.991 41.7158 538.361 36.3023 533.648 31.7167C529.063 27.0038 523.586 23.3736 517.217 20.8261C510.975 18.2785 504.161 17.0048 496.773 17.0048C489.258 17.0048 482.316 18.2785 475.947 20.8261C469.705 23.3736 464.228 27.0038 459.515 31.7167C454.802 36.3023 451.108 41.7158 448.433 47.9572C445.886 54.1987 444.612 61.0133 444.612 68.4012C444.612 75.789 445.886 82.6036 448.433 88.8451C451.108 95.0865 454.802 100.564 459.515 105.277C464.228 109.862 469.705 113.429 475.947 115.976C482.316 118.524 489.258 119.798 496.773 119.798Z" fill="currentColor"/>
      <path d="M366.656 136.802C356.466 136.802 347.04 135.146 338.379 131.835C329.844 128.396 322.393 123.619 316.024 117.505C309.783 111.263 304.879 104.003 301.312 95.7234C297.746 87.444 295.962 78.3365 295.962 68.4012C295.962 58.4658 297.746 49.3584 301.312 41.0789C304.879 32.7994 309.846 25.6027 316.024 19.4886C322.393 13.2472 329.844 8.47053 338.379 5.15874C347.04 1.71958 356.466 0 366.656 0C370.223 0 373.726 0.254621 377.165 0.763862C380.604 1.14573 384.044 1.78233 387.483 2.67367L387.483 20.0618C384.044 18.7881 380.604 17.8967 377.165 17.3875C373.726 16.8783 370.223 16.6236 366.656 16.6236C359.268 16.6236 352.326 17.8967 345.83 20.4443C339.461 22.9919 333.857 26.5584 329.017 31.1441C324.304 35.7297 320.61 41.207 317.935 47.5758C315.388 53.9447 314.114 60.8866 314.114 68.4012C314.114 75.9158 315.388 82.8577 317.935 89.2265C320.61 95.5954 324.304 101.073 329.017 105.658C333.857 110.244 339.461 113.811 345.83 116.358C352.326 118.906 359.268 120.179 366.656 120.179C370.223 120.179 373.726 119.924 377.165 119.415C380.604 118.906 384.044 118.015 387.483 116.741L387.483 134.129C384.044 135.02 380.604 135.656 377.165 136.038C373.726 136.548 370.223 136.802 366.656 136.802Z" fill="currentColor"/>
      <path d="M195.305 136.802C185.115 136.802 175.625 135.083 166.836 131.644C158.175 128.204 150.659 123.428 144.29 117.314C137.922 111.072 132.954 103.812 129.387 95.5324C125.82 87.2529 124.037 78.2092 124.037 68.4012C124.037 58.5932 125.82 49.5495 129.387 41.27C132.954 32.9905 137.922 25.7937 144.29 19.6797C150.659 13.4382 158.175 8.5979 166.836 5.15874C175.498 1.71958 184.987 0 195.305 0C205.495 0 214.857 1.71958 223.391 5.15874C232.053 8.47053 239.568 13.2472 245.937 19.4886C252.433 25.6027 257.401 32.7994 260.84 41.0789C264.407 49.3584 266.19 58.4658 266.19 68.4012C266.19 78.3365 264.407 87.444 260.84 95.7234C257.401 104.003 252.433 111.263 245.937 117.505C239.568 123.619 232.053 128.396 223.391 131.835C214.857 135.146 205.495 136.802 195.305 136.802ZM195.305 119.798C202.693 119.798 209.508 118.524 215.749 115.976C222.118 113.429 227.595 109.862 232.181 105.277C236.893 100.564 240.523 95.0865 243.071 88.8451C245.746 82.6036 247.083 75.789 247.083 68.4012C247.083 61.0133 245.746 54.1987 243.071 47.9572C240.523 41.7158 236.893 36.3023 232.181 31.7167C227.595 27.0038 222.118 23.3736 215.749 20.8261C209.508 18.2785 202.693 17.0048 195.305 17.0048C187.79 17.0048 180.848 18.2785 174.479 20.8261C168.237 23.3736 162.76 27.0038 158.047 31.7167C153.334 36.3023 149.641 41.7158 146.965 47.9572C144.418 54.1987 143.144 61.0133 143.144 68.4012C143.144 75.789 144.418 82.6036 146.965 88.8451C149.641 95.0865 153.334 100.564 158.047 105.277C162.76 109.862 168.237 113.429 174.479 115.976C180.848 118.524 187.79 119.798 195.305 119.798Z" fill="currentColor"/>
      <path d="M0 134.511V2.29102H37.3369C47.5269 2.29102 56.826 3.94692 65.2338 7.25871C73.6416 10.5705 80.9657 15.2198 87.2072 21.2065C93.5759 27.0658 98.5436 34.0714 102.11 42.2235C105.677 50.3757 107.46 59.356 107.46 69.1641V67.6356C107.46 77.4436 105.677 86.4873 102.11 94.7668C98.5436 102.919 93.5759 110.052 87.2072 116.166C80.9657 122.153 73.6416 126.866 65.2338 130.305C56.826 133.617 47.5269 135.273 37.3369 135.273L0 134.511ZM18.7246 118.269H36.1127C44.0089 118.269 51.2057 117.059 57.7019 114.639C64.3254 112.091 70.0574 108.588 74.8976 104.13C79.8654 99.5441 83.6866 94.0669 86.3615 87.698C89.0365 81.3292 90.3739 74.3236 90.3739 66.6816V68.5923C90.3739 60.9503 89.0365 53.9447 86.3615 47.5758C83.6866 41.207 79.8654 35.7934 74.8976 31.335C70.0574 26.7494 64.3254 23.1829 57.7019 20.6353C51.2057 18.0877 44.0089 16.8139 36.1127 16.8139H18.7246V118.269Z" fill="currentColor"/>
    </svg>
  );
}

function DocoLogoLarge({ className = "", height = 56 }: { className?: string; height?: number }) {
  return <DocoLogo className={className} height={height} />;
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
          <DocoLogo className="text-white" height={28} />
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
            <DocoLogoLarge className="text-white" height={56} />
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
