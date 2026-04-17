import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { AuthenticatedRequest } from "../../types/auth.types";
import {
  recordWatchHistoryService,
  getWatchHistoryService,
  removeFromWatchHistoryService,
  clearWatchHistoryService,
} from "../../service/watchhistory/watchhistory.service";

export const recordWatchHistoryController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await recordWatchHistoryService(req.params.videoId as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("watchhistory.controller.recordWatchHistoryController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const getWatchHistoryController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getWatchHistoryService(req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("watchhistory.controller.getWatchHistoryController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const removeFromWatchHistoryController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await removeFromWatchHistoryService(req.params.videoId as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("watchhistory.controller.removeFromWatchHistoryController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const clearWatchHistoryController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await clearWatchHistoryService(req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("watchhistory.controller.clearWatchHistoryController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};
