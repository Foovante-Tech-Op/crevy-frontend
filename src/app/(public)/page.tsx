"use client";

import { useReducedMotion } from "framer-motion";
import { CinematicScrollPitch } from "@/components/public/landing/CinematicScrollPitch";
import {
  FinalCTASection,
  ScrollingMarquee,
} from "@/components/public/landing/FeaturedProjectsSection";
import {
  HeroSection,
  TrustLayerSection,
} from "@/components/public/landing/HeroSection";
import { ProjectTypesSection } from "@/components/public/landing/ProjectTypesSection";
// import { FinalCTASection } from "@/components/public/landing/FinalCTASection";
import { ThePitchSection } from "@/components/public/landing/ThePitchSection";

export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion() as boolean;

  return (
    <div className="animate-in fade-in duration-700 bg-slate-50 selection:bg-slate-900 selection:text-white">
      <HeroSection shouldReduceMotion={shouldReduceMotion} />
      <TrustLayerSection shouldReduceMotion={shouldReduceMotion} />
      <ThePitchSection />
      <CinematicScrollPitch shouldReduceMotion={shouldReduceMotion} />
      <ProjectTypesSection shouldReduceMotion={shouldReduceMotion} />
      <ScrollingMarquee />
      <FinalCTASection shouldReduceMotion={shouldReduceMotion} />
    </div>
  );
}
