import { Router } from "express";
import multer from "multer";
import path from "path";
import config from "../../config/app.config";
import { ALLOWED_IMAGE_FORMATS } from "../../constants/constant";
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

liveRouter.get("/", getActiveStreamsController);
liveRouter.get("/my", getMyStreamsController);
liveRouter.post("/", thumbnailUpload.fields([{ name: "thumbnail", maxCount: 1 }]), createStreamController);
liveRouter.get("/:streamKey", getStreamController);
liveRouter.patch("/:streamKey/end", endStreamController);
