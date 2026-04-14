import { StatusCodes } from "http-status-codes";
import { UniqueConstraintError } from "sequelize";
import { VideoLike, Video, User } from "../../models";
import type { ServiceResult } from "../../types/common.types";

export type LikeInfo = {
  likeCount: number;
  isLiked: boolean;
};

const getLikeInfo = async (videoId: string, userEmail: string): Promise<ServiceResult<LikeInfo>> => {
  const [likeCount, existingRow] = await Promise.all([
    VideoLike.count({ where: { videoId } }),
    VideoLike.findOne({ where: { videoId, userEmail } }),
  ]);
  return {
    success: true,
    data: { likeCount, isLiked: !!existingRow },
    message: "Like info retrieved.",
    statusCode: StatusCodes.OK,
  };
};

export const getLikeInfoService = async (videoId: string, userEmail: string): Promise<ServiceResult<LikeInfo>> => {
  try {
    return await getLikeInfo(videoId, userEmail);
  } catch (error) {
    console.log("like.service.getLikeInfoService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve like info.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

export const toggleLikeService = async (videoId: string, userEmail: string): Promise<ServiceResult<LikeInfo>> => {
  try {
    const existing = await VideoLike.findOne({ where: { videoId, userEmail } });
    if (existing) {
      await existing.destroy();
    } else {
      await VideoLike.create({ videoId, userEmail });
    }
    return await getLikeInfo(videoId, userEmail);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return await getLikeInfo(videoId, userEmail);
    }
    console.log("like.service.toggleLikeService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to toggle like.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

export const getLikedVideosListService = async (userEmail: string): Promise<ServiceResult<any>> => {
  try {
    const list = await VideoLike.findAll({
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
      message: "Liked videos list retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("like.service.getLikedVideosListService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve liked videos list.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
