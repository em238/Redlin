"use client";

import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { StatsBar } from "./stats-bar";
import { Services } from "./services";
import { Coverage } from "./coverage";
import { PricingCalculator } from "./pricing-calculator";
import { TrackShipment } from "./track";
import { VideoSection } from "./video-section";
import { About } from "./about";
import { Testimonials } from "./testimonials";
import { CtaBanner } from "./cta-banner";
import { Contact } from "./contact";
import { Footer } from "./footer";

export function PublicPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <Services />
        <Coverage />
        <PricingCalculator />
        <TrackShipment />
        <VideoSection />
        <About />
        <Testimonials />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
