import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = verifyJWT(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const microserviceUrl = process.env.OCR_MICROSERVICE_URL;
    if (!microserviceUrl) {
      return NextResponse.json({ status: "skipped", message: "OCR microservice URL not configured" });
    }

    console.log(`[OCR Health] Pinging OCR Microservice health endpoint at: ${microserviceUrl}/health`);
    
    const res = await fetch(`${microserviceUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[OCR Health] Ping failed with status ${res.status}: ${errorText}`);
      return NextResponse.json(
        { status: "error", error: `Microservice returned status ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    console.log(`[OCR Health] Ping succeeded:`, data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[OCR Health] Error pinging OCR microservice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check OCR microservice health" },
      { status: 500 }
    );
  }
}
