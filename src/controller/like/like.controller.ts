import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { AuthenticatedRequest } from "../../types/auth.types";
import { getLikeInfoService, toggleLikeService } from "../../service/like/like.service";

export const getLikeInfoController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getLikeInfoService(req.params.videoId as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("like.controller.getLikeInfoController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

export const toggleLikeController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await toggleLikeService(req.params.videoId as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("like.controller.toggleLikeController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};
