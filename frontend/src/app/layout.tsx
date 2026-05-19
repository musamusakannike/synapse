import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Synapse — AI-Powered Learning Assistant",
  description: "Accelerate your learning with an AI tutor that adapts to your thinking. Summaries, quizzes, flashcards, and document analysis — all in one place.",
  openGraph: {
    title: "Synapse — Learn Smarter with AI",
    description: "Accelerate your learning with an AI tutor that adapts to your thinking. Summaries, quizzes, flashcards, and document analysis — all in one place.",
    url: "https://synapsebot.vercel.app/",
    siteName: "Synapse",
    images: [
      {
        url: "https://synapsebot.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Synapse — AI-Powered Learning Assistant",
      },
    ],
    type: "website",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "Synapse — Learn Smarter with AI",
    description: "Accelerate your learning with an AI tutor that adapts to your thinking.",
    images: [
      {
        url: "https://synapsebot.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Synapse — AI-Powered Learning Assistant",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
