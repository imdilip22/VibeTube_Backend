import { Router } from "express";
import { authRouter } from "../auth/routes";
import { videoRouter } from "../video/routes";
import { subscriptionRouter } from "../subscription/routes";
import { watchLaterRouter } from "../watchlater/routes";
import { watchHistoryRouter } from "../watchhistory/routes";
import { channelsRouter } from "../channels/routes";
import { liveRouter } from "../live/routes";

export const router = Router();

router.use("/auth", authRouter);
router.use("/videos", videoRouter);
router.use("/subscriptions", subscriptionRouter);
router.use("/watch-later", watchLaterRouter);
router.use("/watch-history", watchHistoryRouter);
router.use("/channels", channelsRouter);
router.use("/live", liveRouter);
