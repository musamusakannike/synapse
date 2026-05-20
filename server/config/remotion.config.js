const path = require("path");
const fs = require("fs");

// Lazily imported Remotion ESM modules
let bundleModule = null;
let rendererModule = null;

async function getRemotionModules() {
  if (!bundleModule) bundleModule = await import("@remotion/bundler");
  if (!rendererModule) rendererModule = await import("@remotion/renderer");
  return { bundleModule, rendererModule };
}

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

/**
 * Entry point for the Remotion composition.
 * Lives in the FRONTEND project — React/TSX files belong there.
 * The bundler will resolve 'remotion', 'katex', etc. from the frontend's node_modules.
 */
const REMOTION_ENTRY = path.resolve(
  __dirname,
  "../../frontend/src/remotion/index.tsx"
);

/**
 * The bundler needs to resolve React, remotion, katex etc.
 * Point webpack's resolve.modules at the frontend's node_modules.
 */
const FRONTEND_NODE_MODULES = path.resolve(
  __dirname,
  "../../frontend/node_modules"
);

// Output directory for rendered MP4 files
const VIDEO_OUTPUT_DIR = path.resolve(__dirname, "../uploads/videos");

if (!fs.existsSync(VIDEO_OUTPUT_DIR)) {
  fs.mkdirSync(VIDEO_OUTPUT_DIR, { recursive: true });
}

// Bundle cache — avoid re-bundling on every request
let cachedBundleUrl = null;
let lastBundleTime = 0;
const BUNDLE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

/**
 * Renders a course video from a scenes array.
 *
 * @param {string} videoId - Unique identifier (courseId) for the output file
 * @param {Array}  scenes  - Array of VideoScene objects (from AI script)
 * @param {Function} [onProgress] - Optional progress callback (0 → 1)
 * @returns {Promise<string>} Absolute path of the rendered .mp4
 */
async function renderVideo(videoId, scenes, onProgress) {
  const { bundleModule, rendererModule } = await getRemotionModules();
  const { bundle } = bundleModule;
  const { selectComposition, renderMedia } = rendererModule;

  // Compute total frames from scenes
  const totalDurationInFrames = scenes.reduce(
    (acc, s) => acc + Math.max(Math.round((s.durationSeconds ?? 5) * FPS), 30),
    0
  );

  const inputProps = { scenes, fps: FPS };

  // Bundle (cached)
  const now = Date.now();
  if (!cachedBundleUrl || now - lastBundleTime > BUNDLE_CACHE_TTL_MS) {
    console.log("[Remotion] Bundling frontend composition...");
    console.log("[Remotion] Entry:", REMOTION_ENTRY);

    cachedBundleUrl = await bundle({
      entryPoint: REMOTION_ENTRY,
      // Override webpack to resolve modules from the frontend's node_modules
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          modules: [
            FRONTEND_NODE_MODULES,
            "node_modules",
            ...(config.resolve?.modules ?? []),
          ],
        },
      }),
    });

    lastBundleTime = Date.now();
    console.log("[Remotion] Bundle ready:", cachedBundleUrl);
  }

  // Select the composition and override duration dynamically
  const composition = await selectComposition({
    serveUrl: cachedBundleUrl,
    id: "VideoExplanation",
    inputProps,
  });

  const finalComposition = {
    ...composition,
    durationInFrames: totalDurationInFrames,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
  };

  const outputPath = path.join(VIDEO_OUTPUT_DIR, `${videoId}.mp4`);
  const durationSecs = (totalDurationInFrames / FPS).toFixed(1);

  console.log(`[Remotion] Rendering ${scenes.length} scenes → ${outputPath}`);
  console.log(`[Remotion] Duration: ${totalDurationInFrames} frames @ ${FPS}fps (${durationSecs}s)`);

  await renderMedia({
    composition: finalComposition,
    serveUrl: cachedBundleUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    chromiumOptions: {
      disableWebSecurity: false,
      headless: true,
    },
    onProgress: ({ progress }) => {
      if (onProgress) onProgress(progress);
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) console.log(`[Remotion] Progress: ${pct}%`);
    },
    overwrite: true,
    concurrency: process.env.REMOTION_CONCURRENCY
      ? parseInt(process.env.REMOTION_CONCURRENCY, 10)
      : 1,
  });

  console.log(`[Remotion] Done: ${outputPath}`);
  return outputPath;
}

/**
 * Delete a rendered video file.
 * @param {string} videoId
 */
function deleteVideo(videoId) {
  const filePath = path.join(VIDEO_OUTPUT_DIR, `${videoId}.mp4`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/**
 * Get the expected output path for a video (may not exist yet).
 * @param {string} videoId
 */
function getVideoPath(videoId) {
  return path.join(VIDEO_OUTPUT_DIR, `${videoId}.mp4`);
}

module.exports = { renderVideo, deleteVideo, getVideoPath };
