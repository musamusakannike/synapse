import type { Metadata, Viewport } from "next";
import { Sora, Karla, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SabiLearn — you sabi pass this exam",
  description:
    "Turn your notes into quizzes, follow ready-made courses, and learn to code — all in one clean, no-clutter app for Nigerian students.",
  keywords: [
    "SabiLearn",
    "Nigerian students",
    "WAEC",
    "JAMB",
    "quiz generator",
    "online courses",
    "learn to code",
    "edtech Nigeria",
  ],
  authors: [{ name: "SabiLearn" }],
  openGraph: {
    title: "SabiLearn — you sabi pass this exam",
    description:
      "Turn your notes into quizzes, follow ready-made courses, and learn to code — all in one clean app.",
    type: "website",
    siteName: "SabiLearn",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e9f6e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${karla.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
