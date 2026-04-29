import { Router } from "express";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  googleAuthController,
  googleCallbackController,
} from "../../controller/auth/auth.controller";
import { authMiddleware } from "../../middleware/authenticate.middleware";
import { registerUpload } from "../../config/upload";

export const authRouter = Router();

// ── Public ────────────────────────────────────────────────────────────────────
// Register accepts optional multipart fields: avatar, coverPhoto
authRouter.post(
  "/register",
  registerUpload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverPhoto", maxCount: 1 }]),
  registerController
);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);

// ── Google OAuth2 (authorization code flow) ───────────────────────────────────
authRouter.get("/google", googleAuthController);
authRouter.get("/google/callback", googleCallbackController);

// ── Protected ─────────────────────────────────────────────────────────────────
authRouter.post("/logout", authMiddleware, logoutController);
