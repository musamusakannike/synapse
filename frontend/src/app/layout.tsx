import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Synapse",
  description: "A unified, intelligent learning platform for students.",
  openGraph: {
    title: "Synapse - Learn Smarter",
    description: "A unified, intelligent learning platform for students.",
    url: "https://synapsebot.vercel.app/",
    siteName: "Synapse",
    images: [
      {
        url: "https://synapsebot.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Synapse - Learn Smarter",
      },
    ],
    type: "website",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "Synapse - Learn Smarter",
    description: "A unified, intelligent learning platform for students.",
    images: [
      {
        url: "https://synapsebot.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Synapse - Learn Smarter",
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
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
