import path from "path";
import { AppConfig } from "../types/config.types";
import { ALLOWED_FORMATS, MAX_FILE_SIZE } from "../constants/constant";

// process.cwd() always resolves to the project root regardless of whether the
// code is running via ts-node (src/) or compiled JS (build/src/).
const projectRoot = process.cwd();

const config: AppConfig = {
  port: process.env.PORT || 3000,

  // ─── Directories ──────────────────────────────────────────────────────────
  uploadsDir: path.join(projectRoot, "uploads"),
  hlsOutputDir: path.join(projectRoot, "hls-output"),

  // ─── Upload constraints ───────────────────────────────────────────────────
  maxFileSize: MAX_FILE_SIZE,
  allowedExtensions: [...ALLOWED_FORMATS],

  // ─── CORS ─────────────────────────────────────────────────────────────────
  corsOrigin: process.env.CLOUDFRONT_URL || "http://localhost:5173",

  // ─── Database ─────────────────────────────────────────────────────────────
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  auth: {
    jwtSecret: process.env.JWT_ACCESS_SECRET || "",
    jwtExpiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "",
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  // ─── FFmpeg ───────────────────────────────────────────────────────────────
  ffmpeg: {
    maxBuffer: 10 * 1024 * 1024, // 10 MB stderr buffer
    hlsTime: 6,
    variants: [
      { label: "360p", width: 640, height: 360, videoBitrate: "800k", audioBitrate: "96k" },
      { label: "480p", width: 842, height: 480, videoBitrate: "1400k", audioBitrate: "128k" },
      { label: "720p", width: 1280, height: 720, videoBitrate: "2800k", audioBitrate: "192k" },
    ],
  },
};

export default config;
