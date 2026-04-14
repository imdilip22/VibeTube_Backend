import { Router } from "express";
import { authRouter } from "../auth/routes";
import { videoRouter } from "../video/routes";
import { subscriptionRouter } from "../subscription/routes";
import { watchLaterRouter } from "../watchlater/routes";

export const router = Router();

router.use("/auth", authRouter);
router.use("/videos", videoRouter);
router.use("/subscriptions", subscriptionRouter);
router.use("/watch-later", watchLaterRouter);
