import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { ServiceResult } from "../../types/common.types";
import { VideoRecord, VideoStatus } from "../../types/video.types";
import { Video, User } from "../../models";
import config from "../../config/app.config";

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
export type VideoSortOrder = "latest" | "oldest" | "popular";

export const getAllVideos = async (
  createdBy?: string,
  sort: VideoSortOrder = "latest"
): Promise<ServiceResult<VideoRecord[]>> => {
  try {
    const order: [string, string][] =
      sort === "oldest"
        ? [["createdAt", "ASC"]]
        : sort === "popular"
          ? [["views", "DESC"]]
          : [["createdAt", "DESC"]];

    const videos = await Video.findAll({
      where: createdBy ? { createdBy } : undefined,
      include: [{ model: User, as: "uploader", attributes: ["name"] }],
      order,
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
// ─── Delete ───────────────────────────────────────────────────────────────────
export const deleteVideo = async (id: string, email: string): Promise<ServiceResult<null>> => {
  try {
    const video = await Video.findByPk(id);

    if (!video) {
      return {
        success: false,
        data: null,
        message: "Video not found.",
        statusCode: StatusCodes.NOT_FOUND,
      };
    }

    if (video.createdBy !== email) {
      return {
        success: false,
        data: null,
        message: "You are not authorized to delete this video.",
        statusCode: StatusCodes.FORBIDDEN,
      };
    }

    await video.destroy();

    // ── Clean up files ────────────────────────────────────────────────────────
    // 1. Remove the entire HLS output directory (segments + thumbnail + playlist)
    const hlsDir = path.join(config.hlsOutputDir, id);
    if (fs.existsSync(hlsDir)) {
      fs.rmSync(hlsDir, { recursive: true, force: true });
    }

    // 2. Remove any leftover raw upload file (may still exist if transcoding failed)
    const uploadsDir = config.uploadsDir;
    const uploadExts = [".mp4", ".mkv", ".avi", ".mov", ".webm"];
    for (const ext of uploadExts) {
      const uploadFile = path.join(uploadsDir, `${id}${ext}`);
      if (fs.existsSync(uploadFile)) {
        fs.rmSync(uploadFile, { force: true });
        break;
      }
    }

    return {
      success: true,
      data: null,
      message: "Video deleted successfully.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("videoStore.deleteVideo error", error);
    return {
      success: false,
      data: null,
      message: "Failed to delete video.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};