import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { GuidedProcess, CTASection, SiteFooter } from "@/components/shared-sections";

import says_it_all from "@assets/says-it-all.jpg";

import kris_and_jenna from "@assets/kris-and-jenna.jpg";

import model_house_1_small from "@assets/model-house 1 small.png";

import model_house_squooshed from "@assets/model-house-squooshed.jpg";

const SERVICE_LINKS: Record<string, string> = {
  Roofing: "/services/roofing",
  Siding: "/services/siding",
  Windows: "/services/windows",
  Gutters: "/services/gutters",
};

export default function Home() {
  const [, navigate] = useLocation();
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
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-[68px] transition-all duration-300 ${
          isNavScrolled ? "bg-[#0A0A0A]/95 backdrop-blur-xl" : "bg-[#0A0A0A]/92 backdrop-blur-lg"
        }`}
        style={{ borderBottom: "1px solid rgba(88,227,234,0.12)" }}
      >
        <button onClick={() => scrollTo("home")} className="flex items-center transition-transform duration-200 hover:scale-110 focus:scale-110 focus:outline-none" data-testid="link-home-logo">
          <img src="/logo-header.svg" alt="DOCO Exteriors" style={{ height: 28, width: "auto" }} />
        </button>
        <ul className="hidden md:flex items-center gap-9 list-none">
          <li><button onClick={() => scrollTo("about")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-about">About</button></li>
          <li><button onClick={() => scrollTo("services")} className="text-[13px] font-medium tracking-wider uppercase text-white/70 hover:text-[#58E3EA] transition-colors" data-testid="link-nav-services">Services</button></li>
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
      {/* HERO */}
      <section id="home" className="relative min-h-screen pt-[68px] bg-[#0A0A0A]">
        <div className="absolute inset-0 lg:hidden">
          <img
            src={model_house_squooshed}
            alt="Home exterior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0A0A0A]/75" />
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-68px)]">
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
              At DOCO Exteriors, our team is dedicated to delivering superior roofing, siding, windows, and gutters across the greater Minneapolis metro. Every project is personal.
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
            <div className="overflow-hidden h-full">
              <img
                src={model_house_squooshed}
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
            src={kris_and_jenna}
            alt="Minneapolis home exterior"
            className="w-full h-full object-cover block min-h-[400px]"
          />
        </div>
        <div className="p-12 md:p-16 lg:py-24 lg:px-[72px] flex flex-col justify-center">
          <h2 className="text-[clamp(34px,4vw,52px)] font-extrabold leading-[1.1] tracking-tight mb-7 text-[#0A0A0A]" data-testid="text-about-headline">
            Built on Trust,<br/>Finished with Pride.
          </h2>
          <p className="text-[15px] leading-relaxed text-[#444] mb-5 max-w-[480px]">
            DOCO Exteriors was founded with one goal in mind: to give Minneapolis homeowners an exterior contractor they can genuinely trust. We see your home as more than a project — it's your biggest investment and where life happens.
          </p>
          <p className="text-[15px] leading-relaxed text-[#444] mb-5 max-w-[480px]">
            With deep roots in the Twin Cities, our crews show up on time, communicate clearly, and leave every job site cleaner than they found it. From a full roof replacement to new windows and gutters, we bring the same level of care to every single home.
          </p>
          <button
            onClick={() => navigate("/about")}
            className="text-[#0A0A0A] text-[13px] font-bold tracking-wider uppercase inline-flex items-center gap-2 mt-2 border-b-2 border-[#0A0A0A] pb-0.5 self-start transition-colors hover:text-[#3ABFC6] hover:border-[#3ABFC6]"
            data-testid="link-about-more"
          >
            More about us
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </section>
      {/* SERVICES */}
      <section id="services" className="bg-[#111111] px-8 md:px-20 pt-24 pb-0">
        <div className="flex items-end justify-between mb-14">
          <h2 className="text-[clamp(28px,3vw,42px)] font-extrabold tracking-tight" data-testid="text-services-headline">Our Services</h2>
          <div className="hidden sm:flex gap-3">
            <button className="w-11 h-11 border border-white/20 bg-transparent text-white flex items-center justify-center rounded-sm transition-all hover:bg-[#58E3EA] hover:border-[#58E3EA] hover:text-[#0A0A0A]" data-testid="button-services-prev">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button className="w-11 h-11 border border-white/20 bg-transparent text-white flex items-center justify-center rounded-sm transition-all hover:bg-[#58E3EA] hover:border-[#58E3EA] hover:text-[#0A0A0A]" data-testid="button-services-next">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
          {[
            { tag: "Roofing", title: "Roof Replacement & Repair", desc: "From storm damage to full replacements, we handle asphalt, metal, and architectural shingles with precision.", img: "https://cdn.midjourney.com/365218d6-e05d-4ccf-860d-234a277025fd/0_0.png" },
            { tag: "Siding", title: "Siding Installation", desc: "Steel, vinyl, or engineered wood — our siding crews deliver crisp, clean installations that last decades.", img: "https://cdn.midjourney.com/039404f0-2543-4e83-a864-1b8e898f73c1/0_0.png" },
            { tag: "Windows", title: "Window Replacement", desc: "Energy-efficient, Minnesota-rated windows installed to keep heat in and cold out — lowering your bills year-round.", img: "https://cdn.midjourney.com/15c2b54f-384d-4719-9eab-116caf3f4bc9/0_0.png" },
            { tag: "Gutters", title: "Gutter Systems", desc: "Seamless gutters, guards, and downspout systems that protect your foundation through Minnesota's harshest seasons.", img: "https://cdn.midjourney.com/10a24684-6aa4-4c97-8ad4-e6ce00a8fb6f/0_0.png" },
          ].map((svc, i) => (
            <div
              key={i}
              className="relative overflow-hidden aspect-[3/4] cursor-pointer bg-[#1A1A1A] group"
              onClick={() => navigate(SERVICE_LINKS[svc.tag])}
              data-testid={`card-service-${i}`}
            >
              <img src={svc.img} alt={svc.tag} className="w-full h-full object-cover transition-transform duration-600 opacity-70 group-hover:scale-[1.06] group-hover:opacity-85" />
              <div className="absolute bottom-0 left-0 right-0 p-7" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)" }}>
                <span className="inline-block bg-[#58E3EA] text-[#0A0A0A] text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-sm mb-3">{svc.tag}</span>
                <h3 className="text-xl font-bold mb-2.5 tracking-tight">{svc.title}</h3>
                <p className="text-[13px] text-white/70 leading-relaxed mb-4">{svc.desc}</p>
                <span
                  className="text-[12px] font-bold tracking-wider uppercase text-[#58E3EA] flex items-center gap-1.5 transition-all group-hover:gap-2.5"
                  data-testid={`link-service-quote-${i}`}
                >
                  Learn more <ArrowUpRight size={13} strokeWidth={2.5} />
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-8 px-8 swipe-carousel">
          {[
            { tag: "Roofing", title: "Roof Replacement & Repair", desc: "From storm damage to full replacements, we handle asphalt, metal, and architectural shingles with precision.", img: "https://cdn.midjourney.com/365218d6-e05d-4ccf-860d-234a277025fd/0_0.png" },
            { tag: "Siding", title: "Siding Installation", desc: "Steel, vinyl, or engineered wood — our siding crews deliver crisp, clean installations that last decades.", img: "https://cdn.midjourney.com/039404f0-2543-4e83-a864-1b8e898f73c1/0_0.png" },
            { tag: "Windows", title: "Window Replacement", desc: "Energy-efficient, Minnesota-rated windows installed to keep heat in and cold out — lowering your bills year-round.", img: "https://cdn.midjourney.com/15c2b54f-384d-4719-9eab-116caf3f4bc9/0_0.png" },
            { tag: "Gutters", title: "Gutter Systems", desc: "Seamless gutters, guards, and downspout systems that protect your foundation through Minnesota's harshest seasons.", img: "https://cdn.midjourney.com/10a24684-6aa4-4c97-8ad4-e6ce00a8fb6f/0_0.png" },
          ].map((svc, i) => (
            <div
              key={i}
              className="relative overflow-hidden aspect-[3/4] cursor-pointer bg-[#1A1A1A] group snap-start shrink-0 w-[75vw] rounded-lg"
              onClick={() => navigate(SERVICE_LINKS[svc.tag])}
              data-testid={`card-service-mobile-${i}`}
            >
              <img src={svc.img} alt={svc.tag} className="w-full h-full object-cover opacity-70" />
              <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)" }}>
                <span className="inline-block bg-[#58E3EA] text-[#0A0A0A] text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-sm mb-3">{svc.tag}</span>
                <h3 className="text-lg font-bold mb-2 tracking-tight">{svc.title}</h3>
                <p className="text-[12px] text-white/70 leading-relaxed mb-3">{svc.desc}</p>
                <span className="text-[12px] font-bold tracking-wider uppercase text-[#58E3EA] flex items-center gap-1.5">
                  Learn more <ArrowUpRight size={13} strokeWidth={2.5} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <GuidedProcess />
      <CTASection />
      <SiteFooter />
    </div>
  );
}
