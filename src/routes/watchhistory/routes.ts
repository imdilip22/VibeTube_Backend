import { Router } from "express";
import {
  recordWatchHistoryController,
  getWatchHistoryController,
  removeFromWatchHistoryController,
  clearWatchHistoryController,
} from "../../controller/watchhistory/watchhistory.controller";

export const watchHistoryRouter = Router();

watchHistoryRouter.get("/", getWatchHistoryController);
watchHistoryRouter.post("/:videoId", recordWatchHistoryController);
watchHistoryRouter.delete("/clear", clearWatchHistoryController);  // must be before /:videoId
watchHistoryRouter.delete("/:videoId", removeFromWatchHistoryController);
