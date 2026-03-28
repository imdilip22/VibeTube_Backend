import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  getSubscriptionInfoController,
  subscribeController,
  unsubscribeController,
  getSubscriptionsFeedController,
  getSubscribedChannelsController,
} from "../../controller/subscription/subscription.controller";

export const subscriptionRouter = Router();

// All subscription routes require authentication
subscriptionRouter.use(authenticate);

// ── Static paths first — must come before /:channelEmail ─────────────────────

// GET  /api/v1/subscriptions/feed     — video feed from subscribed channels
subscriptionRouter.get("/feed", getSubscriptionsFeedController);

// GET  /api/v1/subscriptions/channels — list of channels the user follows
subscriptionRouter.get("/channels", getSubscribedChannelsController);

// ── Parameterised routes ──────────────────────────────────────────────────────

// GET    /api/v1/subscriptions/:channelEmail  — subscriber count + isSubscribed
subscriptionRouter.get("/:channelEmail", getSubscriptionInfoController);

// POST   /api/v1/subscriptions/:channelEmail  — subscribe
subscriptionRouter.post("/:channelEmail", subscribeController);

// DELETE /api/v1/subscriptions/:channelEmail  — unsubscribe
subscriptionRouter.delete("/:channelEmail", unsubscribeController);
