"use client";
import Hero from "@/components/Hero";
import SchoolBadges from "@/components/SchoolBadges";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);
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
