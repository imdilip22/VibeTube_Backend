import { Router } from "express";
import upload, { generateVideoId } from "../../middleware/upload.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
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
  authenticate,
  generateVideoId,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideoController
);

// ── List / status ─────────────────────────────────────────────────────────────
videoRouter.get("/", getAllVideosController);
videoRouter.get("/liked", authenticate, getLikedVideosListController);
videoRouter.get("/status/:id", getVideoStatusController);

// ── Likes ─────────────────────────────────────────────────────────────────────
// GET  /api/v1/videos/:videoId/likes  — count + isLiked
// POST /api/v1/videos/:videoId/likes  — toggle like/unlike
videoRouter.get("/:videoId/likes", authenticate, getLikeInfoController);
videoRouter.post("/:videoId/likes", authenticate, toggleLikeController);
videoRouter.delete("/:videoId", authenticate, deleteVideoController);
// ── Comments ──────────────────────────────────────────────────────────────────
// GET    /api/v1/videos/:videoId/comments              — list comments
// POST   /api/v1/videos/:videoId/comments              — add comment
// DELETE /api/v1/videos/:videoId/comments/:commentId   — delete own comment
videoRouter.get("/:videoId/comments", authenticate, getCommentsController);
videoRouter.post("/:videoId/comments", authenticate, addCommentController);
videoRouter.delete("/:videoId/comments/:commentId", authenticate, deleteCommentController);
