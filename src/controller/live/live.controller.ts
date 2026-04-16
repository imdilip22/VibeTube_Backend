import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types/auth.types";
import {
  createStreamService,
  getStreamService,
  getActiveStreamsService,
  getUserStreamsService,
  endStreamService,
} from "../../service/live/live.service";

// ─── POST /api/v1/live ────────────────────────────────────────────────────────
export const createStreamController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const title = (req.body.title as string)?.trim();
    if (!title) {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Stream title is required." });
      return;
    }

    // Optional thumbnail uploaded via multipart
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbnailFile = files?.["thumbnail"]?.[0];

    const result = await createStreamService(title, req.user!.email, thumbnailFile);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("live.controller.createStreamController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /api/v1/live ─────────────────────────────────────────────────────────
export const getActiveStreamsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getActiveStreamsService();
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("live.controller.getActiveStreamsController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /api/v1/live/my ─────────────────────────────────────────────────────
export const getMyStreamsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getUserStreamsService(req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("live.controller.getMyStreamsController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /api/v1/live/:streamKey ──────────────────────────────────────────────
export const getStreamController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getStreamService(req.params.streamKey as string);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("live.controller.getStreamController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── PATCH /api/v1/live/:streamKey/end ───────────────────────────────────────
export const endStreamController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await endStreamService(req.params.streamKey as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("live.controller.endStreamController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};
