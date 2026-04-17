import { StatusCodes } from "http-status-codes";
import { User, Video, Subscription } from "../../models";
import type { ServiceResult } from "../../types/common.types";
import { Op } from "sequelize";
import sequelize from "../../config/database";

/**
 * Returns all users enriched with videoCount and subscriberCount.
 * Excludes the requesting user so you only see other channels.
 */
export const getAllChannelsService = async (
  currentUserEmail: string
): Promise<ServiceResult<any>> => {
  try {
    const users = await User.findAll({
      where: { email: { [Op.ne]: currentUserEmail } },
      attributes: ["email", "name", "createdAt"],
      include: [
        {
          model: Video,
          as: "videos",
          attributes: ["id"],
          required: false,
        },
        {
          model: Subscription,
          as: "subscribers",
          attributes: ["subscriberEmail"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const channels = users.map((u: any) => ({
      email: u.email,
      name: u.name,
      joinedAt: u.createdAt,
      videoCount: u.videos?.length ?? 0,
      subscriberCount: u.subscribers?.length ?? 0,
    }));

    return {
      success: true,
      data: channels,
      message: "Channels retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("channels.service.getAllChannelsService error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve channels.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
