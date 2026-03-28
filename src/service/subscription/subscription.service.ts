import { StatusCodes } from "http-status-codes";
import { UniqueConstraintError, Op } from "sequelize";
import { Subscription, User, Video } from "../../models";
import { ServiceResult } from "../../types/common.types";
import { VideoRecord } from "../../types/video.types";

export type SubscriptionInfo = {
  subscriberCount: number;
  isSubscribed: boolean;
};

export type SubscribedChannel = {
  email: string;
  name: string;
  subscriberCount: number;
  subscribedAt: string;
};

// ─── Get info ─────────────────────────────────────────────────────────────────
export const getSubscriptionInfo = async (
  channelEmail: string,
  requestingEmail: string
): Promise<ServiceResult<SubscriptionInfo>> => {
  try {
    const [subscriberCount, existingRow] = await Promise.all([
      Subscription.count({ where: { channelEmail } }),
      channelEmail !== requestingEmail
        ? Subscription.findOne({ where: { channelEmail, subscriberEmail: requestingEmail } })
        : Promise.resolve(null),
    ]);

    return {
      success: true,
      data: { subscriberCount, isSubscribed: !!existingRow },
      message: "Subscription info retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("subscription.service.getSubscriptionInfo error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve subscription info.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Subscribe ────────────────────────────────────────────────────────────────
export const subscribe = async (
  channelEmail: string,
  subscriberEmail: string
): Promise<ServiceResult<SubscriptionInfo>> => {
  try {
    if (channelEmail === subscriberEmail) {
      return {
        success: false,
        data: null,
        message: "You cannot subscribe to yourself.",
        statusCode: StatusCodes.BAD_REQUEST,
      };
    }

    await Subscription.findOrCreate({ where: { channelEmail, subscriberEmail } });
    return getSubscriptionInfo(channelEmail, subscriberEmail);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return getSubscriptionInfo(channelEmail, subscriberEmail);
    }
    console.log("subscription.service.subscribe error", error);
    return {
      success: false,
      data: null,
      message: "Failed to subscribe.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Unsubscribe ──────────────────────────────────────────────────────────────
export const unsubscribe = async (
  channelEmail: string,
  subscriberEmail: string
): Promise<ServiceResult<SubscriptionInfo>> => {
  try {
    await Subscription.destroy({ where: { channelEmail, subscriberEmail } });
    return getSubscriptionInfo(channelEmail, subscriberEmail);
  } catch (error) {
    console.log("subscription.service.unsubscribe error", error);
    return {
      success: false,
      data: null,
      message: "Failed to unsubscribe.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Subscriptions feed ───────────────────────────────────────────────────────
// Videos from all channels the user subscribes to, newest first.
export const getSubscriptionsFeed = async (
  subscriberEmail: string
): Promise<ServiceResult<VideoRecord[]>> => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { subscriberEmail },
      attributes: ["channelEmail"],
    });

    if (subscriptions.length === 0) {
      return {
        success: true,
        data: [],
        message: "No subscriptions yet.",
        statusCode: StatusCodes.OK,
      };
    }

    const channelEmails = subscriptions.map((s) => s.channelEmail);

    const videos = await Video.findAll({
      where: { createdBy: { [Op.in]: channelEmails } },
      include: [{ model: User, as: "uploader", attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
    });

    return {
      success: true,
      data: videos.map((v) => v.toJSON() as VideoRecord),
      message: "Feed retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("subscription.service.getSubscriptionsFeed error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve feed.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};

// ─── Subscribed channels list ─────────────────────────────────────────────────
// All channels the user follows, with their name and subscriber count.
export const getSubscribedChannels = async (
  subscriberEmail: string
): Promise<ServiceResult<SubscribedChannel[]>> => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { subscriberEmail },
      include: [{ model: User, as: "channel", attributes: ["name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    const channels = await Promise.all(
      subscriptions.map(async (sub) => {
        const subscriberCount = await Subscription.count({
          where: { channelEmail: sub.channelEmail },
        });
        return {
          email: sub.channelEmail,
          name: (sub as any).channel?.name ?? "Unknown",
          subscriberCount,
          subscribedAt: sub.createdAt.toISOString(),
        };
      })
    );

    return {
      success: true,
      data: channels,
      message: "Subscribed channels retrieved.",
      statusCode: StatusCodes.OK,
    };
  } catch (error) {
    console.log("subscription.service.getSubscribedChannels error", error);
    return {
      success: false,
      data: null,
      message: "Failed to retrieve subscribed channels.",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }
};
