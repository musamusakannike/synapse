"use client";
import Hero from "@/components/Hero";
import SchoolBadges from "@/components/SchoolBadges";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { AuthModalProvider } from "@/contexts/AuthModalContext";

export default function Home() {
  return (
    <AuthModalProvider>
      <div>
        <Hero />
        <SchoolBadges />
        <Features />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </AuthModalProvider>
  );
}
