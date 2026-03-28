import { StatusCodes } from "http-status-codes";
import { ServiceResult } from "../../types/common.types";
import { VideoRecord, VideoStatus } from "../../types/video.types";
import { Video, User } from "../../models";

// ─── Create ───────────────────────────────────────────────────────────────────
export const createVideo = async (
  videoId: string,
  title: string,
  originalName: string,
  createdBy: string,
  thumbnailPath: string | null = null
): Promise<ServiceResult<VideoRecord>> => {
  try {
    const video = await Video.create({
      id: videoId,
      title,
      originalName,
      status: "processing",
      createdBy,
      thumbnailPath,
      error: null,
    });

    return {
      success: true,
      data: video.toJSON() as VideoRecord,
      message: "Video record created.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("videoStore.createVideo error", error);
    return {
      success: false,
      data: null,
      message: "Failed to create video record.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Get by ID ────────────────────────────────────────────────────────────────
export const getVideoById = async (videoId: string): Promise<ServiceResult<VideoRecord>> => {
  try {
    const video = await Video.findByPk(videoId, {
      include: [{ model: User, as: "uploader", attributes: ["name"] }],
    });

    if (!video) {
      return {
        success: false,
        data: null,
        message: "Video not found.",
        statusCode: StatusCodes.BAD_REQUEST,
      };
    }

    return {
      success: true,
      data: video.toJSON() as VideoRecord,
      message: "Video retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("videoStore.getVideoById error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve video.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Get all (optionally filtered by creator) ─────────────────────────────────
export const getAllVideos = async (createdBy?: string): Promise<ServiceResult<VideoRecord[]>> => {
  try {
    const videos = await Video.findAll({
      where: createdBy ? { createdBy } : undefined,
      include: [{ model: User, as: "uploader", attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
    });

    return {
      success: true,
      data: videos.map((v) => v.toJSON() as VideoRecord),
      message: "Videos retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("videoStore.getAllVideos error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve videos.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Update status ────────────────────────────────────────────────────────────
export const updateVideoStatus = async (
  videoId: string,
  status: VideoStatus,
  error: string | null = null
): Promise<void> => {
  try {
    await Video.update({ status, error }, { where: { id: videoId } });
  } catch (err) {
    console.log("videoStore.updateVideoStatus error", err);
  }
};
