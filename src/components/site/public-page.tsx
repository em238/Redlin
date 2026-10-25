"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { StatsBar } from "./stats-bar";
import { Services } from "./services";
import { HowItWorks } from "./how-it-works";
import { InteractiveMap } from "./interactive-map";
import { VideoSection } from "./video-section";
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

export function PublicPage() {
  // Wait for the core data before rendering sections, so the hard-coded
  // fallback values never flash before the real (DB) data arrives.
  const { isLoading: siteLoading } = useQuery({
    queryKey: ["site-data"],
    queryFn: () => apiGet<any>("/api/site"),
  });
  const { isLoading: aboutLoading } = useQuery({
    queryKey: ["about-content"],
    queryFn: () => apiGet<any>("/api/about"),
  });
  const { isLoading: partnersLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: () => apiGet<any>("/api/partners"),
  });

  if (siteLoading || aboutLoading || partnersLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden noise">
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