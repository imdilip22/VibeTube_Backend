import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../types/auth.types";
import {
  getSubscriptionInfo,
  subscribe,
  unsubscribe,
  getSubscriptionsFeed,
  getSubscribedChannels,
  type FeedSortOrder,
} from "../../service/subscription/subscription.service";

// ─── GET /api/v1/subscriptions/feed ──────────────────────────────────────────
export const getSubscriptionsFeedController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sort = (req.query.sort as FeedSortOrder) ?? "latest";
    const result = await getSubscriptionsFeed(req.user!.email, sort);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("subscription.controller.getSubscriptionsFeedController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /api/v1/subscriptions/channels ──────────────────────────────────────
export const getSubscribedChannelsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getSubscribedChannels(req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("subscription.controller.getSubscribedChannelsController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /api/v1/subscriptions/:channelEmail ──────────────────────────────────
export const getSubscriptionInfoController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getSubscriptionInfo(req.params.channelEmail as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("subscription.controller.getSubscriptionInfoController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── POST /api/v1/subscriptions/:channelEmail ─────────────────────────────────
export const subscribeController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await subscribe(req.params.channelEmail as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("subscription.controller.subscribeController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE /api/v1/subscriptions/:channelEmail ───────────────────────────────
export const unsubscribeController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await unsubscribe(req.params.channelEmail as string, req.user!.email);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.log("subscription.controller.unsubscribeController error", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error." });
  }
};
