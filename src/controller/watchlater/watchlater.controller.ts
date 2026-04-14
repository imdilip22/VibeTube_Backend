import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { AuthenticatedRequest } from "../../types/auth.types";
import {
  addToWatchLaterService,
  removeFromWatchLaterService,
  getWatchLaterListService,
  getWatchLaterStatusService,
} from "../../service/watchlater/watchlater.service";

export const addToWatchLaterController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await addToWatchLaterService(req.params.videoId as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("watchlater.controller.addToWatchLaterController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const removeFromWatchLaterController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await removeFromWatchLaterService(req.params.videoId as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("watchlater.controller.removeFromWatchLaterController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const getWatchLaterListController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getWatchLaterListService(req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("watchlater.controller.getWatchLaterListController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const getWatchLaterStatusController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getWatchLaterStatusService(req.params.videoId as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("watchlater.controller.getWatchLaterStatusController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};
