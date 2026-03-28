import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import config from "../config/app.config";
import { ALLOWED_IMAGE_FORMATS } from "../constants/constant";

// ─── Pre-generate videoId ─────────────────────────────────────────────────────
// Runs before multer so both the video and thumbnail filename callbacks can use
// the same req.videoId without racing each other.
export const generateVideoId = (_req: Request, _res: Response, next: NextFunction) => {
  (_req as any).videoId = uuidv4();
  next();
};

// ─── Storage ──────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === "thumbnail") {
      cb(null, `${req.videoId}_thumb${ext}`);
    } else {
      cb(null, `${req.videoId}${ext}`);
    }
  },
});

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === "video" && config.allowedExtensions.includes(ext)) {
    cb(null, true);
  } else if (file.fieldname === "thumbnail" && ALLOWED_IMAGE_FORMATS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type for ${file.fieldname}: ${ext}`));
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
// Limit is set to the larger of the two (video). Thumbnail size is validated
// in the controller since multer applies one limit to all fields.
const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter,
});

export default upload;
