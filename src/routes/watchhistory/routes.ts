import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  recordWatchHistoryController,
  getWatchHistoryController,
  removeFromWatchHistoryController,
  clearWatchHistoryController,
} from "../../controller/watchhistory/watchhistory.controller";

export const watchHistoryRouter = Router();

// GET  /api/v1/watch-history          – Get user's full history
watchHistoryRouter.get("/", authenticate, getWatchHistoryController);

// POST /api/v1/watch-history/:videoId – Record a video as watched
watchHistoryRouter.post("/:videoId", authenticate, recordWatchHistoryController);

// DELETE /api/v1/watch-history/clear  – Clear entire history (must be before /:videoId)
watchHistoryRouter.delete("/clear", authenticate, clearWatchHistoryController);

// DELETE /api/v1/watch-history/:videoId – Remove one entry
watchHistoryRouter.delete("/:videoId", authenticate, removeFromWatchHistoryController);
