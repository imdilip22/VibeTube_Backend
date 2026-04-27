import { Router } from "express";
import upload, { generateVideoId } from "../../middleware/upload.middleware";
import {
  uploadVideoController,
  getAllVideosController,
  getVideoStatusController,
  deleteVideoController,
} from "../../controller/video/video.controller";
import { getLikeInfoController, toggleLikeController, getLikedVideosListController } from "../../controller/like/like.controller";
import {
  getCommentsController,
  addCommentController,
  deleteCommentController,
} from "../../controller/comment/comment.controller";

export const videoRouter = Router();

// ── Upload ────────────────────────────────────────────────────────────────────
videoRouter.post(
  "/upload",
  generateVideoId,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideoController
);

// ── List / status ─────────────────────────────────────────────────────────────
videoRouter.get("/", getAllVideosController);
videoRouter.get("/liked", getLikedVideosListController);
videoRouter.get("/status/:id", getVideoStatusController);

// ── Likes ─────────────────────────────────────────────────────────────────────
videoRouter.get("/:videoId/likes", getLikeInfoController);
videoRouter.post("/:videoId/likes", toggleLikeController);
videoRouter.delete("/:videoId", deleteVideoController);

// ── Comments ──────────────────────────────────────────────────────────────────
videoRouter.get("/:videoId/comments", getCommentsController);
videoRouter.post("/:videoId/comments", addCommentController);
videoRouter.delete("/:videoId/comments/:commentId", deleteCommentController);
