import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { AuthenticatedRequest } from "../../types/auth.types";
import { getAllChannelsService } from "../../service/channels/channels.service";

export const getAllChannelsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getAllChannelsService(req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("channels.controller.getAllChannelsController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};
