import { StatusCodes } from "http-status-codes";
import { WatchHistory, Video, User } from "../../models";
import type { ServiceResult } from "../../types/common.types";

/**
 * Record a video as watched (upsert — updates watchedAt if already exists).
 */
export const recordWatchHistoryService = async (
  videoId: string,
  userEmail: string
): Promise<ServiceResult<any>> => {
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

    const [entry, created] = await WatchHistory.findOrCreate({
      where: { videoId, userEmail },
      defaults: { watchedAt: new Date() },
    });

    if (!created) {
      // Update watchedAt to push it to the top of history
      await entry.update({ watchedAt: new Date() });
    }

    return {
      success: true,
      data: entry,
      message: "Watch history recorded.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("watchhistory.service.recordWatchHistoryService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to record watch history.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * Get the authenticated user's full watch history, newest first.
 */
export const getWatchHistoryService = async (
  userEmail: string
): Promise<ServiceResult<any>> => {
  try {
    const list = await WatchHistory.findAll({
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
      order: [["watchedAt", "DESC"]],
    });

    const videos = list
      .map((entry: any) => ({
        ...(entry.video?.toJSON() ?? {}),
        watchedAt: entry.watchedAt,
        historyId: entry.id,
      }))
      .filter((v: any) => v.id);

    return {
      success: true,
      data: videos,
      message: "Watch history retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("watchhistory.service.getWatchHistoryService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve watch history.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * Remove a single video from the authenticated user's watch history.
 */
export const removeFromWatchHistoryService = async (
  videoId: string,
  userEmail: string
): Promise<ServiceResult<any>> => {
  try {
    await WatchHistory.destroy({ where: { videoId, userEmail } });
    return {
      success: true,
      data: null,
      message: "Removed from watch history.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("watchhistory.service.removeFromWatchHistoryService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to remove from watch history.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * Clear the authenticated user's entire watch history.
 */
export const clearWatchHistoryService = async (
  userEmail: string
): Promise<ServiceResult<any>> => {
  try {
    await WatchHistory.destroy({ where: { userEmail } });
    return {
      success: true,
      data: null,
      message: "Watch history cleared.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("watchhistory.service.clearWatchHistoryService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to clear watch history.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
