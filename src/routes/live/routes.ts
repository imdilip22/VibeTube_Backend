import { Router } from "express";
import multer from "multer";
import path from "path";
import config from "../../config/app.config";
import { ALLOWED_IMAGE_FORMATS } from "../../constants/constant";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  createStreamController,
  getActiveStreamsController,
  getMyStreamsController,
  getStreamController,
  endStreamController,
} from "../../controller/live/live.controller";

// ─── Multer for optional stream thumbnail ─────────────────────────────────────
const thumbnailUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, config.uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `stream_thumb_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_IMAGE_FORMATS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported thumbnail format: ${ext}`));
    }
  },
});

export const liveRouter = Router();

// List all active (live) streams — public
liveRouter.get("/", getActiveStreamsController);

// My streams — authenticated
liveRouter.get("/my", authenticate, getMyStreamsController);

// Create a new stream (multipart: title + optional thumbnail image)
liveRouter.post(
  "/",
  authenticate,
  thumbnailUpload.fields([{ name: "thumbnail", maxCount: 1 }]),
  createStreamController
);

// Get info about a specific stream by key
liveRouter.get("/:streamKey", getStreamController);

// Mark a stream ended via REST
liveRouter.patch("/:streamKey/end", authenticate, endStreamController);
