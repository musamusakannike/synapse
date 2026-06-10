import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Optional security check for Vercel Cron or custom header
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = "https://sabilearn-ocr-service.onrender.com/health";
    const startTime = Date.now();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Service responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Successfully pinged ocr-service health endpoint",
      durationMs: duration,
      status: response.status,
      data,
    });
  } catch (error: any) {
    console.error("Cron Health Ping failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to ping health endpoint",
      },
      { status: 500 }
    );
  }
}
