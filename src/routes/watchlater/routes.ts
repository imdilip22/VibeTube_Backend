import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  addToWatchLaterController,
  removeFromWatchLaterController,
  getWatchLaterListController,
  getWatchLaterStatusController,
} from "../../controller/watchlater/watchlater.controller";

export const watchLaterRouter = Router();

// GET /api/v1/watch-later - List all watch later videos for the user
watchLaterRouter.get("/", authenticate, getWatchLaterListController);

// GET /api/v1/watch-later/:videoId/status - Check if a video is in watch later
watchLaterRouter.get("/:videoId/status", authenticate, getWatchLaterStatusController);

// POST /api/v1/watch-later/:videoId - Add a video to watch later
watchLaterRouter.post("/:videoId", authenticate, addToWatchLaterController);

// DELETE /api/v1/watch-later/:videoId - Remove a video from watch later
watchLaterRouter.delete("/:videoId", authenticate, removeFromWatchLaterController);
