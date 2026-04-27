import { Router } from "express";
import { getAllChannelsController } from "../../controller/channels/channels.controller";

export const channelsRouter = Router();

channelsRouter.get("/", getAllChannelsController);
