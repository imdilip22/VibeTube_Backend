import { StatusCodes } from "http-status-codes";
import { WatchLater, Video, User } from "../../models";
import type { ServiceResult } from "../../types/common.types";

export const addToWatchLaterService = async (videoId: string, userEmail: string): Promise<ServiceResult<any>> => {
  try {
    const video = await Video.findByPk(videoId);
    if (!video) {
        return {
            success: false,
            data: null,
            message: "Video not found.",
            statusCode: StatusCodes.NOT_FOUND,
        };
    }

    const [entry, created] = await WatchLater.findOrCreate({
      where: { videoId, userEmail },
    });

    return {
      success: true,
      data: entry,
      message: created ? "Added to Watch Later." : "Already in Watch Later.",
      statusCode: created ? StatusCodes.CREATED : StatusCodes.OK,
    };
  } catch (error) {
    console.log("watchlater.service.addToWatchLaterService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to add to Watch Later.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

export const removeFromWatchLaterService = async (videoId: string, userEmail: string): Promise<ServiceResult<any>> => {
  try {
    const deleted = await WatchLater.destroy({
      where: { videoId, userEmail },
    });

    return {
      success: true,
      data: null,
      message: deleted ? "Removed from Watch Later." : "Not found in Watch Later.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("watchlater.service.removeFromWatchLaterService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to remove from Watch Later.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

export const getWatchLaterListService = async (userEmail: string): Promise<ServiceResult<any>> => {
  try {
    const list = await WatchLater.findAll({
      where: { userEmail },
      include: [
        {
          model: Video,
          as: "video",
          include: [
            {
              model: User,
              as: "uploader",
              attributes: ["name", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Flatten to return videos directly
    const videos = list.map((entry: any) => entry.video).filter(Boolean);

    return {
      success: true,
      data: videos,
      message: "Watch Later list retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("watchlater.service.getWatchLaterListService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve Watch Later list.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

export const getWatchLaterStatusService = async (videoId: string, userEmail: string): Promise<ServiceResult<{ isWatchLater: boolean }>> => {
  try {
    const entry = await WatchLater.findOne({
      where: { videoId, userEmail },
    });

    return {
      success: true,
      data: { isWatchLater: !!entry },
      message: "Watch Later status retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("watchlater.service.getWatchLaterStatusService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve Watch Later status.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
