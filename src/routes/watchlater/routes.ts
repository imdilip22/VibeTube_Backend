import { Router } from "express";
import {
  addToWatchLaterController,
  removeFromWatchLaterController,
  getWatchLaterListController,
  getWatchLaterStatusController,
} from "../../controller/watchlater/watchlater.controller";

export const watchLaterRouter = Router();

watchLaterRouter.get("/", getWatchLaterListController);
watchLaterRouter.get("/:videoId/status", getWatchLaterStatusController);
watchLaterRouter.post("/:videoId", addToWatchLaterController);
watchLaterRouter.delete("/:videoId", removeFromWatchLaterController);
