import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sabilearn.online";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SabiLearn — Learn a skill. Sabi it for life.",
    template: "%s | SabiLearn",
  },
  description: "SabiLearn is a Nigerian EdTech platform for courses, flashcards, quizzes and AI-powered study tools.",
  openGraph: {
    siteName: "SabiLearn",
    type: "website",
    locale: "en_NG",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SabiLearn — Learn a skill. Sabi it for life." }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SabiLearn",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: ["https://www.codiac.online"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "SabiLearn",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
