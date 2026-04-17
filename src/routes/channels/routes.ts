import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { getAllChannelsController } from "../../controller/channels/channels.controller";

export const channelsRouter = Router();

// GET /api/v1/channels — list all channels (excluding self)
channelsRouter.get("/", authenticate, getAllChannelsController);
