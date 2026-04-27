import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types/auth.types";
import { MAX_THUMBNAIL_SIZE } from "../../constants/constant";
import {
  uploadVideoService,
  getAllVideosService,
  getVideoStatusService,
} from "../../service/video/video.service";
import { deleteVideo } from "../../service/video/videoStore.service";

// ─── POST /api/v1/videos/upload ───────────────────────────────────────────────
export const uploadVideoController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // With upload.fields(), files land in req.files as a dictionary
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const videoFile = files?.["video"]?.[0];
    const thumbnailFile = files?.["thumbnail"]?.[0];

    if (!videoFile) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No video file provided.",
      });
      return;
    }

    const title = (req.body.title as string)?.trim();
    if (!title) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Video title is required.",
      });
      return;
    }

    // Validate thumbnail size (multer limit covers video; thumbnail is validated here)
    if (thumbnailFile && thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Thumbnail must be under 5 MB.",
      });
      return;
    }

    const result = await uploadVideoService(
      req.videoId!,
      title,
      videoFile.originalname,
      videoFile.filename,
      req.user!.email,
      thumbnailFile
    );

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("video.controller.uploadVideoController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/v1/videos ───────────────────────────────────────────────────────
export const getAllVideosController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const createdBy = (req.query.createdBy as string) || undefined;
    const sort = (req.query.sort as string) || "latest";
    const result = await getAllVideosService(createdBy, sort);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("video.controller.getAllVideosController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/v1/videos/status/:id ───────────────────────────────────────────
export const getVideoStatusController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getVideoStatusService(req.params.id as string);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("video.controller.getVideoStatusController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
// ─── DELETE /api/v1/videos/:videoId ──────────────────────────────────────────
export const deleteVideoController = async (req: AuthenticatedRequest, res: Response) => {
  const videoId = req.params.videoId as string;
  try {
    const result = await deleteVideo(videoId, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("video.controller.deleteVideoController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error.",
    });
  }
}