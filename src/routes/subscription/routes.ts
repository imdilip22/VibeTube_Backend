import { Router } from "express";
import {
  getSubscriptionInfoController,
  subscribeController,
  unsubscribeController,
  getSubscriptionsFeedController,
  getSubscribedChannelsController,
} from "../../controller/subscription/subscription.controller";

export const subscriptionRouter = Router();

// Static paths first — must come before /:channelEmail
subscriptionRouter.get("/feed", getSubscriptionsFeedController);
subscriptionRouter.get("/channels", getSubscribedChannelsController);

// Parameterised routes
subscriptionRouter.get("/:channelEmail", getSubscriptionInfoController);
subscriptionRouter.post("/:channelEmail", subscribeController);
subscriptionRouter.delete("/:channelEmail", unsubscribeController);
