
export const TABLE_NAMES = {
  USERS: "users",
  REFRESH_TOKENS: "refresh_tokens",
  VIDEOS: "videos",
  SUBSCRIPTIONS: "subscriptions",
  VIDEO_LIKES: "video_likes",
  COMMENTS: "comments",
  WATCH_LATER: "watch_later",
} as const;

// ─── Upload ───────────────────────────────────────────────────────────────────
export const ALLOWED_FORMATS: readonly string[] = [".mp4", ".mkv", ".avi", ".mov", ".webm"];

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

export const ALLOWED_IMAGE_FORMATS: readonly string[] = [".jpg", ".jpeg", ".png", ".webp"];

export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5 MB

/** Maps ffmpeg variant index → quality label. Keep in sync with app.config variants array. */
export const QUALITY_LABELS: Record<number, string> = {
  0: "360p",
  1: "480p",
  2: "720p",
};

