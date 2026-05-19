"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useLenis } from "@/lib/useLenis";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { HelpSystemProvider } from "@/contexts/HelpSystemContext";
import HelpSystem from "@/components/HelpSystem";
import HelpButton from "@/components/HelpButton";
import { helpConfigs } from "@/config/helpConfigs";

import Navbar from "@/components/landing/Navbar";
import LandingHero from "@/components/landing/LandingHero";
import SocialProof from "@/components/landing/SocialProof";
import LandingFeatures from "@/components/landing/LandingFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  const router = useRouter();

  // Initialize smooth scrolling
  useLenis();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard/chat");
    }
  }, [router]);

  return (
    <AuthModalProvider>
      <HelpSystemProvider>
        <div className="landing">
          <Navbar />
          <LandingHero />
          <SocialProof />
          <LandingFeatures />
          <HowItWorks />
          <LandingPricing />
          <LandingCTA />
          <LandingFooter />
        </div>
        <HelpButton helpConfig={helpConfigs.landing} />
        <HelpSystem />
      </HelpSystemProvider>
    </AuthModalProvider>
  );
}
