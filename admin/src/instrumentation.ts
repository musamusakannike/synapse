export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Only run persistent ping loop in production, or when explicitly enabled
    const isProduction = process.env.NODE_ENV === "production";
    const enableLocalCron = process.env.ENABLE_LOCAL_CRON === "true";

    if (isProduction || enableLocalCron) {
      const url = "https://sabilearn-ocr-service.onrender.com/health";
      const intervalMs = 14 * 60 * 1000; // 14 minutes

      console.log(`[Cron] Initializing background ping to ${url} every 14 minutes...`);

      const pingService = async () => {
        try {
          const startTime = Date.now();
          const response = await fetch(url, { cache: "no-store" });
          const duration = Date.now() - startTime;
          if (response.ok) {
            console.log(`[Cron] Pinged ocr-service health: status ${response.status} in ${duration}ms`);
          } else {
            console.warn(`[Cron] Failed to ping ocr-service health: status ${response.status}`);
          }
        } catch (error) {
          console.error("[Cron] Error pinging ocr-service health:", error);
        }
      };

      // Execute initial ping after 5 seconds to let server start up
      setTimeout(pingService, 5000);

      // Schedule subsequent pings every 14 minutes
      setInterval(pingService, intervalMs);
    } else {
      console.log("[Cron] Background ping skipped (non-production). Set ENABLE_LOCAL_CRON=true to enable locally.");
    }
  }
}
