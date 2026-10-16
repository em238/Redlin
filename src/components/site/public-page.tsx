"use client";

import dynamic from "next/dynamic";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { StatsBar } from "./stats-bar";
import { Services } from "./services";
import { HowItWorks } from "./how-it-works";
import { About } from "./about";
import { Partners } from "./partners";
import { Testimonials } from "./testimonials";
import { CtaBanner } from "./cta-banner";
import { Contact } from "./contact";
import { Footer } from "./footer";
import { CustomCursor } from "@/components/shared/custom-cursor";
import { PageLoadReveal } from "@/components/shared/page-load-reveal";
import { SectionDivider } from "@/components/shared/section-divider";
import { FloatingCTA, ScrollTopButton } from "@/components/shared/floating-cta";
import { WhatsAppChat } from "@/components/shared/whatsapp-chat";

// Lazy-load heavy below-fold components (SVG map + video gallery)
// ssr: false ensures they only load on client after first paint
const InteractiveMap = dynamic(() => import("./interactive-map").then(m => ({ default: m.InteractiveMap })), {
  ssr: false,
  loading: () => (
    <div className="py-14 sm:py-24 lg:py-28 bg-zinc-950 flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

const VideoSection = dynamic(() => import("./video-section").then(m => ({ default: m.VideoSection })), {
  ssr: false,
  loading: () => (
    <div className="py-14 sm:py-24 lg:py-28 flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

export function PublicPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden noise">
      <PageLoadReveal />
      <CustomCursor />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <SectionDivider className="my-2" />
        <Services />
        <HowItWorks />
        <SectionDivider className="my-2" />
        <InteractiveMap />
        <VideoSection />
        <SectionDivider className="my-2" />
        <About />
        <Partners />
        <Testimonials />
        <SectionDivider className="my-2" />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
      <FloatingCTA />
      <ScrollTopButton />
      <WhatsAppChat />
    </div>
  );
}
