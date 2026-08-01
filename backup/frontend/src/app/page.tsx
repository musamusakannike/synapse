import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://sabilearn.online/#organization",
        "name": "Sabi Learn",
        "url": "https://sabilearn.online",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sabilearn.online/synapse.webp",
          "caption": "Sabi Learn Logo"
        },
        "description": "AI-powered personalized learning. Generate courses, explanatory videos, and practice quizzes tailored entirely to how you sabi book best."
      },
      {
        "@type": "WebSite",
        "@id": "https://sabilearn.online/#website",
        "url": "https://sabilearn.online",
        "name": "Sabi Learn",
        "description": "AI-powered personalized learning. Generate courses, explanatory videos, and practice quizzes tailored entirely to how you sabi book best.",
        "publisher": {
          "@id": "https://sabilearn.online/#organization"
        }
      }
    ]
  };

  return (
    <div className="relative noise">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <CTA />
      <Pricing />
      <Footer />
    </div>
  );
}
