import Hero from "@/components/Hero";
import SchoolBadges from "@/components/SchoolBadges";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <Hero />
      <SchoolBadges />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
