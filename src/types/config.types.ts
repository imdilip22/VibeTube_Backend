// ─── FFmpeg ───────────────────────────────────────────────────────────────────
export type FfmpegVariant = {
  label: string;
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
};

// ─── App Config ───────────────────────────────────────────────────────────────
export type AppConfig = {
  port: number | string;
  uploadsDir: string;
  hlsOutputDir: string;
  maxFileSize: number;
  allowedExtensions: string[];
  corsOrigin: string;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
  };
  ffmpeg: {
    maxBuffer: number;
    hlsTime: number;
    variants: FfmpegVariant[];
  };
};
