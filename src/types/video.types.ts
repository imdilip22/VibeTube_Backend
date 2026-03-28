// ─── Video Status ─────────────────────────────────────────────────────────────
export type VideoStatus = "processing" | "done" | "error";

// ─── Video Record ─────────────────────────────────────────────────────────────
export type VideoRecord = {
  id: string;
  title: string;
  originalName: string;
  status: VideoStatus;
  createdBy: string;
  thumbnailPath: string | null;
  createdAt: string;
  error: string | null;
};
