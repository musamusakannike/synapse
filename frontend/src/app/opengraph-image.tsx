import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  // Load Outfit font for premium typography
  let fontData: ArrayBuffer | null = null;
  try {
    const fontResponse = await fetch(
      new URL("https://fonts.gstatic.com/s/outfit/v11/QldN_F18_5w7RWfb460P5Gg.ttf")
    );
    if (fontResponse.ok) {
      fontData = await fontResponse.arrayBuffer();
    }
  } catch (error) {
    console.warn("Failed to load custom Outfit font for OG Image, falling back to system fonts.", error);
  }

  const options: any = {
    ...size,
  };

  if (fontData) {
    options.fonts = [
      {
        name: "Outfit",
        data: fontData,
        weight: 700,
        style: "normal",
      },
    ];
  }

  return new ImageResponse(
    (
      <div
        tw="flex flex-col w-full h-full bg-[#0C0C0E] text-[#F5F2ED] items-center justify-center relative overflow-hidden px-16"
        style={{
          fontFamily: fontData ? "Outfit" : "system-ui, sans-serif",
        }}
      >
        {/* Ambient Radial Gradient Orb */}
        <div
          tw="absolute w-[800px] h-[800px] rounded-full opacity-60"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(232, 168, 56, 0.15) 0%, rgba(232, 168, 56, 0.01) 60%, transparent 80%)",
          }}
        />

        {/* Brand Header */}
        <div tw="flex items-center gap-3 mb-10">
          <div tw="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            {/* Elegant brain/synapse shape using simplified CSS border curves */}
            <div tw="w-5 h-5 rounded-full border-2 border-[#E8A838] border-t-transparent flex items-center justify-center">
              <div tw="w-2.5 h-2.5 rounded-full bg-[#E8A838]" />
            </div>
          </div>
          <span tw="text-2xl font-bold tracking-tight text-white">Sabi Learn</span>
        </div>

        {/* Hero Title */}
        <div tw="flex flex-col items-center text-center">
          <h1 tw="text-6xl font-black tracking-tight leading-none text-white m-0">
            Sabi the way
          </h1>
          <h1
            tw="text-7xl font-black tracking-tight leading-none mt-2 mb-6"
            style={{
              background: "linear-gradient(to right, #E8A838, #F0BD5C)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            your brain dey work
          </h1>
        </div>

        {/* Subtitle */}
        <p tw="text-xl text-[#A8A29E] text-center max-w-2xl leading-relaxed m-0 mb-10">
          AI-powered personalized learning. Generate courses, explanatory videos, and practice quizzes tailored entirely to how you sabi book best.
        </p>

        {/* Mock CTA Button */}
        <div tw="flex items-center gap-2 px-8 py-4 rounded-full bg-[#E8A838] text-[#0C0C0E] text-lg font-bold shadow-lg">
          Start to learn free
          <span tw="ml-2 font-normal text-black/70">→</span>
        </div>
      </div>
    ),
    options
  );
}
