import { Router } from "express";
import { authRouter } from "../auth/routes";
import { videoRouter } from "../video/routes";
import { subscriptionRouter } from "../subscription/routes";
import { watchLaterRouter } from "../watchlater/routes";
import { watchHistoryRouter } from "../watchhistory/routes";
import { channelsRouter } from "../channels/routes";
import { liveRouter } from "../live/routes";
import { profileRouter } from "../profile/routes";
import { authMiddleware } from "../../middleware/authenticate.middleware";

export const router = Router();

// ── Public auth routes (register, login, refresh, Google OAuth) ───────────────
router.use("/auth", authRouter);

// ── All other routes are protected globally ───────────────────────────────────
router.use(authMiddleware);
router.use("/videos", videoRouter);
router.use("/subscriptions", subscriptionRouter);
router.use("/watch-later", watchLaterRouter);
router.use("/watch-history", watchHistoryRouter);
router.use("/channels", channelsRouter);
router.use("/live", liveRouter);
router.use("/profile", profileRouter);
