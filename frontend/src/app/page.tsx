import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TutorIntro } from "@/components/landing/TutorIntro";
import { FeatureRows } from "@/components/landing/FeatureRows";
import { LevelsSection } from "@/components/landing/LevelsSection";
import { PhotoBand } from "@/components/landing/PhotoBand";
import { CommunityReach } from "@/components/landing/CommunityReach";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />
      <main className="flex-1">
        <Hero />
        <TutorIntro />
        <FeatureRows />
        <LevelsSection />
        <PhotoBand />
        <CommunityReach />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
