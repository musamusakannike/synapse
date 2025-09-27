import Hero from "@/components/Hero";
import SchoolBadges from "@/components/SchoolBadges";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <div>
      <Hero />
      <SchoolBadges />
      <Features />
      <Pricing />
      <CTA />
    </div>
  );
}
