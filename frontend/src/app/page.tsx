import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://synapse.codiac.online/#organization",
        "name": "Synapse",
        "url": "https://synapse.codiac.online",
        "logo": {
          "@type": "ImageObject",
          "url": "https://synapse.codiac.online/synapse.webp",
          "caption": "Synapse Logo"
        },
        "description": "AI-powered personalized learning. Generate courses, explanatory videos, and practice quizzes tailored entirely to how you learn best."
      },
      {
        "@type": "WebSite",
        "@id": "https://synapse.codiac.online/#website",
        "url": "https://synapse.codiac.online",
        "name": "Synapse",
        "description": "AI-powered personalized learning. Generate courses, explanatory videos, and practice quizzes tailored entirely to how you learn best.",
        "publisher": {
          "@id": "https://synapse.codiac.online/#organization"
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
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
}
